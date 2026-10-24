#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {auditTrackBoltOntology,BOLT_CONDITIONS,BOLT_ACTIONS,BOLT_DAMAGES} from './lib/pm-track-bolt-semantics.mjs';
import {validateSemanticCrosswalkInputs} from './lib/pm-semantic-crosswalk.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const model=read('data/ontology/condition-action-damage.v1.json'),fixtures=read('data/quality/semantic-regression-fixtures.v1.json');
const rules=read('data/knowledge/pm-prevention/seed-rules.json').records;
const policy=read('data/quality/pm-track-bolt-discrimination.v1.json'),crossPolicy=read('data/quality/pm-semantic-crosswalk-policy.v1.json');
const sources=read('data/research/sources.v1.json').sources;
const gaps=read('data/quality/pm-gap-review.v1.json').records;
const errors=[...auditTrackBoltOntology(model,fixtures,rules,policy,sources)];
const cross=validateSemanticCrosswalkInputs(model,rules,crossPolicy);
errors.push(...cross.errors);
const check=(v,name)=>{if(!v)errors.push(name)};
check(cross.coverage.totalSeeds===25&&cross.coverage.modeledRules===23&&cross.coverage.unmodeledRuleIds.length===2,'inaccurate_semantic_coverage');
check(cross.coverage.sharedGenericNodes===11&&cross.coverage.sharedDamageNodes===0,'unexpected_cross_system_sharing');
check(gaps.length===10&&gaps.every(x=>x.ruleId!=='track-bolt-loose'),'unexpected_bolt_gap');
const clone=x=>JSON.parse(JSON.stringify(x));
const attacks=[
 x=>x.conditions.find(z=>z.id===BOLT_CONDITIONS[0]).observedValue='verified',
 x=>x.conditions.find(z=>z.id===BOLT_CONDITIONS[1]).observedAt='2026-10-21',
 x=>x.conditions.find(z=>z.id===BOLT_CONDITIONS[2]).system='hidraulico',
 x=>x.conditions.find(z=>z.id===BOLT_CONDITIONS[3]).limitations='Fratura confirmada',
 x=>x.actions.find(z=>z.id===BOLT_ACTIONS[0]).executionStatus='completed',
 x=>x.actions.find(z=>z.id===BOLT_ACTIONS[1]).requiresApplicableOemProcedure=false,
 x=>x.actions.find(z=>z.id===BOLT_ACTIONS[2]).intervalHours=250,
 x=>x.actions.find(z=>z.id===BOLT_ACTIONS[2]).safety='Reapertar sem verificar',
 x=>x.actions.find(z=>z.id===BOLT_ACTIONS[2]).intent='Aplicar torque 1234 Nm',
 x=>x.damageHypotheses.find(z=>z.id===BOLT_DAMAGES[0]).confirmed=true,
 x=>x.damageHypotheses.find(z=>z.id===BOLT_DAMAGES[1]).catalogMapping.componentCode='FICTITIOUS',
 x=>x.bundles.find(z=>z.id==='BUNDLE-13').conditionIds[0]='COND-TRACK-ROLLER-WEAR',
 x=>x.bundles.find(z=>z.id==='BUNDLE-13').differentialDamageIds=[BOLT_DAMAGES[0],BOLT_DAMAGES[0]],
 x=>x.bundles.find(z=>z.id==='BUNDLE-13').automaticDamagePromotion=true,
 x=>x.bundles.find(z=>z.id==='BUNDLE-13').chainIds=['FC-TRACK-001'],
 x=>x.relations.find(z=>z.id==='REL-072').to='COND-TRACK-IDLER-WEAR',
 x=>x.relations.find(z=>z.id==='REL-080').observed=true,
 x=>x.workOrderExecutions.push({synthetic:true}),
 x=>x.bundles=x.bundles.filter(z=>z.id!=='BUNDLE-13'),
 x=>x.version='1.3.10'
];
let rejectedOntology=0;
for(let i=0;i<attacks.length;i++){
 const x=clone(model);attacks[i](x);
 if(auditTrackBoltOntology(x,fixtures,rules,policy,sources).length||
    validateSemanticCrosswalkInputs(x,rules,crossPolicy).errors.length)rejectedOntology++;
 else errors.push('unsafe_ontology_mutation_accepted_'+i);
}
const attacksPolicy=[
 x=>x.safeguards.no_universal_torque_or_angle=false,
 x=>x.measuredPreload=150,
 x=>x.appliedTorqueNm=1200,
 x=>x.appliedTurnAngleDegrees=90,
 x=>x.observedFailures=1,
 x=>x.approvedSapMappings=1,
 x=>x.paths[0].conditionId='COND-TRACK-ROLLER-WEAR',
 x=>x.paths[1].status='confirmed_field_observation'
];
let rejectedPolicy=0;
for(let i=0;i<attacksPolicy.length;i++){
 const x=clone(policy);attacksPolicy[i](x);
 if(auditTrackBoltOntology(model,fixtures,rules,x,sources).length)rejectedPolicy++;
 else errors.push('unsafe_policy_mutation_accepted_'+i);
}
const attacksFixtures=[
 x=>x.cases.find(z=>z.id==='SEM-21').expectedConfirmedDamageIds=[BOLT_DAMAGES[0]],
 x=>x.cases.find(z=>z.id==='SEM-22').independentComponentTest='performed',
 x=>x.cases.find(z=>z.id==='SEM-21').observedConditionIds=['COND-TRACK-ROLLER-HEAT'],
 x=>x.cases=x.cases.filter(z=>z.id!=='SEM-22')
];
let rejectedFixtures=0;
for(let i=0;i<attacksFixtures.length;i++){
 const x=clone(fixtures);attacksFixtures[i](x);
 if(auditTrackBoltOntology(model,x,rules,policy,sources).length)rejectedFixtures++;
 else errors.push('unsafe_fixture_mutation_accepted_'+i);
}
check(rejectedOntology===20&&rejectedPolicy===8&&rejectedFixtures===4,'adversarial_suite_incomplete');
const report={schema:'fmea-mining.pm-track-bolt-report.v1',version:'1.3.46',nature:'modelled_hypotheses_without_installed_OEM_effectivity',
 counts:{pmRules:rules.length,semanticBundles:model.bundles.length,remainingUnmodeledRules:cross.coverage.unmodeledRuleIds.length,
 conditions:model.conditions.length,actions:model.actions.length,damageHypotheses:model.damageHypotheses.length,
 typedRelations:model.relations.length,syntheticFixtures:fixtures.cases.length,
 unsafeOntologyMutationsRejected:rejectedOntology,unsafePolicyMutationsRejected:rejectedPolicy,unsafeFixtureMutationsRejected:rejectedFixtures,
 actualTorqueMeasurements:0,confirmedFailures:0,performedActions:0,approvedSapMappings:0},
 ruleId:'track-bolt-loose',mechanisms:policy.paths.map(x=>({id:x.id,conditionId:x.conditionId,claim:x.status})),
 evidenceGates:policy.independentEvidence,sourceIds:policy.sourceIds,errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-track-bolt.generated.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',counts:report.counts,errors},null,2));
process.exit(errors.length?1:0);
