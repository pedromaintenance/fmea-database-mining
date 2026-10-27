#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {buildPmFunctionalReconciliation,assessPmFunctionalReconciliation} from './lib/pm-functional-reconciliation.mjs';
import {buildPmP0StagedTriage,assessPmP0StagedTriage} from './lib/pm-p0-staged-triage.mjs';
import {buildPmFunctionalReviewWorkpacks,assessPmFunctionalReviewWorkpacks} from './lib/pm-functional-review-workpacks.mjs';
import {buildPmP0DiscriminativeEvidence,assessPmP0DiscriminativeEvidence} from './lib/pm-p0-discriminative-evidence.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8')),clone=x=>JSON.parse(JSON.stringify(x));
const seeds=read('data/knowledge/pm-prevention/seed-rules.json'),gaps=read('data/quality/pm-gap-review.v1.json'),maturity=read('data/quality/pm-maturity-matrix.v1.json');
const reconInputs={policy:read('data/quality/pm-functional-reconciliation-policy.v1.json'),
 db:read('data/catalog/failure-db.v1.json'),rules:seeds.records,
 links:read('data/knowledge/pm-prevention/generated-links.json').records,gaps,maturity};
const reconciliation=buildPmFunctionalReconciliation(reconInputs);
const stagedInputs={policy:read('data/quality/pm-p0-staged-triage-policy.v1.json'),
 readiness:read('data/quality/pm-p0-investigation-readiness.v1.json'),seeds,gaps,maturity,
 runbook:read('data/governance/pm-private-deployment-runbook.v1.json')};
const staged=buildPmP0StagedTriage(stagedInputs);
const workpackInputs={policy:read('data/quality/pm-functional-review-workpacks-policy.v1.json'),reconciliation,seeds,gaps,maturity,staged};
const workpacks=buildPmFunctionalReviewWorkpacks(workpackInputs);
const inputs={policy:read('data/quality/pm-p0-discriminative-evidence-policy.v1.json'),
 originalPolicy:read('data/quality/pm-p0-investigation-readiness-policy.v1.json'),
 readiness:stagedInputs.readiness,workpacks,gaps,maturity};
const report=buildPmP0DiscriminativeEvidence(inputs);
const initial=assessPmP0DiscriminativeEvidence(inputs,report);
const errors=[...initial.errors],attacks=[];
for(const [id,result] of [
 ['functional_recon',assessPmFunctionalReconciliation(reconInputs,reconciliation).status],
 ['staged_P0',assessPmP0StagedTriage(stagedInputs,staged).status],
 ['family_workpacks',assessPmFunctionalReviewWorkpacks(workpackInputs,workpacks).status]
]){
 if(!result.startsWith('NO_GO_'))errors.push('upstream_audit_'+id+'_'+result);
}
function attack(name,change){
 const source=clone(inputs),out=clone(report);
 try{change(source,out)}catch(e){errors.push('invalid_test_fixture_'+name+'_'+e.message);return}
 let detected=false;
 try{detected=assessPmP0DiscriminativeEvidence(source,out).status==='REJECTED'}catch(_){detected=true}
 attacks.push({name,detected});if(!detected)errors.push('unsafe_mutation_accepted_'+name);
}
const p=x=>x.packets[0],h=x=>x.packets[0].differentials[0];
attack('actual_tag_in_p0',(s,o)=>p(o).actualAssetIdentified=true);
attack('fabricated_serial_verification',(s,o)=>p(o).serialOemVerified=true);
attack('fabricated_field_approval',(s,o)=>p(o).fieldTestApproved=true);
attack('engineering_signoff_faked',(s,o)=>p(o).engineeringSignOff=true);
attack('sap_change_faked',(s,o)=>p(o).SAPChangeApproved=true);
attack('operations_release_faked',(s,o)=>p(o).operationsReleased=true);
attack('packet_go',(s,o)=>p(o).status='GO');
attack('packet_false_machine_type',(s,o)=>p(o).modelKeysAreNotMachines=false);
attack('packet_priority_changed',(s,o)=>p(o).preexistingPriority='P1');
attack('packet_blocker_replaced',(s,o)=>p(o).preexistingBlocker='NONE');
attack('packet_wrong_system',(s,o)=>p(o).system='hidraulico');
attack('packet_bundle_forged',(s,o)=>p(o).bundleId='BUNDLE-25');
attack('packet_wrong_subgroup',(s,o)=>p(o).subgroupCandidate='HSVV');
attack('packet_wrong_hypothesis_count',(s,o)=>p(o).hypothesisCount=2);
attack('packet_first_gate_removed',(s,o)=>p(o).firstPrivateRequest='OEM-TEST');
attack('packet_original_evidence_erased',(s,o)=>p(o).minimumEvidenceFromUpstream.pop());
attack('packet_original_alternative_modified',(s,o)=>p(o).independentAlternativeFromUpstream='CONFIRMED');
attack('packet_reference_removed',(s,o)=>p(o).sourceRegistryIds.pop());
attack('packet_remove',(s,o)=>o.packets.pop());
attack('packet_duplicate',(s,o)=>o.packets.push(clone(p(o))));
attack('hypothesis_kind_changed',(s,o)=>h(o).originalKind='candidate_component_damage');
attack('hypothesis_causal_layer_changed',(s,o)=>h(o).causalInterpretation='damage_confirmed');
attack('hypothesis_exclusive',(s,o)=>h(o).exclusiveOfOtherHypotheses=true);
attack('hypothesis_other_open_removed',(s,o)=>h(o).otherOpenHypotheses.pop());
attack('hypothesis_id_replaced',(s,o)=>h(o).hypothesisId='FABRICATED');
attack('hypothesis_condition_fabricated',(s,o)=>h(o).candidate='confirmed hydraulic failure');
attack('hypothesis_differentiation_removed',(s,o)=>h(o).qualitativeDistinguishingObservation='YES');
attack('hypothesis_competitor_removed',(s,o)=>h(o).independentCompetingExplanationCheck='NA');
attack('hypothesis_negative_result_removed',(s,o)=>h(o).falsificationOrInconclusiveBoundary='GO');
attack('hypothesis_test_run_faked',(s,o)=>h(o).testPerformed=true);
attack('hypothesis_evidence_receipt_faked',(s,o)=>h(o).evidenceReceived=true);
attack('hypothesis_damage_confirmed',(s,o)=>h(o).physicalDamageConfirmed=true);
attack('hypothesis_root_cause_confirmed',(s,o)=>h(o).rootCauseConfirmed=true);
attack('hypothesis_oem_test_effective',(s,o)=>h(o).OEMProcedureEffective=true);
attack('hypothesis_disposition_promoted',(s,o)=>h(o).disposition='CONFIRMED');
attack('hypothesis_diagnostic_auto',(s,o)=>h(o).diagnosisPromotionAllowed=true);
attack('hypothesis_sap_auto',(s,o)=>h(o).SAPCodePromotionAllowed=true);
attack('hypothesis_omit_identity_gate',(s,o)=>h(o).requiredEvidenceRequests.shift());
attack('hypothesis_document_claim',(s,o)=>h(o).requiredEvidenceRequests[0].publiclyEvidenced=true);
attack('hypothesis_private_receipt',(s,o)=>h(o).requiredEvidenceRequests[0].privateReceipt='PRIVATE-URL');
attack('hypothesis_duplicate',(s,o)=>p(o).differentials.push(clone(h(o))));
attack('hypothesis_removed',(s,o)=>p(o).differentials.pop());
attack('summary_fake_cases',(s,o)=>o.summary.observedCases=1);
attack('summary_fake_field_tests',(s,o)=>o.summary.physicalTestsPerformed=1);
attack('summary_fake_damages',(s,o)=>o.summary.confirmedComponentDamages=1);
attack('summary_fake_roots',(s,o)=>o.summary.confirmedRootCauses=1);
attack('summary_fake_oem',(s,o)=>o.summary.OEMSerialEffectivityVerified=1);
attack('summary_fake_sap',(s,o)=>o.summary.approvedSAPMappings=1);
attack('summary_fake_engineering',(s,o)=>o.summary.engineeringApprovals=1);
attack('summary_fake_operation',(s,o)=>o.summary.operationalReleases=1);
attack('summary_private_request_faked',(s,o)=>o.summary.privateRequestsSent=1);
attack('summary_drop_sap_blocks',(s,o)=>o.summary.unchangedSapExceptionBlocks=9);
attack('summary_reduce_differentials',(s,o)=>o.summary.designedDifferentials=14);
attack('summary_reduce_positions',(s,o)=>o.summary.theoreticalRuleModelPositions=34);
attack('summary_GO',(s,o)=>o.summary.decision='GO');
attack('policy_causal_layer_promoted',(s)=>s.policy.causalLayers.condition_not_damaged_core='confirmed_damage');
attack('policy_remove_discriminating_signal',(s)=>s.policy.hypothesisChecks['cooling-radiator-blockage'][0].discriminatingObservation='GO');
attack('policy_remove_counterfactual',(s)=>s.policy.hypothesisChecks['fuel-filter-contamination'][0].competingExplanationCheck='pass');
attack('policy_remove_negative',(s)=>s.policy.hypothesisChecks['hydraulic-hose-leak'][0].negativeOrInconclusiveFinding='confirmed');
attack('policy_unlisted_document_id',(s)=>s.policy.hypothesisChecks['fuel-tank-water'][0].evidenceRequestIds=['ASSET-ID','FAKE-DOCUMENT']);
attack('policy_no_asset_id_request',(s)=>s.policy.hypothesisChecks['hydraulic-hose-abrasion'][0].evidenceRequestIds=['OEM-TEST']);
attack('policy_duplicate_hypothesis',(s)=>s.policy.hypothesisChecks['cooling-radiator-blockage'][0].hypothesisId='RAD-INT-COOLANT');
attack('policy_missing_rule',(s)=>delete s.policy.hypothesisChecks['fuel-tank-water']);
attack('policy_real_status',(s)=>s.policy.allPublicFlags.actualCasesReceived=1);
attack('policy_remove_trust_boundary',(s)=>s.policy.safeguards.noPrivateDocumentsInPublicRepo=false);
attack('policy_auto_sap',(s)=>s.policy.safeguards.noAutomaticSAPRemap=false);
attack('policy_synthetic_threshold',(s)=>s.policy.safeguards.noThresholdInvented=false);
attack('policy_nonexclusive_broken',(s)=>s.policy.interpretation.hypotheses='mutually_exclusive');
attack('upstream_hypothesis_verified',(s)=>s.readiness.packets[0].proposedHypotheses[0].verified=true);
attack('upstream_model_keys_become_real',(s)=>s.readiness.slots[0].candidateKeyIsRealEquipment=true);
attack('upstream_sap_unblocked',(s)=>s.gaps.records[0].autoRemapAllowed=true);
attack('upstream_workpacks_GO',(s)=>s.workpacks.summary.publicDecision='GO');
attack('upstream_approved_sap',(s)=>s.maturity.summary.sapMappingsApproved=1);
attack('upstream_field_recorded',(s)=>s.maturity.summary.fieldConfirmed=1);
attack('upstream_request_id_removed',(s)=>s.originalPolicy.evidenceRequests.pop());
const audit={status:errors.length?'FAIL':'OK',sourceAssessment:initial.status,
 adversarialCases:attacks.length,rejected:attacks.filter(x=>x.detected).length,attacks,errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-p0-discriminative-evidence.generated.json'),JSON.stringify({...report,audit},null,2)+'\n');
console.log(JSON.stringify({status:audit.status,summary:report.summary,
 packets:report.packets.map(x=>({ruleId:x.ruleId,blocker:x.preexistingBlocker,
 differentialIds:x.differentials.map(h=>h.hypothesisId)})),
 adversarialCases:audit.adversarialCases,rejected:audit.rejected,errors},null,2));
process.exit(errors.length?1:0);
