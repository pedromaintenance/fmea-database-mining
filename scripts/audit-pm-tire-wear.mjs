#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateSemanticCrosswalkInputs} from './lib/pm-semantic-crosswalk.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const ont=read('data/ontology/condition-action-damage.v1.json');
const fixtures=read('data/quality/semantic-regression-fixtures.v1.json');
const policy=read('data/quality/pm-tire-wear-boundaries.v1.json');
const cross=read('data/quality/pm-semantic-crosswalk-policy.v1.json');
const rules=read('data/knowledge/pm-prevention/seed-rules.json').records;
const sources=new Set(read('data/research/sources.v1.json').sources.map(s=>s.id));
const gaps=read('data/quality/pm-gap-review.v1.json').records;
const links=read('data/knowledge/pm-prevention/generated-links.json').records;
const copy=x=>JSON.parse(JSON.stringify(x));
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const by=(xs,id)=>xs.find(x=>x.id===id);
const expectedConditions=['COND-TIRE-WEAR-RTD-PROFILE','COND-TIRE-WEAR-CENTER','COND-TIRE-WEAR-SHOULDERS','COND-TIRE-WEAR-ONE-SIDED','COND-TIRE-WEAR-LOCALIZED','COND-TIRE-WEAR-DUAL-MATCH'];
const expectedActions=['ACT-TIRE-WEAR-IDENTIFY','ACT-TIRE-WEAR-MEASURE','ACT-TIRE-WEAR-PRESSURE-LOAD','ACT-TIRE-WEAR-ALIGNMENT-DUAL'];
const expectedDamages=['DMG-TIRE-WEAR-CENTER-LOSS-CANDIDATE','DMG-TIRE-WEAR-SHOULDER-LOSS-CANDIDATE','DMG-TIRE-WEAR-LOCAL-LOSS-CANDIDATE'];
function check(m,f,p,c){
 const e=[],ok=(v,k)=>{if(!v)e.push(k)};
 const seed=rules.find(x=>x.id==='wheel-tire-wear');
 const wear=by(m.bundles,'BUNDLE-21'),structural=by(m.bundles,'BUNDLE-20');
 ok(m.version==='1.3.23'&&m.conditions.length===107&&m.actions.length===82&&m.damageHypotheses.length===51&&m.bundles.length===25&&m.relations.length===251,'ontology_count');
 ok(m.observations.length===0&&m.workOrderExecutions.length===0&&m.confirmedComponentDamages.length===0,'fabricated_events');
 ok(seed?.system==='pneus_rodas'&&seed?.subgroupCode==='TIR3'&&seed?.partText==='Pneu'&&seed?.review==='pendente'&&rules.length===25&&gaps.length===10&&links.length===115,'pm_sap_drift');
 ok(p.schema==='fmea-mining.pm-tire-wear-boundaries.v1'&&p.version==='1.3.55'&&p.sourceOntologyVersion==='1.3.19'&&p.ruleId==='wheel-tire-wear','policy_identity');
 ok(p.scope.system===seed.system&&p.scope.subgroupCode===seed.subgroupCode&&eq(p.scope.models,seed.models)&&p.scope.partText===seed.partText,'scope');
 ok(Object.values({tire:p.scope.tireIdentified,pattern:p.scope.patternVerified,dual:p.scope.dualFitmentVerified,oem:p.scope.oemLimitVerified}).every(v=>v===false),'imaginary_effectivity');
 ok(eq(p.conditionIds,expectedConditions)&&eq(p.actionIds,expectedActions)&&eq(p.damageIds,expectedDamages),'policy_node_identity');
 ok(eq(p.sourceIds,['MICHELIN-EARTHMOVER-TIRE-INSPECTION','MICHELIN-EARTHMOVER-TIRE-PRESSURE','BRIDGESTONE-OTR-PROGRAM'])&&p.sourceIds.every(id=>sources.has(id)),'source_provenance');
 ok(wear?.ruleId==='wheel-tire-wear'&&eq(wear.conditionIds,p.conditionIds)&&eq(wear.actionIds,p.actionIds)&&eq(wear.differentialDamageIds,p.damageIds),'bundle_references');
 ok(wear?.status==='review_candidate'&&wear?.mappingScope==='generic_only'&&wear?.automaticDamagePromotion===false&&wear?.chainIds.length===0&&wear?.observedConditionIds.length===0&&wear?.performedActionIds.length===0&&wear?.confirmedDamageIds.length===0&&wear?.evidenceInterpretation==='sem_resultado_de_campo','promotion');
 ok(wear?.interpretation.includes('OEM')&&wear?.interpretation.includes('wheel-tire-damage')&&wear?.interpretation.includes('duplos'),'interpretation_limits');
 ok(m.bundles.filter(x=>x.ruleId==='wheel-tire-wear').length===1&&structural?.ruleId==='wheel-tire-damage','two_independent_rules');
 ok(wear?.conditionIds.every(x=>!structural.conditionIds.includes(x))&&wear?.actionIds.every(x=>!structural.actionIds.includes(x))&&wear?.differentialDamageIds.every(x=>!structural.differentialDamageIds.includes(x)),'structural_cross_contamination');
 for(const id of p.conditionIds){
  const v=by(m.conditions,id);
  ok(v?.system==='pneus_rodas'&&v?.status==='condition_hypothesis_not_observed'&&v?.observedValue===null&&v?.observedAt===null&&eq(v?.sourceIds,p.sourceIds),'observed_condition_'+id);
  ok(v?.observation?.length>90&&v?.limitations?.length>95&&v?.methods.includes('EV-01'),'weak_observation_'+id);
 }
 ok(by(m.conditions,'COND-TIRE-WEAR-DUAL-MATCH')?.limitations.includes('presumida'),'dual_not_conditional');
 for(const id of p.actionIds){
  const v=by(m.actions,id);
  ok(v?.requiresApplicableOemProcedure===true&&v?.executionStatus==='not_performed'&&v?.observedResults.length===0&&v?.intervalHours===null&&eq(v?.sourceIds,p.sourceIds),'executed_action_'+id);
  ok(v?.intent?.length>95&&v?.safety?.length>100,'weak_action_'+id);
 }
 ok(by(m.actions,'ACT-TIRE-WEAR-PRESSURE-LOAD')?.safety.includes('esvaziar pneu quente'),'unsafe_pressure');
 for(const id of p.damageIds){
  const v=by(m.damageHypotheses,id);
  ok(v?.kind==='candidate_component_damage'&&v?.confirmed===false&&v?.reviewStatus==='not_approved'&&eq(v?.sourceIds,p.sourceIds),'damage_promoted_'+id);
  ok(v?.label.startsWith('Possível')&&v?.requiredEvidence.length>110&&Object.keys(v?.catalogMapping||{}).length===5&&Object.values(v.catalogMapping).every(x=>x===null),'damage_sap_'+id);
 }
 const edges=m.relations.filter(x=>x.from==='BUNDLE-21'),want=[...p.conditionIds,...p.actionIds,...p.damageIds];
 ok(edges.length===13&&eq(edges.map(x=>x.to),want)&&eq(edges.map(x=>x.id),Array.from({length:13},(_,i)=>'REL-'+String(183+i).padStart(3,'0'))),'relations');
 ok(edges.every(x=>x.observed===false&&x.reviewStatus==='interpretacao_inferida'&&x.type===(p.conditionIds.includes(x.to)?'rule_monitors_condition':p.actionIds.includes(x.to)?'rule_proposes_action':'rule_lists_differential_damage')),'relation_types');
 ok(p.differentials.length===5&&p.differentials.every(x=>x.confirmed===false&&x.meaning.length>70),'differential_inference');
 ok(p.gates.length===9&&p.gates.every(x=>x.status==='pending'),'gate_promoted');
 ok(Object.keys(p.safeguards).length===16&&Object.values(p.safeguards).every(v=>v===true),'safety_relaxed');
 ok(Object.keys(p.limits).length===6&&Object.values(p.limits).every(x=>x===null),'fabricated_limit');
 ok(Object.keys(p.fieldState).length===6&&Object.values(p.fieldState).every(x=>x===0),'fabricated_field_state');
 ok(f.version==='1.3.23'&&f.status==='synthetic_assertions_not_real_events'&&f.cases.length===46,'fixture_baseline');
 for(const id of ['SEM-37','SEM-38']){const x=by(f.cases,id);ok(x?.ruleId==='wheel-tire-wear'&&x.independentComponentTest==='not_performed'&&x.expectedConfirmedDamageIds.length===0&&x.observedConditionIds.every(v=>p.conditionIds.includes(v))&&x.performedActionIds.every(v=>p.actionIds.includes(v)),'fixture_promoted_'+id);}
 ok(c.version==='1.3.59'&&c.sourceOntologyVersion==='1.3.23'&&c.expectedBundles===25&&c.expectedUnmodeledRules===0,'crosswalk_policy');
 const result=validateSemanticCrosswalkInputs(m,rules,c);
 ok(result.errors.length===0&&result.coverage.modeledRules===25&&result.coverage.unmodeledRuleIds.length===0&&result.coverage.sharedGenericNodes===11&&result.coverage.sharedDamageNodes===0,'crosswalk_'+result.errors.slice(0,3).join('-'));
 return e;
}
const errors=check(ont,fixtures,policy,cross),att=[],pa=[],fx=[];
for(const id of expectedConditions){att.push(x=>{by(x.conditions,id).observedValue='fake'});att.push(x=>{by(x.conditions,id).system='freios'});}
for(const id of expectedActions){att.push(x=>{by(x.actions,id).executionStatus='done'});att.push(x=>{by(x.actions,id).requiresApplicableOemProcedure=false});}
for(const id of expectedDamages){att.push(x=>{by(x.damageHypotheses,id).confirmed=true});att.push(x=>{by(x.damageHypotheses,id).catalogMapping.damageCode='02.01'});}
att.push(x=>{by(x.bundles,'BUNDLE-21').automaticDamagePromotion=true});
att.push(x=>{by(x.bundles,'BUNDLE-21').conditionIds.push('COND-TIRE-SIDEWALL-CUT')});
att.push(x=>{by(x.relations,'REL-183').observed=true});
att.push(x=>{x.workOrderExecutions.push({invented:true})});
pa.push(x=>{x.gates[0].status='approved'});
pa.push(x=>{x.safeguards.noDeflationOfHotTire=false});
pa.push(x=>{x.limits.pressurePsi=100});
pa.push(x=>{x.fieldState.measurements=1});
fx.push(x=>{by(x.cases,'SEM-37').expectedConfirmedDamageIds=[expectedDamages[0]]});
fx.push(x=>{by(x.cases,'SEM-38').independentComponentTest='performed'});
let rejected=0;
for(let i=0;i<att.length;i++){const x=copy(ont);att[i](x);if(check(x,fixtures,policy,cross).length)rejected++;else errors.push('ontology_mutant_accepted_'+i)}
for(let i=0;i<pa.length;i++){const x=copy(policy);pa[i](x);if(check(ont,fixtures,x,cross).length)rejected++;else errors.push('policy_mutant_accepted_'+i)}
for(let i=0;i<fx.length;i++){const x=copy(fixtures);fx[i](x);if(check(ont,x,policy,cross).length)rejected++;else errors.push('fixture_mutant_accepted_'+i)}
const expected=att.length+pa.length+fx.length;if(expected!==36||rejected!==expected)errors.push('mutation_count');
const counts={pmRules:rules.length,modeledBundles:ont.bundles.length,remainingRules:rules.length-ont.bundles.length,conditions:ont.conditions.length,actions:ont.actions.length,damageHypotheses:ont.damageHypotheses.length,relations:ont.relations.length,syntheticFixtures:fixtures.cases.length,adversarialMutationsRejected:rejected,confirmedDamages:0,fieldObservations:0,approvedSapMappings:0};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});fs.writeFileSync(path.join(root,'reports/pm-tire-wear.generated.json'),JSON.stringify({schema:'fmea-mining.pm-tire-wear-report.v1',version:'1.3.55',counts,errors},null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',counts,errors},null,2));process.exit(errors.length?1:0);
