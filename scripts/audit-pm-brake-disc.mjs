#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateSemanticCrosswalkInputs} from './lib/pm-semantic-crosswalk.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const model=read('data/ontology/condition-action-damage.v1.json');
const fixtures=read('data/quality/semantic-regression-fixtures.v1.json');
const rules=read('data/knowledge/pm-prevention/seed-rules.json').records;
const policy=read('data/quality/pm-brake-disc-boundaries.v1.json');
const crossPolicy=read('data/quality/pm-semantic-crosswalk-policy.v1.json');
const gaps=read('data/quality/pm-gap-review.v1.json').records;
const links=read('data/knowledge/pm-prevention/generated-links.json').records;
const sources=new Set(read('data/research/sources.v1.json').sources.map(x=>x.id));
const equals=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const dict=xs=>new Map(xs.map(x=>[x.id,x]));
function check(m,f,p){
 const e=[],ck=(v,k)=>{if(!v)e.push(k)};
 ck(m?.schema==='fmea-mining.condition-action-damage.v1'&&m?.version==='1.3.18'&&m?.conditions.length===77&&m?.actions.length===58&&m?.damageHypotheses.length===36&&m?.bundles.length===20&&m?.relations.length===182,'ontology_counts');
 ck(m?.observations.length===0&&m?.workOrderExecutions.length===0&&m?.confirmedComponentDamages.length===0,'fabricated_events');
 const rule=rules.find(x=>x.id==='brake-disc');
 ck(rule?.system==='freios'&&rule?.subgroupCode==='BRA1'&&rule?.partText==='Disco'&&rule?.review==='pendente'&&equals(rule.models,['CAT777','CAT980','EQ09']),'seed_drift');
 ck(p?.schema==='fmea-mining.pm-brake-disc-boundaries.v1'&&p?.version==='1.3.51'&&p?.sourceOntologyVersion==='1.3.16'&&p?.ruleId==='brake-disc','policy_identity');
 ck(p?.configurations?.length===4&&equals(p?.configurations?.map(x=>x.id),['CAT777_05_FRONT','CAT777_05_REAR','CAT777_07_FRONT_REAR','CAT980_SERVICE']),'architecture_count');
 const expectedTypes=['dry_caliper_disc','oil_cooled_multidisc','oil_cooled_multidisc','hydraulic_enclosed_wet_disc'];
 ck(equals(p?.configurations?.map(x=>x.brakeType),expectedTypes)&&
    p.configurations.every(x=>x.effectivity==='public_model_brochure_only'&&p.sourceIds.includes(x.sourceId)),'architecture_effectivity_invalid');
 ck(p?.sourceIds.length===4&&p.sourceIds.every(x=>sources.has(x))&&p.sourceIds.includes('ISO-3450-2011'),'missing_OEM_or_standard_source');
 ck(p?.evidenceGates.length===7&&Object.keys(p?.safeguards||{}).length===12&&Object.values(p.safeguards).every(Boolean),'policy_safety_relaxed');
 ck([p?.fieldObservations,p?.performedActions,p?.confirmedDamages,p?.approvedSapMappings].every(x=>x===0)&&p?.brakePressureLimit===null&&p?.discWearLimit===null&&p?.serialEffectivityVerified===false,'invented_limit_or_operation');
 const b=m.bundles.find(x=>x.id==='BUNDLE-18');
 ck(b?.ruleId==='brake-disc'&&equals(b?.conditionIds,p.conditionIds)&&equals(b?.actionIds,p.actionIds)&&equals(b?.differentialDamageIds,p.damageIds),'bundle_boundary');
 ck(b?.chainIds.length===0&&b?.status==='review_candidate'&&b?.mappingScope==='generic_only'&&b?.automaticDamagePromotion===false&&b?.observedConditionIds.length===0&&b?.performedActionIds.length===0&&b?.confirmedDamageIds.length===0,'bundle_promoted');
 ck(b?.interpretation.includes('CAT77705')&&b?.interpretation.includes('CAT77707')&&b?.interpretation.includes('imobilização'),'unsafe_brake_interpretation');
 const cond=dict(m.conditions),actions=dict(m.actions),damages=dict(m.damageHypotheses);
 const mediums=['conjunto_atrito_freio','conjunto_atrito_freio','conjunto_atrito_freio','sistema_frenagem','circuito_atuacao_freio','circuito_atuacao_freio','sistema_frenagem'];
 for(let i=0;i<p.conditionIds.length;i++){
  const id=p.conditionIds[i],x=cond.get(id);
  ck(x?.system==='freios'&&x?.medium===mediums[i]&&x?.status==='condition_hypothesis_not_observed'&&x?.observedValue===null&&x?.observedAt===null,'condition_promoted_'+id);
  ck(x?.limitations?.length>105&&x?.observation?.length>75&&x?.sourceIds?.every(s=>sources.has(s)),'weak_condition_'+id);
 }
 for(const id of p.actionIds){
  const x=actions.get(id);
  ck(x?.requiresApplicableOemProcedure===true&&x?.executionStatus==='not_performed'&&x?.intervalHours===null&&x?.observedResults.length===0,'unapproved_action_'+id);
  ck(x?.safety?.length>110&&x?.intent?.length>85&&x?.sourceIds?.every(s=>sources.has(s)),'unsafe_action_'+id);
 }
 ck(actions.get('ACT-BRAKE-ACTUATION-DIFFERENTIAL')?.safety.includes('Proibir teste dinâmico'),'uncontrolled_brake_test');
 ck(actions.get('ACT-BRAKE-FUNCTIONAL-SAFETY-REVIEW')?.safety.includes('imobilização'),'unsafe_return_to_service');
 for(const id of p.damageIds){
  const x=damages.get(id);
  ck(x?.kind==='candidate_component_damage'&&x?.confirmed===false&&x?.reviewStatus==='not_approved'&&Object.keys(x?.catalogMapping||{}).length===5&&Object.values(x.catalogMapping).every(v=>v===null),'damage_promoted_'+id);
  ck(x?.label.includes('Possível')&&x?.requiredEvidence?.length>100&&x?.sourceIds?.every(s=>sources.has(s)),'damage_evidence_missing_'+id);
 }
 ck(m.bundles.filter(x=>x.ruleId==='brake-disc').length===1&&!m.bundles.some(x=>x.id!=='BUNDLE-18'&&x.differentialDamageIds.some(id=>p.damageIds.includes(id))),'component_damage_shared');
 const edges=m.relations.filter(x=>x.from==='BUNDLE-18'),targets=[...p.conditionIds,...p.actionIds,...p.damageIds];
 ck(edges.length===14&&equals(edges.map(x=>x.id),Array.from({length:14},(_,i)=>'REL-'+String(i+140).padStart(3,'0'))),'relation_count');
 ck(edges.every(x=>targets.includes(x.to)&&x.observed===false&&x.reviewStatus==='interpretacao_inferida'&&x.type===(p.conditionIds.includes(x.to)?'rule_monitors_condition':p.actionIds.includes(x.to)?'rule_proposes_action':'rule_lists_differential_damage')),'relation_type');
 ck(f?.status==='synthetic_assertions_not_real_events'&&f?.version==='1.3.18'&&f?.cases.length===36,'fixture_count');
 for(const [id,conditions,action] of [
 ['SEM-31',['COND-BRAKE-LOW-DECEL','COND-BRAKE-ACTUATION-PRESSURE'],'ACT-BRAKE-ACTUATION-DIFFERENTIAL'],
 ['SEM-32',['COND-BRAKE-DISC-THERMAL','COND-BRAKE-WEAR-INDICATOR'],'ACT-BRAKE-ARCHITECTURE-VERIFY']
 ]){
  const x=f.cases.find(y=>y.id===id);
  ck(x?.ruleId==='brake-disc'&&equals(x?.observedConditionIds,conditions)&&equals(x?.performedActionIds,[action])&&x?.independentComponentTest==='not_performed'&&x?.expectedConfirmedDamageIds.length===0,'fixture_not_synthetic_'+id);
 }
 return e;
}
const errors=[...check(model,fixtures,policy)],cross=validateSemanticCrosswalkInputs(model,rules,crossPolicy);errors.push(...cross.errors);
const checkGlobal=(v,id)=>{if(!v)errors.push(id)};
checkGlobal(cross.coverage.totalSeeds===25&&cross.coverage.modeledRules===20&&cross.coverage.unmodeledRuleIds.length===5&&cross.coverage.sharedGenericNodes===11&&cross.coverage.sharedDamageNodes===0,'coverage_error');
checkGlobal(gaps.length===10&&links.length===115,'PM_backlog_drift');
const clone=x=>JSON.parse(JSON.stringify(x));
const changes=[
 x=>x.conditions.find(y=>y.id===policy.conditionIds[0]).observedValue='wear',
 x=>x.conditions.find(y=>y.id===policy.conditionIds[1]).observedAt='2026-10-22',
 x=>x.conditions.find(y=>y.id===policy.conditionIds[2]).medium='oleo_diferencial',
 x=>x.conditions.find(y=>y.id===policy.conditionIds[3]).system='hidraulico',
 x=>x.conditions.find(y=>y.id===policy.conditionIds[4]).limitations='pressure proves disc wear',
 x=>x.conditions.find(y=>y.id===policy.conditionIds[5]).medium='conjunto_atrito_freio',
 x=>x.actions.find(y=>y.id===policy.actionIds[0]).executionStatus='completed',
 x=>x.actions.find(y=>y.id===policy.actionIds[1]).requiresApplicableOemProcedure=false,
 x=>x.actions.find(y=>y.id===policy.actionIds[2]).safety='Test brake on haul road',
 x=>x.actions.find(y=>y.id===policy.actionIds[3]).intervalHours=100,
 x=>x.damageHypotheses.find(y=>y.id===policy.damageIds[0]).confirmed=true,
 x=>x.damageHypotheses.find(y=>y.id===policy.damageIds[1]).catalogMapping.componentCode='FAKE',
 x=>x.damageHypotheses.find(y=>y.id===policy.damageIds[2]).reviewStatus='approved',
 x=>x.bundles.find(y=>y.id==='BUNDLE-18').conditionIds[0]='COND-DIFF-OIL-DEBRIS',
 x=>x.bundles.find(y=>y.id==='BUNDLE-18').differentialDamageIds=[policy.damageIds[0]],
 x=>x.bundles.find(y=>y.id==='BUNDLE-18').automaticDamagePromotion=true,
 x=>x.bundles.find(y=>y.id==='BUNDLE-18').interpretation='Brake failure proven by pressure alone',
 x=>x.relations.find(y=>y.id==='REL-140').to='COND-HYD-EXTERNAL-LEAK',
 x=>x.relations.find(y=>y.id==='REL-153').observed=true,
 x=>x.workOrderExecutions.push({invented:true})
];
let rejected=0;for(let i=0;i<changes.length;i++){const x=clone(model);changes[i](x);if(check(x,fixtures,policy).length||validateSemanticCrosswalkInputs(x,rules,crossPolicy).errors.length)rejected++;else errors.push('model_mutation_accepted_'+i)}
const safetyAttacks=[
 x=>x.safeguards.noDryWetConflation=false,
 x=>x.safeguards.noUncontrolledDynamicBrakeTests=false,
 x=>x.configurations[0].brakeType='oil_cooled_multidisc',
 x=>x.configurations[2].effectivity='installed_by_serial',
 x=>x.brakePressureLimit=150,
 x=>x.discWearLimit=2,
 x=>x.confirmedDamages=1,
 x=>x.approvedSapMappings=1
];
let rejectedPolicy=0;for(let i=0;i<safetyAttacks.length;i++){const x=clone(policy);safetyAttacks[i](x);if(check(model,fixtures,x).length)rejectedPolicy++;else errors.push('policy_mutation_accepted_'+i)}
const fixtureAttacks=[
 x=>x.cases.find(y=>y.id==='SEM-31').expectedConfirmedDamageIds=[policy.damageIds[0]],
 x=>x.cases.find(y=>y.id==='SEM-32').independentComponentTest='performed',
 x=>x.cases.find(y=>y.id==='SEM-31').observedConditionIds=['COND-IMPL-CYL-DRIFT'],
 x=>x.cases=x.cases.filter(y=>y.id!=='SEM-32')
];
let rejectedFixture=0;for(let i=0;i<fixtureAttacks.length;i++){const x=clone(fixtures);fixtureAttacks[i](x);if(check(model,x,policy).length)rejectedFixture++;else errors.push('fixture_mutation_accepted_'+i)}
checkGlobal(rejected===20&&rejectedPolicy===8&&rejectedFixture===4,'mutation_suite_incomplete');
const report={schema:'fmea-mining.pm-brake-disc-report.v1',version:'1.3.51',nature:'critical_safety_differentials_without_field_inspection',
 counts:{pmRules:rules.length,modeledBundles:model.bundles.length,unmodeledRules:cross.coverage.unmodeledRuleIds.length,conditions:model.conditions.length,actions:model.actions.length,damageHypotheses:model.damageHypotheses.length,relations:model.relations.length,syntheticFixtures:fixtures.cases.length,mutationsRejected:rejected+rejectedPolicy+rejectedFixture,performedTests:0,confirmedDamages:0,approvedSapMappings:0},
 architectureVariants:policy.configurations,limitations:policy.evidenceGates,errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});fs.writeFileSync(path.join(root,'reports/pm-brake-disc.generated.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',counts:report.counts,errors},null,2));process.exit(errors.length?1:0);
