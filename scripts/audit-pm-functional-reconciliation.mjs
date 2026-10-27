#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {classifyPmPath} from './lib/pm-functional-boundaries.mjs';
import {buildPmFunctionalReconciliation,assessPmFunctionalReconciliation} from './lib/pm-functional-reconciliation.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const base={
 policy:read('data/quality/pm-functional-reconciliation-policy.v1.json'),
 db:read('data/catalog/failure-db.v1.json'),
 rules:read('data/knowledge/pm-prevention/seed-rules.json').records,
 links:read('data/knowledge/pm-prevention/generated-links.json').records,
 gaps:read('data/quality/pm-gap-review.v1.json'),
 maturity:read('data/quality/pm-maturity-matrix.v1.json')
};
const output=buildPmFunctionalReconciliation(base),assessment=assessPmFunctionalReconciliation(base,output);
const errors=[...assessment.errors],clone=x=>JSON.parse(JSON.stringify(x)),mutations=[],structuralChecks=[];
const getRule=id=>base.rules.find(x=>x.id===id);
const leaf=(rule,system,group,subgroup,depth=3,model=rule.models[0])=>({
 profundidade:depth,modelo:model,sistema:{codigo:system},grupo:{codigo:group},
 subgrupo:subgroup?{codigo:subgroup}:null
});
const fuel=getRule('fuel-filter-contamination'),hose=getRule('hydraulic-hose-leak');
const cool=getRule('cooling-radiator-blockage'),air=getRule('drill-compressor-filter');
const exampleCases=[
 ['fuel_parent_valid_filter_only',fuel,leaf(fuel,'ENSY','FUSY','HSVV'),'candidate_path'],
 ['fuel_HSVV_in_cooling_group_rejected',fuel,leaf(fuel,'ENSY','COSY','HSVV'),'system_group_out_of_scope'],
 ['fuel_HSVV_in_hydraulics_rejected',fuel,leaf(fuel,'HYSY','FUSY','HSVV'),'system_group_out_of_scope'],
 ['hydraulic_HSVV_in_fuel_rejected',hose,leaf(hose,'ENSY','FUSY','HSVV'),'system_group_out_of_scope'],
 ['hydraulic_HSVV_in_cooling_rejected',hose,leaf(hose,'ENSY','COSY','HSVV'),'system_group_out_of_scope'],
 ['hydraulic_brake_branch_rejected',hose,leaf(hose,'HYSY','BRSY','HSVV'),'system_group_out_of_scope'],
 ['hydraulic_steering_branch_rejected',hose,leaf(hose,'HYSY','STSY','HSVV'),'system_group_out_of_scope'],
 ['hydraulic_candidate_not_OEM',hose,leaf(hose,'HYSY','IMAT','HSVV'),'candidate_path'],
 ['cooling_wrong_parent_rejected',cool,leaf(cool,'ENSY','ENGN','RADI'),'system_group_out_of_scope'],
 ['cooling_candidate_not_OEM',cool,leaf(cool,'ENSY','COSY','RADI'),'candidate_path'],
 ['compressor_COMR_wrong_root',air,leaf(air,'ENSY','COMR','COMR'),'system_group_out_of_scope'],
 ['compressor_group_only_rejected',air,leaf(air,'AISY','COMR','OTHER'),'subgroup_out_of_scope'],
 ['compressor_leaf_candidate_not_OEM',air,leaf(air,'AISY','COMR','COMR'),'candidate_path'],
 ['wrong_model_rejected',fuel,leaf(fuel,'ENSY','FUSY','HSVV',3,'UNREGISTERED'),'model_out_of_scope'],
 ['non_leaf_rejected',fuel,leaf(fuel,'ENSY','FUSY','HSVV',2),'not_leaf_location'],
 ['wrong_subgroup_rejected',fuel,leaf(fuel,'ENSY','FUSY','UNKNOWN'),'subgroup_out_of_scope']
];
for(const [name,rule,loc,expected] of exampleCases){
 let actual;try{actual=classifyPmPath(rule,loc)}catch(e){actual='threw_'+e.message}
 structuralChecks.push({name,expected,actual,passed:actual===expected});
 if(actual!==expected)errors.push('functional_fixture_'+name);
}
function attack(name,modify){
 const d={...base,policy:clone(base.policy),rules:clone(base.rules),links:clone(base.links),gaps:clone(base.gaps),maturity:clone(base.maturity)};
 const r=clone(output);
 modify(d,r);
 let rejected=false;
 try{rejected=assessPmFunctionalReconciliation(d,r).status==='REJECTED'}catch(e){rejected=true}
 mutations.push({name,rejected});if(!rejected)errors.push('adversarial_accept_'+name);
}
const first=r=>r.rows[0],firstCount=r=>r.rows[0].counts;
attack('fabricated_oem_pass',(_,r)=>first(r).rootGroupOemEffective=true);
attack('claimed_installed_part',(_,r)=>first(r).physicalComponentInstalledVerified=true);
attack('claimed_diagnosis',(_,r)=>first(r).diagnosisConfirmed=true);
attack('engineering_review_faked',(_,r)=>first(r).engineeringReviewed=true);
attack('sap_mapping_faked',(_,r)=>first(r).sapMappingApproved=true);
attack('auto_remap_unblocked',(_,r)=>first(r).automaticRemapAllowed=true);
attack('absence_proven_from_zero',(_,r)=>first(r).zeroLinksMeansPhysicalAbsence=true);
attack('remove_human_review',(_,r)=>first(r).reviewNeeded='READY');
attack('inject_fake_link_count',(_,r)=>firstCount(r).actualGeneratedLinks++);
attack('inject_fake_compatible_count',(_,r)=>firstCount(r).permittedDamageCauseInstances++);
attack('skip_root_filter_counts',(_,r)=>firstCount(r).subgroupRejectedBySystemOrGroup++);
attack('skip_part_count',(_,r)=>firstCount(r).componentDescriptionInstances++);
attack('wrong_model_count',(_,r)=>firstCount(r).modelLeafPaths++);
attack('wrong_rule_system',(_,r)=>first(r).system='hidraulico');
attack('wrong_subgroup',(_,r)=>first(r).subgroupCode='HSVV');
attack('wrong_priority',(_,r)=>r.rows.find(x=>x.preexistingGapPriority).preexistingGapPriority='P3');
attack('wrong_blocker',(_,r)=>r.rows.find(x=>x.preexistingSapBlocker).preexistingSapBlocker='cleared');
attack('remove_rule_row',(_,r)=>r.rows.pop());
attack('duplicate_rule_row',(_,r)=>r.rows.push(clone(r.rows[0])));
attack('publish_approval',(_,r)=>r.summary.sapApprovals=1);
attack('publish_actual_observation',(_,r)=>r.summary.realObservations=1);
attack('publish_oem_effectivity',(_,r)=>r.summary.oemSerialClaims=1);
attack('publish_confirmed_diagnosis',(_,r)=>r.summary.diagnosticClaims=1);
attack('claim_sap_exception_closed',(_,r)=>r.summary.preexistingBlockedExceptions=9);
attack('claim_p0_reprioritized',(_,r)=>r.summary.blockedP0=0);
attack('claim_structural_links_zero',(_,r)=>r.summary.generatedCandidateLinks=0);
attack('claim_operational_GO',(_,r)=>r.summary.overallState='GO');
attack('shared_subgroup_misinterpreted',(_,r)=>r.sharedSubgroups[0].sameCodeNotProofOfSameCircuit=false);
attack('shared_subgroup_full_path_dropped',(_,r)=>r.sharedSubgroups[0].allApplicationsNeedFullPath=false);
attack('shared_subgroup_code_swapped',(_,r)=>r.sharedSubgroups[0].subgroupCode='HYPOTHETICAL');
attack('policy_subgroup_only_enabled',(d)=>d.policy.differentialGuards.neverMatchBySubgroupAlone=false);
attack('policy_allow_sap_recoding',(d)=>d.policy.differentialGuards.noAutomaticSAPRecoding=false);
attack('policy_allow_field_claims',(d)=>d.policy.publicClaims.fieldInspectionsPerformed=1);
attack('policy_equate_zero_with_absence',(d)=>d.policy.interpretation.zeroLinks='physical_absence');
attack('policy_stage_removed',(d)=>d.policy.stageOrder.pop());
attack('source_link_approved',(d)=>d.links[0].associationStatus='homologado');
attack('source_duplicate_link',(d)=>d.links.push({...d.links[0]}));
attack('source_component_not_catalogued',(d)=>d.links[0].componentCode='FAKE_CODE');
attack('source_wrong_functional_location',(d)=>d.links[0].locationId='FAKE_LOCATION');
attack('source_link_declared_observed',(d)=>d.links[0].occurrence='observada');
attack('source_blocked_gap_unlocked',(d)=>d.gaps.records[0].autoRemapAllowed=true);
attack('source_gap_observed_failure',(d)=>d.gaps.records[0].observedFailures=1);
attack('source_maturity_SAP_approved',(d)=>d.maturity.summary.sapMappingsApproved=1);
attack('source_maturity_OEM_verified',(d)=>d.maturity.summary.serialOemVerified=1);
attack('source_maturity_field_evidence',(d)=>d.maturity.summary.fieldConfirmed=1);
attack('source_rule_review_approved',(d)=>d.rules[0].review='aprovado');
const report={...output,audit:{
 status:errors.length?'FAIL':'OK',sourceAssessment:assessment.status,
 functionalFixtures:structuralChecks.length,functionalFixturesPassed:structuralChecks.filter(x=>x.passed).length,
 adversarialMutations:mutations.length,adversarialRejected:mutations.filter(x=>x.rejected).length,
 structuralChecks,mutations,errors
}};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-functional-reconciliation.generated.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.audit.status,summary:report.summary,
 fixtureTests:report.audit.functionalFixtures,fixturePassed:report.audit.functionalFixturesPassed,
 adversarialTests:report.audit.adversarialMutations,rejected:report.audit.adversarialRejected,
 blockedRules:report.rows.filter(x=>x.preexistingSapBlocker).map(x=>x.ruleId),errors},null,2));
process.exit(errors.length?1:0);
