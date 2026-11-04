#!/usr/bin/env node
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gradeHydraulicReasoning,safeTrainingExport,TRAINING_REPORT_FIELDS} from './lib/hydraulic-reasoning.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const d=read('data/quality/hydraulic-diagnostic-reasoning-benchmark.v1.json');
const schema=read('schemas/hydraulic-diagnostic-reasoning-benchmark.schema.json');
const base=read('data/quality/hydraulic-circuit-differential.v1.json');
const maturity=read('data/quality/pm-maturity-matrix.v1.json');
const catalog=read('data/research/sources.v1.json').sources;
const html=fs.readFileSync(path.join(root,'docs/treino-diagnostico-hidraulico.html'),'utf8');
const moduleText=fs.readFileSync(path.join(root,'scripts/lib/hydraulic-reasoning.mjs'),'utf8');
const expectedAction={VERIFY_OEM_DISCRIMINANT:10,SAFETY_STOP:6,RECONCILE_OBSERVABILITY:4};
const immutable=['allExamplesFictional','independentOemReviewStillRequired','neverInferConfirmedCauseFromSymptom',
 'neverAuthorizePressurizedTests','neverDisableInterlocks','noUniversalAcceptanceValues','noRealAssetsOrSerials',
 'noActualMeasurements','noFieldTests','noAutomaticSapMapping','noOperatingRelease','noQuantifiedFailureProbability',
 'noSensitiveDataExport'];
const expectedFlags=['requiredBoundary','oemSerialVerified','performedOnMachine','actualMeasurements','confirmedRootCause','operatingRelease','sapMappingApproved','privateCorporateGate'];
const errors=[],assert=(ok,label,a=errors)=>{if(!ok)a.push(label)};
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),copy=x=>structuredClone(x);
const srcIds=new Set(catalog.map(s=>s.id));
const expectedIds=base.records.flatMap(r=>r.competingHypotheses.map(h=>h.id));
const expectedActions=new Set(Object.keys(d.responseSemantics||{}));
const allFields=Object.keys(schema.properties?.entries?.items?.properties||{});
function validate(x){
 const e=[],t=(v,name)=>assert(v,name,e);
 t(x?.schema==='fmea-mining.hydraulic-diagnostic-reasoning-benchmark.v1'&&x?.version==='1.3.94'&&x?.nature==='synthetic_training_not_field_diagnostics','identity');
 t(x?.basedOn==='data/quality/hydraulic-circuit-differential.v1.json','based_on');
 for(const key of immutable)t(x?.policy?.[key]===true,'flag_'+key);
 t(x?.policy?.privateGates==='NO_GO','private_gates');
 t(x?.scoring?.trainingOnly!==false && x?.scoring?.educationalOnly===true&&x?.scoring?.neverTreatScoreAsQualification===true&&x?.scoring?.noCertificationIssued===true,'training_scoring');
 t(x?.entries?.length===20,'case_count');
 let counts={},focus=new Set(),ids=new Set(),opts=new Set();
 for(let i=0;i<(x?.entries||[]).length;i++){
  const v=x.entries[i],baseCase=base.records[Math.floor(i/2)];
  const id='HY-DRILL-'+String(i+1).padStart(2,'0');
  if(!v){t(false,'null_case_'+i);continue;}
  t(v.id===id&&!ids.has(v.id),'case_id_'+id);ids.add(v.id);
  t(v.scenarioId===baseCase.id,'scenario_link_'+id);
  t(v.kind===(i%2===0?'ambiguous_symptom':'safety_or_observability_countercase'),'case_type_'+id);
  t(eq(v.hypothesisIds,baseCase.competingHypotheses.map(h=>h.id)),'hypothesis_crossref_'+id);
  t(v.hypothesisIds.includes(v.focusHypothesisId),'focus_is_candidate_'+id);focus.add(v.focusHypothesisId);
  t(eq(v.sourceIds,baseCase.sourceIds)&&v.sourceIds.every(s=>srcIds.has(s)),'source_crossref_'+id);
  t(typeof v.simulatedContext==='string'&&v.simulatedContext.length>=85&&typeof v.question==='string'&&v.question.length>=55,'substantive_case_'+id);
  t(typeof v.engineeringExplanation==='string'&&v.engineeringExplanation.length>=85,'rationale_'+id);
  t(v.requiredBoundary==='conceptual_education_no_operational_authority'&&v.oemSerialVerified===false&&v.performedOnMachine===false&&v.actualMeasurements===null&&v.confirmedRootCause===null&&v.operatingRelease===false&&v.sapMappingApproved===false&&v.privateCorporateGate==='NO_GO','no_field_or_approval_'+id);
  t(eq(Object.keys(v).sort(),[...allFields].sort()),'case_field_contract_'+id);
  t(v.choices?.length===3,'choice_count_'+id);
  const choiceCodes=(v.choices||[]).map(c=>c.code);
  t(new Set(choiceCodes).size===3&&choiceCodes.every(c=>expectedActions.has(c)),'choice_code_'+id);
  t((v.choices||[]).every(c=>typeof c.label==='string'&&c.label.length>=40&&typeof c.feedback==='string'&&c.feedback.length>=55),'choice_text_'+id);
  t(choiceCodes.includes(v.expectedChoiceCode),'answer_exists_'+id);
  if(i%2===0)t(v.expectedChoiceCode==='VERIFY_OEM_DISCRIMINANT','noninvasive_discrimination_'+id);
  else t(v.expectedChoiceCode===([0,3,4,5,6,7].includes(Math.floor(i/2))?'SAFETY_STOP':'RECONCILE_OBSERVABILITY'),'countercase_expected_'+id);
  const correct=gradeHydraulicReasoning(v,v.expectedChoiceCode);
  t(correct.completed&&correct.correct&&correct.operationalApproval===false&&correct.confirmedRootCause===false,'correct_grade_'+id);
  for(const code of choiceCodes.filter(c=>c!==v.expectedChoiceCode)){
   const wrong=gradeHydraulicReasoning(v,code);
   t(wrong.completed&&wrong.correct===false&&wrong.operationalApproval===false,'wrong_grade_'+id);
  }
  counts[v.expectedChoiceCode]=(counts[v.expectedChoiceCode]||0)+1;
 }
 t(eq(counts,expectedAction)||Object.entries(expectedAction).every(([k,v])=>counts[k]===v),'expected_action_distribution');
 t(new Set(x?.entries?.flatMap(r=>r.hypothesisIds)).size===30,'all_30_hypotheses');
 t(x?.scoring?.publicExportFormat==='aggregate_anonymous_training_attempts'&&x?.scoring?.noNegativePenalty===true,'export_not_qualification');
 return e;
}
errors.push(...validate(d));
assert(schema?.properties?.entries?.minItems===20&&schema?.properties?.entries?.maxItems===20,'schema_exact_count');
assert(schema?.properties?.entries?.items?.additionalProperties===false,'schema_no_surprises');
assert(schema?.properties?.policy?.properties?.noOperatingRelease?.const===true,'schema_safety_policy');
assert(maturity.summary.seedRules===25&&maturity.summary.sapExceptionsBlocked===10&&maturity.summary.serialOemVerified===0&&maturity.summary.engineeringApprovalsRecorded===0,'legacy_baseline');
const local=html.match(/<script id="reasoning-data" type="application\/json">([\s\S]*?)<\/script>/);
try{assert(eq(JSON.parse(local?.[1]||''),d),'html_json_parity')}catch(e){errors.push('html_data_invalid')}
const js=html.match(/<script>\s*([\s\S]*?)<\/script>/);
let browser=null;
if(js){
 const begin=js[1].indexOf('/**'),end=js[1].indexOf('const BOOK=JSON.parse');
 assert(begin>=0&&end>begin,'javascript_module_boundaries');
 if(begin>=0&&end>begin){
  assert(js[1].slice(begin,end).trim()===moduleText.replace(/^export /gm,'').trim(),'browser_library_parity');
  try{
    browser=vm.runInNewContext(js[1].slice(0,end)+'\n({gradeHydraulicReasoning,safeTrainingExport})',{},{timeout:1000});
  }catch(e){errors.push('browser_runtime_unavailable_'+e.name);}
 }
}
for(const term of ['<script src=','<iframe','localStorage','sessionStorage','fetch(','WebSocket(','XMLHttpRequest','navigator.sendBeacon','indexedDB','serviceWorker'])
 assert(!html.includes(term),'offline_forbidden_'+term);
const allCorrect=d.entries.map(v=>({caseId:v.id,choiceCode:v.expectedChoiceCode}));
const report=safeTrainingExport(d,allCorrect);
assert(report.trainingOnly===true&&report.qualificationGranted===false&&report.operationalApproval===false&&report.score===20&&report.total===20,'perfect_score_still_training_only');
assert(eq(Object.keys(report),TRAINING_REPORT_FIELDS),'anonymous_export_shape');
if(browser){
 const br=browser.safeTrainingExport(d,allCorrect);
 assert(eq(report,br),'browser_training_export_parity');
 for(const entry of d.entries){
  const r=gradeHydraulicReasoning(entry,entry.expectedChoiceCode);
  const b=browser.gradeHydraulicReasoning(entry,entry.expectedChoiceCode);
  assert(eq(r,b),'browser_grade_parity_'+entry.id);
 }
}
const sentinel='SYNTHETIC_PRIVATE_ID_SHOULD_NOT_EXPORT';
const contaminated=allCorrect.map((x,i)=>({...x,operatorName:sentinel,assetTag:sentinel,machineSerial:sentinel,privateDocuments:sentinel,
 measurements:sentinel,notes:sentinel,id:i}));
const sanitized=safeTrainingExport(d,contaminated);
assert(!JSON.stringify(sanitized).includes(sentinel),'synthetic_private_canary_protected');
assert(safeTrainingExport(d,[...allCorrect,...allCorrect]).total===20,'duplicate_attempts_not_counted');
assert(safeTrainingExport(d,[{caseId:'HC-DIFF-999',choiceCode:'UNSAFE_TEST'},...allCorrect]).total===20,'unknown_case_ignored');
const mutate=[
 x=>x.policy.noOperatingRelease=false,
 x=>x.policy.privateGates='GO',
 x=>x.entries.pop(),
 x=>x.entries[0].id='HY-DRILL-99',
 x=>x.entries[1].scenarioId='HC-DIFF-02',
 x=>x.entries[2].hypothesisIds[0]='FAKE-HYPOTHESIS',
 x=>x.entries[3].sourceIds=['FAKE-SOURCE'],
 x=>x.entries[4].performedOnMachine=true,
 x=>x.entries[5].operatingRelease=true,
 x=>x.entries[6].actualMeasurements={pressure:37000},
 x=>x.entries[7].confirmedRootCause='PUMP',
 x=>x.entries[8].privateCorporateGate='GO',
 x=>x.entries[9].expectedChoiceCode='PREMATURE_CAUSE',
 x=>x.entries[10].expectedChoiceCode='SAFETY_STOP',
 x=>x.entries[11].expectedChoiceCode='RECONCILE_OBSERVABILITY',
 x=>x.entries[12].choices[0].code=x.entries[12].choices[1].code,
 x=>x.entries[13].choices.pop(),
 x=>x.entries[14].focusHypothesisId='HC-DIFF-01-PUMP',
 x=>x.entries[15].question='?',
 x=>x.entries[16].engineeringExplanation='No conclusion',
 x=>x.entries[17].sapMappingApproved=true,
 x=>x.entries[18].oemSerialVerified=true,
 x=>x.entries[19].sourceIds=[],
 x=>x.entries[0].fabricatedFieldEvent=1
];
let caught=0;
for(const change of mutate){const c=copy(d);change(c);if(validate(c).length)caught++;else errors.push('mutation_escaped');}
assert(caught===mutate.length,'all_mutations_caught');
const result={schema:'fmea-mining.hydraulic-reasoning-benchmark-audit.v1',version:'1.3.94',
 status:errors.length?'FAIL':'OK',totals:{
 scenarios:base.records.length,syntheticDrills:d.entries.length,
 hypothesisRefs:new Set(d.entries.flatMap(r=>r.hypothesisIds)).size,
 bestActions:expectedAction,
 adversarialMutationsCaught:caught,
 offlineRuntimeParity:Boolean(browser),
 privateCanaryExcluded:!JSON.stringify(sanitized).includes(sentinel),
 actualFieldEvents:0,testsExecuted:0,approvedSapMappings:0,
 safetyGates:'NO_GO'
 },errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/hydraulic-reasoning-benchmark.generated.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));process.exit(errors.length?1:0);
