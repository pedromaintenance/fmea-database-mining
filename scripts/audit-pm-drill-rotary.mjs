#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateSemanticCrosswalkInputs} from './lib/pm-semantic-crosswalk.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const model=read('data/ontology/condition-action-damage.v1.json');
const fixture=read('data/quality/semantic-regression-fixtures.v1.json');
const guard=read('data/quality/pm-drill-rotary-boundaries.v1.json');
const cross=read('data/quality/pm-semantic-crosswalk-policy.v1.json');
const seeds=read('data/knowledge/pm-prevention/seed-rules.json').records;
const gaps=read('data/quality/pm-gap-review.v1.json').records;
const links=read('data/knowledge/pm-prevention/generated-links.json').records;
const sources=new Set(read('data/research/sources.v1.json').sources.map(s=>s.id));
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const clone=x=>JSON.parse(JSON.stringify(x));
const by=(a,id)=>a.find(x=>x.id===id);
const cIds=['COND-ROTARY-BEARING-NOISE','COND-ROTARY-BEARING-VIBRATION','COND-ROTARY-BEARING-TEMPERATURE','COND-ROTARY-BEARING-LUBE','COND-ROTARY-BEARING-PLAY','COND-ROTARY-BEARING-FASTENER'];
const aIds=['ACT-ROTARY-BEARING-CONFIG','ACT-ROTARY-BEARING-SAFE-REVIEW','ACT-ROTARY-BEARING-LUBE-CORRELATE','ACT-ROTARY-BEARING-DIAGNOSIS','ACT-ROTARY-BEARING-DISPOSITION'];
const dIds=['DMG-ROTARY-BEARING-RACE-CANDIDATE','DMG-ROTARY-BEARING-SUPPORT-CANDIDATE','DMG-ROTARY-BEARING-SEAL-CANDIDATE'];
const sIds=['SANDVIK-DI650I-ROTARY-BROCHURE-2020','SANDVIK-DI650I-ROTARY-OEM-PAGE','SANDVIK-DR410I-TWO-STAGE-ROTARY-OEM'];
function check(m,f,p,crossPolicy){
 const errors=[],ck=(v,k)=>{if(!v)errors.push(k)};
 const seed=seeds.find(x=>x.id==='drill-rotary-bearing'),b=by(m.bundles,'BUNDLE-23');
 ck(m.schema==='fmea-mining.condition-action-damage.v1'&&m.version==='1.3.23'&&m.conditions.length===107&&m.actions.length===82&&m.damageHypotheses.length===51&&m.bundles.length===25&&m.relations.length===251,'ontology_cardinality');
 ck(m.observations.length===0&&m.workOrderExecutions.length===0&&m.confirmedComponentDamages.length===0,'fabricated_field_events');
 ck(seed?.system==='cabeca_rotativa'&&seed?.subgroupCode==='MORO'&&seed?.partText==='Rolamento'&&seed?.review==='pendente'&&seeds.length===25&&gaps.length===10&&links.length===115,'sap_pm_seed_modified');
 ck(p.schema==='fmea-mining.pm-drill-rotary-boundaries.v1'&&p.version==='1.3.57'&&p.sourceOntologyVersion==='1.3.21'&&p.ruleId==='drill-rotary-bearing','guard_identity');
 ck(eq(p.scope.models,seed.models)&&p.scope.system===seed.system&&p.scope.subgroupCode===seed.subgroupCode&&p.scope.partText===seed.partText,'false_seed_mapping');
 ck(p.scope.eqModelMappingVerified===false&&p.scope.serialEffectivityVerified===false&&p.scope.headVariantInstalled===null&&p.scope.bearingModulePartNumberVerified===false&&p.scope.oilCompartmentVerified===false,'assumed_installed_head');
 ck(eq(p.sourceIds,sIds)&&p.sourceIds.every(id=>sources.has(id)),'source_provenance');
 const h=p.oemArchitectures;
 ck(h.length===3&&eq(h.map(x=>x.id),['DI650i-HTRH6','DI650i-MRH6','DR410i-TWO-STAGE']),'oem_architecture_identity');
 ck(h[0].familyDocumented===true&&h[0].bearingModuleDocumented===true&&h[0].bearingPreloadMechanismKnown===null&&h[0].installedOnFleet===false,'htrh_not_specific');
 ck(h[1].familyDocumented===true&&h[1].bearingModuleDocumented===null&&h[1].bearingPreloadMechanismKnown===true&&h[1].installedOnFleet===false,'mrh6_pretension_transfer');
 ck(h[2].familyDocumented===true&&h[2].bearingModuleDocumented===null&&h[2].bearingPreloadMechanismKnown===null&&h[2].installedOnFleet===false,'dr410_architecture_transfer');
 ck(eq(p.conditionIds,cIds)&&eq(p.actionIds,aIds)&&eq(p.damageIds,dIds),'guard_node_identity');
 ck(p.differentials.length===5&&p.differentials.every(x=>x.confirmed===false&&x.distinction.length>110),'causal_differentials_promoted');
 ck(p.gates.length===10&&p.gates.every(x=>x.status==='pending'),'gates_falsely_approved');
 ck(Object.keys(p.safeguards).length===18&&Object.values(p.safeguards).every(v=>v===true),'safety_relaxed');
 ck(Object.keys(p.limits).length===6&&Object.values(p.limits).every(v=>v===null),'oem_limit_invented');
 ck(Object.keys(p.fieldState).length===6&&Object.values(p.fieldState).every(v=>v===0),'field_event_falsified');
 ck(b?.ruleId==='drill-rotary-bearing'&&eq(b.conditionIds,cIds)&&eq(b.actionIds,aIds)&&eq(b.differentialDamageIds,dIds)&&b.chainIds.length===0,'bundle_references');
 ck(b?.status==='review_candidate'&&b?.mappingScope==='generic_only'&&b?.automaticDamagePromotion===false&&b?.observedConditionIds.length===0&&b?.performedActionIds.length===0&&b?.confirmedDamageIds.length===0&&b?.evidenceInterpretation==='sem_resultado_de_campo','automatic_damage_promotion');
 ck(b?.interpretation.includes('HTRH6')&&b?.interpretation.includes('MRH6')&&b?.interpretation.includes('DR410i')&&b?.interpretation.includes('MORO/SAP')&&eq(b.sourceIds,sIds),'weak_architecture_limitations');
 ck(m.bundles.filter(x=>x.ruleId==='drill-rotary-bearing').length===1,'duplicate_rotary_rule');
 for(const id of cIds){
  const x=by(m.conditions,id);
  ck(x?.system==='cabeca_rotativa'&&x.status==='condition_hypothesis_not_observed'&&x.observedValue===null&&x.observedAt===null&&eq(x.sourceIds,sIds),'observed_condition_'+id);
  ck(x?.observation.length>105&&x?.limitations.length>110&&x?.methods.includes('EV-01'),'nondiscriminative_condition_'+id);
 }
 for(const id of aIds){
  const x=by(m.actions,id);
  ck(x?.requiresApplicableOemProcedure===true&&x.executionStatus==='not_performed'&&x.observedResults.length===0&&x.intervalHours===null&&eq(x.sourceIds,sIds),'executed_action_'+id);
  ck(x?.intent.length>110&&x?.safety.length>110,'unsafe_action_'+id);
 }
 ck(by(m.actions,'ACT-ROTARY-BEARING-SAFE-REVIEW')?.safety.includes('energias')&&by(m.actions,'ACT-ROTARY-BEARING-DIAGNOSIS')?.safety.includes('Não executar'),'unsafe_energy_or_active_test');
 for(const id of dIds){
  const x=by(m.damageHypotheses,id);
  ck(x?.kind==='candidate_component_damage'&&x.confirmed===false&&x.reviewStatus==='not_approved'&&eq(x.sourceIds,sIds),'promoted_physical_damage_'+id);
  ck(x?.label.startsWith('Possível')&&x?.requiredEvidence.length>115&&Object.keys(x?.catalogMapping||{}).length===5&&Object.values(x.catalogMapping).every(v=>v===null),'false_sap_mapping_'+id);
 }
 const edges=m.relations.filter(x=>x.from==='BUNDLE-23'),expected=[...cIds,...aIds,...dIds];
 ck(edges.length===14&&eq(edges.map(x=>x.to),expected)&&eq(edges.map(x=>x.id),Array.from({length:14},(_,i)=>'REL-'+String(210+i).padStart(3,'0'))),'edge_refs_or_count');
 ck(edges.every(x=>x.observed===false&&x.reviewStatus==='interpretacao_inferida'&&x.type===(cIds.includes(x.to)?'rule_monitors_condition':aIds.includes(x.to)?'rule_proposes_action':'rule_lists_differential_damage')),'edge_semantics');
 ck(f.version==='1.3.23'&&f.status==='synthetic_assertions_not_real_events'&&f.cases.length===46,'fixtures');
 for(const id of ['SEM-41','SEM-42']){
  const x=by(f.cases,id);
  ck(x?.ruleId==='drill-rotary-bearing'&&x.independentComponentTest==='not_performed'&&x.expectedConfirmedDamageIds.length===0&&x.observedConditionIds.every(v=>cIds.includes(v))&&x.performedActionIds.every(v=>aIds.includes(v)),'fabricated_fixture_'+id);
 }
 ck(crossPolicy.version==='1.3.59'&&crossPolicy.sourceOntologyVersion==='1.3.23'&&crossPolicy.expectedBundles===25&&crossPolicy.expectedUnmodeledRules===0,'crosswalk_version');
 const cv=validateSemanticCrosswalkInputs(m,seeds,crossPolicy);
 ck(cv.errors.length===0&&cv.coverage.modeledRules===25&&cv.coverage.unmodeledRuleIds.length===0&&cv.coverage.sharedGenericNodes===11&&cv.coverage.sharedDamageNodes===0,'crosswalk_'+cv.errors.slice(0,3).join('_'));
 return errors;
}
const errors=check(model,fixture,guard,cross),oa=[],pa=[],fa=[];
for(const id of cIds){oa.push(x=>{by(x.conditions,id).observedValue='fake'});oa.push(x=>{by(x.conditions,id).system='avanco_perfuratriz'});}
for(const id of aIds){oa.push(x=>{by(x.actions,id).executionStatus='done'});oa.push(x=>{by(x.actions,id).requiresApplicableOemProcedure=false});}
for(const id of dIds){oa.push(x=>{by(x.damageHypotheses,id).confirmed=true});oa.push(x=>{by(x.damageHypotheses,id).catalogMapping.damageCode='06.05'});}
oa.push(x=>{by(x.bundles,'BUNDLE-23').automaticDamagePromotion=true});
oa.push(x=>{by(x.bundles,'BUNDLE-23').conditionIds.push('COND-FEED-CHAIN-WEAR')});
oa.push(x=>{by(x.relations,'REL-210').observed=true});
oa.push(x=>{x.workOrderExecutions.push({invented:true})});
pa.push(x=>{x.gates[0].status='approved'});
pa.push(x=>{x.safeguards.noImprovisedActiveRotaryTest=false});
pa.push(x=>{x.limits.preloadNm=150});
pa.push(x=>{x.fieldState.tests=1});
pa.push(x=>{x.scope.headVariantInstalled='MRH6'});
pa.push(x=>{x.scope.serialEffectivityVerified=true});
pa.push(x=>{x.oemArchitectures[1].installedOnFleet=true});
pa.push(x=>{x.oemArchitectures[2].bearingPreloadMechanismKnown=true});
fa.push(x=>{by(x.cases,'SEM-41').expectedConfirmedDamageIds=[dIds[0]]});
fa.push(x=>{by(x.cases,'SEM-42').independentComponentTest='performed'});
let rejected=0;
for(let i=0;i<oa.length;i++){const x=clone(model);oa[i](x);if(check(x,fixture,guard,cross).length)rejected++;else errors.push('ontology_attack_accepted_'+i);}
for(let i=0;i<pa.length;i++){const x=clone(guard);pa[i](x);if(check(model,fixture,x,cross).length)rejected++;else errors.push('guard_attack_accepted_'+i);}
for(let i=0;i<fa.length;i++){const x=clone(fixture);fa[i](x);if(check(model,x,guard,cross).length)rejected++;else errors.push('fixture_attack_accepted_'+i);}
const expected=oa.length+pa.length+fa.length;if(expected!==42||rejected!==expected)errors.push('adversarial_attack_count');
const counts={pmRules:seeds.length,modeledBundles:model.bundles.length,remainingRules:seeds.length-model.bundles.length,conditions:model.conditions.length,actions:model.actions.length,candidateDamages:model.damageHypotheses.length,relations:model.relations.length,syntheticFixtures:fixture.cases.length,adversarialMutationsRejected:rejected,confirmedDamages:0,fieldObservations:0,approvedSapMappings:0};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-drill-rotary.generated.json'),JSON.stringify({schema:'fmea-mining.pm-drill-rotary-report.v1',version:'1.3.57',counts,errors},null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',counts,errors},null,2));
process.exit(errors.length?1:0);
