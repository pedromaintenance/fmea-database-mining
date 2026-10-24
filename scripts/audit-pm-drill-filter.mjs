#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateSemanticCrosswalkInputs} from './lib/pm-semantic-crosswalk.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const m=read('data/ontology/condition-action-damage.v1.json'),fx=read('data/quality/semantic-regression-fixtures.v1.json'),p=read('data/quality/pm-drill-filter-boundaries.v1.json'),cross=read('data/quality/pm-semantic-crosswalk-policy.v1.json');
const prior=read('data/quality/pm-vpar-evidence-plan.v1.json'),priorDiff=read('data/research/pm-vpar-function-differentials.v1.json');
const rules=read('data/knowledge/pm-prevention/seed-rules.json').records,links=read('data/knowledge/pm-prevention/generated-links.json').records,gaps=read('data/quality/pm-gap-review.v1.json').records,sources=new Set(read('data/research/sources.v1.json').sources.map(x=>x.id));
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),clone=x=>JSON.parse(JSON.stringify(x)),by=(a,id)=>a.find(x=>x.id===id);
const cIds=['COND-AIR-FILTER-INTAKE-RESTRICTION','COND-AIR-FILTER-LUBE-OIL-DIFFERENTIAL','COND-AIR-FILTER-OIL-CARRYOVER','COND-AIR-FILTER-SEPARATOR-DP','COND-AIR-FILTER-RECEIVER-MOISTURE','COND-AIR-FILTER-DOWNSTREAM-FLOW'];
const aIds=['ACT-AIR-FILTER-IDENTIFY-CIRCUIT','ACT-AIR-FILTER-SAFE-ISOLATION','ACT-AIR-FILTER-DIFFERENTIAL-REVIEW','ACT-AIR-FILTER-CARRYOVER-REVIEW','ACT-AIR-FILTER-SAP-REVIEW'];
const dIds=['DMG-AIR-FILTER-INTAKE-MEDIA-CANDIDATE','DMG-AIR-FILTER-LUBE-MEDIA-CANDIDATE','DMG-AIR-FILTER-SEPARATOR-MEDIA-CANDIDATE'];
const functions=['compressor_air_intake','compressor_lubricating_oil','air_oil_separation','receiver_tank_filtration'];
const sIds=['SANDVIK-DR410I-CAT-C18-MAINT-PLANNER','SANDVIK-DR410I-CUMMINS-MAINT-PLANNER','ATLAS-COPCO-COMPRESSOR-FILTER-FUNCTIONS','KAESER-COMPRESSOR-MAINTENANCE-INDICATORS'];
function check(o,f,g,c){
 const errors=[],ck=(v,id)=>{if(!v)errors.push(id)};
 const seed=rules.find(x=>x.id==='drill-compressor-filter'),gap=gaps.find(x=>x.ruleId==='drill-compressor-filter'),b=by(o.bundles,'BUNDLE-25'),previous=by(o.bundles,'BUNDLE-24');
 ck(o.version==='1.3.23'&&o.conditions.length===107&&o.actions.length===82&&o.damageHypotheses.length===51&&o.bundles.length===25&&o.relations.length===251,'ontology_cardinality');
 ck(o.observations.length===0&&o.workOrderExecutions.length===0&&o.confirmedComponentDamages.length===0,'false_field_events');
 ck(rules.length===25&&links.length===115&&gaps.length===10&&seed?.system==='ar_comprimido'&&seed?.subgroupCode==='COMR'&&seed?.partText==='Filtro'&&seed?.review==='pendente','pm_seed_drift');
 ck(gap?.expectedBlocker==='subgroup_not_in_scope'&&gap?.status==='bloqueado_aguardando_curadoria'&&gap?.autoRemapAllowed===false&&gap?.approvedModelIds.length===0&&gap?.confirmedSapLocationIds.length===0&&gap?.verifiedPartCodes.length===0&&gap?.observedFailures===0,'sap_gap_unblocked');
 ck(g.schema==='fmea-mining.pm-drill-filter-boundaries.v1'&&g.version==='1.3.59'&&g.sourceOntologyVersion==='1.3.23'&&g.ruleId==='drill-compressor-filter','policy_version');
 ck(eq(g.scope.models,seed.models)&&g.scope.system===seed.system&&g.scope.subgroupCode===seed.subgroupCode&&g.scope.partText===seed.partText,'scope_incorrect');
 ck(g.scope.eqModelsResolved===false&&g.scope.serialEffectivityVerified===false&&g.scope.filterElementInstalled===false&&g.scope.circuitBOMVerified===false&&g.scope.oemReplacementLimitsVerified===false,'unverified_oem_promoted');
 ck(g.sapBlocker.ruleId===seed.id&&g.sapBlocker.expectedBlocker==='subgroup_not_in_scope'&&g.sapBlocker.originalSubgroupCode==='COMR'&&g.sapBlocker.actualHierarchyGroup==='COMR'&&g.sapBlocker.candidateSubgroup==='VPAR'&&g.sapBlocker.noGroupAsSubgroup===true&&g.sapBlocker.autoRemapAllowed===false&&g.sapBlocker.approvedSapMappings===0,'sap_alias_unblocked');
 ck(eq(g.sourceIds,sIds)&&g.sourceIds.every(x=>sources.has(x)),'source_provenance');
 ck(prior.version==='1.3.38'&&prior.target.ruleId==='drill-compressor-filter'&&prior.target.originalRuleSubgroup==='COMR'&&prior.target.candidateSubgroup==='VPAR'&&prior.gateDefinitions.length===7&&prior.approvedMappings===0&&prior.realInspections===0&&Object.values(prior.policy).every(Boolean),'prior_7_evidence_gates');
 ck(priorDiff.version==='1.3.37'&&eq(priorDiff.functionalAlternatives.map(x=>x.id),functions)&&priorDiff.functionalAlternatives.every(x=>x.canIdentifyVPAR===false)&&priorDiff.approvedSapMappings===0&&priorDiff.verifiedInstalledConfiguration===false,'prior_functional_review');
 ck(eq(g.circuits.map(x=>x.id),functions)&&g.circuits.every(x=>x.installed===false&&x.componentVerified===false),'invented_receiver_or_filter');
 ck(g.differentials.length===5&&g.differentials.every(x=>x.confirmed===false&&x.distinction.length>105),'causal_differential_missing');
 ck(g.gates.length===10&&g.gates.every(x=>x.status==='pending'),'unapproved_gate_promoted');
 ck(Object.keys(g.safeguards).length===18&&Object.values(g.safeguards).every(Boolean),'safety_relaxed');
 ck(Object.keys(g.limits).length===6&&Object.values(g.limits).every(x=>x===null),'manufactured_differential_limit');
 ck(Object.keys(g.fieldState).length===6&&Object.values(g.fieldState).every(x=>x===0),'fabricated_field_activity');
 ck(eq(g.conditionIds,cIds)&&eq(g.actionIds,aIds)&&eq(g.damageIds,dIds),'policy_concept_ids');
 ck(b?.ruleId==='drill-compressor-filter'&&eq(b.conditionIds,cIds)&&eq(b.actionIds,aIds)&&eq(b.differentialDamageIds,dIds)&&b.chainIds.length===0,'bundle_concept_refs');
 ck(b?.mappingScope==='generic_only'&&b?.status==='review_candidate'&&b?.automaticDamagePromotion===false&&b?.observedConditionIds.length===0&&b?.performedActionIds.length===0&&b?.confirmedDamageIds.length===0&&b?.evidenceInterpretation==='sem_resultado_de_campo','automatic_evidence_promotion');
 ck(b?.interpretation.includes('COMR')&&b?.interpretation.includes('VPAR')&&b?.interpretation.includes('pressão zero')&&eq(b.sourceIds,sIds),'false_functional_conclusion');
 ck(o.bundles.filter(x=>x.ruleId==='drill-compressor-filter').length===1&&previous?.ruleId==='drill-compressor-pressure'&&previous?.differentialDamageIds.every(x=>!dIds.includes(x)),'pressure_filter_domain_overlap');
 for(const id of cIds){const x=by(o.conditions,id);ck(x?.system==='ar_comprimido'&&x.status==='condition_hypothesis_not_observed'&&x.observedValue===null&&x.observedAt===null&&eq(x.sourceIds,sIds),'fabricated_condition_'+id);ck(x?.observation.length>110&&x?.limitations.length>115&&x.methods.includes('EV-01'),'weak_condition_'+id);}
 for(const id of aIds){const x=by(o.actions,id);ck(x?.requiresApplicableOemProcedure===true&&x.executionStatus==='not_performed'&&x.observedResults.length===0&&x.intervalHours===null&&eq(x.sourceIds,sIds),'executed_action_'+id);ck(x?.intent.length>115&&x?.safety.length>125,'unsafe_action_'+id);}
 ck(by(o.actions,'ACT-AIR-FILTER-SAFE-ISOLATION')?.safety.includes('pressurizada')&&by(o.actions,'ACT-AIR-FILTER-SAP-REVIEW')?.safety.includes('subgroup_not_in_scope'),'pressure_or_SAP_gate_missing');
 for(const id of dIds){const x=by(o.damageHypotheses,id);ck(x?.kind==='candidate_component_damage'&&x.confirmed===false&&x.reviewStatus==='not_approved'&&eq(x.sourceIds,sIds),'damage_confirmed_'+id);ck(x?.label.startsWith('Possível')&&x?.requiredEvidence.length>135&&Object.keys(x?.catalogMapping||{}).length===5&&Object.values(x.catalogMapping).every(v=>v===null),'sap_damage_mapping_'+id);}
 const edges=o.relations.filter(x=>x.from==='BUNDLE-25'),all=[...cIds,...aIds,...dIds];
 ck(edges.length===14&&eq(edges.map(x=>x.to),all)&&eq(edges.map(x=>x.id),Array.from({length:14},(_,i)=>'REL-'+String(i+238).padStart(3,'0'))),'relations_missing');
 ck(edges.every(x=>!x.observed&&x.reviewStatus==='interpretacao_inferida'&&x.type===(cIds.includes(x.to)?'rule_monitors_condition':aIds.includes(x.to)?'rule_proposes_action':'rule_lists_differential_damage')),'edge_semantics');
 ck(f.version==='1.3.23'&&f.status==='synthetic_assertions_not_real_events'&&f.cases.length===46,'fixtures_version');
 for(const id of ['SEM-45','SEM-46']){const x=by(f.cases,id);ck(x?.ruleId==='drill-compressor-filter'&&x.independentComponentTest==='not_performed'&&x.expectedConfirmedDamageIds.length===0&&x.observedConditionIds.every(y=>cIds.includes(y))&&x.performedActionIds.every(y=>aIds.includes(y)),'fictitious_fixture_'+id);}
 ck(c.version==='1.3.59'&&c.sourceOntologyVersion==='1.3.23'&&c.expectedBundles===25&&c.expectedUnmodeledRules===0,'crosswalk_policy_version');
 const validation=validateSemanticCrosswalkInputs(o,rules,c);
 ck(validation.errors.length===0&&validation.coverage.modeledRules===25&&validation.coverage.unmodeledRuleIds.length===0&&validation.coverage.sharedGenericNodes===11&&validation.coverage.sharedDamageNodes===0,'crosswalk_'+validation.errors.slice(0,3).join('_'));
 return errors;
}
const errors=check(m,fx,p,cross),oa=[],ga=[],fa=[];
for(const id of cIds){oa.push(x=>{by(x.conditions,id).observedValue='observado'});oa.push(x=>{by(x.conditions,id).system='motor_diesel'});}
for(const id of aIds){oa.push(x=>{by(x.actions,id).executionStatus='performed'});oa.push(x=>{by(x.actions,id).requiresApplicableOemProcedure=false});}
for(const id of dIds){oa.push(x=>{by(x.damageHypotheses,id).confirmed=true});oa.push(x=>{by(x.damageHypotheses,id).catalogMapping.damageCode='03.02'});}
oa.push(x=>{by(x.bundles,'BUNDLE-25').automaticDamagePromotion=true});
oa.push(x=>{by(x.bundles,'BUNDLE-25').conditionIds.push('COND-AIR-PRESS-LOW-RECEIVER')});
oa.push(x=>{by(x.relations,'REL-238').observed=true});
oa.push(x=>{x.workOrderExecutions.push({fake:true})});
ga.push(x=>{x.gates[0].status='approved'});
ga.push(x=>{x.safeguards.noOpenUnderPressure=false});
ga.push(x=>{x.limits.separatorDeltaKpa=100});
ga.push(x=>{x.fieldState.tests=1});
ga.push(x=>{x.sapBlocker.autoRemapAllowed=true});
ga.push(x=>{x.sapBlocker.approvedSapMappings=1});
ga.push(x=>{x.circuits[3].installed=true});
ga.push(x=>{x.scope.filterElementInstalled=true});
fa.push(x=>{by(x.cases,'SEM-45').expectedConfirmedDamageIds=[dIds[0]]});
fa.push(x=>{by(x.cases,'SEM-46').independentComponentTest='performed'});
let rejected=0;
for(let i=0;i<oa.length;i++){const x=clone(m);oa[i](x);if(check(x,fx,p,cross).length)rejected++;else errors.push('ontology_attack_accepted_'+i);}
for(let i=0;i<ga.length;i++){const x=clone(p);ga[i](x);if(check(m,fx,x,cross).length)rejected++;else errors.push('policy_attack_accepted_'+i);}
for(let i=0;i<fa.length;i++){const x=clone(fx);fa[i](x);if(check(m,x,p,cross).length)rejected++;else errors.push('fixture_attack_accepted_'+i);}
const expected=oa.length+ga.length+fa.length;if(expected!==42||rejected!==expected)errors.push('attack_count_mismatch');
const counts={pmSeeds:rules.length,modeledBundles:m.bundles.length,remainingRules:rules.length-m.bundles.length,conditions:m.conditions.length,actions:m.actions.length,candidateDamages:m.damageHypotheses.length,relations:m.relations.length,syntheticCases:fx.cases.length,rejectedAdversarialMutations:rejected,confirmedDamages:0,fieldTests:0,approvedSapMappings:0};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-drill-filter.generated.json'),JSON.stringify({schema:'fmea-mining.pm-drill-filter-report.v1',version:'1.3.59',counts,errors},null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',counts,errors},null,2));
process.exit(errors.length?1:0);
