#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {buildPmFunctionalReconciliation,assessPmFunctionalReconciliation} from './lib/pm-functional-reconciliation.mjs';
import {buildPmP0StagedTriage,assessPmP0StagedTriage} from './lib/pm-p0-staged-triage.mjs';
import {buildPmFunctionalReviewWorkpacks,assessPmFunctionalReviewWorkpacks} from './lib/pm-functional-review-workpacks.mjs';
import {buildPmP0DiscriminativeEvidence,assessPmP0DiscriminativeEvidence} from './lib/pm-p0-discriminative-evidence.mjs';
import {buildPmP0PilotEvidenceBlueprints,assessPmP0PilotEvidenceBlueprints} from './lib/pm-p0-evidence-pilot-blueprints.mjs';
import {buildSyntheticP0EvidenceOutcomes,assessSyntheticP0EvidenceOutcomes} from './lib/pm-p0-synthetic-evidence-outcomes.mjs';
import {buildCorporateReadinessClosure,assessCorporateReadinessClosure} from './lib/pm-corporate-readiness-closure.mjs';
import {buildSec01ApprovalBrief,assessSec01ApprovalBrief} from './lib/pm-sec01-approval-brief.mjs';
import {buildSec01GovernanceHandoff,assessSec01GovernanceHandoff} from './lib/pm-sec01-governance-handoff.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const clone=x=>JSON.parse(JSON.stringify(x));
const seeds=read('data/knowledge/pm-prevention/seed-rules.json'),gaps=read('data/quality/pm-gap-review.v1.json');
const maturity=read('data/quality/pm-maturity-matrix.v1.json'),runbook=read('data/governance/pm-private-deployment-runbook.v1.json');
const reconIn={policy:read('data/quality/pm-functional-reconciliation-policy.v1.json'),
 db:read('data/catalog/failure-db.v1.json'),rules:seeds.records,
 links:read('data/knowledge/pm-prevention/generated-links.json').records,gaps,maturity};
const reconciliation=buildPmFunctionalReconciliation(reconIn);
const stagedIn={policy:read('data/quality/pm-p0-staged-triage-policy.v1.json'),
 readiness:read('data/quality/pm-p0-investigation-readiness.v1.json'),
 seeds,gaps,maturity,runbook};
const staged=buildPmP0StagedTriage(stagedIn);
const workIn={policy:read('data/quality/pm-functional-review-workpacks-policy.v1.json'),
 reconciliation,seeds,gaps,maturity,staged};
const workpacks=buildPmFunctionalReviewWorkpacks(workIn);
const diffIn={policy:read('data/quality/pm-p0-discriminative-evidence-policy.v1.json'),
 originalPolicy:read('data/quality/pm-p0-investigation-readiness-policy.v1.json'),
 readiness:stagedIn.readiness,workpacks,gaps,maturity};
const differentials=buildPmP0DiscriminativeEvidence(diffIn);
const inputs={
 policy:read('data/governance/pm-p0-evidence-pilot-blueprints-policy.v1.json'),
 differentials,intake:read('data/governance/pm-evidence-intake-policy.v1.json'),
 reviewPolicy:read('data/governance/pm-review-decision-policy.v1.json'),
 reviewPacket:read('data/quality/pm-review-decision-packet.v1.json'),
 preflight:read('data/quality/pm-pilot-preflight.v1.json'),gaps,maturity,runbook
};
const blueprint=buildPmP0PilotEvidenceBlueprints(inputs);
const blueprintInputs=inputs;

const evidenceInputs={policy:read('data/quality/pm-p0-synthetic-evidence-outcomes-policy.v1.json'),
 blueprint,intake:blueprintInputs.intake,decisionPolicy:blueprintInputs.reviewPolicy,
 gaps,maturity,runbook};
const result=buildSyntheticP0EvidenceOutcomes(evidenceInputs);

const corporateInputs={policy:read('data/governance/pm-corporate-readiness-closure-policy.v1.json'),
 runbook,scenarios:result,blueprint,readiness:stagedIn.readiness,
 reviewPacket:blueprintInputs.reviewPacket,intake:blueprintInputs.intake,
 decisionPolicy:blueprintInputs.reviewPolicy,gaps,maturity};
const snapshot=buildCorporateReadinessClosure(corporateInputs);

const secInputs={policy:read('data/governance/pm-sec01-approval-brief-policy.v1.json'),
 runbook,closure:snapshot,intake:blueprintInputs.intake,
 restrictedDesign:read('data/governance/restricted-infrastructure-design.v1.json'),
 gaps,maturity};

const brief=buildSec01ApprovalBrief(secInputs);
const handoffInputs={policy:read('data/governance/pm-sec01-governance-handoff-policy.v1.json'),
 brief,closure:snapshot,runbook,
 intake:blueprintInputs.intake,decisionPolicy:blueprintInputs.reviewPolicy,gaps,maturity};
const report=buildSec01GovernanceHandoff(handoffInputs);
const initial=assessSec01GovernanceHandoff(handoffInputs,report);
const errors=[...initial.errors],attacks=[];
const chain=[
 ['SEC01_brief',assessSec01ApprovalBrief(secInputs,brief).status],
 ['corporate_closure',assessCorporateReadinessClosure(corporateInputs,snapshot).status],
 ['scenario_assessment',assessSyntheticP0EvidenceOutcomes(evidenceInputs,result).status],
 ['pilot_blueprint',assessPmP0PilotEvidenceBlueprints(blueprintInputs,blueprint).status],
 ['differentials',assessPmP0DiscriminativeEvidence(diffIn,differentials).status],
 ['workpacks',assessPmFunctionalReviewWorkpacks(workIn,workpacks).status],
 ['staged_P0',assessPmP0StagedTriage(stagedIn,staged).status],
 ['reconciliation',assessPmFunctionalReconciliation(reconIn,reconciliation).status]
];
for(const [id,status] of chain)if(!status.startsWith('NO_GO_'))errors.push('invalid_upstream_'+id+'_'+status);
function attack(name,fn){
 const input=clone(handoffInputs),out=clone(report);
 try{fn(input,out)}catch(e){errors.push('broken_fixture_'+name+'_'+e.message);return}
 let blocked=false;
 try{blocked=assessSec01GovernanceHandoff(input,out).status==='REJECTED'}catch(e){blocked=true}
 attacks.push({name,blocked});
 if(!blocked)errors.push('dangerous_mutation_not_blocked_'+name);
}
const role=r=>r.raciRoles[0],rac=r=>r.raciRows[0],dec=r=>r.decisionRegister[0],
  acceptance=r=>r.acceptanceMatrix[0],agenda=r=>r.agenda[0],queue=r=>r.missingPrivateRequestQueue[0];
attack('faked_role_holder',(_,o)=>role(o).corporateRoleHolderIdentified=true);
attack('role_signer_autoapproved',(_,o)=>role(o).authorizedSigner=true);
attack('role_appointment_document',(_,o)=>role(o).appointmentDocumentVerified=true);
attack('role_becomes_real',(_,o)=>role(o).proposedOnly=false);
attack('role_deleted',(_,o)=>o.raciRoles.pop());
attack('role_duplicated',(_,o)=>o.raciRoles.push(clone(role(o))));
attack('role_title_rewritten',(_,o)=>role(o).functionLabel='CEO approved');
attack('raci_accountable_replaced',(_,o)=>rac(o).A='corporate_project_sponsor');
attack('raci_added_second_accountable',(_,o)=>rac(o).A=['corporate_governance','corporate_legal']);
attack('raci_responsible_deleted',(_,o)=>rac(o).R.pop());
attack('raci_consulted_deleted',(_,o)=>rac(o).C.pop());
attack('raci_informed_deleted',(_,o)=>rac(o).I.pop());
attack('raci_cross_role_duplicate',(_,o)=>rac(o).R=[rac(o).A]);
attack('raci_check_missing',(_,o)=>o.raciRows.pop());
attack('raci_extra_record',(_,o)=>o.raciRows.push(clone(rac(o))));
attack('raci_claim_real_assignment',(_,o)=>rac(o).corporateRoleAssignmentConfirmed=true);
attack('raci_claim_evidence',(_,o)=>rac(o).documentationReceived=true);
attack('raci_claim_approval',(_,o)=>rac(o).realApprovalRecorded=true);
attack('raci_claim_accepted',(_,o)=>rac(o).state='APPROVED');
attack('raci_private_proof_removed',(_,o)=>rac(o).privateProofRequired='none');
attack('decision_signed',(_,o)=>dec(o).authorizedSigner='TEST-REAL');
attack('decision_approved',(_,o)=>dec(o).actualDecision='APPROVED_FOR_RESTRICTED_DESIGN_REVIEW_ONLY');
attack('decision_private_reference',(_,o)=>dec(o).privateDecisionRef='INTERNAL');
attack('decision_timestamp',(_,o)=>dec(o).decisionTimestamp='2026-10-27');
attack('decision_mark_ready',(_,o)=>dec(o).state='APPROVED');
attack('decision_has_go',(_,o)=>dec(o).decision='GO');
attack('decision_review_completed',(_,o)=>dec(o).documentaryReviewComplete=true);
attack('decision_privacy_completed',(_,o)=>dec(o).legalOrPrivacyFindingEstablished=true);
attack('decision_removed_check',(_,o)=>dec(o).unresolvedCheckIds.pop());
attack('decision_release_option_forged',(_,o)=>dec(o).availablePrivateOutcomes.push('OPERATIONS_RELEASE');
attack('decision_owner_reassigned',(_,o)=>dec(o).proposedAccountableRole='software_auto_approver');
attack('decision_removed',(_,o)=>o.decisionRegister.pop());
attack('decision_duplicate',(_,o)=>o.decisionRegister.push(clone(dec(o))));
attack('acceptance_private_document',(_,o)=>acceptance(o).validatedPrivateEvidence=true);
attack('acceptance_independent_assessor',(_,o)=>acceptance(o).independentCorporateAssessorAssigned=true);
attack('acceptance_trusted_sig',(_,o)=>acceptance(o).trustedDecisionAuthenticated=true);
attack('acceptance_document_verified',(_,o)=>acceptance(o).publicCheckResult='PASS');
attack('acceptance_condition_go',(_,o)=>acceptance(o).decision='GO');
attack('acceptance_condition_removed',(_,o)=>o.acceptanceMatrix.pop());
attack('acceptance_required_proof_removed',(_,o)=>acceptance(o).privateEvidenceToRequest='approval');
attack('meeting_scheduled_claim',(_,o)=>agenda(o).realMeetingScheduled=true);
attack('meeting_attendees_invited_claim',(_,o)=>agenda(o).corporateAttendeesInvited=true);
attack('meeting_minutes_claim',(_,o)=>agenda(o).minutesRecorded=true);
attack('meeting_decision_claim',(_,o)=>agenda(o).realDecisionTaken=true);
attack('meeting_fourth_item_deleted',(_,o)=>o.agenda.pop());
attack('private_request_pretended',(_,o)=>queue(o).status='SUBMITTED');
attack('private_request_corporate_reference',(_,o)=>queue(o).corporateReference='CORPORATE-TICKET');
attack('private_request_evidence_supplied',(_,o)=>queue(o).documentationSupplied=true);
attack('private_request_legally_reviewed',(_,o)=>queue(o).legallyReviewed=true);
attack('private_request_decision_recorded',(_,o)=>queue(o).decisionRecorded=true);
attack('request_queue_missing',(_,o)=>o.missingPrivateRequestQueue.pop());
attack('protected_CEO_signer',(_,o)=>o.protectedBoundaries.realSignatoryIdentity='CEO');
attack('protected_meeting_date',(_,o)=>o.protectedBoundaries.corporateMeetingDate='2026-10-27');
attack('protected_actual_decision',(_,o)=>o.protectedBoundaries.actualCorporateDecision='APPROVED');
attack('protected_SEC01_closed',(_,o)=>o.protectedBoundaries.SEC01GateApproved=true);
attack('protected_ID02_closed',(_,o)=>o.protectedBoundaries.subsequentGateID02Approved=true);
attack('protected_pilot_authorized',(_,o)=>o.protectedBoundaries.actualPilotAuthorized=true);
attack('protected_SAP_integrated',(_,o)=>o.protectedBoundaries.liveSAPIntegrated=true);
attack('protected_operation_released',(_,o)=>o.protectedBoundaries.operationsReleaseGranted=true);
attack('protected_public_go',(_,o)=>o.protectedBoundaries.publicDecision='GO');
attack('summary_nonzero_roles',(_,o)=>o.summary.realRoleAssignments=1);
attack('summary_nonzero_decisions',(_,o)=>o.summary.realDecisionsTaken=1);
attack('summary_nonzero_meeting',(_,o)=>o.summary.corporateMeetingsHeld=1);
attack('summary_nonzero_private_docs',(_,o)=>o.summary.realDocumentsReceived=1);
attack('summary_eight_gate_decrement',(_,o)=>o.summary.gatesBlocked=7);
attack('summary_SAP_decision_invented',(_,o)=>o.summary.SAPChanges=1);
attack('summary_engineering_signed',(_,o)=>o.summary.engineeringApprovals=1);
attack('summary_workorder_unauthorized',(_,o)=>o.summary.workOrders=1);
attack('summary_real_release',(_,o)=>o.summary.operationalReleases=1);
attack('summary_approved',(_,o)=>o.summary.decision='GO');
attack('policy_role_record_assigned',(i)=>i.policy.roles[0].realPersonAssigned=true);
attack('policy_role_verified',(i)=>i.policy.roles[0].corporateRoleVerified=true);
attack('policy_role_unknown',(i)=>i.policy.roles[0].id='unknown');
attack('policy_A_array',(i)=>i.policy.raci[0].A=['corporate_governance','corporate_project_sponsor']);
attack('policy_A_and_R_same',(i)=>i.policy.raci[0].R=[i.policy.raci[0].A]);
attack('policy_no_consulted',(i)=>i.policy.raci[0].C=[]);
attack('policy_no_responsible',(i)=>i.policy.raci[0].R=[]);
attack('policy_duplicate_check',(i)=>i.policy.raci[1].checkId=i.policy.raci[0].checkId);
attack('policy_manual_case_approval',(i)=>i.policy.raci[0].corporateAssignmentRecorded=true);
attack('policy_approval_fields_filled',(i)=>i.policy.decisions[0].actualSignatory='REAL');
attack('policy_override_outcome',(i)=>i.policy.decisions[0].outcomeOptions.push('AUTOMATIC_APPROVE');
attack('policy_mismatched_anchor',(i)=>i.policy.decisions[0].anchorCheckId='SEC01-L01');
attack('policy_independent_roles_removed',(i)=>i.policy.raci[1].C=[]);
attack('policy_acceptance_marked_passed',(i)=>i.policy.acceptanceConditions[0].satisfied=true);
attack('policy_acceptance_proof_invented',(i)=>i.policy.acceptanceConditions[0].corporateVerification='VERIFIED');
attack('policy_acceptance_dropped',(i)=>i.policy.acceptanceConditions.pop());
attack('policy_agenda_removed',(i)=>i.policy.agenda.pop());
attack('policy_gate_preconditions_removed',(i)=>i.policy.gateDecisionPreconditions.pop());
attack('policy_fake_authorization',(i)=>i.policy.safeHandoffRules.noCorporateApprovalClaims=false);
attack('policy_public_oem_document',(i)=>i.policy.safeHandoffRules.noMinutesOrDocumentsStoredInPublicRepo=false);
attack('policy_autoSAP',(i)=>i.policy.safeHandoffRules.noSAPOrWorkOrderWrite=false);
attack('policy_pilot_scoping',(i)=>i.policy.scope='real_pilot_authorized');
attack('upstream_sec01_signed',(i)=>i.brief.documentaryChecklist[0].approvalSignaturePresent=true);
attack('upstream_sec01_made_request',(i)=>i.brief.summary.privateSubmissionsMade=1);
attack('upstream_sec01_role_assigned',(i)=>i.brief.reviewStreams[0].ownerAssignedInRealOrganization=true);
attack('upstream_gate_unblocked',(i)=>i.runbook.phases[0].gate='GO');
attack('upstream_gate_signed',(i)=>i.runbook.phases[0].decisionToken='TRUE');
attack('upstream_closure_go',(i)=>i.closure.summary.overallDecision='GO');
attack('upstream_closure_private_gate',(i)=>i.closure.summary.privateGatesVerified=1);
attack('upstream_live_intake',(i)=>i.intake.boundaries.privateStorageImplemented=true);
attack('upstream_decision_auto_sign',(i)=>i.decisionPolicy.trustBoundary.engineeringAutoApproval=true);
attack('upstream_SAP_gap_removed',(i)=>i.gaps.records.pop());
attack('upstream_maturity_increased',(i)=>i.maturity.summary.fieldConfirmed=1);
const audit={status:errors.length?'FAIL':'OK',
 sourceRevalidations:chain.length,
 negativeMutations:attacks.length,negativeMutationsRejected:attacks.filter(x=>x.blocked).length,
 attacks,errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-sec01-governance-handoff.generated.json'),JSON.stringify({...report,audit},null,2)+'\n');
console.log(JSON.stringify({status:audit.status,summary:report.summary,
 decisionRegister:report.decisionRegister.map(d=>({topic:d.decisionId,unresolved:d.unresolvedCheckIds.length,state:d.state})),
 upstream:chain.length,negativeMutations:audit.negativeMutations,rejected:audit.negativeMutationsRejected,errors},null,2));
process.exit(errors.length?1:0);
