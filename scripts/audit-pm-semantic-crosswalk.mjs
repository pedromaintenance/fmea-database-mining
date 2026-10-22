#!/usr/bin/env node
/** Full rule coverage ledger and transversal semantic boundaries, no OEM effectivity. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateSemanticCrosswalkInputs} from './lib/pm-semantic-crosswalk.mjs';
import {inspectFocusGuards} from './lib/pm-functional-boundaries.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const ont=read('data/ontology/condition-action-damage.v1.json');
const policy=read('data/quality/pm-semantic-crosswalk-policy.v1.json');
const rules=read('data/knowledge/pm-prevention/seed-rules.json').records;
const gaps=read('data/quality/pm-gap-review.v1.json').records;
const gates=read('data/quality/pm-exception-evidence-gates.v1.json').records;
const links=read('data/knowledge/pm-prevention/generated-links.json').records;
const errors=[...inspectFocusGuards(rules,gaps,gates,links)];
const ck=(condition,reason)=>{if(!condition)errors.push(reason)};
const results=validateSemanticCrosswalkInputs(ont,rules,policy);
errors.push(...results.errors);
ck(links.length===115&&gaps.length===10&&rules.length===25,'pm_baseline_drift');
ck(results.coverage.modeledRules===12&&results.coverage.unmodeledRuleIds.length===13,'inaccurate_semantic_coverage');
ck(results.coverage.sharedGenericNodes===6&&results.coverage.sharedDamageNodes===0,'unexpected_semantic_sharing');
ck(results.shared.every(x=>x.risk?.length>60&&x.requiredDiscrimination?.length>65),'ambiguous_shared_node_undocumented');
const clone=x=>JSON.parse(JSON.stringify(x));
const attacks=[
 ['fuel_water_as_hydraulic',x=>{x.conditions.find(c=>c.id==='COND-FUEL-WATER').system='hidraulico';}],
 ['fuel_tank_uses_hyd_condition',x=>{x.bundles.find(b=>b.ruleId==='fuel-tank-water').conditionIds[0]='COND-HYD-EXTERNAL-LEAK';}],
 ['fuel_tank_uses_hyd_action',x=>{x.bundles.find(b=>b.ruleId==='fuel-tank-water').actionIds[0]='ACT-HYD-PUMP-LEAK-TRACE';}],
 ['hose_uses_pump_damage',x=>{x.bundles.find(b=>b.ruleId==='hydraulic-hose-leak').differentialDamageIds[0]='DMG-HYD-PUMP-SEAL-LEAK';}],
 ['engine_uses_fuel_sample',x=>{x.bundles.find(b=>b.ruleId==='engine-oil-filter').actionIds[0]='ACT-FUEL-REPRESENTATIVE-SAMPLE';}],
 ['coolant_uses_fuel_condition',x=>{x.bundles.find(b=>b.ruleId==='cooling-radiator-blockage').conditionIds[0]='COND-FUEL-WATER';}],
 ['idler_borrows_roller_heat',x=>{x.bundles.find(b=>b.ruleId==='track-idler-wear').conditionIds[1]='COND-TRACK-ROLLER-HEAT';}],
 ['roller_borrows_idler_seal',x=>{x.bundles.find(b=>b.ruleId==='track-roller-wear').actionIds[1]='ACT-TRACK-IDLER-SEAL-CHECK';}],
 ['drain_damage_shared',x=>{x.bundles.find(b=>b.ruleId==='fuel-filter-contamination').differentialDamageIds[0]='DMG-FUEL-DRAIN-FAILURE';}],
 ['make_filter_specific_condition_shared',x=>{x.bundles.find(b=>b.ruleId==='fuel-tank-water').conditionIds.push('COND-FUEL-FLOW-RESTRICTION');}],
 ['duplicate_reference_same_bundle',x=>{x.bundles.find(b=>b.ruleId==='fuel-tank-water').conditionIds.push('COND-FUEL-WATER');}],
 ['remove_link',x=>{x.relations=x.relations.filter(e=>e.id!=='REL-049');}],
 ['relocate_link',x=>{x.relations.find(e=>e.id==='REL-049').to='COND-TRACK-ROLLER-HEAT';}],
 ['mark_shared_water_as_observed',x=>{x.conditions.find(c=>c.id==='COND-FUEL-WATER').observedValue='fake';}],
 ['execute_shared_sample',x=>{x.actions.find(a=>a.id==='ACT-FUEL-REPRESENTATIVE-SAMPLE').executionStatus='completed';}],
 ['approve_damage',x=>{x.damageHypotheses.find(d=>d.id==='DMG-HYD-PUMP-SEAL-LEAK').confirmed=true;}],
 ['approve_bundle',x=>{x.bundles.find(b=>b.ruleId==='hydraulic-hose-leak').automaticDamagePromotion=true;}],
 ['manufacture_work_order',x=>{x.workOrderExecutions.push({fake:true});}],
 ['change_ontology_version',x=>{x.version='1.3.7';}],
 ['create_unapproved_bundle',x=>{const b=clone(x.bundles[0]);b.id='BUNDLE-X';b.ruleId='final-drive-gear';x.bundles.push(b);}]
];
let rejected=0;
for(const [name,edit] of attacks){
 const x=clone(ont);edit(x);
 if(validateSemanticCrosswalkInputs(x,rules,policy).errors.length)rejected++;
 else errors.push('unsafe_ontology_edit_passed_'+name);
}
const policyAttacks=[
 ['remove_shared',x=>{x.sharedNodes.pop();}],
 ['invent_shared_damage',x=>{x.sharedNodes[0].kind='damage';}],
 ['cross_system_policy',x=>{x.sharedNodes[0].system='hidraulico';}],
 ['weaken_discrimination',x=>{x.sharedNodes[1].requiredDiscrimination='';}],
 ['relax_field_rule',x=>{x.policy.noObservedConditions=false;}],
 ['pretend_full_coverage',x=>{x.expectedUnmodeledRules=0;}],
 ['invent_oem_approval',x=>{x.approvedSapMappings=1;}],
 ['omit_idler_boundary',x=>{x.domainSeparation=x.domainSeparation.filter(y=>y.left!=='track-roller-wear');}],
 ['wrong_share_partner',x=>{x.sharedNodes[0].ruleIds=['fuel-tank-water','hydraulic-pump-seal'];}]
];
let rejectedPolicy=0;
for(const [name,edit] of policyAttacks){
 const x=clone(policy);edit(x);
 if(validateSemanticCrosswalkInputs(ont,rules,x).errors.length)rejectedPolicy++;
 else errors.push('unsafe_policy_edit_passed_'+name);
}
ck(rejected===attacks.length&&rejectedPolicy===policyAttacks.length,'mutation_suite_incomplete');
const payload={
 schema:'fmea-mining.pm-semantic-crosswalk-report.v1',version:'1.3.43',
 nature:'nine_modeled_rules_plus_sixteen_unmodeled_rules_no_field_verification',
 counts:{...results.coverage,
  unsafeOntologyMutationsRejected:rejected,unsafePolicyMutationsRejected:rejectedPolicy,
  confirmedDamageEvents:0,executedMaintenanceActions:0,approvedSapMappings:0},
 sharedNodes:results.shared,
 editorialReviewCandidates:results.editorialFlags,
 distinction:'generic_shared_condition_or_action_is_not_component_failure_or_root_cause',
 pending:'extend_semantic_ontology_to_unmodeled_rules_with_OEM_review',
 errors
};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-semantic-crosswalk.generated.json'),JSON.stringify(payload,null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',counts:payload.counts,
 shared:payload.sharedNodes.map(x=>({id:x.id,kind:x.kind,rules:x.ruleIds})),
 editorialReviewCandidates:payload.editorialReviewCandidates,
 errors:errors.slice(0,35)},null,2));
process.exit(errors.length?1:0);
