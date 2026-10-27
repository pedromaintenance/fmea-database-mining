#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {buildPmFunctionalReconciliation,assessPmFunctionalReconciliation} from './lib/pm-functional-reconciliation.mjs';
import {buildPmP0StagedTriage,assessPmP0StagedTriage} from './lib/pm-p0-staged-triage.mjs';
import {buildPmFunctionalReviewWorkpacks,assessPmFunctionalReviewWorkpacks} from './lib/pm-functional-review-workpacks.mjs';
import {buildPmP0DiscriminativeEvidence,assessPmP0DiscriminativeEvidence} from './lib/pm-p0-discriminative-evidence.mjs';
import {buildPmP0PilotEvidenceBlueprints,assessPmP0PilotEvidenceBlueprints} from './lib/pm-p0-evidence-pilot-blueprints.mjs';
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
const report=buildPmP0PilotEvidenceBlueprints(inputs);
const initial=assessPmP0PilotEvidenceBlueprints(inputs,report);
const errors=[...initial.errors],mutations=[];
for(const [id,result] of [
 ['reconciliation',assessPmFunctionalReconciliation(reconIn,reconciliation).status],
 ['staged',assessPmP0StagedTriage(stagedIn,staged).status],
 ['workpacks',assessPmFunctionalReviewWorkpacks(workIn,workpacks).status],
 ['differentials',assessPmP0DiscriminativeEvidence(diffIn,differentials).status]
])if(!result.startsWith('NO_GO_'))errors.push('upstream_invalid_'+id+'_'+result);
function attack(id,fn){
 const source=clone(inputs),out=clone(report);
 try{fn(source,out)}catch(e){errors.push('bad_test_case_'+id+'_'+e.message);return}
 let caught=false;
 try{caught=assessPmP0PilotEvidenceBlueprints(source,out).status==='REJECTED'}catch(e){caught=true}
 mutations.push({id,caught});
 if(!caught)errors.push('unsafe_attack_accepted_'+id);
}
const h=o=>o.hypothesisRows[0],c=o=>o.pilotCases[0],p=o=>o.pilotCases[0].checklist[0],r=o=>o.pilotCases[0].evidenceReceiptKinds[0];
attack('recorded_real_asset',(_,o)=>h(o).realAssetMapped=true);
attack('OEM_effectivity_faked',(_,o)=>h(o).OEMEffective=true);
attack('custody_authenticated_without_proof',(_,o)=>h(o).authenticatedCustody=true);
attack('real_measurement_claimed',(_,o)=>h(o).realMeasurementTaken=true);
attack('counterevidence_autoreview',(_,o)=>h(o).falsifyingEvidenceReviewed=true);
attack('hypothesis_auto_confirmed',(_,o)=>h(o).hypothesisConfirmed=true);
attack('root_cause_auto_confirmed',(_,o)=>h(o).rootCauseConfirmed=true);
attack('eng_approved',(_,o)=>h(o).humanEngineeringApproved=true);
attack('sap_approved',(_,o)=>h(o).SAPRemapApproved=true);
attack('operations_approved',(_,o)=>h(o).operationsReleased=true);
attack('public_disposition_promoted',(_,o)=>h(o).currentDisposition='supported_for_independent_review');
attack('public_go',(_,o)=>h(o).decision='GO');
attack('different_hypothesis_id',(_,o)=>h(o).hypothesisId='UNKNOWN');
attack('wrong_hypothesis_rule',(_,o)=>h(o).ruleId='wheel-tire-wear');
attack('causal_layer_recast',(_,o)=>h(o).causalLayer='root_cause_confirmed');
attack('hypothesis_competitor_removed',(_,o)=>h(o).competingMechanismReview='none');
attack('qualifying_signal_removed',(_,o)=>h(o).qualifyingSignal='yes');
attack('negative_evidence_removed',(_,o)=>h(o).unresolvedOrNegativeBoundary='none');
attack('competing_hypothesis_removed',(_,o)=>h(o).competingHypothesisIds.pop());
attack('missing_supplemental_counterevidence',(_,o)=>h(o).requiredIntakeReceiptKinds=h(o).requiredIntakeReceiptKinds.filter(x=>x!=='counterevidence'));
attack('missing_metrology',(_,o)=>h(o).requiredIntakeReceiptKinds=h(o).requiredIntakeReceiptKinds.filter(x=>x!=='measurement_quality'));
attack('remove_private_metadata',(_,o)=>h(o).minimumPrivateCustodyMetadata.pop());
attack('remove_source_document_request',(_,o)=>h(o).documentaryRequests.pop());
attack('mark_source_document_received',(_,o)=>h(o).documentaryRequests[0].privateDocumentReceived=true);
attack('insert_private_vault_url',(_,o)=>h(o).documentaryRequests[0].verifiedReceipt='PRIVATE-VAULT');
attack('force_document_applicability',(_,o)=>h(o).documentaryRequests[0].applicabilityConfirmed=true);
attack('crosswalk_sap_into_oem_receipt',(s)=>s.policy.referenceToIntake['SAP-BOM'].kind='oem_effectivity');
attack('crosswalk_identity_not_private',(s)=>s.policy.referenceToIntake['ASSET-ID'].kind='field_observation');
attack('crosswalk_remove_SAP_lane',(s)=>s.policy.referenceToIntake['SAP-BOM'].lane='engineering_validation');
attack('crosswalk_invent_unknown_request',(s)=>delete s.policy.referenceToIntake['OEM-BOM']);
attack('policy_disable_private_boundary',(s)=>s.policy.guardrails.noLiveEvidenceIngestOrStorage=false);
attack('policy_allow_automatic_workorder',(s)=>s.policy.guardrails.noAutomaticTaskOrWorkOrder=false);
attack('policy_ignores_counterevidence',(s)=>s.policy.guardrails.competingHypothesesNotAutomaticallyEliminated=false);
attack('policy_approves_SAP',(s)=>s.policy.guardrails.SAPMasterdataIsNotOperationalAuthorization=false);
attack('policy_reorders_gates',(s)=>s.policy.gateOrder.shift());
attack('policy_improper_kinds',(s)=>s.policy.evidenceKinds.pop());
attack('policy_missing_metadata',(s)=>s.policy.mandatoryPrivateCustodyMetadata.pop());
attack('pilot_real_case_id',(_,o)=>c(o).actualCaseId='ACTUAL');
attack('pilot_asset_tag',(_,o)=>c(o).actualAssetTag='TEST-ASSET');
attack('pilot_serial',(_,o)=>c(o).actualSerial='SERIAL');
attack('pilot_actual_evidence',(_,o)=>c(o).actualEvidenceCount=1);
attack('pilot_go',(_,o)=>c(o).publicDecision='GO');
attack('pilot_field_authorized',(_,o)=>c(o).fieldInspectionAuthorized=true);
attack('pilot_eng_signed',(_,o)=>c(o).engineeringSignoff=true);
attack('pilot_SAP_changed',(_,o)=>c(o).SAPMasterdataChangeApproved=true);
attack('pilot_released',(_,o)=>c(o).operationsReleaseGranted=true);
attack('pilot_check_approved',(_,o)=>p(o).status='VERIFIED');
attack('pilot_check_private_token',(_,o)=>p(o).privateReceipt='PRIVATE');
attack('pilot_check_reviewer_claim',(_,o)=>p(o).reviewerToken='PERSON');
attack('pilot_check_deleted',(_,o)=>c(o).checklist.pop());
attack('pilot_receipt_received',(_,o)=>r(o).status='RECEIVED');
attack('pilot_receipt_custody_claim',(_,o)=>r(o).custodyVerified=true);
attack('pilot_receipt_license_claim',(_,o)=>r(o).licenseVerified=true);
attack('pilot_receipt_private_url',(_,o)=>r(o).privateVaultRef='PRIVATE');
attack('pilot_lane_signed',(_,o)=>c(o).decisionLanes[0].signatureVerified=true);
attack('pilot_lane_private_review',(_,o)=>c(o).decisionLanes[0].privateReviewRef='PRIVATE');
attack('pilot_lane_removed',(_,o)=>c(o).decisionLanes.pop());
attack('pilot_custody_stage_removed',(_,o)=>c(o).custodyStages.pop());
attack('pilot_role_removed',(_,o)=>c(o).independentRoleOrder.pop());
attack('pilot_duplicate',(_,o)=>o.pilotCases.push(clone(c(o))));
attack('pilot_removed',(_,o)=>o.pilotCases.pop());
attack('hypothesis_removed',(_,o)=>o.hypothesisRows.pop());
attack('hypothesis_duplicated',(_,o)=>o.hypothesisRows.push(clone(h(o))));
attack('summary_false_real',(_,o)=>o.summary.realPilotsSelected=1);
attack('summary_false_field',(_,o)=>o.summary.fieldInspections=1);
attack('summary_false_SAP',(_,o)=>o.summary.SAPApprovals=1);
attack('summary_false_operation',(_,o)=>o.summary.operationsReleases=1);
attack('summary_private_approvals',(_,o)=>o.summary.engineeringApprovals=1);
attack('summary_dropped_blocks',(_,o)=>o.summary.blockedPrivateGates=0);
attack('summary_drop_requirements',(_,o)=>o.summary.pilotChecklistInstances=67);
attack('summary_false_receipts',(_,o)=>o.summary.receivedRealEvidence=1);
attack('upstream_live_platform_claim',(s)=>s.intake.boundaries.privateStorageImplemented=true);
attack('upstream_review_ledger_claim',(s)=>s.reviewPolicy.trustBoundary.immutableDecisionLedgerImplemented=true);
attack('upstream_preflight_pilot_claim',(s)=>s.preflight.summary.actualPilotsApproved=1);
attack('upstream_decision_falsified',(s)=>s.reviewPacket.summary.publicDecision='GO');
attack('upstream_oem_approval_claim',(s)=>s.maturity.summary.serialOemVerified=1);
attack('upstream_engineering_false',(s)=>s.differentials.packets[0].engineeringSignOff=true);
attack('upstream_sap_unblocked',(s)=>s.gaps.records[0].autoRemapAllowed=true);
attack('upstream_private_gates_unblocked',(s)=>s.runbook.phases[0].gate='GO');
const audit={status:errors.length?'FAIL':'OK',sourceAssessment:initial.status,
 negativeTests:mutations.length,attacksRejected:mutations.filter(x=>x.caught).length,
 mutations,errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-p0-evidence-pilot-blueprints.generated.json'),JSON.stringify({...report,audit},null,2)+'\n');
console.log(JSON.stringify({status:audit.status,summary:report.summary,
 pilotCases:report.pilotCases.map(x=>({caseId:x.caseId,ruleId:x.ruleId,checklist:x.checklist.length,receiptKinds:x.evidenceReceiptKinds.length,decisionLanes:x.decisionLanes.length})),
 tests:audit.negativeTests,rejected:audit.attacksRejected,errors},null,2));
process.exit(errors.length?1:0);
