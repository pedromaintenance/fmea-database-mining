#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {buildPmP0StagedTriage,assessPmP0StagedTriage} from './lib/pm-p0-staged-triage.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const inputs={
 policy:read('data/quality/pm-p0-staged-triage-policy.v1.json'),
 readiness:read('data/quality/pm-p0-investigation-readiness.v1.json'),
 seeds:read('data/knowledge/pm-prevention/seed-rules.json'),
 gaps:read('data/quality/pm-gap-review.v1.json'),
 maturity:read('data/quality/pm-maturity-matrix.v1.json'),
 runbook:read('data/governance/pm-private-deployment-runbook.v1.json')
};
const clone=x=>JSON.parse(JSON.stringify(x)),baseline=buildPmP0StagedTriage(inputs);
const assessed=assessPmP0StagedTriage(inputs,baseline);
const errors=[...assessed.errors],mutations=[];
function attack(name,fn){
 const src=clone(inputs),out=clone(baseline);fn(src,out);
 let rejected=false;
 try{rejected=assessPmP0StagedTriage(src,out).status==='REJECTED'}catch(e){rejected=true}
 mutations.push({name,rejected});if(!rejected)errors.push('unsafe_mutation_accepted_'+name);
}
const first=o=>o.candidatePositions[0],template=o=>o.keyTemplates[0];
attack('template_is_asset',(_,o)=>template(o).distinctAssetCount=1);
attack('template_model_approved',(_,o)=>template(o).verifiedModel=true);
attack('template_crosswalk_approved',(_,o)=>template(o).publicCrosswalkStatus='APPROVED');
attack('template_private_receipt_leaked',(_,o)=>template(o).privateEvidenceReceipt='TEST-PRIVATE');
attack('template_request_falsely_sent',(_,o)=>template(o).realRequestsSent=1);
attack('template_rule_removed',(_,o)=>template(o).relevantRules.pop());
attack('template_wrong_system',(_,o)=>template(o).systemCandidates=['arrefecimento']);
attack('template_duplicate',(_,o)=>o.keyTemplates.push(clone(o.keyTemplates[0])));
attack('template_removed',(_,o)=>o.keyTemplates.pop());
attack('slot_rule_alias',(_,o)=>first(o).ruleId='fuel-tank-water');
attack('slot_model_alias',(_,o)=>first(o).modelCandidateKey='CAT999');
attack('slot_wrong_system',(_,o)=>first(o).system='hidraulico');
attack('slot_wrong_subgroup',(_,o)=>first(o).subgroupCandidate='HSVV');
attack('slot_wrong_blocker',(_,o)=>first(o).existingSapBlocker='NO_BLOCKER');
attack('slot_wrong_bundle',(_,o)=>first(o).bundleId='BUNDLE-25');
attack('slot_cross_system_root',(_,o)=>first(o).rootFilterCandidates=['HYSY']);
attack('slot_root_marked_effective',(_,o)=>first(o).rootsAreProvisionalOnly=false);
attack('slot_subgroup_alone_passes',(_,o)=>first(o).subgroupOnlyMatchAccepted=true);
attack('slot_installed_function_claim',(_,o)=>first(o).installedFunctionConfirmed=true);
attack('slot_private_id_leak',(_,o)=>first(o).realAssetIdentityInPublicReport='TEST-ASSET-1');
attack('slot_identity_gate_skipped',(_,o)=>first(o).identityGate.requestId='OEM-MANUAL');
attack('slot_identity_verified',(_,o)=>first(o).identityGate.status='VERIFIED');
attack('slot_private_applicability_claim',(_,o)=>first(o).identityGate.privateApplicability='applicable');
attack('slot_private_crosswalk_claim',(_,o)=>first(o).identityGate.privateCrosswalkReceipt='TEST-RECEIPT');
attack('slot_deferred_OEM_removed',(_,o)=>first(o).deferredRequestIds.pop());
attack('slot_OEM_sent_early',(_,o)=>first(o).deferredStatus='SENT');
attack('slot_hypotheses_confirmed',(_,o)=>first(o).hypothesisVerified=true);
attack('slot_damage_confirmed',(_,o)=>first(o).damageConfirmed=true);
attack('slot_cause_confirmed',(_,o)=>first(o).causeConfirmed=true);
attack('slot_OEM_verified',(_,o)=>first(o).OEMSerialEffectivityVerified=true);
attack('slot_SAP_approved',(_,o)=>first(o).sapMappingApproved=true);
attack('slot_engineering_approved',(_,o)=>first(o).engineeringSignedOff=true);
attack('slot_field_work_authorized',(_,o)=>first(o).fieldWorkAuthorized=true);
attack('slot_return_to_service',(_,o)=>first(o).operationallyReleased=true);
attack('slot_public_GO',(_,o)=>first(o).decision='GO');
attack('slot_deleted',(_,o)=>o.candidatePositions.pop());
attack('slot_duplicated',(_,o)=>o.candidatePositions.push(clone(o.candidatePositions[0])));
attack('summary_private_requests_sent',(_,o)=>o.summary.privateRequestsSent=1);
attack('summary_asset_count',(_,o)=>o.summary.actualAssetsVerified=1);
attack('summary_OEM_effective',(_,o)=>o.summary.OEMSerialEffectivityApproved=1);
attack('summary_SAP_authorized',(_,o)=>o.summary.realSapMappingsApproved=1);
attack('summary_gates_unblocked',(_,o)=>o.summary.remainingPrivateInfrastructureBlocks=0);
attack('summary_count_confusion',(_,o)=>o.summary.deferredDocumentClassPositions=238);
attack('policy_forgets_identity_gate',(s)=>s.policy.firstGate.requestId='OEM-BOM');
attack('policy_defers_not_six',(s)=>s.policy.deferredRequestIds.pop());
attack('policy_SAP_auto_remap',(s)=>s.policy.safety.noAutomaticRemap=false);
attack('policy_HSVV_cross_system',(s)=>s.policy.safety.sharedHSVVAcrossSystemsNeverInterchangeable=false);
attack('policy_scope_by_subgroup',(s)=>s.policy.safety.subgroupAloneNeverSufficient=false);
attack('policy_public_records_allowed',(s)=>s.policy.safety.noRealPrivateDataInPublicOutput=false);
attack('policy_step_removed',(s)=>s.policy.stages.pop());
attack('upstream_slot_becomes_real',(s)=>s.readiness.slots[0].candidateKeyIsRealEquipment=true);
attack('upstream_actual_serial_claim',(s)=>s.readiness.slots[0].serialNumber='TEST');
attack('upstream_SAP_unlocked',(s)=>s.gaps.records[0].autoRemapAllowed=true);
attack('upstream_real_case_claim',(s)=>s.maturity.summary.fieldConfirmed=1);
attack('upstream_OEM_claim',(s)=>s.maturity.summary.serialOemVerified=1);
attack('upstream_private_go',(s)=>s.runbook.goNoGo.decision='GO');
const report={...baseline,audit:{status:errors.length?'FAIL':'OK',baselineAssessment:assessed.status,adversarialTests:mutations.length,rejectedMutations:mutations.filter(x=>x.rejected).length,mutations,errors}};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-p0-staged-triage.generated.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.audit.status,summary:report.summary,adversarialTests:report.audit.adversarialTests,rejected:report.audit.rejectedMutations,errors},null,2));
process.exit(errors.length?1:0);
