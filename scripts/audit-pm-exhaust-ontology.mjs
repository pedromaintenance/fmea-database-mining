#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateSemanticCrosswalkInputs} from './lib/pm-semantic-crosswalk.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const model=read('data/ontology/condition-action-damage.v1.json');
const fixtures=read('data/quality/semantic-regression-fixtures.v1.json');
const preflight=read('data/quality/pm-exhaust-preflight.v1.json');
const seeds=read('data/knowledge/pm-prevention/seed-rules.json').records;
const policy=read('data/quality/pm-semantic-crosswalk-policy.v1.json');
const gaps=read('data/quality/pm-gap-review.v1.json').records;
const links=read('data/knowledge/pm-prevention/generated-links.json').records;
const sources=new Set(read('data/research/sources.v1.json').sources.map(x=>x.id));
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const clone=x=>JSON.parse(JSON.stringify(x));
const find=(a,id)=>a.find(x=>x.id===id);
const wantedConditions=['COND-ENGINE-EXH-SOOT-TRACE','COND-ENGINE-EXH-BODY-DISCONTINUITY','COND-ENGINE-EXH-FLANGE-LEAK','COND-ENGINE-EXH-WET-RESIDUE','COND-ENGINE-EXH-FLEX-JOINT','COND-ENGINE-EXH-PERFORMANCE'];
const wantedActions=['ACT-ENGINE-EXH-BOM-VERIFY','ACT-ENGINE-EXH-TRACE-INSPECT','ACT-ENGINE-EXH-JOINT-DIFFERENTIAL','ACT-ENGINE-EXH-RESIDUE-FLEX-DIFFERENTIAL','ACT-ENGINE-EXH-PERFORMANCE-CORRELATE'];
const wantedDamages=['DMG-ENGINE-EXH-MANIFOLD-CRACK-CANDIDATE','DMG-ENGINE-EXH-GASKET-LEAK-CANDIDATE','DMG-ENGINE-EXH-STUD-FAILURE-CANDIDATE'];
function check(m,f,pre,p) {
 const errors=[],ck=(v,id)=>{if(!v)errors.push(id);};
 const seed=seeds.find(x=>x.id==='engine-exhaust'),b=find(m.bundles,'BUNDLE-19');
 ck(m.version==='1.3.19'&&m.conditions.length===83&&m.actions.length===62&&m.damageHypotheses.length===39&&m.bundles.length===21&&m.relations.length===195,'ontology_baseline');
 ck(m.observations.length===0&&m.workOrderExecutions.length===0&&m.confirmedComponentDamages.length===0,'fabricated_field_events');
 ck(pre.version==='1.3.52'&&pre.ontologyVersionFrozen==='1.3.16'&&pre.scope.serialEffectivityVerified===false&&pre.evidenceGates.length===8&&pre.evidenceGates.every(x=>x.status==='pending'),'preflight_promoted');
 ck(pre.sourceIds.length===3&&pre.sourceIds.every(id=>sources.has(id))&&pre.differentials.length===6&&pre.differentials.every(x=>x.status==='hypothesis_not_observed'&&x.confirmed===false),'preflight_provenance');
 ck(seed?.subgroupCode==='EXSY'&&seed?.partText==='Coletor'&&seed?.system==='motor_diesel'&&seed?.review==='pendente','seed_modified');
 ck(b?.ruleId==='engine-exhaust'&&eq(b?.conditionIds,wantedConditions)&&eq(b?.actionIds,wantedActions)&&eq(b?.differentialDamageIds,wantedDamages),'bundle_refs');
 ck(m.bundles.filter(x=>x.ruleId==='engine-exhaust').length===1&&b?.chainIds.length===0&&b?.mappingScope==='generic_only'&&b?.status==='review_candidate'&&b?.automaticDamagePromotion===false&&b?.evidenceInterpretation==='sem_resultado_de_campo','bundle_evidence_promoted');
 ck(b?.observedConditionIds.length===0&&b?.performedActionIds.length===0&&b?.confirmedDamageIds.length===0,'bundle_fabricated_observations');
 ck(b?.sourceIds.every(id=>sources.has(id))&&b?.interpretation.includes('fissura')&&b?.interpretation.includes('fole')&&b?.interpretation.includes('isolamento'),'weak_mechanical_boundary');
 for(const id of wantedConditions) {
  const c=find(m.conditions,id);
  ck(c?.system==='motor_diesel'&&c?.status==='condition_hypothesis_not_observed'&&c?.observedValue===null&&c?.observedAt===null,'observed_condition_'+id);
  ck(c?.limitations.length>105&&c?.observation.length>100&&c?.sourceIds.every(s=>sources.has(s)),'weak_condition_'+id);
 }
 ck(find(m.conditions,'COND-ENGINE-EXH-FLEX-JOINT')?.limitations.includes('Não presumir fole'),'unverified_bellows');
 ck(find(m.conditions,'COND-ENGINE-EXH-WET-RESIDUE')?.limitations.includes('não define'),'false_generator_transfer');
 for(const id of wantedActions) {
  const a=find(m.actions,id);
  ck(a?.requiresApplicableOemProcedure===true&&a?.executionStatus==='not_performed'&&a?.observedResults.length===0&&a?.intervalHours===null,'executed_action_'+id);
  ck(a?.intent.length>105&&a?.safety.length>105&&a?.sourceIds.every(s=>sources.has(s)),'weak_safety_'+id);
 }
 ck(find(m.actions,'ACT-ENGINE-EXH-TRACE-INSPECT')?.safety.includes('superfícies quentes'),'hot_surface_exposure');
 ck(find(m.actions,'ACT-ENGINE-EXH-JOINT-DIFFERENTIAL')?.safety.includes('Não reapertar'),'fabricated_torque_procedure');
 for(const id of wantedDamages){
  const d=find(m.damageHypotheses,id);
  ck(d?.kind==='candidate_component_damage'&&d?.confirmed===false&&d?.reviewStatus==='not_approved'&&Object.keys(d?.catalogMapping||{}).length===5&&Object.values(d.catalogMapping).every(v=>v===null),'damage_promoted_'+id);
  ck(d?.label.startsWith('Possível')&&d?.requiredEvidence.length>105&&d?.sourceIds.every(s=>sources.has(s)),'weak_damage_'+id);
 }
 ck(!wantedDamages.some(id=>id.includes('BELLOWS'))&&m.bundles.filter(x=>x.id!=='BUNDLE-19').every(x=>x.differentialDamageIds.every(id=>!wantedDamages.includes(id))),'external_part_as_manifold_damage');
 const edges=m.relations.filter(x=>x.from==='BUNDLE-19'),all=[...wantedConditions,...wantedActions,...wantedDamages];
 ck(eq(edges.map(x=>x.id),Array.from({length:14},(_,i)=>'REL-'+String(154+i).padStart(3,'0')))&&eq(edges.map(x=>x.to),all),'relations');
 ck(edges.every(x=>!x.observed&&x.reviewStatus==='interpretacao_inferida'&&x.type===(wantedConditions.includes(x.to)?'rule_monitors_condition':wantedActions.includes(x.to)?'rule_proposes_action':'rule_lists_differential_damage')),'relation_falsification');
 ck(f.version==='1.3.19'&&f.status==='synthetic_assertions_not_real_events'&&f.cases.length===38,'fixtures_version');
 for(const [id,cs,as] of [['SEM-33',['COND-ENGINE-EXH-SOOT-TRACE','COND-ENGINE-EXH-FLANGE-LEAK'],['ACT-ENGINE-EXH-TRACE-INSPECT']],['SEM-34',['COND-ENGINE-EXH-WET-RESIDUE','COND-ENGINE-EXH-PERFORMANCE'],['ACT-ENGINE-EXH-PERFORMANCE-CORRELATE']]]){
  const fx=find(f.cases,id);
  ck(fx?.ruleId==='engine-exhaust'&&eq(fx.observedConditionIds,cs)&&eq(fx.performedActionIds,as)&&fx.independentComponentTest==='not_performed'&&fx.expectedConfirmedDamageIds.length===0,'synthetic_fixture_'+id);
 }
 ck(p?.version==='1.3.55'&&p?.sourceOntologyVersion==='1.3.19'&&p?.expectedBundles===21&&p?.expectedUnmodeledRules===4,'crosswalk_policy');
 ck(gaps.length===10&&links.length===115&&seeds.length===25,'sap_pm_immutability');
 const cross=validateSemanticCrosswalkInputs(m,seeds,p);
 ck(cross.errors.length===0,'crosswalk:'+cross.errors.slice(0,6).join(','));
 ck(cross.coverage.modeledRules===21&&cross.coverage.unmodeledRuleIds.length===4&&cross.coverage.sharedGenericNodes===11&&cross.coverage.sharedDamageNodes===0,'coverage_or_sharing');
 return errors;
}
const errors=check(model,fixtures,preflight,policy),attacks=[];
for(let i=0;i<wantedConditions.length;i++){
 attacks.push(x=>{find(x.conditions,wantedConditions[i]).observedValue='present'});
 attacks.push(x=>{find(x.conditions,wantedConditions[i]).system='arrefecimento'});
}
for(let i=0;i<wantedActions.length;i++)attacks.push(x=>{find(x.actions,wantedActions[i]).executionStatus='completed'});
for(let i=0;i<wantedDamages.length;i++){
 attacks.push(x=>{find(x.damageHypotheses,wantedDamages[i]).confirmed=true});
 attacks.push(x=>{find(x.damageHypotheses,wantedDamages[i]).catalogMapping.damageCode='01.02'});
}
attacks.push(x=>{find(x.bundles,'BUNDLE-19').automaticDamagePromotion=true});
attacks.push(x=>{find(x.bundles,'BUNDLE-19').conditionIds.push('COND-BRAKE-DISC-WEAR')});
attacks.push(x=>{find(x.relations,'REL-154').observed=true});
attacks.push(x=>{x.workOrderExecutions.push({fiction:true})});
const policyAttacks=[x=>{x.expectedBundles=18},x=>{x.expectedUnmodeledRules=0},x=>{x.sharedNodes.push({id:'DMG-ENGINE-EXH-MANIFOLD-CRACK-CANDIDATE'})}];
const fixtureAttacks=[x=>{find(x.cases,'SEM-33').expectedConfirmedDamageIds=[wantedDamages[0]]},x=>{find(x.cases,'SEM-34').independentComponentTest='performed'}];
const preAttacks=[x=>{x.evidenceGates[0].status='approved'},x=>{x.scope.serialEffectivityVerified=true}];
let rejected=0;
for(let i=0;i<attacks.length;i++){const x=clone(model);attacks[i](x);if(check(x,fixtures,preflight,policy).length)rejected++;else errors.push('ontology_attack_passed_'+i);}
for(let i=0;i<policyAttacks.length;i++){const x=clone(policy);policyAttacks[i](x);if(check(model,fixtures,preflight,x).length)rejected++;else errors.push('policy_attack_passed_'+i);}
for(let i=0;i<fixtureAttacks.length;i++){const x=clone(fixtures);fixtureAttacks[i](x);if(check(model,x,preflight,policy).length)rejected++;else errors.push('fixture_attack_passed_'+i);}
for(let i=0;i<preAttacks.length;i++){const x=clone(preflight);preAttacks[i](x);if(check(model,fixtures,x,policy).length)rejected++;else errors.push('preflight_attack_passed_'+i);}
const expectedAttacks=attacks.length+policyAttacks.length+fixtureAttacks.length+preAttacks.length;
if(rejected!==expectedAttacks)errors.push('mutation_total_incomplete');
const counts={pmRules:seeds.length,modeledBundles:model.bundles.length,remainingRules:seeds.length-model.bundles.length,conditions:model.conditions.length,actions:model.actions.length,candidateDamages:model.damageHypotheses.length,relations:model.relations.length,syntheticCases:fixtures.cases.length,adversarialMutationsRejected:rejected,confirmedDamages:0,actualTests:0,approvedSapMappings:0};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-exhaust-ontology.generated.json'),JSON.stringify({schema:'fmea-mining.pm-exhaust-ontology-report.v1',version:'1.3.53',counts,errors},null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',counts,errors},null,2));process.exit(errors.length?1:0);
