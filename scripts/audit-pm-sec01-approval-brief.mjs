#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {buildPmFunctionalReconciliation,assessPmFunctionalReconciliation} from './lib/pm-functional-reconciliation.mjs';
import {buildPmP0StagedTriage,assessPmP0StagedTriage} from './lib/pm-p0-staged-triage.mjs';
import {buildPmFunctionalReviewWorkpacks,assessPmFunctionalReviewWorkpacks} from './lib/pm-functional-review-workpacks.mjs';
import {buildPmP0DiscriminativeEvidence,assessPmP0DiscriminativeEvidence} from './lib/pm-p0-discriminative-evidence.mjs';
import {buildPmP0PilotEvidenceBlueprints,assessPmP0PilotEvidenceBlueprints} from './lib/pm-p0-evidence-pilot-blueprints.mjs';
import {buildSyntheticP0EvidenceOutcomes,assessSyntheticP0EvidenceOutcomes} from './lib/pm-p0-synthetic-evidence-outcomes.mjs';
import {buildCorporateReadinessClosure,assessCorporateReadinessClosure} from './lib/pm-corporate-readiness-closure.mjs';
import {buildSec01ApprovalBrief,assessSec01ApprovalBrief,classifySec01Synthetic} from './lib/pm-sec01-approval-brief.mjs';
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
const report=buildSec01ApprovalBrief(secInputs),initial=assessSec01ApprovalBrief(secInputs,report);
const errors=[...initial.errors],adversarial=[],classifierTests=[];
const upstream=[
 ['corporate_readiness',assessCorporateReadinessClosure(corporateInputs,snapshot).status],
 ['synthetic_outcomes',assessSyntheticP0EvidenceOutcomes(evidenceInputs,result).status],
 ['pilot_blueprints',assessPmP0PilotEvidenceBlueprints(blueprintInputs,blueprint).status],
 ['differential_hypotheses',assessPmP0DiscriminativeEvidence(diffIn,differentials).status],
 ['functional_workpacks',assessPmFunctionalReviewWorkpacks(workIn,workpacks).status],
 ['staged_p0',assessPmP0StagedTriage(stagedIn,staged).status],
 ['functional_reconciliation',assessPmFunctionalReconciliation(reconIn,reconciliation).status]
];
for(const [name,status] of upstream)if(!status.startsWith('NO_GO_'))errors.push('upstream_invalid_'+name+'_'+status);
function attack(name,change){
 const input=clone(secInputs),out=clone(report);
 try{change(input,out)}catch(e){errors.push('invalid_attack_fixture_'+name+'_'+e.message);return}
 let rejected=false;try{rejected=assessSec01ApprovalBrief(input,out).status==='REJECTED'}catch(e){rejected=true}
 adversarial.push({name,rejected});if(!rejected)errors.push('unsafe_mutation_accepted_'+name);
}
function probe(name,fields,expected){
 const actual=classifySec01Synthetic(fields,secInputs.policy.inputEnums);
 classifierTests.push({name,expected,actual,passed:actual===expected});
 if(actual!==expected)errors.push('classification_incorrect_'+name);
}
for(const s of secInputs.policy.scenarios)probe('baseline_'+s.id,s.fields,s.expected);
const complete=clone(secInputs.policy.scenarios.find(x=>x.id==='apparently_complete').fields);
const repl=(key,value)=>({...complete,[key]:value});
probe('public_receipt_rejected_first',repl('boundary','public_raw_evidence'),'REJECT_PUBLIC_EVIDENCE_ROUTE');
probe('invalid_oem_rights_rejected',repl('license','incompatible'),'REJECT_OEM_USAGE_SCOPE');
probe('missing_project_sponsor',repl('sponsor','missing'),'REQUEST_FORMAL_SPONSORSHIP');
probe('undefined_scope',repl('sponsor','scope_undefined'),'REQUEST_SCOPE_REDEFINITION');
probe('unreviewed_OEM_rights',repl('license','not_reviewed'),'HOLD_OEM_LICENSE_REVIEW');
probe('unreviewed_privacy',repl('privacy','not_reviewed'),'HOLD_PRIVACY_ASSESSMENT');
probe('seemingly_ready_still_needs_private_signoff',complete,'HOLD_PRIVATE_CORPORATE_ATTESTATION');
probe('public_upload_overrides_other_gaps',{...complete,sponsor:'missing',license:'incompatible',boundary:'public_raw_evidence'},'REJECT_PUBLIC_EVIDENCE_ROUTE');
probe('incompatible_license_overrides_missing_sponsor',{...complete,sponsor:'missing',license:'incompatible'},'REJECT_OEM_USAGE_SCOPE');
probe('unexpected_tag_rejected',{...complete,assetTag:'REAL'},'REJECT_UNSUPPORTED_SYNTHETIC_INPUT');
probe('no_privacy_field',Object.fromEntries(Object.entries(complete).filter(([k])=>k!=='privacy')),'REJECT_UNSUPPORTED_SYNTHETIC_INPUT');
probe('fake_corporate_approval_enum',repl('license','CORPORATE_APPROVED'),'REJECT_UNSUPPORTED_SYNTHETIC_INPUT');
probe('wrong_type_sponsor',repl('sponsor',42),'REJECT_UNSUPPORTED_SYNTHETIC_INPUT');
probe('null_input',null,'REJECT_UNSUPPORTED_SYNTHETIC_INPUT');
probe('array_input',[],'REJECT_UNSUPPORTED_SYNTHETIC_INPUT');
const check=r=>r.documentaryChecklist[0],lane=r=>r.reviewStreams[0],drill=r=>r.syntheticDecisionDrills[0];
attack('brief_public_GO',(_,r)=>r.decision='GO');
attack('brief_corporate_scope_approved',(_,r)=>r.scopeBoundary.grantedDecision=true);
attack('brief_security_approved',(_,r)=>r.scopeBoundary.privateSecurityApproval=true);
attack('brief_privacy_approved',(_,r)=>r.scopeBoundary.privatePrivacyApproval=true);
attack('brief_OEM_license_approved',(_,r)=>r.scopeBoundary.licensedOEMReproductionApproval=true);
attack('brief_DPIA_claimed',(_,r)=>r.scopeBoundary.legalDPIADeterminationReceived=true);
attack('brief_operations_released',(_,r)=>r.scopeBoundary.releaseOfEquipmentAuthorized=true);
attack('brief_pilot_authorized',(_,r)=>r.scopeBoundary.downstreamPilotAuthorized=true);
attack('brief_real_data_allowed',(_,r)=>r.scopeBoundary.authorizationToUseRealData=true);
attack('brief_downstream_gate_skipped',(_,r)=>r.scopeBoundary.nextDownstreamGate='STO-03');
attack('brief_fake_signer',(_,r)=>check(r).authorizedReviewerVerified=true);
attack('brief_fake_licensed_document',(_,r)=>check(r).licensingAuthenticityVerified=true);
attack('brief_faked_private_evidence',(_,r)=>check(r).evidenceActuallyReceived=true);
attack('brief_faked_approval_signature',(_,r)=>check(r).approvalSignaturePresent=true);
attack('brief_check_closed',(_,r)=>check(r).state='CLOSED');
attack('brief_check_GO',(_,r)=>check(r).decision='GO');
attack('brief_check_deleted',(_,r)=>r.documentaryChecklist.pop());
attack('brief_check_doubled',(_,r)=>r.documentaryChecklist.push(clone(check(r))));
attack('brief_check_stream_altered',(_,r)=>check(r).stream='OEM');
attack('brief_check_wording_changed',(_,r)=>check(r).reviewQuestion='approved');
attack('brief_stream_owner_assigned',(_,r)=>lane(r).ownerAssignedInRealOrganization=true);
attack('brief_stream_submitted',(_,r)=>lane(r).submittedToGovernance=true);
attack('brief_stream_reviews_recorded',(_,r)=>lane(r).completedPrivateReviews=1);
attack('brief_stream_go',(_,r)=>lane(r).decision='GO');
attack('brief_stream_complete',(_,r)=>lane(r).currentState='COMPLETE');
attack('brief_stream_missing_check',(_,r)=>lane(r).requestChecks.pop());
attack('brief_stream_removed',(_,r)=>r.reviewStreams.pop());
attack('drill_false_authentic_signer',(_,r)=>drill(r).realSignerAuthenticated=true);
attack('drill_false_licensing',(_,r)=>drill(r).OEMRightsApproved=true);
attack('drill_false_privacy',(_,r)=>drill(r).privacyBasisApproved=true);
attack('drill_false_corporate_sponsor',(_,r)=>drill(r).securitySponsorshipApproved=true);
attack('drill_false_gate_closed',(_,r)=>drill(r).gateClosed=true);
attack('drill_real_case_authorized',(_,r)=>drill(r).realPilotAuthorized=true);
attack('drill_submitted',(_,r)=>drill(r).privateSubmissionPerformed=true);
attack('drill_false_legal_assessment',(_,r)=>drill(r).legalAssessmentPerformed=true);
attack('drill_false_notification',(_,r)=>drill(r).corporateDecisionNotified=true);
attack('drill_wrong_route',(_,r)=>drill(r).recommendedPrivateReviewRoute='APPROVED');
attack('drill_wrong_owner',(_,r)=>drill(r).possibleOwnerFunction='AUTO_APPROVER');
attack('drill_unknown_scenario',(_,r)=>drill(r).scenarioId='CORPORATE_REAL');
attack('drill_condition_modified',(_,r)=>drill(r).syntheticConditions.privacy='NOT_REQUIRED');
attack('drill_deleted',(_,r)=>r.syntheticDecisionDrills.pop());
attack('summary_sponsor_claim',(_,r)=>r.summary.corporateSponsorsVerified=1);
attack('summary_license_claim',(_,r)=>r.summary.OEMLicensesValidated=1);
attack('summary_privacy_claim',(_,r)=>r.summary.privacyAssessmentsValidated=1);
attack('summary_private_submission',(i,r)=>r.summary.privateSubmissionsMade=1);
attack('summary_signatures',(i,r)=>r.summary.privateGateAttestations=1);
attack('summary_pilot_approved',(_,r)=>r.summary.realPilotsApproved=1);
attack('summary_sap_changed',(_,r)=>r.summary.approvedSAPChanges=1);
attack('summary_workflow_unblocked',(_,r)=>r.summary.overallGatesBlocked=0);
attack('summary_sap_exceptions_unblocked',(_,r)=>r.summary.otherSapExceptionsBlocked=0);
attack('summary_go',(_,r)=>r.summary.publicDecision='GO');
attack('policy_auto_private_license',(i)=>i.policy.invariants.noPrivateLicenseDocuments=false);
attack('policy_auto_sap',(i)=>i.policy.invariants.noSAPChanges=false);
attack('policy_ignores_CI',(i)=>i.policy.invariants.noAutomaticGateApproval=false);
attack('policy_privacy_not_checked',(i)=>i.policy.invariants.noDPIARequirementInferred=false);
attack('policy_replaces_owner',(i)=>i.policy.requiredRunbookOwner='auto_tester');
attack('policy_removes_oem_check',(i)=>i.policy.checks.splice(4,1));
attack('policy_reverses_stream_order',(i)=>i.policy.streams.reverse());
attack('policy_generic_OEM_artifact',(i)=>i.policy.streams[1].evidenceAnchor='free_google_search');
attack('policy_corporate_signature_status',(i)=>i.policy.decisionInterpretation.corporateSignatureStatus='VERIFIED');
attack('policy_approves_real_pilot',(i)=>i.policy.decisionInterpretation.signoffScope='pilot_approved');
attack('policy_scenario_fake_GO',(i)=>i.policy.scenarios[6].expected='GO');
attack('policy_input_enum_expansion',(i)=>i.policy.inputEnums.privacy.push('approved'));
attack('policy_router_auto_approval',(i)=>i.policy.routing.HOLD_PRIVATE_CORPORATE_ATTESTATION='AUTOMATION');
attack('upstream_runbook_SEC01_GO',(i)=>i.runbook.phases[0].gate='GO');
attack('upstream_runbook_private_signer',(i)=>i.runbook.phases[0].decisionToken='signed');
attack('upstream_closure_private_signer',(i)=>i.closure.gateRegister[0].corporateAttestationReceived=true);
attack('upstream_closure_go',(i)=>i.closure.summary.overallDecision='GO');
attack('upstream_intake_live',(i)=>i.intake.boundaries.privateStorageImplemented=true);
attack('upstream_privacy_rights_removed',(i)=>i.restrictedDesign.privacyAndRights.licenseForOEMRequired=false);
attack('upstream_sap_exception_unblocked',(i)=>i.gaps.records[0].autoRemapAllowed=true);
attack('upstream_maturity_real',(i)=>i.maturity.summary.serialOemVerified=1);
const audit={status:errors.length?'FAIL':'OK',upstreamAudits:upstream.length,
 classificationProbes:classifierTests.length,classificationPassed:classifierTests.filter(x=>x.passed).length,
 adversarialMutations:adversarial.length,adversarialRejected:adversarial.filter(x=>x.rejected).length,
 classifierTests,adversarial,errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-sec01-approval-brief.generated.json'),JSON.stringify({...report,audit},null,2)+'\n');
console.log(JSON.stringify({status:audit.status,summary:report.summary,
 streams:report.reviewStreams.map(x=>({id:x.streamId,checks:x.requiredCheckCount})),
 upstreamAudits:audit.upstreamAudits,classificationProbes:audit.classificationProbes,
 classificationPassed:audit.classificationPassed,mutations:audit.adversarialMutations,
 rejected:audit.adversarialRejected,errors},null,2));
process.exit(errors.length?1:0);
