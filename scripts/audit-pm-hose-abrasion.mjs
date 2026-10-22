#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateSemanticCrosswalkInputs} from './lib/pm-semantic-crosswalk.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const m=read('data/ontology/condition-action-damage.v1.json');
const fixtures=read('data/quality/semantic-regression-fixtures.v1.json');
const seed=read('data/knowledge/pm-prevention/seed-rules.json').records;
const gaps=read('data/quality/pm-gap-review.v1.json').records;
const links=read('data/knowledge/pm-prevention/generated-links.json').records;
const policy=read('data/quality/pm-semantic-crosswalk-policy.v1.json');
const severity=read('data/quality/pm-hose-abrasion-discrimination.v1.json');
const sources=new Set(read('data/research/sources.v1.json').sources.map(x=>x.id));
const errors=[],ck=(v,id)=>{if(!v)errors.push(id)};
const ids=['COND-HYD-HOSE-ABRASION-SURFACE','COND-HYD-HOSE-REINFORCEMENT-EXPOSED','COND-HYD-HOSE-ROUTING-CONTACT','COND-HYD-HOSE-DEFORMATION'];
const actions=['ACT-HYD-HOSE-ABRASION-CLASSIFY','ACT-HYD-HOSE-ASSEMBLY-REPLACE-EVALUATE'];
const damage='DMG-HYD-HOSE-REINFORCEMENT-CANDIDATE';
const b=m.bundles.find(x=>x.id==='BUNDLE-12');
const old=m.bundles.find(x=>x.id==='BUNDLE-06');
const map=x=>new Map(x.map(y=>[y.id,y]));
const cond=map(m.conditions),act=map(m.actions),dmgs=map(m.damageHypotheses);
const clone=x=>JSON.parse(JSON.stringify(x));
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function checkModel(model){
 const e=[],test=(v,id)=>{if(!v)e.push(id)},c=map(model.conditions),a=map(model.actions),d=map(model.damageHypotheses);
 const newRule=model.bundles.find(x=>x.id==='BUNDLE-12'),leak=model.bundles.find(x=>x.id==='BUNDLE-06');
 test(model.version==='1.3.10'&&model.conditions.length===28&&model.actions.length===25&&model.damageHypotheses.length===12&&model.bundles.length===12&&model.relations.length===71,'version_or_counts');
 test(newRule?.ruleId==='hydraulic-hose-abrasion'&&eq(newRule.conditionIds,ids)&&eq(newRule.actionIds,actions)&&eq(newRule.differentialDamageIds,[damage]),'bundle_identity');
 test(leak?.ruleId==='hydraulic-hose-leak'&&leak.conditionIds.includes('COND-HYD-EXTERNAL-LEAK')&&!leak.conditionIds.some(id=>ids.includes(id)),'leak_boundary');
 test(newRule?.chainIds.length===0&&newRule?.mappingScope==='generic_only'&&newRule?.automaticDamagePromotion===false&&newRule?.observedConditionIds.length===0&&newRule?.performedActionIds.length===0&&newRule?.confirmedDamageIds.length===0,'premature_approval');
 for(const id of ids){
  const x=c.get(id);
  test(x?.system==='hidraulico'&&x?.medium==='mangueira_hidraulica'&&x?.status==='condition_hypothesis_not_observed'&&x.observedValue===null&&x.observedAt===null,'observed_condition_'+id);
  test(x?.sourceIds.includes('CAT-HYD-HOSE-INSPECT')&&x?.sourceIds.includes('CAT-HYD-HOSE-FAILURE')&&x?.limitations.length>100,'insufficient_evidence_'+id);
 }
 for(const id of actions){
  const x=a.get(id);
  test(x?.executionStatus==='not_performed'&&x?.intervalHours===null&&x?.observedResults.length===0&&x?.requiresApplicableOemProcedure===true&&x?.safety.length>110,'unsafe_action_'+id);
 }
 const x=d.get(damage);
 test(x?.confirmed===false&&x?.reviewStatus==='not_approved'&&Object.values(x?.catalogMapping||{}).length===5&&Object.values(x.catalogMapping).every(v=>v===null),'structural_damage_promoted');
 test(newRule?.interpretation.includes('Armadura exposta')&&newRule?.interpretation.includes('sem aguardar vazamento')&&newRule?.interpretation.includes('HSVV permanece bloqueada'),'unsafe_critical_response');
 test(c.get('COND-HYD-HOSE-REINFORCEMENT-EXPOSED')?.limitations.includes('retirada segura de serviço')&&c.get('COND-HYD-HOSE-REINFORCEMENT-EXPOSED')?.limitations.includes('NÃO autoriza operação'),'reinforcement_risk_ignored');
 test(c.get('COND-HYD-HOSE-COVER-DAMAGE')?.label==='Abrasão ou fissura aparente na cobertura da mangueira','cover_identity_changed');
 const edges=model.relations.filter(x=>x.from==='BUNDLE-12');
 test(edges.length===7&&eq(edges.map(x=>x.id).sort(),['REL-065','REL-066','REL-067','REL-068','REL-069','REL-070','REL-071']),'edge_count');
 test(edges.every(x=>x.observed===false&&x.reviewStatus==='interpretacao_inferida'&&[...ids,...actions,damage].includes(x.to)),'invalid_edge');
 test(model.observations.length===0&&model.workOrderExecutions.length===0&&model.confirmedComponentDamages.length===0,'fake_events');
 return e;
}
errors.push(...checkModel(m));
const cross=validateSemanticCrosswalkInputs(m,seed,policy);errors.push(...cross.errors);
ck(cross.coverage.modeledRules===12&&cross.coverage.unmodeledRuleIds.length===13&&cross.coverage.sharedGenericNodes===6&&cross.coverage.sharedDamageNodes===0,'coverage_or_unreviewed_share');
ck(severity.schema==='fmea-mining.hose-abrasion-discrimination.v1'&&severity.version==='1.3.45'&&severity.classes.length===4,'severity_baseline');
ck(eq(severity.classes.map(x=>x.conditionId),ids)&&severity.classes.every(x=>x.canProveLeak===false),'abrasion_conflated_with_leak');
ck(severity.classes.find(x=>x.id==='reinforcement')?.action==='withdraw_safely_and_evaluate_replacement','unsafe_exposed_reinforcement');
ck(severity.requiresIndependentEvidence&&severity.requiresOEMConfiguration&&!severity.pressureTestingAuthorized,'unsafe_oem_assumptions');
ck([severity.fieldObservations,severity.performedInspections,severity.confirmedDamage,severity.approvedSapMapping].every(v=>v===0),'invented_severity_evidence');
ck(severity.sourceIds.every(id=>sources.has(id)),'unverified_source');
for(const id of ['hydraulic-hose-leak','hydraulic-hose-abrasion']){
 const gap=gaps.find(x=>x.ruleId===id);
 ck(gap?.expectedBlocker==='subgroup_not_in_scope'&&gap?.status==='bloqueado_aguardando_curadoria'&&gap?.autoRemapAllowed===false,'sap_rule_promoted_'+id);
 ck(!links.some(x=>x.originRule===id),'unexpected_hose_sap_link_'+id);
}
ck(seed.length===25&&links.length===115&&gaps.length===10,'pm_baseline_drift');
ck(fixtures.cases.length===20&&fixtures.status==='synthetic_assertions_not_real_events','fixture_count');
for(const id of ['SEM-19','SEM-20']){
 const f=fixtures.cases.find(x=>x.id===id);
 ck(f?.ruleId==='hydraulic-hose-abrasion'&&f.independentComponentTest==='not_performed'&&f.expectedConfirmedDamageIds.length===0,'fixture_not_hypothesis_'+id);
}
const attacks=[
 x=>x.bundles.find(y=>y.id==='BUNDLE-12').conditionIds[0]='COND-HYD-EXTERNAL-LEAK',
 x=>x.bundles.find(y=>y.id==='BUNDLE-12').differentialDamageIds[0]='DMG-HYD-HOSE-INTEGRITY',
 x=>x.bundles.find(y=>y.id==='BUNDLE-12').automaticDamagePromotion=true,
 x=>x.bundles.find(y=>y.id==='BUNDLE-12').chainIds=['FC-HOSE-001'],
 x=>x.bundles.find(y=>y.id==='BUNDLE-12').interpretation='Abrasão sem risco confirmado',
 x=>x.conditions.find(y=>y.id===ids[0]).observedValue='fake',
 x=>x.conditions.find(y=>y.id===ids[1]).limitations='Sem risco',
 x=>x.conditions.find(y=>y.id===ids[2]).system='arrefecimento',
 x=>x.conditions.find(y=>y.id===ids[3]).observedAt='2026-10-21',
 x=>x.actions.find(y=>y.id===actions[0]).executionStatus='done',
 x=>x.actions.find(y=>y.id===actions[1]).intervalHours=250,
 x=>x.actions.find(y=>y.id===actions[1]).requiresApplicableOemProcedure=false,
 x=>x.damageHypotheses.find(y=>y.id===damage).confirmed=true,
 x=>x.damageHypotheses.find(y=>y.id===damage).catalogMapping.componentCode='FABRICATED',
 x=>x.relations.find(y=>y.id==='REL-065').observed=true,
 x=>x.relations.find(y=>y.id==='REL-071').to='DMG-HYD-HOSE-INTEGRITY',
 x=>x.bundles=x.bundles.filter(y=>y.id!=='BUNDLE-12'),
 x=>x.workOrderExecutions.push({fake:true})
];
let rejected=0;for(const change of attacks){const x=clone(m);change(x);if(checkModel(x).length||validateSemanticCrosswalkInputs(x,seed,policy).errors.length)rejected++;else errors.push('adversarial_ontology_edit_passed');}
const policyAttacks=[
 x=>x.classes[1].canProveLeak=true,
 x=>x.classes[1].action='monitor_until_leak',
 x=>x.pressureTestingAuthorized=true,
 x=>x.approvedSapMapping=1,
 x=>x.classes.pop(),
 x=>x.requiresOEMConfiguration=false
];
let rejectedPolicy=0;for(const change of policyAttacks){const x=clone(severity);change(x);
 if(!eq(x.classes.map(z=>z.conditionId),ids)||x.classes.some(z=>z.canProveLeak!==false)||x.classes[1]?.action!=='withdraw_safely_and_evaluate_replacement'||x.pressureTestingAuthorized!==false||x.approvedSapMapping!==0||x.requiresOEMConfiguration!==true)rejectedPolicy++;
 else errors.push('adversarial_policy_edit_passed');}
ck(rejected===18&&rejectedPolicy===6,'adversarial_coverage');
const report={schema:'fmea-mining.hose-abrasion-report.v1',version:'1.3.45',
 totals:{rules:seed.length,modeledBundles:m.bundles.length,unmodeledRules:cross.coverage.unmodeledRuleIds.length,conditions:m.conditions.length,actions:m.actions.length,damages:m.damageHypotheses.length,relations:m.relations.length,
 syntheticTestsRejected:rejected+rejectedPolicy,confirmedFailureEvents:0,approvedSapRemaps:0,performedInspections:0},
 distinctions:severity.classes,blockedSapRules:['hydraulic-hose-leak','hydraulic-hose-abrasion'],errorList:errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-hose-abrasion.generated.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',totals:report.totals,errors},null,2));
process.exit(errors.length?1:0);
