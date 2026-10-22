#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkGearSemanticBoundary,DRIVE_CONDITIONS,DRIVE_ACTIONS,DRIVE_DAMAGES} from './lib/pm-final-drive-gear-boundary.mjs';
import {validateSemanticCrosswalkInputs} from './lib/pm-semantic-crosswalk.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const model=load('data/ontology/condition-action-damage.v1.json');
const fixtures=load('data/quality/semantic-regression-fixtures.v1.json');
const rules=load('data/knowledge/pm-prevention/seed-rules.json').records;
const policy=load('data/quality/pm-final-drive-gear-discrimination.v1.json');
const crossPolicy=load('data/quality/pm-semantic-crosswalk-policy.v1.json');
const sources=load('data/research/sources.v1.json').sources;
const gaps=load('data/quality/pm-gap-review.v1.json').records;
const errors=[...checkGearSemanticBoundary(model,fixtures,policy,rules,sources)];
const cross=validateSemanticCrosswalkInputs(model,rules,crossPolicy);errors.push(...cross.errors);
const check=(v,k)=>{if(!v)errors.push(k)};
check(cross.coverage.totalSeeds===25&&cross.coverage.modeledRules===15&&cross.coverage.unmodeledRuleIds.length===10,'coverage_invalid');
check(cross.coverage.sharedGenericNodes===6&&cross.coverage.sharedDamageNodes===0,'unexpected_shared_component_damage');
check(gaps.length===10&&gaps.every(x=>x.ruleId!=='final-drive-gear'),'unexpected_SAP_gap');
const clone=v=>JSON.parse(JSON.stringify(v));
const changes=[
 x=>x.conditions.find(z=>z.id===DRIVE_CONDITIONS[0]).observedValue='worn',
 x=>x.conditions.find(z=>z.id===DRIVE_CONDITIONS[1]).observedAt='2026-10-21',
 x=>x.conditions.find(z=>z.id===DRIVE_CONDITIONS[2]).system='rodante',
 x=>x.conditions.find(z=>z.id===DRIVE_CONDITIONS[3]).limitations='Limalha comprova fratura',
 x=>x.conditions.find(z=>z.id===DRIVE_CONDITIONS[4]).limitations='Metais comprovam engrenagem',
 x=>x.conditions.find(z=>z.id===DRIVE_CONDITIONS[5]).medium='oleo_hidraulico',
 x=>x.conditions.find(z=>z.id===DRIVE_CONDITIONS[6]).observedValue='ruido_medicao',
 x=>x.actions.find(z=>z.id===DRIVE_ACTIONS[0]).executionStatus='completed',
 x=>x.actions.find(z=>z.id===DRIVE_ACTIONS[1]).requiresApplicableOemProcedure=false,
 x=>x.actions.find(z=>z.id===DRIVE_ACTIONS[2]).intervalHours=500,
 x=>x.actions.find(z=>z.id===DRIVE_ACTIONS[3]).safety='Desmontar e girar',
 x=>x.damageHypotheses.find(z=>z.id===DRIVE_DAMAGES[0]).confirmed=true,
 x=>x.damageHypotheses.find(z=>z.id===DRIVE_DAMAGES[1]).catalogMapping.componentCode='FAKE',
 x=>x.damageHypotheses.find(z=>z.id===DRIVE_DAMAGES[2]).reviewStatus='approved',
 x=>x.bundles.find(z=>z.id==='BUNDLE-14').conditionIds[0]='COND-TRACK-ROLLER-HEAT',
 x=>x.bundles.find(z=>z.id==='BUNDLE-14').differentialDamageIds=[DRIVE_DAMAGES[0]],
 x=>x.bundles.find(z=>z.id==='BUNDLE-14').automaticDamagePromotion=true,
 x=>x.bundles.find(z=>z.id==='BUNDLE-14').chainIds=['FC-DRIVE-001'],
 x=>x.bundles.find(z=>z.id==='BUNDLE-14').interpretation='Ruído confirma engrenagem com pitting',
 x=>x.relations.find(z=>z.id==='REL-081').to='COND-HYD-EXTERNAL-LEAK',
 x=>x.relations.find(z=>z.id==='REL-094').observed=true,
 x=>x.workOrderExecutions.push({fake:true}),
 x=>x.bundles=x.bundles.filter(z=>z.id!=='BUNDLE-14'),
 x=>x.version='1.3.11'
];
let rejected=0;
for(let i=0;i<changes.length;i++){
 const x=clone(model);changes[i](x);
 if(checkGearSemanticBoundary(x,fixtures,policy,rules,sources).length||validateSemanticCrosswalkInputs(x,rules,crossPolicy).errors.length)rejected++;
 else errors.push('ontology_mutation_not_rejected_'+i);
}
const policyChanges=[
 x=>x.safety.noOilMetalsToFracture=false,
 x=>x.safety.noGenericCatThreshold=false,
 x=>x.nonLocalizingConditions.pop(),
 x=>x.damages.push('DMG-TRACK-IDLER-WEAR'),
 x=>x.oemCondemnationLimit=6,
 x=>x.observedEvents=1,
 x=>x.approvedMappings=1,
 x=>x.requiresDirectGearInspectionForDamage=false
];
let policyRejected=0;
for(let i=0;i<policyChanges.length;i++){
 const x=clone(policy);policyChanges[i](x);
 if(checkGearSemanticBoundary(model,fixtures,x,rules,sources).length)policyRejected++;
 else errors.push('policy_mutation_not_rejected_'+i);
}
const fixtureChanges=[
 x=>x.cases.find(z=>z.id==='SEM-23').expectedConfirmedDamageIds=[DRIVE_DAMAGES[2]],
 x=>x.cases.find(z=>z.id==='SEM-24').independentComponentTest='performed',
 x=>x.cases.find(z=>z.id==='SEM-23').observedConditionIds=[DRIVE_CONDITIONS[2]],
 x=>x.cases=x.cases.filter(z=>z.id!=='SEM-24')
];
let fixtureRejected=0;
for(let i=0;i<fixtureChanges.length;i++){
 const x=clone(fixtures);fixtureChanges[i](x);
 if(checkGearSemanticBoundary(model,x,policy,rules,sources).length)fixtureRejected++;
 else errors.push('fixture_mutation_not_rejected_'+i);
}
check(rejected===24&&policyRejected===8&&fixtureRejected===4,'adversarial_tests_incomplete');
const report={schema:'fmea-mining.pm-final-drive-gear-report.v1',version:'1.3.47',
 nature:'hypotheses_only_without_confirmed_OEM_effectivity',
 counts:{pmRules:rules.length,modeledBundles:model.bundles.length,remainingUnmodeled:cross.coverage.unmodeledRuleIds.length,
 conditions:model.conditions.length,actions:model.actions.length,damageHypotheses:model.damageHypotheses.length,
 relations:model.relations.length,syntheticFixtures:fixtures.cases.length,
 adversarialMutationsRejected:rejected+policyRejected+fixtureRejected,
 performedInspections:0,confirmedComponentDamages:0,approvedSapMappings:0,actualOilMeasurements:0},
 differentials:policy.conditions,nonLocalizingSignals:policy.nonLocalizingConditions,competingBearingRule:policy.competingRuleId,
 oemLimitsApproved:false,errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-final-drive-gear.generated.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',counts:report.counts,errors},null,2));
process.exit(errors.length?1:0);
