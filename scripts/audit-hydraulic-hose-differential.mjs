#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const d=read('data/quality/hydraulic-hose-differential.v1.json');
const sources=read('data/research/sources.v1.json').sources;
const gaps=read('data/quality/pm-gap-review.v1.json').records;
const baseline=read('data/quality/pm-hose-abrasion-discrimination.v1.json');
const sourceIds=new Set(sources.map(s=>s.id));
const failures=[];
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const check=(v,msg,arr=failures)=>{if(!v)arr.push(msg);};
function validate(x){
 const e=[], test=(v,k)=>check(v,k,e);
 test(x.schema==='fmea-mining.hydraulic-hose-differential.v1'&&x.version==='1.3.89','schema_and_version');
 test(x.nature==='conceptual_technical_differentials_not_field_diagnostics','nature');
 test(x.scope?.system==='hidraulico'&&same(x.scope.pmRules,['hydraulic-hose-abrasion','hydraulic-hose-leak'])&&x.scope.sapBlocker==='subgroup_not_in_scope'&&x.scope.operationalPriorityAssigned===false,'pm_scope');
 const p=x.policy||{};
 for(const k of ['conceptualOnly','oemSerialRequired','independentReviewRequired','noAutomaticSapMapping','noAutomaticWorkOrder','noPressurizedLeakSearch','noOperatingRelease','noUniversalThresholds'])test(p[k]===true,'policy_'+k);
 test(p.recordedFieldEvents===0&&p.performedInspections===0&&p.engineeringApprovals===0&&p.privateCorporateGates==='NO_GO','fake_execution_or_approval');
 test(typeof x.globalSafety==='string'&&x.globalSafety.includes('pressão residual')&&x.globalSafety.includes('injeção')&&x.globalSafety.includes('OMM'),'unsafe_global_boundary');
 test(Array.isArray(x.records)&&x.records.length===9,'record_count');
 const seen=new Set(),hypIds=new Set();
 for(const [i,r] of (x.records||[]).entries()){
   const id='HH-DIFF-'+String(i+1).padStart(2,'0');
   test(r.id===id&&!seen.has(r.id),'id_'+id);seen.add(r.id);
   test(typeof r.signal==='string'&&r.signal.length>30&&typeof r.potentialFunctionalEffect==='string'&&r.potentialFunctionalEffect.length>20,'technical_content_'+id);
   test(['isolate_and_verify_origin_safely','inspect_without_operating_release','withdraw_from_service_evaluate_replacement','withdraw_from_service_if_confirmed'].includes(r.disposition),'disposition_'+id);
   if(i>=2&&i<=7)test(r.disposition==='withdraw_from_service_evaluate_replacement','critical_disposition_'+id);
   if(i===8)test(r.disposition==='withdraw_from_service_if_confirmed','twist_boundary');
   test(Array.isArray(r.competingHypotheses)&&r.competingHypotheses.length>=2,'alternatives_'+id);
   for(const h of r.competingHypotheses||[]){
     test(typeof h.id==='string'&&h.id.startsWith(id+'-')&&!hypIds.has(h.id),'hypothesis_id_'+id); hypIds.add(h.id);
     for(const k of ['mechanism','proposedDiscriminant','competingExplanation'])test(typeof h[k]==='string'&&h[k].length>=20,'hypothesis_'+k+'_'+id);
   }
   test(Array.isArray(r.evidenceToRequest)&&r.evidenceToRequest.length>=3&&r.evidenceToRequest.every(t=>typeof t==='string'&&t.length>=12),'requested_evidence_'+id);
   test(Array.isArray(r.sourceIds)&&r.sourceIds.length>=2&&new Set(r.sourceIds).size===r.sourceIds.length&&r.sourceIds.every(s=>sourceIds.has(s)),'source_trace_'+id);
   test(typeof r.interpretationLimit==='string'&&r.interpretationLimit.length>=45,'limit_'+id);
   test(r.observedOnAsset===false&&r.performedTests===0&&r.confirmedDamage===false&&r.confirmedRootCause===false,'false_field_evidence_'+id);
   test(r.approvedMeasurementLimit===null&&r.validatedOemSerial===null&&r.approvedSapMapping===false&&r.independentReview==='not_performed','false_release_'+id);
 }
 test((x.records||[]).filter(r=>r.disposition==='withdraw_from_service_evaluate_replacement').length===6,'withdrawal_cases');
 return e;
}
failures.push(...validate(d));
check(baseline.pressureTestingAuthorized===false&&baseline.fieldObservations===0&&baseline.confirmedDamage===0,'previous_hose_safety_baseline');
for(const rule of d.scope.pmRules){
 const g=gaps.find(z=>z.ruleId===rule);
 check(g?.expectedBlocker==='subgroup_not_in_scope'&&g?.status==='bloqueado_aguardando_curadoria'&&g?.autoRemapAllowed===false,'existing_sap_blocker_'+rule);
}
const mutations=[
 x=>x.policy.noOperatingRelease=false,
 x=>x.policy.engineeringApprovals=1,
 x=>x.policy.privateCorporateGates='GO',
 x=>x.scope.operationalPriorityAssigned=true,
 x=>x.records[0].confirmedRootCause=true,
 x=>x.records[1].observedOnAsset=true,
 x=>x.records[2].disposition='inspect_without_operating_release',
 x=>x.records[3].approvedMeasurementLimit=350,
 x=>x.records[4].competingHypotheses.pop(),
 x=>x.records[5].sourceIds=['BOGUS-SOURCE'],
 x=>x.records[6].validatedOemSerial='TEST00001',
 x=>x.records[7].performedTests=1,
 x=>x.records[8].approvedSapMapping=true,
 x=>x.records[0].interpretationLimit='ok',
 x=>x.records.pop()
];
let rejected=0;
for(const mutate of mutations){
 const candidate=structuredClone(d);mutate(candidate);
 if(validate(candidate).length)rejected++; else failures.push('unsafe_mutation_escaped');
}
check(rejected===mutations.length,'mutation_coverage');
const report={schema:'fmea-mining.hydraulic-hose-differential-audit.v1',version:d.version,status:failures.length?'FAIL':'OK',
 totals:{differentialCases:d.records.length,competingHypotheses:d.records.reduce((n,r)=>n+r.competingHypotheses.length,0),
 sourcesReferenced:new Set(d.records.flatMap(r=>r.sourceIds)).size,adversarialMutationsRejected:rejected,
 fieldObservations:0,performedTests:0,approvedSapMappings:0,privateGates:'NO_GO'},errors:failures};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/hydraulic-hose-differential.generated.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
process.exit(failures.length?1:0);
