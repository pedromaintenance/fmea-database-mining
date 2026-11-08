#!/usr/bin/env node
/**
 * End-to-end integration and privacy regression for the REAL pilot workflow.
 * Uses only SYNTHETIC in-memory-generated fixtures, destroys them after test.
 * No real questions, judgments or reviewer identities are committed/published.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const cwd=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
process.chdir(cwd);
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const cfg=json('data/quality/field-pilot-readiness.v1.json');
const errors=[],checks=[];let mutations=0;
function check(id,ok){checks.push(id);if(!ok)errors.push(id)}
const actual=json('reports/dual-review-public-status.generated.json');
const old=json('reports/external-review-evaluation.generated.json');
check('readiness_contract',cfg.schema==='fmea-mining.field-pilot-readiness.v1'&&cfg.version==='1.4.9'&&cfg.intendedInitialQuestions===20&&cfg.statisticalCertification===false);
check('eleven_distinct_gates',cfg.prerequisites.length===11&&new Set(cfg.prerequisites.map(x=>x.id)).size===11);
check('gates_have_human_owners',cfg.prerequisites.every(x=>x.required===true&&x.ownerRole&&typeof x.automated==='boolean'));
check('public_status_zero',actual.status==='NO_REAL_REVIEW_DATA'&&actual.questionCount===0&&actual.independentRetrievalMetrics===null);
check('external_status_null',old.status==='NO_EXTERNAL_SAMPLE'&&old.metrics===null);
const kit=read('docs/piloto-oficina.html');
const script=kit.match(/<script>([\s\S]*?)<\/script>/);
try{check('kit_javascript',!!script&&!!new vm.Script(script[1]))}catch{check('kit_javascript',false)}
check('kit_20_blank_lines',kit.includes('for(let i=1;i<=20;i++)')&&kit.includes("createElement('div')"));
check('kit_no_persistent_tracking',!/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|<script\s+src=/i.test(kit));
check('kit_explains_voluntary',kit.includes('voluntária')&&kit.includes('não precisa se identificar')===false&&kit.includes('20'));
check('kit_no_names_or_asset_values',!kit.includes('040-')&&!kit.includes('KYD00'));
const evaluator=read('scripts/evaluate-external-review.mjs');
const reconciliation=read('scripts/reconcile-blind-reviews.mjs');
check('input_output_private_gate',evaluator.includes("const privateRoot=path.resolve('private')")&&evaluator.includes("if(input){"));
check('new_directory_guard',reconciliation.includes("Output directory already exists")&&reconciliation.includes("isSymbolicLink()"));
check('nonblind_gate',read('scripts/lib/dual-review-core.mjs').includes('INVALID_PROTOCOL_DECLARATIONS'));
const privateDir=path.resolve('private');fs.mkdirSync(privateDir,{recursive:true});
const work=fs.mkdtempSync(path.join(privateDir,'qa-field-149-'));
const file=(name,d)=>{const p=path.join(work,name);fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');return p};
const q=[
 {id:'EXT-001',question:'Como funciona a cavitação hidráulica em uma bomba?'},
 {id:'EXT-002',question:'Por que aparecem bolhas de ar e espuma no óleo?'}
];
const collection={schema:'fmea-mining.question-collection.v1',version:'1.4.8',nature:'external_unlabelled_questions',publicSafe:true,outsideDevelopmentSelfAttested:false,cases:q};
const rated=(idx,status,ids,why)=>({
 ...q[idx],category:'explanation',expectedStatus:status,expectedIds:ids,rationale:why,reviewedBeforePrediction:true
});
const declaration={didNotSeePredictions:true,independentOfOtherReviewer:true,notInEngineDevelopment:false,publicSafe:true};
const r1={schema:'fmea-mining.blind-review.v1',version:'1.4.8',role:'R1',declaration,cases:[
 rated(0,'FOUND_CONCEPTUAL',['TK-HYD-CAVITATION-001'],'Teste sintético da relevância conceitual da cavitação hidráulica.'),
 rated(1,'FOUND_CONCEPTUAL',['TK-HYD-AERATION-001'],'Teste sintético sobre a presença de ar livre no fluido.')
]};
const r2=structuredClone(r1);r2.role='R2';r2.cases[1].expectedStatus='MULTIPLE_CONCEPTS';r2.cases[1].expectedIds=['TK-HYD-AERATION-001','TK-HYD-CAVITATION-001'];
const decision={schema:'fmea-mining.adjudication-decisions.v1',version:'1.4.8',predictionsNotViewed:true,
 decisions:[{id:'EXT-002',expectedStatus:'FOUND_CONCEPTUAL',expectedIds:['TK-HYD-AERATION-001'],category:'explanation',
  rationale:'Adjudicação sintética opta pelo mecanismo de ar entranhado em fluido.'}]};
function call(script,args){
 return spawnSync(process.execPath,[script,...args],{cwd,encoding:'utf8',timeout:25000});
}
function contents(result){try{return JSON.parse(result.stdout)}catch{return null}}
try{
 const inputs={collection:file('questions.json',collection),r1:file('r1.json',r1),r2:file('r2.json',r2),decision:file('decision.json',decision)};
 const base=['--collection',inputs.collection,'--r1',inputs.r1,'--r2',inputs.r2];
 const hold=path.join(work,'conflict_hold');
 const blocked=call('scripts/reconcile-blind-reviews.mjs',[...base,'--out-dir',hold]);
 check('conflict_held',blocked.status===0&&contents(blocked)?.status==='NEEDS_ADJUDICATION'&&fs.existsSync(path.join(hold,'adjudication-conflicts.private.json'))&&!fs.existsSync(path.join(hold,'gold.private.json')));
 const ready=path.join(work,'ready');
 const run=call('scripts/reconcile-blind-reviews.mjs',[...base,'--decisions',inputs.decision,'--out-dir',ready]);
 check('adjudication_generates_gold',run.status===0&&contents(run)?.status==='READY_GOLD_PRIVATE'&&fs.existsSync(path.join(ready,'gold.private.json')));
 const gold=path.join(ready,'gold.private.json');
 check('adjudicated_exact_case_count',json(gold).cases.length===2);
 const score=path.join(ready,'score.private.json');
 const evalRun=call('scripts/evaluate-external-review.mjs',['--input',gold,'--out',score]);
 check('private_evaluation_success',evalRun.status===0&&fs.existsSync(score)&&json(score).totals.submitted===2&&json(score).independenceSelfAttested===false);
 const oldGold=read(gold);
 const second=call('scripts/reconcile-blind-reviews.mjs',[...base,'--decisions',inputs.decision,'--out-dir',ready]);mutations++;
 check('reject_overwrite_existing_gold',second.status!==0&&read(gold)===oldGold);
 const publicLeak=path.join(work,'..','..','reports','_qa_human_score_should_not_exist.json');
 const unsafe=call('scripts/evaluate-external-review.mjs',['--input',gold,'--out',publicLeak]);mutations++;
 check('reject_public_score_output',unsafe.status!==0&&!fs.existsSync(publicLeak));
 const invalid=structuredClone(r1);invalid.declaration.didNotSeePredictions=false;const wrong=file('r1-not-blind.json',invalid);
 const badOut=path.join(work,'bad_nonblind');
 const bad=call('scripts/reconcile-blind-reviews.mjs',['--collection',inputs.collection,'--r1',wrong,'--r2',inputs.r2,'--decisions',inputs.decision,'--out-dir',badOut]);mutations++;
 check('reject_nonblind_reviewer',bad.status!==0&&!fs.existsSync(path.join(badOut,'gold.private.json')));
 const coord=structuredClone(r2);coord.declaration.independentOfOtherReviewer=false;const colluded=file('r2-coordinated.json',coord);
 const bad2=call('scripts/reconcile-blind-reviews.mjs',['--collection',inputs.collection,'--r1',inputs.r1,'--r2',colluded,'--decisions',inputs.decision,'--out-dir',path.join(work,'bad_coordinated')]);mutations++;
 check('reject_coordinated_review',bad2.status!==0);
 const tracked=path.join(cwd,'reports','_qa_public_reconciliation');
 const attempt=call('scripts/reconcile-blind-reviews.mjs',[...base,'--out-dir',tracked]);mutations++;
 check('reject_outside_private_root',attempt.status!==0&&!fs.existsSync(tracked));
 // A declared refusal to redact cannot be used to mint a gold, even if other
 // declarations are favorable and the code would otherwise match predictions.
 const unsafePrivacy=structuredClone(r1);unsafePrivacy.declaration.publicSafe=false;
 const privacyPath=file('r1-unredacted.json',unsafePrivacy);
 const unsafeReview=call('scripts/reconcile-blind-reviews.mjs',['--collection',inputs.collection,'--r1',privacyPath,'--r2',inputs.r2,'--decisions',inputs.decision,'--out-dir',path.join(work,'bad_privacy')]);mutations++;
 check('reject_unredacted_review',unsafeReview.status!==0);
}finally{
 fs.rmSync(work,{recursive:true,force:true});
}
const output={schema:'fmea-mining.field-pilot-readiness-audit.v1',version:'1.4.9',status:errors.length?'FAIL':'PASS',
 nature:'synthetic_CI_integration_not_external_worker_responses',checks:checks.length,adversarialMutations:mutations,
 actualHumanQuestions:0,actualExternalReviewers:0,realPilotStatus:'NOT_STARTED',
 humanAgreement:null,externalSearchAccuracy:null,errors};
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/field-pilot-readiness-audit.generated.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output,null,2));
process.exit(errors.length?1:0);
