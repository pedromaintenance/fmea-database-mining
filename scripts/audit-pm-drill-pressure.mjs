#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {validateSemanticCrosswalkInputs} from './lib/pm-semantic-crosswalk.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const m=read('data/ontology/condition-action-damage.v1.json'),fx=read('data/quality/semantic-regression-fixtures.v1.json'),p=read('data/quality/pm-drill-pressure-boundaries.v1.json'),cross=read('data/quality/pm-semantic-crosswalk-policy.v1.json');
const rules=read('data/knowledge/pm-prevention/seed-rules.json').records,links=read('data/knowledge/pm-prevention/generated-links.json').records,gaps=read('data/quality/pm-gap-review.v1.json').records;
const sources=new Set(read('data/research/sources.v1.json').sources.map(s=>s.id));
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),clone=x=>JSON.parse(JSON.stringify(x)),by=(a,id)=>a.find(x=>x.id===id);
const cIds=['COND-AIR-PRESS-LOW-RECEIVER','COND-AIR-PRESS-AUDIBLE-LEAK','COND-AIR-PRESS-HOSE-WEAR','COND-AIR-PRESS-JOINT-LEAK','COND-AIR-PRESS-RECEIVER-RISK','COND-AIR-PRESS-FLOW-DEVIATION'];
const aIds=['ACT-AIR-PRESS-SERIAL-CIRCUIT','ACT-AIR-PRESS-ISOLATE-VERIFY','ACT-AIR-PRESS-STATIC-DIFFERENTIAL','ACT-AIR-PRESS-OPERATING-DIFFERENTIAL','ACT-AIR-PRESS-ENGINEERING-DISPOSITION'];
const dIds=['DMG-AIR-PRESS-HOSE-THROUGHLEAK-CANDIDATE','DMG-AIR-PRESS-JOINT-SEAL-CANDIDATE','DMG-AIR-PRESS-RECEIVER-WALL-CANDIDATE'];
const sIds=['SANDVIK-DR410I-TRANSIT-GUIDE-REV-C-2023','SANDVIK-DR410i-SPEC','SANDVIK-DI650I-S5-SPEC','KAESER-COMPRESSED-AIR-SAFETY-2019'];
function check(o,f,g,c){
 const errors=[],ck=(v,id)=>{if(!v)errors.push(id)};
 const seed=by(rules,'drill-compressor-pressure'),bundle=by(o.bundles,'BUNDLE-24');
 const gap=gaps.find(x=>x.ruleId==='drill-compressor-pressure');
 ck(o.version==='1.3.23'&&o.conditions.length===107&&o.actions.length===82&&o.damageHypotheses.length===51&&o.bundles.length===25&&o.relations.length===251,'ontology_version_counts');
 ck(o.observations.length===0&&o.workOrderExecutions.length===0&&o.confirmedComponentDamages.length===0,'fabricated_operational_evidence');
 ck(rules.length===25&&links.length===115&&gaps.length===10&&seed?.system==='ar_comprimido'&&seed?.subgroupCode==='VPAR'&&seed?.partText==='Mangueira'&&seed?.review==='pendente','seed_immutability');
 ck(gap?.status==='bloqueado_aguardando_curadoria'&&gap.expectedBlocker==='component_not_registered'&&gap.autoRemapAllowed===false&&gap.approvedModelIds.length===0&&gap.confirmedSapLocationIds.length===0&&gap.observedFailures===0,'vpar_gap_must_remain_blocked');
 ck(g.schema==='fmea-mining.pm-drill-pressure-boundaries.v1'&&g.version==='1.3.58'&&g.sourceOntologyVersion==='1.3.22'&&g.ruleId==='drill-compressor-pressure','policy_version');
 ck(eq(g.scope.models,seed.models)&&g.scope.system===seed.system&&g.scope.subgroupCode===seed.subgroupCode&&g.scope.partText===seed.partText,'scope_provenance');
 ck(g.scope.eqModelsResolved===false&&g.scope.serialEffectivityVerified===false&&g.scope.circuitBOMVerified===false&&g.scope.vparHoseRegistered===false&&g.scope.receiverInspected===false,'invented_effectivity');
 ck(g.sapBlocker.ruleId===seed.id&&g.sapBlocker.expectedBlocker==='component_not_registered'&&g.sapBlocker.autoRemapAllowed===false&&g.sapBlocker.approvedMappingCount===0,'sap_policy_unblocked');
 ck(eq(g.sourceIds,sIds)&&g.sourceIds.every(x=>sources.has(x)),'source_integrity');
 ck(g.differentials.length===5&&g.differentials.every(x=>x.confirmed===false&&x.distinction.length>80),'weak_or_confirmed_differential');
 ck(g.gates.length===10&&g.gates.every(x=>x.status==='pending'),'evidence_gates_promoted');
 ck(Object.keys(g.safeguards).length===18&&Object.values(g.safeguards).every(x=>x===true),'safety_weakening');
 ck(Object.keys(g.limits).length===6&&Object.values(g.limits).every(x=>x===null),'invented_pressure_limit');
 ck(Object.keys(g.fieldState).length===6&&Object.values(g.fieldState).every(x=>x===0),'fabricated_field_data');
 ck(eq(g.conditionIds,cIds)&&eq(g.actionIds,aIds)&&eq(g.damageIds,dIds),'concept_ids_changed');
 ck(bundle?.ruleId==='drill-compressor-pressure'&&eq(bundle.conditionIds,cIds)&&eq(bundle.actionIds,aIds)&&eq(bundle.differentialDamageIds,dIds)&&bundle.chainIds.length===0,'bundle_references');
 ck(bundle?.status==='review_candidate'&&bundle.mappingScope==='generic_only'&&bundle.automaticDamagePromotion===false&&bundle.observedConditionIds.length===0&&bundle.performedActionIds.length===0&&bundle.confirmedDamageIds.length===0&&bundle.evidenceInterpretation==='sem_resultado_de_campo','bundle_promoted');
 ck(bundle?.interpretation.includes('VPAR')&&bundle?.interpretation.includes('DI650i')&&bundle?.interpretation.includes('pressão zero'),'unsafe_explanation');
 const filterBundle=o.bundles.find(b=>b.ruleId==='drill-compressor-filter');
 ck(o.bundles.filter(b=>b.ruleId==='drill-compressor-pressure').length===1&&filterBundle?.id==='BUNDLE-25'&&filterBundle.mappingScope==='generic_only'&&filterBundle.differentialDamageIds.every(id=>!bundle.differentialDamageIds.includes(id))&&filterBundle.conditionIds.every(id=>!bundle.conditionIds.includes(id))&&filterBundle.actionIds.every(id=>!bundle.actionIds.includes(id)),'pressure_filter_boundary');
 for(const id of cIds){const x=by(o.conditions,id);ck(x?.system==='ar_comprimido'&&x.status==='condition_hypothesis_not_observed'&&x.observedValue===null&&x.observedAt===null&&eq(x.sourceIds,sIds),'invented_condition_'+id);ck(x?.observation.length>95&&x?.limitations.length>105,'weak_discrimination_'+id);}
 for(const id of aIds){const x=by(o.actions,id);ck(x?.requiresApplicableOemProcedure===true&&x.executionStatus==='not_performed'&&x.observedResults.length===0&&x.intervalHours===null&&eq(x.sourceIds,sIds),'fake_execution_'+id);ck(x?.intent.length>98&&x?.safety.length>105,'unsafe_inspection_'+id);}
 ck(by(o.actions,'ACT-AIR-PRESS-ISOLATE-VERIFY')?.safety.includes('pressão zero'),'missing_pressure_zero');
 ck(by(o.actions,'ACT-AIR-PRESS-STATIC-DIFFERENTIAL')?.safety.includes('pressurização'),'unsafe_pressure_hunting');
 for(const id of dIds){const x=by(o.damageHypotheses,id);ck(x?.kind==='candidate_component_damage'&&x.confirmed===false&&x.reviewStatus==='not_approved'&&eq(x.sourceIds,sIds),'damage_approved_'+id);ck(x?.label.startsWith('Possível')&&x?.requiredEvidence.length>105&&Object.keys(x?.catalogMapping||{}).length===5&&Object.values(x.catalogMapping).every(v=>v===null),'sap_mapped_damage_'+id);}
 const edges=o.relations.filter(x=>x.from==='BUNDLE-24'),all=[...cIds,...aIds,...dIds];
 ck(edges.length===14&&eq(edges.map(x=>x.to),all)&&eq(edges.map(x=>x.id),Array.from({length:14},(_,i)=>'REL-'+String(224+i).padStart(3,'0'))),'typed_relations');
 ck(edges.every(x=>x.observed===false&&x.reviewStatus==='interpretacao_inferida'&&x.type===(cIds.includes(x.to)?'rule_monitors_condition':aIds.includes(x.to)?'rule_proposes_action':'rule_lists_differential_damage')),'relation_provenance');
 ck(f.version==='1.3.23'&&f.status==='synthetic_assertions_not_real_events'&&f.cases.length===46,'fixtures_version');
 for(const id of ['SEM-43','SEM-44']){const x=by(f.cases,id);ck(x?.ruleId==='drill-compressor-pressure'&&x.independentComponentTest==='not_performed'&&x.expectedConfirmedDamageIds.length===0&&x.observedConditionIds.every(v=>cIds.includes(v))&&x.performedActionIds.every(v=>aIds.includes(v)),'fake_fixture_'+id);}
 ck(c.version==='1.3.59'&&c.sourceOntologyVersion==='1.3.23'&&c.expectedBundles===25&&c.expectedUnmodeledRules===0,'crosswalk_policy');
 const cw=validateSemanticCrosswalkInputs(o,rules,c);
 ck(cw.errors.length===0&&cw.coverage.modeledRules===25&&cw.coverage.unmodeledRuleIds.length===0&&cw.coverage.sharedGenericNodes===11&&cw.coverage.sharedDamageNodes===0,'crosswalk_'+cw.errors.slice(0,4).join('_'));
 return errors;
}
const errors=check(m,fx,p,cross),oa=[],ga=[],fa=[];
for(const id of cIds){oa.push(x=>{by(x.conditions,id).observedValue='fake'});oa.push(x=>{by(x.conditions,id).system='hidraulico'})}
for(const id of aIds){oa.push(x=>{by(x.actions,id).executionStatus='completed'});oa.push(x=>{by(x.actions,id).requiresApplicableOemProcedure=false})}
for(const id of dIds){oa.push(x=>{by(x.damageHypotheses,id).confirmed=true});oa.push(x=>{by(x.damageHypotheses,id).catalogMapping.damageCode='03.01'})}
oa.push(x=>{by(x.bundles,'BUNDLE-24').automaticDamagePromotion=true});
oa.push(x=>{by(x.bundles,'BUNDLE-24').conditionIds.push('COND-FEED-CHAIN-WEAR')});
oa.push(x=>{by(x.relations,'REL-224').observed=true});
oa.push(x=>{x.workOrderExecutions.push({fake:true})});
ga.push(x=>{x.gates[0].status='approved'});
ga.push(x=>{x.safeguards.noPressurizedIntervention=false});
ga.push(x=>{x.limits.testPressureBar=30});
ga.push(x=>{x.fieldState.tests=1});
ga.push(x=>{x.scope.vparHoseRegistered=true});
ga.push(x=>{x.sapBlocker.autoRemapAllowed=true});
ga.push(x=>{x.scope.eqModelsResolved=true});
ga.push(x=>{x.differentials[0].confirmed=true});
fa.push(x=>{by(x.cases,'SEM-43').expectedConfirmedDamageIds=[dIds[0]]});
fa.push(x=>{by(x.cases,'SEM-44').independentComponentTest='performed'});
let rejected=0;
for(let i=0;i<oa.length;i++){const x=clone(m);oa[i](x);if(check(x,fx,p,cross).length)rejected++;else errors.push('ontology_mutant_'+i);}
for(let i=0;i<ga.length;i++){const x=clone(p);ga[i](x);if(check(m,fx,x,cross).length)rejected++;else errors.push('guard_mutant_'+i);}
for(let i=0;i<fa.length;i++){const x=clone(fx);fa[i](x);if(check(m,x,p,cross).length)rejected++;else errors.push('fixture_mutant_'+i);}
const expected=oa.length+ga.length+fa.length;if(expected!==42||rejected!==expected)errors.push('adversarial_suite_incomplete');
const counts={totalPMRules:rules.length,modeledBundles:m.bundles.length,remainingRules:rules.length-m.bundles.length,conditions:m.conditions.length,actions:m.actions.length,candidateDamages:m.damageHypotheses.length,typedRelations:m.relations.length,syntheticCases:fx.cases.length,mutationsRejected:rejected,confirmedDamages:0,observations:0,approvedSAPMappings:0};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});fs.writeFileSync(path.join(root,'reports/pm-drill-pressure.generated.json'),JSON.stringify({schema:'fmea-mining.pm-drill-pressure-report.v1',version:'1.3.58',counts,errors},null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',counts,errors},null,2));process.exit(errors.length?1:0);
