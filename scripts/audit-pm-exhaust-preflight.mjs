#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const model=read('data/ontology/condition-action-damage.v1.json');
const seeds=read('data/knowledge/pm-prevention/seed-rules.json').records;
const sources=read('data/research/sources.v1.json').sources;
const gaps=read('data/quality/pm-gap-review.v1.json').records;
const p=read('data/quality/pm-exhaust-preflight.v1.json');
const clone=x=>JSON.parse(JSON.stringify(x));
const equals=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const expectedPhenomena=['localized_soot_trace','visible_manifold_fissure','flange_or_gasket_leak','black_wet_exhaust_residue','expansion_bellows_damage','exhaust_performance_deviation'];
const expectedGates=['OEM-SERIAL','BOM-PARTS','SITE-ISOLATION','PHYSICAL-DISCRIMINATION','CONDITION-CONTEXT','APPROVED-METHOD','SAP-STRUCTURE','INDEPENDENT-REVIEW'];
const expectedSources=['CAT-EXHAUST-MANIFOLD-KIT-INFO','CAT-EXHAUST-WET-STACKING','CAT-EXHAUST-BELLOWS-RELIABILITY'];
function check(x){
 const errors=[],ok=(v,k)=>{if(!v)errors.push(k)};
 const seed=seeds.find(s=>s.id==='engine-exhaust');
 ok(x?.schema==='fmea-mining.pm-exhaust-preflight.v1'&&x?.version==='1.3.52'&&x?.ruleId==='engine-exhaust','identity');
 ok(x?.nature==='literature_based_differential_hypotheses_no_field_events','nature');
 ok(seed?.system==='motor_diesel'&&seed?.subgroupCode==='EXSY'&&seed?.partText==='Coletor'&&seed?.review==='pendente','seed');
 ok(equals(x?.scope?.models,seed?.models)&&x?.scope?.system===seed?.system&&x?.scope?.subgroupCode===seed?.subgroupCode&&x?.scope?.partText===seed?.partText,'scope');
 ok(x?.scope?.serialEffectivityVerified===false&&x?.scope?.physicalLocationVerified===false,'fabricated_effectivity');
 ok(model.version==='1.3.20'&&x?.ontologyVersionFrozen==='1.3.16'&&model.bundles.length===22&&model.bundles.filter(b=>b.ruleId==='engine-exhaust').length===1,'preflight_not_model_approval');
 ok(seeds.length===25&&gaps.length===10,'base_backlog_drift');
 ok(equals(x?.sourceIds,expectedSources)&&x.sourceIds.every(id=>sources.some(s=>s.id===id&&s.url.startsWith('https://www.cat.com/')&&s.reviewStatus==='fonte_publica_consultada_sem_reproducao_integral')),'source_provenance');
 ok(equals(x?.differentials?.map(d=>d.phenomenon),expectedPhenomena),'differential_identity');
 for(const d of x?.differentials||[]){
  ok(d.id.startsWith('EXH-')&&d.status==='hypothesis_not_observed'&&d.confirmed===false,'differential_promoted_'+d.id);
  ok(d.interpretation?.length>65&&d.discriminator?.length>90&&d.confounds?.length>=3,'weak_discrimination_'+d.id);
 }
 ok(equals(x?.evidenceGates?.map(g=>g.id),expectedGates)&&x.evidenceGates.every(g=>g.status==='pending'&&g.purpose.length>24),'gate_promoted');
 const controls=x?.safeguards||{};
 ok(Object.keys(controls).length===10&&Object.values(controls).every(v=>v===true),'safeguards');
 ok(Object.keys(x?.limits||{}).length===4&&Object.values(x.limits).every(v=>v===null),'invented_oem_limit');
 ok(Object.keys(x?.fieldState||{}).length===5&&Object.values(x.fieldState).every(v=>v===0),'fabricated_execution');
 ok(x?.nextDecision?.includes('BUNDLE-19')&&x.nextDecision.includes('OEM'),'missing_next_gate');
 return errors;
}
const errors=check(p);
const attacks=[];
for(let i=0;i<p.differentials.length;i++){
 attacks.push(x=>{x.differentials[i].confirmed=true});
 attacks.push(x=>{x.differentials[i].status='observed_in_mine'});
}
for(let i=0;i<p.evidenceGates.length;i++)attacks.push(x=>{x.evidenceGates[i].status='approved'});
for(const key of Object.keys(p.safeguards))attacks.push(x=>{x.safeguards[key]=false});
for(let i=0;i<p.sourceIds.length;i++)attacks.push(x=>{x.sourceIds[i]='FAKE-OEM'});
attacks.push(x=>{x.scope.serialEffectivityVerified=true});
attacks.push(x=>{x.fieldState.confirmedDamages=1});
attacks.push(x=>{x.limits.torqueNm=150});
let rejected=0;
for(let i=0;i<attacks.length;i++){
 const mutant=clone(p);attacks[i](mutant);
 if(check(mutant).length)rejected++;
 else errors.push('adversarial_mutation_accepted_'+i);
}
if(rejected!==36)errors.push('mutation_count_drift');
const report={
 schema:'fmea-mining.pm-exhaust-preflight-report.v1',version:p.version,
 nature:p.nature,counts:{rules:seeds.length,modeledBundles:model.bundles.length,
 rulesWithoutBundle:seeds.length-model.bundles.length,differentials:p.differentials.length,
 evidenceGates:p.evidenceGates.length,adversarialMutationsRejected:rejected,
 observations:0,testsExecuted:0,confirmedDamages:0,approvedSapMappings:0},
 pendingGates:p.evidenceGates.map(g=>g.id),errors
};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-exhaust-preflight.generated.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',counts:report.counts,errors},null,2));
process.exit(errors.length?1:0);
