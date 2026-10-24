#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateSemanticCrosswalkInputs} from './lib/pm-semantic-crosswalk.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const m=read('data/ontology/condition-action-damage.v1.json');
const f=read('data/quality/semantic-regression-fixtures.v1.json');
const p=read('data/quality/pm-drill-feed-boundaries.v1.json');
const cross=read('data/quality/pm-semantic-crosswalk-policy.v1.json');
const seeds=read('data/knowledge/pm-prevention/seed-rules.json').records;
const gaps=read('data/quality/pm-gap-review.v1.json').records;
const links=read('data/knowledge/pm-prevention/generated-links.json').records;
const sources=new Set(read('data/research/sources.v1.json').sources.map(s=>s.id));
const clone=x=>JSON.parse(JSON.stringify(x));
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const by=(arr,id)=>arr.find(x=>x.id===id);
const cIds=['COND-FEED-CHAIN-WEAR','COND-FEED-CHAIN-SLACK','COND-FEED-CHAIN-SPROCKET','COND-FEED-CHAIN-TRACK','COND-FEED-CHAIN-SIDE-SKEW','COND-FEED-CHAIN-GUIDE'];
const aIds=['ACT-FEED-CHAIN-SERIAL-BOM','ACT-FEED-CHAIN-SAFE-VISUAL','ACT-FEED-CHAIN-TENSION-VERIFY','ACT-FEED-CHAIN-SYNC-DIFFERENTIAL','ACT-FEED-CHAIN-REVIEW-DISPOSITION'];
const dIds=['DMG-FEED-CHAIN-JOINT-WEAR-CANDIDATE','DMG-FEED-CHAIN-SPROCKET-WEAR-CANDIDATE','DMG-FEED-CHAIN-GUIDE-WEAR-CANDIDATE'];
function check(o,fx,g,crossPolicy){
 const errors=[],ck=(v,k)=>{if(!v)errors.push(k)};
 const s=seeds.find(x=>x.id==='drill-feed-chain'),b=by(o.bundles,'BUNDLE-22');
 ck(o.schema==='fmea-mining.condition-action-damage.v1'&&o.version==='1.3.21'&&o.conditions.length===95&&o.actions.length===72&&o.damageHypotheses.length===45&&o.bundles.length===23&&o.relations.length===223,'ontology_baseline');
 ck(o.observations.length===0&&o.workOrderExecutions.length===0&&o.confirmedComponentDamages.length===0,'invented_field_evidence');
 ck(seeds.length===25&&gaps.length===10&&links.length===115&&s?.system==='avanco_perfuratriz'&&s.subgroupCode==='FECH'&&s.partText==='Corrente'&&s.review==='pendente','pm_sap_seed_drift');
 ck(g.schema==='fmea-mining.pm-drill-feed-boundaries.v1'&&g.version==='1.3.56'&&g.sourceOntologyVersion==='1.3.20'&&g.ruleId==='drill-feed-chain','guard_identity');
 ck(eq(g.scope.models,s.models)&&g.scope.system===s.system&&g.scope.subgroupCode===s.subgroupCode&&g.scope.partText===s.partText,'seed_mapping_changed');
 ck(g.scope.eqModelsResolved===false&&g.scope.serialEffectivityVerified===false&&g.scope.dr410AutoTensionInstalled===null&&g.scope.di650TensionMechanismConfirmed===false&&g.scope.componentLocationVerified===false,'unsupported_effectivity');
 ck(eq(g.sourceIds,['SANDVIK-DR410I-FEED-SPEC-2024','SANDVIK-DI650I-CHAIN-SPEC-2020'])&&g.sourceIds.every(id=>sources.has(id)),'source_provenance');
 ck(g.oemArchitecture.length===2&&g.oemArchitecture[0].id==='DR410i'&&g.oemArchitecture[0].standardManualPins===true&&g.oemArchitecture[0].autoHydraulicTensionOptional===true&&g.oemArchitecture[0].fleetOptionConfirmed===false,'dr410_options_not_proven');
 ck(g.oemArchitecture[1].id==='DI650i-S5'&&g.oemArchitecture[1].chainFeedInPublication===true&&g.oemArchitecture[1].standardManualPins===null&&g.oemArchitecture[1].autoHydraulicTensionOptional===null&&g.oemArchitecture[1].fleetOptionConfirmed===false,'di650_transfer_risk');
 ck(g.oemArchitecture[0].chainFeedInPublication===true&&g.oemArchitecture[0].twinCylindersInPublication===true&&g.oemArchitecture[1].twinCylindersInPublication===null,'architecture_not_specific');
 ck(eq(g.conditionIds,cIds)&&eq(g.actionIds,aIds)&&eq(g.damageIds,dIds),'guard_identifiers');
 ck(g.differentials.length===5&&g.differentials.every(x=>x.confirmed===false&&x.distinction.length>90),'differentials_promoted');
 ck(g.gates.length===10&&g.gates.every(x=>x.status==='pending'),'missing_evidence_gate');
 ck(Object.keys(g.safeguards).length===16&&Object.values(g.safeguards).every(x=>x===true),'safety_policy_relaxed');
 ck(Object.keys(g.limits).length===6&&Object.values(g.limits).every(x=>x===null),'invented_oem_limit');
 ck(Object.keys(g.fieldState).length===6&&Object.values(g.fieldState).every(x=>x===0),'fake_execution');
 ck(b?.ruleId==='drill-feed-chain'&&eq(b.conditionIds,cIds)&&eq(b.actionIds,aIds)&&eq(b.differentialDamageIds,dIds)&&b.chainIds.length===0,'bundle_concepts');
 ck(b?.status==='review_candidate'&&b?.mappingScope==='generic_only'&&b?.automaticDamagePromotion===false&&b?.observedConditionIds.length===0&&b?.performedActionIds.length===0&&b?.confirmedDamageIds.length===0&&b?.evidenceInterpretation==='sem_resultado_de_campo','bundle_false_result');
 ck(b?.interpretation.includes('DR410i')&&b?.interpretation.includes('DI650i')&&b?.interpretation.includes('FECH/SAP')&&eq(b.sourceIds,g.sourceIds),'weak_differential_justification');
 ck(o.bundles.filter(x=>x.ruleId==='drill-feed-chain').length===1,'duplicate_rule');
 for(const id of cIds){
  const x=by(o.conditions,id);
  ck(x?.system==='avanco_perfuratriz'&&x.status==='condition_hypothesis_not_observed'&&x.observedValue===null&&x.observedAt===null&&eq(x.sourceIds,g.sourceIds),'faked_condition_'+id);
  ck(x?.observation.length>95&&x?.limitations.length>105&&x?.methods.includes('EV-01'),'weak_condition_'+id);
 }
 for(const id of aIds){
  const x=by(o.actions,id);
  ck(x?.requiresApplicableOemProcedure===true&&x.executionStatus==='not_performed'&&x.observedResults.length===0&&x.intervalHours===null&&eq(x.sourceIds,g.sourceIds),'faked_action_'+id);
  ck(x?.intent.length>100&&x?.safety.length>105,'unsafe_action_'+id);
 }
 ck(by(o.actions,'ACT-FEED-CHAIN-SAFE-VISUAL')?.safety.includes('energias hidráulicas e gravitacionais'),'stored_energy_hazard');
 ck(by(o.actions,'ACT-FEED-CHAIN-TENSION-VERIFY')?.safety.includes('Não ajustar'),'unauthorized_tensioning');
 for(const id of dIds){
  const x=by(o.damageHypotheses,id);
  ck(x?.kind==='candidate_component_damage'&&x.confirmed===false&&x.reviewStatus==='not_approved'&&eq(x.sourceIds,g.sourceIds),'faked_damage_'+id);
  ck(x?.label.startsWith('Possível')&&x?.requiredEvidence.length>105&&Object.keys(x?.catalogMapping||{}).length===5&&Object.values(x.catalogMapping).every(v=>v===null),'unapproved_sap_'+id);
 }
 const edges=o.relations.filter(x=>x.from==='BUNDLE-22'),expected=[...cIds,...aIds,...dIds];
 ck(edges.length===14&&eq(edges.map(x=>x.to),expected)&&eq(edges.map(x=>x.id),Array.from({length:14},(_,i)=>'REL-'+String(196+i).padStart(3,'0'))),'edge_cardinality');
 ck(edges.every(x=>x.observed===false&&x.reviewStatus==='interpretacao_inferida'&&x.type===(cIds.includes(x.to)?'rule_monitors_condition':aIds.includes(x.to)?'rule_proposes_action':'rule_lists_differential_damage')),'edge_type_or_evidence');
 ck(fx.version==='1.3.21'&&fx.status==='synthetic_assertions_not_real_events'&&fx.cases.length===42,'synthetic_fixture_baseline');
 for(const id of ['SEM-39','SEM-40']){
  const x=by(fx.cases,id);
  ck(x?.ruleId==='drill-feed-chain'&&x?.independentComponentTest==='not_performed'&&x?.expectedConfirmedDamageIds.length===0&&x?.observedConditionIds.every(v=>cIds.includes(v))&&x?.performedActionIds.every(v=>aIds.includes(v)),'fixture_promoted_'+id);
 }
 ck(crossPolicy.version==='1.3.57'&&crossPolicy.sourceOntologyVersion==='1.3.21'&&crossPolicy.expectedBundles===23&&crossPolicy.expectedUnmodeledRules===2,'crosswalk_policy');
 const v=validateSemanticCrosswalkInputs(o,seeds,crossPolicy);
 ck(v.errors.length===0&&v.coverage.modeledRules===23&&v.coverage.unmodeledRuleIds.length===2&&v.coverage.sharedGenericNodes===11&&v.coverage.sharedDamageNodes===0,'crosswalk_'+v.errors.slice(0,4).join('_'));
 return errors;
}
const errors=check(m,f,p,cross),oa=[],pa=[],fa=[];
for(const id of cIds){oa.push(x=>{by(x.conditions,id).observedValue='fake'});oa.push(x=>{by(x.conditions,id).system='cabeca_rotativa'})}
for(const id of aIds){oa.push(x=>{by(x.actions,id).executionStatus='completed'});oa.push(x=>{by(x.actions,id).requiresApplicableOemProcedure=false})}
for(const id of dIds){oa.push(x=>{by(x.damageHypotheses,id).confirmed=true});oa.push(x=>{by(x.damageHypotheses,id).catalogMapping.damageCode='02.01'})}
oa.push(x=>{by(x.bundles,'BUNDLE-22').automaticDamagePromotion=true});
oa.push(x=>{by(x.bundles,'BUNDLE-22').conditionIds.push('COND-TIRE-WEAR-RTD-PROFILE')});
oa.push(x=>{by(x.relations,'REL-196').observed=true});
oa.push(x=>{x.workOrderExecutions.push({fake:true})});
pa.push(x=>{x.gates[0].status='approved'});
pa.push(x=>{x.safeguards.noUncontrolledMastAccess=false});
pa.push(x=>{x.limits.chainElongationPercent=2});
pa.push(x=>{x.scope.dr410AutoTensionInstalled=true});
pa.push(x=>{x.oemArchitecture[1].autoHydraulicTensionOptional=true});
pa.push(x=>{x.fieldState.confirmedDamages=1});
fa.push(x=>{by(x.cases,'SEM-39').expectedConfirmedDamageIds=[dIds[0]]});
fa.push(x=>{by(x.cases,'SEM-40').independentComponentTest='performed'});
let rejected=0;
for(let i=0;i<oa.length;i++){const x=clone(m);oa[i](x);if(check(x,f,p,cross).length)rejected++;else errors.push('ontology_mutant_'+i)}
for(let i=0;i<pa.length;i++){const x=clone(p);pa[i](x);if(check(m,f,x,cross).length)rejected++;else errors.push('policy_mutant_'+i)}
for(let i=0;i<fa.length;i++){const x=clone(f);fa[i](x);if(check(m,x,p,cross).length)rejected++;else errors.push('fixture_mutant_'+i)}
const expected=oa.length+pa.length+fa.length;if(expected!==40||rejected!==expected)errors.push('mutation_suite_count');
const counts={pmRules:seeds.length,modeledBundles:m.bundles.length,remainingRules:seeds.length-m.bundles.length,conditions:m.conditions.length,actions:m.actions.length,damageHypotheses:m.damageHypotheses.length,typedRelations:m.relations.length,syntheticCases:f.cases.length,mutationsRejected:rejected,realInspections:0,confirmedDamages:0,approvedSapMappings:0};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-drill-feed.generated.json'),JSON.stringify({schema:'fmea-mining.pm-drill-feed-report.v1',version:'1.3.56',counts,errors},null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',counts,errors},null,2));
process.exit(errors.length?1:0);
