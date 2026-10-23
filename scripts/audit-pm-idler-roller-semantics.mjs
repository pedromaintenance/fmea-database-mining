#!/usr/bin/env node
/**
 * Verify ontological semantic split without creating field evidence, touching
 * SAP PM approvals, or changing published 1.0.0 chain-level contracts.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateIdlerRollerBoundary,IDLER_CONDITIONS,IDLER_ACTIONS,ROLLER_CONDITIONS,ROLLER_ACTIONS} from './lib/pm-idler-roller-boundary.mjs';
import {inspectFocusGuards} from './lib/pm-functional-boundaries.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const model=read('data/ontology/condition-action-damage.v1.json');
const fixtures=read('data/quality/semantic-regression-fixtures.v1.json');
const gaps=read('data/quality/pm-gap-review.v1.json').records;
const seed=read('data/knowledge/pm-prevention/seed-rules.json').records;
const gates=read('data/quality/pm-exception-evidence-gates.v1.json').records;
const links=read('data/knowledge/pm-prevention/generated-links.json').records;
const review=read('data/quality/pm-idler-technical-review.v1.json');
const gap=gaps.find(x=>x.ruleId==='track-idler-wear');
const errors=[...inspectFocusGuards(seed,gaps,gates,links),
 ...validateIdlerRollerBoundary(model,fixtures,gap,links)];
const ck=(v,message)=>{if(!v)errors.push(message);};
ck(review.version==='1.3.41'&&review.crossComponentOntologyRefs.length===2,'historical_review_lost');
ck(review.crossComponentOntologyRefs.some(x=>x.refId==='COND-TRACK-ROLLER-HEAT')&&
   review.crossComponentOntologyRefs.some(x=>x.refId==='ACT-TRACK-ROLLER-SEAL-CHECK'),'historical_roller_finding_lost');
ck(seed.length===25&&gaps.length===10&&links.length===115,'baseline_pm_counts_drift');
ck(model.damageHypotheses.length===29&&model.bundles.length===18,'damage_or_bundle_count_changed');
const clone=x=>JSON.parse(JSON.stringify(x));
const mutate=[
 ['borrow_roller_heat',x=>{x.bundles.find(b=>b.id==='BUNDLE-09').conditionIds[1]='COND-TRACK-ROLLER-HEAT';}],
 ['borrow_roller_seal_action',x=>{x.bundles.find(b=>b.id==='BUNDLE-09').actionIds[1]='ACT-TRACK-ROLLER-SEAL-CHECK';}],
 ['borrow_roller_seal_condition',x=>{x.bundles.find(b=>b.id==='BUNDLE-09').conditionIds[2]='COND-TRACK-ROLLER-SEAL-LEAK';}],
 ['destroy_roller_bundle',x=>{x.bundles.find(b=>b.id==='BUNDLE-08').actionIds[1]='ACT-TRACK-IDLER-SEAL-CHECK';}],
 ['ambiguous_confirmed_label',x=>{x.damageHypotheses.find(d=>d.id==='DMG-TRACK-IDLER-WEAR').label='Desgaste confirmado da roda-guia';}],
 ['approve_bearing',x=>{x.damageHypotheses.find(d=>d.id==='DMG-TRACK-IDLER-WEAR').confirmed=true;}],
 ['invent_sap_location',x=>{x.damageHypotheses.find(d=>d.id==='DMG-TRACK-IDLER-WEAR').catalogMapping.locationId='FAKE';}],
 ['invent_idler_heat',x=>{x.conditions.find(d=>d.id==='COND-TRACK-IDLER-HEAT').observedValue=110;}],
 ['invent_idler_seal',x=>{x.conditions.find(d=>d.id==='COND-TRACK-IDLER-SEAL-LEAK').observedAt='2026-10-21';}],
 ['fake_action_execution',x=>{x.actions.find(a=>a.id==='ACT-TRACK-IDLER-SEAL-CHECK').executionStatus='completed';}],
 ['unsafe_maintenance',x=>{x.actions.find(a=>a.id==='ACT-TRACK-IDLER-SEAL-CHECK').requiresApplicableOemProcedure=false;}],
 ['fake_work_order',x=>{x.workOrderExecutions.push({fake:true});}],
 ['false_edge_heat',x=>{x.relations.find(e=>e.id==='REL-050').to='COND-TRACK-ROLLER-HEAT';}],
 ['false_edge_seal_action',x=>{x.relations.find(e=>e.id==='REL-052').to='ACT-TRACK-ROLLER-SEAL-CHECK';}],
 ['remove_idler_seal_edge',x=>{x.relations=x.relations.filter(e=>e.id!=='REL-054');}],
 ['promote_semantic_edge',x=>{x.relations.find(e=>e.id==='REL-054').observed=true;}],
 ['promote_bundle',x=>{x.bundles.find(b=>b.id==='BUNDLE-09').automaticDamagePromotion=true;}],
 ['fabricated_interval',x=>{x.actions.find(a=>a.id==='ACT-TRACK-IDLER-CTS').intervalHours=250;}],
 ['hide_roller_heat',x=>{x.conditions=x.conditions.filter(e=>e.id!=='COND-TRACK-ROLLER-HEAT');}],
 ['change_ontology_version',x=>{x.version='1.3.7';}]
];
let rejected=0;
for(const [id,fn] of mutate){
 const copy=clone(model);fn(copy);
 if(validateIdlerRollerBoundary(copy,fixtures,gap,links).length)rejected++;
 else errors.push('mutation_not_rejected_'+id);
}
const fixtureMutations=[
 ['forge_heat_failure',x=>{x.cases.find(f=>f.id==='SEM-15').expectedConfirmedDamageIds=['DMG-TRACK-IDLER-WEAR'];}],
 ['swap_idler_fixture_to_roller',x=>{x.cases.find(f=>f.id==='SEM-16').observedConditionIds=['COND-TRACK-ROLLER-SEAL-LEAK'];}],
 ['perform_roller_task_as_idler',x=>{x.cases.find(f=>f.id==='SEM-16').performedActionIds=['ACT-TRACK-ROLLER-SEAL-CHECK'];}],
 ['remove_new_fixture',x=>{x.cases=x.cases.filter(f=>f.id!=='SEM-15');}]
];
let fixtureRejected=0;
for(const [id,fn] of fixtureMutations){
 const copy=clone(fixtures);fn(copy);
 if(validateIdlerRollerBoundary(model,copy,gap,links).length)fixtureRejected++;
 else errors.push('fixture_mutation_not_rejected_'+id);
}
ck(rejected===mutate.length&&fixtureRejected===fixtureMutations.length,'missing_adversarial_coverage');
const report={
 schema:'fmea-mining.pm-idler-roller-semantic-audit.v1',version:'1.3.42',
 nature:'catalogue_and_OEM_general_context_no_field_evidence',
 ontologyVersion:model.version,
 counts:{conditions:model.conditions.length,actions:model.actions.length,
  damageHypotheses:model.damageHypotheses.length,relations:model.relations.length,
  syntheticScenarios:fixtures.cases.length,unsafeMutationsRejected:rejected+fixtureRejected,
  mappedSapApprovals:0,fieldObservations:0,performedTasks:0,confirmedDamages:0},
 boundary:{
  idler:{conditions:IDLER_CONDITIONS,actions:IDLER_ACTIONS},
  roller:{conditions:ROLLER_CONDITIONS,actions:ROLLER_ACTIONS},
  idlerDamageLabel:model.damageHypotheses.find(x=>x.id==='DMG-TRACK-IDLER-WEAR').label,
  legacyNodeIdsRemoved:0,
  historicalReview:'v1.3.41_review_remains_as_detection_record',
  correctedBundle:'BUNDLE-09'
 },
 errors
};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-idler-roller-semantics.generated.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',counts:report.counts,
 boundary:report.boundary,adversarialScenarios:mutate.length+fixtureMutations.length,errors},null,2));
process.exit(errors.length?1:0);
