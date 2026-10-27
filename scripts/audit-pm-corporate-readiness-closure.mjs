#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {buildPmFunctionalReconciliation,assessPmFunctionalReconciliation} from './lib/pm-functional-reconciliation.mjs';
import {buildPmP0StagedTriage,assessPmP0StagedTriage} from './lib/pm-p0-staged-triage.mjs';
import {buildPmFunctionalReviewWorkpacks,assessPmFunctionalReviewWorkpacks} from './lib/pm-functional-review-workpacks.mjs';
import {buildPmP0DiscriminativeEvidence,assessPmP0DiscriminativeEvidence} from './lib/pm-p0-discriminative-evidence.mjs';
import {buildPmP0PilotEvidenceBlueprints,assessPmP0PilotEvidenceBlueprints} from './lib/pm-p0-evidence-pilot-blueprints.mjs';
import {buildSyntheticP0EvidenceOutcomes,assessSyntheticP0EvidenceOutcomes} from './lib/pm-p0-synthetic-evidence-outcomes.mjs';
import {buildCorporateReadinessClosure,assessCorporateReadinessClosure} from './lib/pm-corporate-readiness-closure.mjs';
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
const base=assessCorporateReadinessClosure(corporateInputs,snapshot);
const errors=[...base.errors],adversarial=[];
const checks=[
 ['reconciliation',assessPmFunctionalReconciliation(reconIn,reconciliation).status],
 ['staged_p0',assessPmP0StagedTriage(stagedIn,staged).status],
 ['functional_workpacks',assessPmFunctionalReviewWorkpacks(workIn,workpacks).status],
 ['differential_evidence',assessPmP0DiscriminativeEvidence(diffIn,differentials).status],
 ['pilot_blueprint',assessPmP0PilotEvidenceBlueprints(blueprintInputs,blueprint).status],
 ['evidence_scenarios',assessSyntheticP0EvidenceOutcomes(evidenceInputs,result).status]
];
for(const [label,state] of checks)if(!state.startsWith('NO_GO_'))errors.push('invalid_upstream_'+label+'_'+state);
function attack(name,modify){
 const input=clone(corporateInputs),out=clone(snapshot);
 try{modify(input,out)}catch(e){errors.push('invalid_test_case_'+name+'_'+e.message);return}
 let rejected=false;
 try{rejected=assessCorporateReadinessClosure(input,out).status==='REJECTED'}catch(e){rejected=true}
 adversarial.push({name,rejected});if(!rejected)errors.push('accepted_unsafe_mutation_'+name);
}
const g=r=>r.gateRegister[0],pl=r=>r.pilotCases[0],wave=r=>r.waves[0],evid=r=>r.missingPrivateEvidenceClasses[0];
attack('declare_gate_go',(_,r)=>g(r).decision='GO');
attack('declare_gate_open',(_,r)=>g(r).readiness='VERIFIED');
attack('gate_evidence_received',(_,r)=>g(r).corporateAttestationReceived=true);
attack('gate_signer_faked',(_,r)=>g(r).signatureAuthenticated=true);
attack('gate_private_test_faked',(_,r)=>g(r).privateVerificationPerformed=true);
attack('gate_pilot_enabled',(_,r)=>g(r).approvedForRealPilot=true);
attack('gate_inherited_status_forged',(_,r)=>g(r).inheritedGateStatus='GO');
attack('gate_original_owner_swapped',(_,r)=>g(r).ownerRole='PUBLIC_AUTO_APPROVER');
attack('gate_prerequisite_removed',(_,r)=>r.gateRegister.find(x=>x.gateId==='STO-03').prerequisites.pop());
attack('gate_proof_class_removed',(_,r)=>g(r).proofClass='none');
attack('gate_artifact_removed',(_,r)=>g(r).requiredCorporateArtifacts.pop());
attack('gate_proof_question_removed',(_,r)=>g(r).verificationQuestion='YES');
attack('gate_wave_reordered',(_,r)=>g(r).dependencyWave=6);
attack('gate_missing',(_,r)=>r.gateRegister.pop());
attack('gate_duplicated',(_,r)=>r.gateRegister.push(clone(g(r))));
attack('dependency_wave_approved',(_,r)=>wave(r).advanceAuthorized=true);
attack('dependency_wave_bypass',(_,r)=>wave(r).prerequisiteStatus='VERIFIED');
attack('dependency_waves_dropped',(_,r)=>r.waves.pop());
attack('readiness_public_Go',(_,r)=>r.summary.overallDecision='GO');
attack('readiness_corporate_approved',(_,r)=>r.summary.corporateAcceptanceState='APPROVED');
attack('readiness_private_gates_closed',(_,r)=>r.summary.privateGatesBlocked=0);
attack('readiness_private_gates_verified',(_,r)=>r.summary.privateGatesVerified=8);
attack('readiness_real_asset',(_,r)=>r.summary.realSelectedAssets=1);
attack('readiness_oem_effectivity',(_,r)=>r.summary.verifiedOEMSerials=1);
attack('readiness_real_measurement',(_,r)=>r.summary.realMeasurements=1);
attack('readiness_approved_sap',(_,r)=>r.summary.approvedSAPChanges=1);
attack('readiness_approved_engr',(_,r)=>r.summary.engineeringSignoffs=1);
attack('readiness_workorders',(_,r)=>r.summary.workOrdersCreated=1);
attack('readiness_operations_release',(_,r)=>r.summary.operationalReleases=1);
attack('readiness_accept_case',(_,r)=>r.summary.privateCasesAccepted=1);
attack('readiness_SAP_exception_suppressed',(_,r)=>r.summary.originalSapExceptionBlocks=0);
attack('pilot_public_status_changed',(_,r)=>pl(r).state='READY');
attack('pilot_asset_confirmed',(_,r)=>pl(r).actualAssetIdentified=true);
attack('pilot_oem_confirmed',(_,r)=>pl(r).OEMSeriesEffective=true);
attack('pilot_custody_faked',(_,r)=>pl(r).documentsInCorporateVault=true);
attack('pilot_procedure_authorized',(_,r)=>pl(r).procedureApproved=true);
attack('pilot_measurement_collected',(_,r)=>pl(r).qualifiedObservationCollected=true);
attack('pilot_independent_engr_approved',(_,r)=>pl(r).independentEngineeringApproved=true);
attack('pilot_sap_approved',(_,r)=>pl(r).SAPChangeApproved=true);
attack('pilot_work_authorized',(_,r)=>pl(r).workAuthorized=true);
attack('pilot_ops_released',(_,r)=>pl(r).operationsReleased=true);
attack('pilot_checklist_signed',(_,r)=>pl(r).checklistSections[0].reviewSignatures=1);
attack('pilot_verified_check',(_,r)=>pl(r).checklistSections[0].verifiedChecks=1);
attack('pilot_checklist_item_missing',(_,r)=>pl(r).checklistSections[0].unresolvedCheckIds.pop());
attack('pilot_independent_lane_signed',(_,r)=>pl(r).humanDecisionLanes[0].signedApprovalReceived=true);
attack('pilot_independent_lane_removed',(_,r)=>pl(r).humanDecisionLanes.pop());
attack('pilot_count_inflated',(_,r)=>pl(r).scenarioEvaluations=10);
attack('pilot_missing',(_,r)=>r.pilotCases.pop());
attack('evidence_proof_faked',(_,r)=>evid(r).receivedAndAuthenticated=true);
attack('evidence_status_faked',(_,r)=>evid(r).currentReadiness='VERIFIED');
attack('evidence_class_removed',(_,r)=>r.missingPrivateEvidenceClasses.pop());
attack('policy_fake_private_evidence',(i)=>i.policy.gateProofCriteria[0].privateAttestationReceived=true);
attack('policy_fake_gate_GO',(i)=>i.policy.gateProofCriteria[0].gateDecision='GO');
attack('policy_signature_faked',(i)=>i.policy.gateProofCriteria[0].reviewerIdentityConfirmed=true);
attack('policy_removes_proof',(i)=>i.policy.gateProofCriteria[0].privateEvidenceDescription='OK');
attack('policy_disables_privacy',(i)=>i.policy.safety.privateDataMustStayOutsideGitHub=false);
attack('policy_auto_sap',(i)=>i.policy.safety.noAutomaticSapCoding=false);
attack('policy_promotes_cases',(i)=>i.policy.safety.documentedTestPassDoesNotProveFieldReadiness=false);
attack('policy_drop_signoffs',(i)=>i.policy.safety.independentLanesRequired=false);
attack('policy_go_ready',(i)=>i.policy.corporateReadiness='APPROVED');
attack('policy_reorders_gate_ids',(i)=>i.policy.requiredGateOrder.reverse());
attack('policy_omits_dependency_category',(i)=>i.policy.pilotChecklistCategories.pop());
attack('policy_downgrades_first_step',(i)=>i.policy.allowedNextPrivateStep='PUBLIC_UPLOAD_OEM_DOCUMENTS');
attack('source_runbook_unlock',(i)=>i.runbook.phases[0].gate='GO');
attack('source_runbook_forged_token',(i)=>i.runbook.phases[0].decisionToken='SIGNED');
attack('source_runbook_go_decision',(i)=>i.runbook.goNoGo.decision='GO');
attack('source_scenario_signoff',(i)=>i.scenarios.cases[0].engineeringApproved=true);
attack('source_scenario_received',(i)=>i.scenarios.summary.realReceivedDocuments=1);
attack('source_private_blueprint_asset',(i)=>i.blueprint.pilotCases[0].actualAssetTag='REAL_TAG');
attack('source_private_blueprint_authorized',(i)=>i.blueprint.pilotCases[0].publicDecision='GO');
attack('source_review_packet_approved',(i)=>i.reviewPacket.summary.engineeringApprovals=1);
attack('source_intake_stored',(i)=>i.intake.boundaries.privateStorageImplemented=true);
attack('source_policy_autoreview',(i)=>i.decisionPolicy.trustBoundary.engineeringAutoApproval=true);
attack('source_gap_unblocked',(i)=>i.gaps.records[0].autoRemapAllowed=true);
attack('source_maturity_field',(i)=>i.maturity.summary.fieldConfirmed=1);
attack('source_maturity_SAP',(i)=>i.maturity.summary.sapMappingsApproved=1);
attack('source_sap_exception_deleted',(i)=>i.gaps.records.pop());
const report={...snapshot,audit:{status:errors.length?'FAIL':'OK',
 verifiedUpstreamAudits:checks.length,adversarialMutations:adversarial.length,
 adversarialRejected:adversarial.filter(x=>x.rejected).length,adversarial,errors}};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-corporate-readiness-closure.generated.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.audit.status,summary:report.summary,
 gateWaves:report.waves.map(x=>({wave:x.wave,gates:x.gateIds})),
 pilotCheckCounts:report.pilotCases.map(x=>({id:x.caseId,checks:x.checklistSections.reduce((n,y)=>n+y.expectedChecks,0)})),
 upstreamAudits:checks.length,adversarialMutations:report.audit.adversarialMutations,
 rejected:report.audit.adversarialRejected,errors},null,2));
process.exit(errors.length?1:0);
