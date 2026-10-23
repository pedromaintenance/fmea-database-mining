#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkFanOntology,FAN_SUPPORT,FAN_BELT} from './lib/pm-cooling-fan-boundary.mjs';
import {validateSemanticCrosswalkInputs} from './lib/pm-semantic-crosswalk.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const model=read('data/ontology/condition-action-damage.v1.json'),fixtures=read('data/quality/semantic-regression-fixtures.v1.json');
const seed=read('data/knowledge/pm-prevention/seed-rules.json').records,sources=read('data/research/sources.v1.json').sources;
const policy=read('data/quality/pm-semantic-crosswalk-policy.v1.json');
const gaps=read('data/quality/pm-gap-review.v1.json').records,links=read('data/knowledge/pm-prevention/generated-links.json').records;
const cross=validateSemanticCrosswalkInputs(model,seed,policy);
const errors=[...checkFanOntology(model,fixtures,seed,sources),...cross.errors];
const ck=(ok,id)=>{if(!ok)errors.push(id)};
ck(cross.coverage.totalSeeds===25&&cross.coverage.modeledRules===20&&cross.coverage.unmodeledRuleIds.length===5,'semantic_coverage_incorrect');
ck(cross.coverage.sharedGenericNodes===11&&cross.coverage.sharedDamageNodes===0&&cross.editorialFlags.length===0,'semantic_risk_or_ambiguous_label');
ck(links.length===115&&gaps.length===10,'sap_candidate_baseline_changed');
const clone=x=>JSON.parse(JSON.stringify(x));
const attacks=[
 x=>x.damageHypotheses.find(a=>a.id==='DMG-COOL-INTERNAL-BLOCKAGE').label='Obstrução interna efetiva do trocador',
 x=>x.damageHypotheses.find(a=>a.id===FAN_SUPPORT.damage).confirmed=true,
 x=>x.damageHypotheses.find(a=>a.id===FAN_BELT.damage).catalogMapping.componentCode='UNVERIFIED',
 x=>x.conditions.find(a=>a.id===FAN_SUPPORT.conditions[0]).observedValue='seen',
 x=>x.conditions.find(a=>a.id===FAN_BELT.conditions[1]).observedAt='2026-10-21',
 x=>x.actions.find(a=>a.id===FAN_SUPPORT.actions[1]).executionStatus='completed',
 x=>x.actions.find(a=>a.id===FAN_BELT.actions[1]).intervalHours=250,
 x=>x.actions.find(a=>a.id===FAN_BELT.actions[1]).requiresApplicableOemProcedure=false,
 x=>x.bundles.find(a=>a.id===FAN_SUPPORT.bundle).actionIds[0]='ACT-COOL-FAN-SUPPORT-INSPECT',
 x=>x.bundles.find(a=>a.id===FAN_BELT.bundle).differentialDamageIds=[FAN_SUPPORT.damage],
 x=>x.bundles.find(a=>a.id===FAN_BELT.bundle).conditionIds[0]=FAN_SUPPORT.conditions[0],
 x=>x.bundles.find(a=>a.id===FAN_BELT.bundle).interpretation='A correia está instalada no ventilador com falha',
 x=>x.conditions.find(a=>a.id===FAN_BELT.conditions[0]).limitations='Leitura simples',
 x=>x.damageHypotheses.find(a=>a.id===FAN_SUPPORT.damage).requiredEvidence='',
 x=>x.bundles.find(a=>a.id===FAN_SUPPORT.bundle).chainIds=['FC-COOL-003'],
 x=>x.bundles.find(a=>a.id===FAN_SUPPORT.bundle).automaticDamagePromotion=true,
 x=>x.conditions.find(a=>a.id===FAN_SUPPORT.conditions[0]).system='hidraulico',
 x=>x.relations.find(a=>a.id==='REL-055').to='COND-FUEL-WATER',
 x=>x.relations.find(a=>a.id==='REL-064').observed=true,
 x=>x.workOrderExecutions.push({synthetic:true}),
 x=>x.bundles=x.bundles.filter(a=>a.id!=='BUNDLE-11'),
 x=>x.version='1.3.8'
];
let rejected=0;for(let i=0;i<attacks.length;i++){const copy=clone(model);attacks[i](copy);
 if(checkFanOntology(copy,fixtures,seed,sources).length||validateSemanticCrosswalkInputs(copy,seed,policy).errors.length)rejected++;
 else errors.push('unsafe_ontology_mutation_'+i);
}
const fixtureAttacks=[
 x=>x.cases.find(f=>f.id==='SEM-17').expectedConfirmedDamageIds=[FAN_SUPPORT.damage],
 x=>x.cases.find(f=>f.id==='SEM-17').observedConditionIds=[FAN_BELT.conditions[0]],
 x=>x.cases.find(f=>f.id==='SEM-18').performedActionIds=[FAN_SUPPORT.actions[0]],
 x=>x.cases=x.cases.filter(f=>f.id!=='SEM-18')
];
let fixtureRejected=0;for(let i=0;i<fixtureAttacks.length;i++){const copy=clone(fixtures);fixtureAttacks[i](copy);
 if(checkFanOntology(model,copy,seed,sources).length)fixtureRejected++;
 else errors.push('unsafe_fixture_mutation_'+i);
}
ck(rejected===attacks.length&&fixtureRejected===fixtureAttacks.length,'mutation_coverage_incomplete');
const counts={totalPmRules:seed.length,semanticBundles:model.bundles.length,unmodeledPmRules:cross.coverage.unmodeledRuleIds.length,
 conditions:model.conditions.length,actions:model.actions.length,damageHypotheses:model.damageHypotheses.length,
 typedRelations:model.relations.length,syntheticFixtures:fixtures.cases.length,mutationsRejected:rejected+fixtureRejected,
 observedFailures:0,performedActions:0,approvedSapMappings:0};
const report={schema:'fmea-mining.pm-cooling-fan-ontology-report.v1',version:'1.3.44',
 nature:'unverified_generic_OEM_model_not_field_data',counts,
 fanRules:[FAN_SUPPORT,FAN_BELT].map(x=>({ruleId:x.rule,bundleId:x.bundle,conditions:x.conditions,actions:x.actions,
 damageCandidate:x.damage,installedComponentsVerified:false,engineeringReview:'pending'})),
 radiatorLabel:model.damageHypotheses.find(x=>x.id==='DMG-COOL-INTERNAL-BLOCKAGE').label,
 conditionsOfUse:'Confirm actual OEM engine/fan arrangement and safe procedure before field work.',
 errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-cooling-fan-ontology.generated.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',counts,errors},null,2));
process.exit(errors.length?1:0);
