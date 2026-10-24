#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateSemanticCrosswalkInputs} from './lib/pm-semantic-crosswalk.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const model=load('data/ontology/condition-action-damage.v1.json');
const fixtures=load('data/quality/semantic-regression-fixtures.v1.json');
const rules=load('data/knowledge/pm-prevention/seed-rules.json').records;
const policy=load('data/quality/pm-differential-gear-discrimination.v1.json');
const crossPolicy=load('data/quality/pm-semantic-crosswalk-policy.v1.json');
const gaps=load('data/quality/pm-gap-review.v1.json').records;
const links=load('data/knowledge/pm-prevention/generated-links.json').records;
const sources=new Set(load('data/research/sources.v1.json').sources.map(x=>x.id));
const condIds=[...policy.specificConditions,...policy.nonLocalizingConditions];
const actionIds=['ACT-DIFF-OEM-CONFIG-IDENTIFY','ACT-DIFF-BACKLASH-CONTACT-CHECK','ACT-DIFF-BEARING-PRELOAD-EVALUATE','ACT-DIFF-OIL-SAMPLE-AND-REVIEW'];
const damageIds=policy.damageCandidates;
const byId=arr=>new Map(arr.map(x=>[x.id,x]));
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function check(m,f,p){
 const errors=[],ck=(v,id)=>{if(!v)errors.push(id)};
 ck(m.version==='1.3.20'&&m.conditions.length===89&&m.actions.length===67&&m.damageHypotheses.length===42&&m.bundles.length===22&&m.relations.length===209,'ontology_baseline');
 ck(m.observations.length===0&&m.workOrderExecutions.length===0&&m.confirmedComponentDamages.length===0,'events_fabricated');
 ck(p.schema==='fmea-mining.pm-differential-gear-discrimination.v1'&&p.version==='1.3.49'&&p.ontologyVersion==='1.3.14'&&p.ruleId==='differential-gear','policy_identity');
 ck(p.specificConditions.length===5&&p.nonLocalizingConditions.length===2&&p.damageCandidates.length===3,'differential_groups');
 ck(p.evidenceGates.length===7&&Object.keys(p.warnings||{}).length===11&&Object.values(p.warnings).every(Boolean),'policy_relaxed');
 ck(p.fieldMeasurements===0&&p.performedServices===0&&p.approvedSapMappings===0&&p.confirmedFailures===0&&p.OEMBacklashLimit===null&&p.OEMBearingPreloadLimit===null,'invented_parameters');
 ck(p.sourceIds.every(id=>sources.has(id)),'unverified_sources');
 const seed=rules.find(x=>x.id==='differential-gear');
 ck(seed?.system==='diferencial'&&seed?.subgroupCode==='DIFF'&&seed?.partText==='Engrenagem'&&seed?.damageId==='02.01'&&seed?.causeId==='C2.11'&&seed?.review==='pendente','seed_rule_changed');
 const bundle=m.bundles.find(x=>x.id==='BUNDLE-16');
 ck(bundle?.ruleId==='differential-gear'&&same(bundle.conditionIds,condIds)&&same(bundle.actionIds,actionIds)&&same(bundle.differentialDamageIds,damageIds),'bundle_mismatch');
 ck(bundle?.mappingScope==='generic_only'&&bundle?.status==='review_candidate'&&bundle?.automaticDamagePromotion===false&&bundle?.chainIds.length===0&&bundle?.observedConditionIds.length===0&&bundle?.performedActionIds.length===0&&bundle?.confirmedDamageIds.length===0,'bundle_promoted');
 ck(bundle?.interpretation.includes('Folga backlash, padrão de contato, pré-carga e desgaste são fenômenos distintos')&&bundle?.interpretation.includes('não localizam falha'),'diagnostic_boundary_lost');
 const cs=byId(m.conditions),as=byId(m.actions),ds=byId(m.damageHypotheses);
 for(const id of condIds){
  const c=cs.get(id);
  ck(c?.system==='diferencial'&&c?.status==='condition_hypothesis_not_observed'&&c?.observedValue===null&&c?.observedAt===null,'condition_observed_'+id);
  const expected=id==='COND-DIFF-OIL-DEBRIS'?'oleo_diferencial':id==='COND-DIFF-NOISE-LOAD'?'conjunto_diferencial':id==='COND-DIFF-BEARING-SUPPORT-SUSPECT'?'apoio_diferencial':id.includes('BACKLASH')||id.includes('CONTACT-PATTERN')?'engrenamento_diferencial':'engrenagem_diferencial';
  ck(c?.medium===expected&&c?.limitations.length>80&&c?.sourceIds.every(s=>sources.has(s)),'condition_medium_'+id);
 }
 for(const id of actionIds){
  const a=as.get(id);
  ck(a?.requiresApplicableOemProcedure===true&&a?.executionStatus==='not_performed'&&a?.intervalHours===null&&a?.observedResults.length===0,'executed_action_'+id);
  ck(a?.safety.length>100&&a?.sourceIds.every(s=>sources.has(s)),'action_unsafe_'+id);
 }
 for(const id of damageIds){
  const d=ds.get(id);
  ck(d?.kind==='candidate_component_damage'&&d?.confirmed===false&&d?.reviewStatus==='not_approved'&&Object.keys(d.catalogMapping).length===5&&Object.values(d.catalogMapping).every(v=>v===null),'damage_approved_'+id);
  ck(d?.label.includes('Possível')&&d?.requiredEvidence.length>90,'damage_causality_'+id);
 }
 ck(m.bundles.filter(x=>x.ruleId==='differential-gear').length===1,'duplicate_bundle');
 ck(!m.bundles.some(x=>x.id!=='BUNDLE-16'&&x.differentialDamageIds.some(id=>damageIds.includes(id))),'physical_damage_shared');
 const edges=m.relations.filter(e=>e.from==='BUNDLE-16');
 ck(edges.length===14&&same(edges.map(x=>x.id),Array.from({length:14},(_,i)=>'REL-'+String(i+110).padStart(3,'0'))),'relation_count');
 ck(edges.every(x=>[...condIds,...actionIds,...damageIds].includes(x.to)&&x.observed===false&&x.reviewStatus==='interpretacao_inferida'&&x.type===(condIds.includes(x.to)?'rule_monitors_condition':actionIds.includes(x.to)?'rule_proposes_action':'rule_lists_differential_damage')),'incorrect_relation');
 ck(f.cases.length===40&&f.status==='synthetic_assertions_not_real_events','fixture_count');
 for(const [id,conds,action] of [
  ['SEM-27',['COND-DIFF-NOISE-LOAD','COND-DIFF-OIL-DEBRIS'],'ACT-DIFF-OIL-SAMPLE-AND-REVIEW'],
  ['SEM-28',['COND-DIFF-BACKLASH-SUSPECT','COND-DIFF-TOOTH-CONTACT-PATTERN'],'ACT-DIFF-BACKLASH-CONTACT-CHECK']
 ]){
  const x=f.cases.find(q=>q.id===id);
  ck(x?.ruleId==='differential-gear'&&same(x?.observedConditionIds,conds)&&same(x?.performedActionIds,[action])&&x?.independentComponentTest==='not_performed'&&x?.expectedConfirmedDamageIds.length===0,'fixture_promoted_'+id);
 }
 return errors;
}
const errors=[...check(model,fixtures,policy)];
const x=validateSemanticCrosswalkInputs(model,rules,crossPolicy);
errors.push(...x.errors);
const ck=(v,id)=>{if(!v)errors.push(id)};
ck(x.coverage.totalSeeds===25&&x.coverage.modeledRules===22&&x.coverage.unmodeledRuleIds.length===3,'coverage_error');
ck(x.coverage.sharedGenericNodes===11&&x.coverage.sharedDamageNodes===0&&gaps.length===10&&links.length===115,'baseline_drift');
const clone=y=>JSON.parse(JSON.stringify(y));
const mutations=[
 y=>y.conditions.find(c=>c.id===condIds[0]).observedValue='measured',
 y=>y.conditions.find(c=>c.id===condIds[1]).observedAt='2026-10-22',
 y=>y.conditions.find(c=>c.id===condIds[2]).system='comando_final',
 y=>y.conditions.find(c=>c.id===condIds[3]).medium='oleo_diferencial',
 y=>y.conditions.find(c=>c.id===condIds[4]).status='field_confirmed',
 y=>y.conditions.find(c=>c.id===condIds[5]).limitations='Oil proves gear damage',
 y=>y.actions.find(a=>a.id===actionIds[0]).executionStatus='completed',
 y=>y.actions.find(a=>a.id===actionIds[1]).requiresApplicableOemProcedure=false,
 y=>y.actions.find(a=>a.id===actionIds[2]).intervalHours=100,
 y=>y.actions.find(a=>a.id===actionIds[3]).safety='Operate with covers removed',
 y=>y.damageHypotheses.find(d=>d.id===damageIds[0]).confirmed=true,
 y=>y.damageHypotheses.find(d=>d.id===damageIds[1]).catalogMapping.componentCode='fiction',
 y=>y.damageHypotheses.find(d=>d.id===damageIds[2]).reviewStatus='approved',
 y=>y.bundles.find(b=>b.id==='BUNDLE-16').conditionIds[0]='COND-DRIVE-GEAR-PITTING',
 y=>y.bundles.find(b=>b.id==='BUNDLE-16').differentialDamageIds=[damageIds[0]],
 y=>y.bundles.find(b=>b.id==='BUNDLE-16').automaticDamagePromotion=true,
 y=>y.bundles.find(b=>b.id==='BUNDLE-16').interpretation='backlash proves pinion fracture',
 y=>y.relations.find(e=>e.id==='REL-110').to='COND-HYD-EXTERNAL-LEAK',
 y=>y.relations.find(e=>e.id==='REL-123').observed=true,
 y=>y.workOrderExecutions.push({fiction:true})
];
let n=0;for(let i=0;i<mutations.length;i++){const z=clone(model);mutations[i](z);if(check(z,fixtures,policy).length||validateSemanticCrosswalkInputs(z,rules,crossPolicy).errors.length)n++;else errors.push('model_adversary_'+i)}
const policyAttacks=[
 y=>y.warnings.backlashIsNotBearingPreload=false,
 y=>y.warnings.noDanaNumbersOnCatModels=false,
 y=>y.OEMBacklashLimit=0.4,
 y=>y.OEMBearingPreloadLimit=1,
 y=>y.confirmedFailures=1,
 y=>y.approvedSapMappings=1
];
let np=0;for(let i=0;i<policyAttacks.length;i++){const z=clone(policy);policyAttacks[i](z);if(check(model,fixtures,z).length)np++;else errors.push('policy_adversary_'+i)}
const fixtureAttacks=[
 y=>y.cases.find(c=>c.id==='SEM-27').expectedConfirmedDamageIds=[damageIds[0]],
 y=>y.cases.find(c=>c.id==='SEM-28').independentComponentTest='performed',
 y=>y.cases.find(c=>c.id==='SEM-28').observedConditionIds=['COND-DRIVE-GEAR-PITTING'],
 y=>y.cases=y.cases.filter(c=>c.id!=='SEM-28')
];
let nf=0;for(let i=0;i<fixtureAttacks.length;i++){const z=clone(fixtures);fixtureAttacks[i](z);if(check(model,z,policy).length)nf++;else errors.push('fixture_adversary_'+i)}
ck(n===20&&np===6&&nf===4,'adversarial_incomplete');
const report={schema:'fmea-mining.pm-differential-gear-report.v1',version:'1.3.49',nature:'concepts_not_inspections',counts:{pmRules:rules.length,modeledRules:x.coverage.modeledRules,unmodeledRules:x.coverage.unmodeledRuleIds.length,conditions:model.conditions.length,actions:model.actions.length,damageHypotheses:model.damageHypotheses.length,relations:model.relations.length,fixtures:fixtures.cases.length,mutationsRejected:n+np+nf,confirmedFailures:0,measurements:0,executedActions:0,sapApprovals:0},errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-differential-gear.generated.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',counts:report.counts,errors},null,2));
process.exit(errors.length?1:0);
