#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateBearingDifferentials,BEARING_CONDITIONS,BEARING_ACTIONS,BEARING_DAMAGES} from './lib/pm-final-drive-bearing-boundary.mjs';
import {validateSemanticCrosswalkInputs} from './lib/pm-semantic-crosswalk.mjs';
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const load=p=>JSON.parse(fs.readFileSync(path.join(dir,p),'utf8'));
const m=load('data/ontology/condition-action-damage.v1.json'),fix=load('data/quality/semantic-regression-fixtures.v1.json');
const seed=load('data/knowledge/pm-prevention/seed-rules.json').records;
const policy=load('data/quality/pm-final-drive-bearing-discrimination.v1.json');
const xpolicy=load('data/quality/pm-semantic-crosswalk-policy.v1.json');
const sources=load('data/research/sources.v1.json').sources;
const gaps=load('data/quality/pm-gap-review.v1.json').records;
const links=load('data/knowledge/pm-prevention/generated-links.json').records;
const errors=[...validateBearingDifferentials(m,fix,policy,seed,sources)];
const cross=validateSemanticCrosswalkInputs(m,seed,xpolicy);
errors.push(...cross.errors);
const ck=(v,id)=>{if(!v)errors.push(id)};
ck(cross.coverage.totalSeeds===25&&cross.coverage.modeledRules===18&&cross.coverage.unmodeledRuleIds.length===7,'semantic_coverage_inaccurate');
ck(cross.coverage.sharedGenericNodes===11&&cross.coverage.sharedDamageNodes===0,'unsafe_cross_component_sharing');
ck(gaps.length===10&&links.length===115&&!gaps.some(x=>x.ruleId==='final-drive-bearing'),'unexpected_SAP_gap_or_link');
ck(!links.some(x=>x.originRule==='final-drive-bearing')||links.every(x=>x.originRule!=='final-drive-bearing'||x.approvalStatus!=='approved'),'bearing_link_auto_approved');
const clone=x=>JSON.parse(JSON.stringify(x));
const modelAttacks=[
 x=>x.conditions.find(z=>z.id===BEARING_CONDITIONS[0]).observedValue='abrasive wear',
 x=>x.conditions.find(z=>z.id===BEARING_CONDITIONS[1]).observedAt='2026-10-22',
 x=>x.conditions.find(z=>z.id===BEARING_CONDITIONS[2]).medium='oleo_comando_final',
 x=>x.conditions.find(z=>z.id===BEARING_CONDITIONS[3]).system='hidraulico',
 x=>x.conditions.find(z=>z.id===BEARING_CONDITIONS[4]).observedValue='broken bearing',
 x=>x.conditions.find(z=>z.id===BEARING_CONDITIONS[5]).medium='oleo_motor',
 x=>x.actions.find(z=>z.id===BEARING_ACTIONS[0]).executionStatus='completed',
 x=>x.actions.find(z=>z.id===BEARING_ACTIONS[1]).requiresApplicableOemProcedure=false,
 x=>x.actions.find(z=>z.id===BEARING_ACTIONS[2]).safety='Abra em operacao',
 x=>x.actions.find(z=>z.id===BEARING_ACTIONS[3]).intervalHours=200,
 x=>x.damageHypotheses.find(z=>z.id===BEARING_DAMAGES[0]).confirmed=true,
 x=>x.damageHypotheses.find(z=>z.id===BEARING_DAMAGES[1]).catalogMapping.componentCode='invented',
 x=>x.damageHypotheses.find(z=>z.id===BEARING_DAMAGES[2]).componentRole='rolamento_comando_final',
 x=>x.bundles.find(z=>z.id==='BUNDLE-15').automaticDamagePromotion=true,
 x=>x.bundles.find(z=>z.id==='BUNDLE-15').conditionIds[4]='COND-HYD-OIL-CONTAMINATION',
 x=>x.bundles.find(z=>z.id==='BUNDLE-15').differentialDamageIds[0]='DMG-DRIVE-GEAR-PITTING-CANDIDATE',
 x=>x.bundles.find(z=>z.id==='BUNDLE-15').interpretation='Partículas comprovam rolamento danificado',
 x=>x.relations.find(z=>z.id==='REL-095').to='COND-TRACK-ROLLER-HEAT',
 x=>x.relations.find(z=>z.id==='REL-109').observed=true,
 x=>x.workOrderExecutions.push({fictitious:true})
];
let rejectedModels=0;
for(let i=0;i<modelAttacks.length;i++){
 const a=clone(m);modelAttacks[i](a);
 if(validateBearingDifferentials(a,fix,policy,seed,sources).length||
    validateSemanticCrosswalkInputs(a,seed,xpolicy).errors.length)rejectedModels++;
 else errors.push('ontology_attack_not_rejected_'+i);
}
const policyAttacks=[
 x=>x.guards.noOilMetalsAsBearingFailure=false,
 x=>x.guards.noSealOwnershipAssumption=false,
 x=>x.measuredValues=0.05,
 x=>x.confirmedFailures=1,
 x=>x.sapMappingsApproved=1,
 x=>x.genericSharedConditions.pop(),
 x=>x.branches[0].candidateDamage='DMG-DRIVE-GEAR-PITTING-CANDIDATE',
 x=>x.branches[1].needsPhysicalInspection=false
];
let rejectedPolicy=0;
for(let i=0;i<policyAttacks.length;i++){
 const a=clone(policy);policyAttacks[i](a);
 if(validateBearingDifferentials(m,fix,a,seed,sources).length)rejectedPolicy++;
 else errors.push('policy_attack_not_rejected_'+i);
}
const fixtureAttacks=[
 x=>x.cases.find(z=>z.id==='SEM-25').expectedConfirmedDamageIds=[BEARING_DAMAGES[0]],
 x=>x.cases.find(z=>z.id==='SEM-26').independentComponentTest='performed',
 x=>x.cases.find(z=>z.id==='SEM-25').observedConditionIds=['COND-DRIVE-BEARING-CONTACT-FATIGUE'],
 x=>x.cases=x.cases.filter(z=>z.id!=='SEM-26')
];
let rejectedFixtures=0;
for(let i=0;i<fixtureAttacks.length;i++){
 const a=clone(fix);fixtureAttacks[i](a);
 if(validateBearingDifferentials(m,a,policy,seed,sources).length)rejectedFixtures++;
 else errors.push('fixture_attack_not_rejected_'+i);
}
ck(rejectedModels===20&&rejectedPolicy===8&&rejectedFixtures===4,'mutation_suite_incomplete');
const result={schema:'fmea-mining.pm-final-drive-bearing-report.v1',version:'1.3.48',
 nature:'hypothetical_component_differentials_not_field_evidence',counts:{
 rules:seed.length,modeledBundles:m.bundles.length,unmodeledRules:cross.coverage.unmodeledRuleIds.length,
 conditions:m.conditions.length,actions:m.actions.length,damageHypotheses:m.damageHypotheses.length,
 relations:m.relations.length,syntheticFixtures:fix.cases.length,genericShares:cross.coverage.sharedGenericNodes,
 adversarialMutationsRejected:rejectedModels+rejectedPolicy+rejectedFixtures,
 fieldFindings:0,confirmedDamage:0,executedMaintenance:0,approvedSapMappings:0},
 differentiations:policy.branches,nonLocalizingSharedSignals:policy.genericSharedConditions,
 sharedSampleAction:policy.genericSharedAction,approvedOEMEffectivity:false,errors};
fs.mkdirSync(path.join(dir,'reports'),{recursive:true});
fs.writeFileSync(path.join(dir,'reports/pm-final-drive-bearing.generated.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',counts:result.counts,errors},null,2));
process.exit(errors.length?1:0);
