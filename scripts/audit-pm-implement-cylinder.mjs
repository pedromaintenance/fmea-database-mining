#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateSemanticCrosswalkInputs} from './lib/pm-semantic-crosswalk.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const model=load('data/ontology/condition-action-damage.v1.json');
const fix=load('data/quality/semantic-regression-fixtures.v1.json');
const seed=load('data/knowledge/pm-prevention/seed-rules.json').records;
const p=load('data/quality/pm-implement-cylinder-differentials.v1.json');
const crossPolicy=load('data/quality/pm-semantic-crosswalk-policy.v1.json');
const gaps=load('data/quality/pm-gap-review.v1.json').records;
const links=load('data/knowledge/pm-prevention/generated-links.json').records;
const sourceIds=new Set(load('data/research/sources.v1.json').sources.map(x=>x.id));
const condIds=['COND-IMPL-CYL-EXTERNAL-SEEP','COND-IMPL-CYL-PISTON-BYPASS','COND-IMPL-CYL-DRIFT','COND-IMPL-CYL-LOW-FORCE','COND-IMPL-CYL-ROD-SURFACE','COND-IMPL-CYL-ALIGNMENT','COND-IMPL-CIRCUIT-VALVE-LEAK','COND-IMPL-CIRCUIT-PRESSURE-LOW'];
const actionIds=['ACT-IMPL-CYL-EFFECTIVITY-IDENTIFY','ACT-IMPL-CYL-EXTERNAL-LEAK-TRACE','ACT-IMPL-CYL-DRIFT-CHARACTERIZE','ACT-IMPL-CYL-CIRCUIT-PRESSURE-CHECK','ACT-IMPL-CYL-PISTON-SEAL-INVESTIGATE'];
const damageIds=['DMG-IMPL-ROD-SEAL-CANDIDATE','DMG-IMPL-PISTON-SEAL-CANDIDATE','DMG-IMPL-ROD-BARREL-CANDIDATE'];
const expectedMedium=['cilindro_implemento','cilindro_implemento','circuito_implemento','circuito_implemento','haste_cilindro_implemento','montagem_cilindro_implemento','circuito_implemento','circuito_implemento'];
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const byId=x=>new Map(x.map(v=>[v.id,v]));
function verify(m,f,policy){
 const errors=[],ck=(v,id)=>{if(!v)errors.push(id)};
 ck(m?.version==='1.3.16'&&m?.conditions?.length===65&&m?.actions?.length===48&&m?.damageHypotheses?.length===29&&m?.bundles?.length===18&&m?.relations?.length===153,'ontology_version_or_counts');
 ck(m?.observations?.length===0&&m?.workOrderExecutions?.length===0&&m?.confirmedComponentDamages?.length===0,'fabricated_field_records');
 ck(policy?.schema==='fmea-mining.pm-implement-cylinder-differentials.v1'&&policy?.version==='1.3.50'&&policy?.ontologyVersion==='1.3.15'&&policy?.ruleId==='implement-cylinder','policy_identity');
 ck(same(policy?.classes?.map(x=>x.conditionId),condIds)&&policy?.classes?.every(x=>x.competingCauses.length>=3&&x.decision.length>25),'missing_differentials');
 ck(policy?.evidenceGates?.length===7&&Object.keys(policy?.safeguards||{}).length===12&&Object.values(policy.safeguards).every(Boolean),'unsafe_policy');
 ck([policy?.fieldMeasurements,policy?.performedTests,policy?.confirmedFailures,policy?.approvedSapMappings].every(x=>x===0)&&policy?.driftLimitMm===null&&policy?.testPressureBar===null&&policy?.serialEffectivityVerified===false,'invented_measurements_or_effectivity');
 ck(policy?.sources?.includes('PARKER-CYL-DRIFT-SERVICE')&&policy?.sources?.includes('CAT-HYD-TECHNICAL-ANALYSIS')&&policy.sources.every(x=>sourceIds.has(x)),'sources_missing');
 const rule=seed.find(x=>x.id==='implement-cylinder');
 ck(rule?.system==='implementos'&&rule?.subgroupCode==='CYL1'&&rule?.partText==='Vedação'&&rule?.damageId==='03.01'&&rule?.causeId==='C2.13'&&rule?.review==='pendente','original_rule_modified');
 const b=m.bundles.find(x=>x.id==='BUNDLE-17');
 ck(b?.ruleId==='implement-cylinder'&&same(b?.conditionIds,condIds)&&same(b?.actionIds,actionIds)&&same(b?.differentialDamageIds,damageIds),'wrong_bundle');
 ck(b?.status==='review_candidate'&&b?.mappingScope==='generic_only'&&b?.automaticDamagePromotion===false&&b?.chainIds?.length===0&&b?.observedConditionIds?.length===0&&b?.performedActionIds?.length===0&&b?.confirmedDamageIds?.length===0,'promoted_bundle');
 ck(b?.interpretation.includes('Deriva pode provir de vedação do pistão, válvula direcional, retenção e makeup')&&b?.interpretation.includes('Nenhum teste sob carga'),'drift_causes_conflated');
 const cond=byId(m.conditions),actions=byId(m.actions),dmg=byId(m.damageHypotheses);
 for(let i=0;i<condIds.length;i++){
  const id=condIds[i],x=cond.get(id);
  ck(x?.system==='implementos'&&x?.medium===expectedMedium[i]&&x?.status==='condition_hypothesis_not_observed'&&x?.observedValue===null&&x?.observedAt===null,'false_observation_'+id);
  ck(x?.limitations.length>95&&x?.observation.length>85&&x?.sourceIds?.every(z=>sourceIds.has(z)),'weak_evidence_'+id);
 }
 for(const id of actionIds){
  const a=actions.get(id);
  ck(a?.requiresApplicableOemProcedure===true&&a?.executionStatus==='not_performed'&&a?.observedResults?.length===0&&a?.intervalHours===null,'action_falsified_'+id);
  ck(a?.safety.length>115&&a?.sourceIds?.every(z=>sourceIds.has(z)),'unsafe_action_'+id);
 }
 ck(actions.get('ACT-IMPL-CYL-PISTON-SEAL-INVESTIGATE')?.safety?.includes('Não desconectar linha de cilindro sob carga ou pressão'),'unsafe_isolation_test');
 for(const id of damageIds){
  const d=dmg.get(id);
  ck(d?.confirmed===false&&d?.reviewStatus==='not_approved'&&d?.kind==='candidate_component_damage'&&Object.keys(d?.catalogMapping||{}).length===5&&Object.values(d.catalogMapping).every(z=>z===null),'falsely_approved_damage_'+id);
  ck(d?.label.includes('Possível')&&d?.requiredEvidence.length>115,'weak_damage_evidence_'+id);
 }
 ck(m.bundles.filter(x=>x.ruleId==='implement-cylinder').length===1&&
 !m.bundles.some(x=>x.id!=='BUNDLE-17'&&x.differentialDamageIds.some(z=>damageIds.includes(z))),'incorrect_component_damages');
 const rel=m.relations.filter(x=>x.from==='BUNDLE-17');
 ck(rel.length===16&&same(rel.map(x=>x.id),Array.from({length:16},(_,i)=>'REL-'+String(i+124).padStart(3,'0'))),'relations_missing');
 ck(rel.every(x=>x.observed===false&&x.reviewStatus==='interpretacao_inferida'&&[...condIds,...actionIds,...damageIds].includes(x.to)&&x.type===(condIds.includes(x.to)?'rule_monitors_condition':actionIds.includes(x.to)?'rule_proposes_action':'rule_lists_differential_damage')),'relation_mismatch');
 ck(f?.version==='1.3.16'&&f?.status==='synthetic_assertions_not_real_events'&&f?.cases.length===32,'fixture_baseline');
 for(const [id,conds,act] of [
  ['SEM-29',['COND-IMPL-CYL-DRIFT','COND-IMPL-CIRCUIT-VALVE-LEAK'],'ACT-IMPL-CYL-DRIFT-CHARACTERIZE'],
  ['SEM-30',['COND-IMPL-CIRCUIT-PRESSURE-LOW','COND-IMPL-CYL-ROD-SURFACE'],'ACT-IMPL-CYL-CIRCUIT-PRESSURE-CHECK']
 ]){
  const x=f.cases.find(y=>y.id===id);
  ck(x?.ruleId==='implement-cylinder'&&same(x?.observedConditionIds,conds)&&same(x?.performedActionIds,[act])&&x?.independentComponentTest==='not_performed'&&x?.expectedConfirmedDamageIds?.length===0,'fixture_claims_failure_'+id);
 }
 return errors;
}
const errors=[...verify(model,fix,p)];
const coverage=validateSemanticCrosswalkInputs(model,seed,crossPolicy);errors.push(...coverage.errors);
if(!(coverage.coverage.totalSeeds===25&&coverage.coverage.modeledRules===18&&coverage.coverage.unmodeledRuleIds.length===7&&coverage.coverage.sharedGenericNodes===11&&coverage.coverage.sharedDamageNodes===0))errors.push('coverage_or_sharing_regression');
if(gaps.length!==10||links.length!==115)errors.push('pm_link_or_exception_drift');
const clone=x=>JSON.parse(JSON.stringify(x));
const modelMutations=[
 x=>x.conditions.find(v=>v.id===condIds[0]).observedValue='oil',
 x=>x.conditions.find(v=>v.id===condIds[1]).observedAt='2026-10-22',
 x=>x.conditions.find(v=>v.id===condIds[2]).system='hidraulico',
 x=>x.conditions.find(v=>v.id===condIds[3]).medium='cilindro_implemento',
 x=>x.conditions.find(v=>v.id===condIds[4]).limitations='rod damage proved',
 x=>x.conditions.find(v=>v.id===condIds[5]).status='confirmed',
 x=>x.actions.find(v=>v.id===actionIds[0]).executionStatus='done',
 x=>x.actions.find(v=>v.id===actionIds[1]).requiresApplicableOemProcedure=false,
 x=>x.actions.find(v=>v.id===actionIds[2]).intervalHours=250,
 x=>x.actions.find(v=>v.id===actionIds[3]).safety='Test under suspended load',
 x=>x.actions.find(v=>v.id===actionIds[4]).safety='Disconnect line to test',
 x=>x.damageHypotheses.find(v=>v.id===damageIds[0]).confirmed=true,
 x=>x.damageHypotheses.find(v=>v.id===damageIds[1]).catalogMapping.componentCode='FAKE',
 x=>x.damageHypotheses.find(v=>v.id===damageIds[2]).reviewStatus='approved',
 x=>x.bundles.find(v=>v.id==='BUNDLE-17').conditionIds[0]='COND-HYD-EXTERNAL-LEAK',
 x=>x.bundles.find(v=>v.id==='BUNDLE-17').differentialDamageIds=[damageIds[0]],
 x=>x.bundles.find(v=>v.id==='BUNDLE-17').automaticDamagePromotion=true,
 x=>x.bundles.find(v=>v.id==='BUNDLE-17').interpretation='Drift confirms piston seal',
 x=>x.relations.find(v=>v.id==='REL-124').to='COND-FUEL-WATER',
 x=>x.workOrderExecutions.push({fake:true})
];
let rejectModels=0;for(let i=0;i<modelMutations.length;i++){const x=clone(model);modelMutations[i](x);if(verify(x,fix,p).length||validateSemanticCrosswalkInputs(x,seed,crossPolicy).errors.length)rejectModels++;else errors.push('model_mutation_accepted_'+i)}
const policyMutations=[
 x=>x.safeguards.noDriftEqualsPistonSealFailure=false,
 x=>x.safeguards.noSuspendedLoadTestWithoutPositiveSupport=false,
 x=>x.driftLimitMm=4,
 x=>x.testPressureBar=250,
 x=>x.fieldMeasurements=1,
 x=>x.approvedSapMappings=1,
 x=>x.classes.pop(),
 x=>x.serialEffectivityVerified=true
];
let rejectPolicy=0;for(let i=0;i<policyMutations.length;i++){const x=clone(p);policyMutations[i](x);if(verify(model,fix,x).length)rejectPolicy++;else errors.push('policy_mutation_accepted_'+i)}
const fixtureMutations=[
 x=>x.cases.find(y=>y.id==='SEM-29').expectedConfirmedDamageIds=[damageIds[1]],
 x=>x.cases.find(y=>y.id==='SEM-30').independentComponentTest='performed',
 x=>x.cases.find(y=>y.id==='SEM-29').observedConditionIds=['COND-HYD-EXTERNAL-LEAK'],
 x=>x.cases=x.cases.filter(y=>y.id!=='SEM-30')
];
let rejectFixtures=0;for(let i=0;i<fixtureMutations.length;i++){const x=clone(fix);fixtureMutations[i](x);if(verify(model,x,p).length)rejectFixtures++;else errors.push('fixture_mutation_accepted_'+i)}
if(rejectModels!==20||rejectPolicy!==8||rejectFixtures!==4)errors.push('mutation_suite_incomplete');
const report={schema:'fmea-mining.pm-implement-cylinder-report.v1',version:'1.3.50',nature:'hypothetical_causal_boundaries_not_machine_field_events',
 counts:{pmRules:seed.length,modeledBundles:model.bundles.length,unmodeledRules:coverage.coverage.unmodeledRuleIds.length,conditions:model.conditions.length,actions:model.actions.length,damageHypotheses:model.damageHypotheses.length,relations:model.relations.length,fixtures:fix.cases.length,adversarialMutationsRejected:rejectModels+rejectPolicy+rejectFixtures,performedTests:0,confirmedFailures:0,sapApprovals:0},
 competingMechanisms:p.classes,requirementGates:p.evidenceGates,errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-implement-cylinder.generated.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',counts:report.counts,errors},null,2));
process.exit(errors.length?1:0);
