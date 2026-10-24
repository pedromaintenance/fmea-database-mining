#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {validateSemanticCrosswalkInputs} from './lib/pm-semantic-crosswalk.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const ontology=read('data/ontology/condition-action-damage.v1.json'),fixtures=read('data/quality/semantic-regression-fixtures.v1.json'),policy=read('data/quality/pm-tire-damage-boundaries.v1.json'),cross=read('data/quality/pm-semantic-crosswalk-policy.v1.json'),rules=read('data/knowledge/pm-prevention/seed-rules.json').records,sourceIds=new Set(read('data/research/sources.v1.json').sources.map(x=>x.id)),gaps=read('data/quality/pm-gap-review.v1.json').records,links=read('data/knowledge/pm-prevention/generated-links.json').records;
const clone=x=>JSON.parse(JSON.stringify(x)),eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),find=(a,id)=>a.find(x=>x.id===id);
function check(m,f,p,c){
 const e=[],ck=(v,n)=>{if(!v)e.push(n)},seed=rules.find(r=>r.id==='wheel-tire-damage'),b=find(m.bundles,'BUNDLE-20');
 ck(m.version==='1.3.23'&&m.conditions.length===107&&m.actions.length===82&&m.damageHypotheses.length===51&&m.bundles.length===25&&m.relations.length===251,'counts');
 ck(m.observations.length===0&&m.workOrderExecutions.length===0&&m.confirmedComponentDamages.length===0,'fabricated_events');
 ck(rules.length===25&&gaps.length===10&&links.length===115&&seed?.system==='pneus_rodas'&&seed?.subgroupCode==='TIR1'&&seed?.partText==='Pneu'&&seed.review==='pendente','pm_baseline');
 ck(p.schema==='fmea-mining.pm-tire-damage-boundaries.v1'&&p.version==='1.3.54'&&p.sourceOntologyVersion==='1.3.18'&&p.ruleId==='wheel-tire-damage','policy_version');
 ck(p.scope.system===seed.system&&eq(p.scope.models,seed.models)&&p.scope.subgroupCode==='TIR1'&&p.scope.tireSizeVerified===false&&p.scope.constructionVerified===false&&p.scope.oemCriteriaVerified===false,'effectivity');
 ck(eq(b?.conditionIds,p.conditionIds)&&eq(b?.actionIds,p.actionIds)&&eq(b?.differentialDamageIds,p.damageIds)&&b?.ruleId==='wheel-tire-damage'&&b?.status==='review_candidate'&&b?.mappingScope==='generic_only','bundle');
 ck(b?.automaticDamagePromotion===false&&b?.observedConditionIds.length===0&&b?.performedActionIds.length===0&&b?.confirmedDamageIds.length===0&&b?.chainIds.length===0,'promotion');
 ck(b?.interpretation.includes('imobilização')&&b?.interpretation.includes('wheel-tire-wear')&&b?.evidenceInterpretation==='sem_resultado_de_campo','interpretation');
 const wear=m.bundles.find(x=>x.ruleId==='wheel-tire-wear');
 ck(wear?.id==='BUNDLE-21'&&wear?.mappingScope==='generic_only'&&wear.conditionIds.every(x=>!b.conditionIds.includes(x))&&wear.actionIds.every(x=>!b.actionIds.includes(x))&&wear.differentialDamageIds.every(x=>!b.differentialDamageIds.includes(x)),'wear_separation');
 ck(p.conditionIds.length===6&&p.actionIds.length===5&&p.damageIds.length===4&&p.sourceIds.length===3&&p.sourceIds.every(id=>sourceIds.has(id)),'concept_source_counts');
 for(const id of p.conditionIds){const x=find(m.conditions,id);ck(x?.system==='pneus_rodas'&&x?.status==='condition_hypothesis_not_observed'&&x.observedValue===null&&x.observedAt===null&&x?.observation.length>90&&x?.limitations.length>100&&eq(x?.sourceIds,p.sourceIds),'condition_'+id);}
 for(const id of p.actionIds){const x=find(m.actions,id);ck(x?.requiresApplicableOemProcedure===true&&x?.executionStatus==='not_performed'&&x?.observedResults.length===0&&x?.intervalHours===null&&x?.intent.length>105&&x?.safety.length>105&&eq(x?.sourceIds,p.sourceIds),'action_'+id);}
 for(const id of p.damageIds){const x=find(m.damageHypotheses,id);ck(x?.kind==='candidate_component_damage'&&x?.confirmed===false&&x?.reviewStatus==='not_approved'&&x?.requiredEvidence.length>100&&Object.keys(x?.catalogMapping||{}).length===5&&Object.values(x.catalogMapping).every(v=>v===null),'damage_'+id);}
 ck(p.differentials.length===5&&p.differentials.every(x=>x.confirmed===false&&x.distinction.length>75),'differentials');
 ck(p.gates.length===9&&p.gates.every(x=>x.status==='pending'),'gates');
 ck(Object.keys(p.safeguards).length===16&&Object.values(p.safeguards).every(Boolean),'safety');
 ck(Object.keys(p.limits).length===6&&Object.values(p.limits).every(v=>v===null),'invented_limits');
 ck(Object.keys(p.fieldState).length===6&&Object.values(p.fieldState).every(v=>v===0),'fake_action');
 const ee=m.relations.filter(x=>x.from==='BUNDLE-20'),expected=[...p.conditionIds,...p.actionIds,...p.damageIds];
 ck(ee.length===15&&eq(ee.map(x=>x.to),expected)&&eq(ee.map(x=>x.id),Array.from({length:15},(_,i)=>'REL-'+String(i+168).padStart(3,'0'))),'edges');
 ck(ee.every(x=>!x.observed&&x.reviewStatus==='interpretacao_inferida'&&x.type===(p.conditionIds.includes(x.to)?'rule_monitors_condition':p.actionIds.includes(x.to)?'rule_proposes_action':'rule_lists_differential_damage')),'edge_types');
 ck(f.version==='1.3.23'&&f.status==='synthetic_assertions_not_real_events'&&f.cases.length===46,'fixtures');
 for(const id of ['SEM-35','SEM-36']){const x=find(f.cases,id);ck(x?.ruleId==='wheel-tire-damage'&&x?.independentComponentTest==='not_performed'&&x?.expectedConfirmedDamageIds.length===0,'fixture_'+id);}
 ck(c.version==='1.3.59'&&c.expectedBundles===25&&c.expectedUnmodeledRules===0&&c.sourceOntologyVersion==='1.3.23','cross_policy');
 const x=validateSemanticCrosswalkInputs(m,rules,c);
 ck(x.errors.length===0&&x.coverage.modeledRules===25&&x.coverage.unmodeledRuleIds.length===0&&x.coverage.sharedDamageNodes===0&&x.coverage.sharedGenericNodes===11,'crosswalk_'+x.errors.slice(0,3).join(','));
 return e;
}
const errors=check(ontology,fixtures,policy,cross),att=[],pa=[],fa=[];
for(const id of policy.conditionIds){att.push(x=>{find(x.conditions,id).observedValue='fake'});att.push(x=>{find(x.conditions,id).system='freios'});}
for(const id of policy.actionIds){att.push(x=>{find(x.actions,id).executionStatus='completed'});att.push(x=>{find(x.actions,id).requiresApplicableOemProcedure=false});}
for(const id of policy.damageIds){att.push(x=>{find(x.damageHypotheses,id).confirmed=true});att.push(x=>{find(x.damageHypotheses,id).catalogMapping.damageCode='01.02'});}
att.push(x=>{find(x.bundles,'BUNDLE-20').automaticDamagePromotion=true});
att.push(x=>{find(x.bundles,'BUNDLE-20').conditionIds.push('COND-BRAKE-LOW-DECEL')});
att.push(x=>{find(x.relations,'REL-168').observed=true});
att.push(x=>{x.workOrderExecutions.push({fake:true})});
pa.push(x=>{x.gates[0].status='approved'});
pa.push(x=>{x.safeguards.noInflateDeflateDamagedTire=false});
pa.push(x=>{x.limits.pressurePsi=100});
pa.push(x=>{x.fieldState.damages=1});
pa.push(x=>{x.scope.oemCriteriaVerified=true});
pa.push(x=>{x.differentials[0].confirmed=true});
fa.push(x=>{find(x.cases,'SEM-35').expectedConfirmedDamageIds=[policy.damageIds[0]]});
fa.push(x=>{find(x.cases,'SEM-36').independentComponentTest='performed'});
let rejected=0;
att.forEach((mut,i)=>{const x=clone(ontology);mut(x);if(check(x,fixtures,policy,cross).length)rejected++;else errors.push('ontology_mutant_accepted_'+i)});
pa.forEach((mut,i)=>{const x=clone(policy);mut(x);if(check(ontology,fixtures,x,cross).length)rejected++;else errors.push('policy_mutant_accepted_'+i)});
fa.forEach((mut,i)=>{const x=clone(fixtures);mut(x);if(check(ontology,x,policy,cross).length)rejected++;else errors.push('fixture_mutant_accepted_'+i)});
const expected=att.length+pa.length+fa.length;if(expected!==42||rejected!==expected)errors.push('mutation_count');
const counts={pmRules:rules.length,bundles:ontology.bundles.length,remaining:rules.length-ontology.bundles.length,conditions:ontology.conditions.length,actions:ontology.actions.length,damages:ontology.damageHypotheses.length,relations:ontology.relations.length,syntheticFixtures:fixtures.cases.length,adversarialMutationsRejected:rejected,fieldObservations:0,confirmedDamages:0,approvedSapMappings:0};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});fs.writeFileSync(path.join(root,'reports/pm-tire-damage.generated.json'),JSON.stringify({schema:'fmea-mining.pm-tire-damage-report.v1',version:'1.3.54',counts,errors},null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',counts,errors},null,2));process.exit(errors.length?1:0);
