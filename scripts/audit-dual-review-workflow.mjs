#!/usr/bin/env node
/** Synthetic-only protocol QA: never count fabricated reviewers as external evidence. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {validateCollection,validateBlindReview,compareBlindReviews,buildAdjudicatedGold} from './lib/dual-review-core.mjs';
import {checkReviewBatch} from './lib/external-review-core.mjs';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const graph=json('data/knowledge/functional-architecture.v1.json');
const records=graph.fundamentalRecordPaths.map(p=>({...json(p),__path:p}));
const recordIds=records.map(r=>r.id);
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const hashes={engineSha256:sha(read('scripts/lib/technical-discovery-v2.mjs')),corpusSha256:sha(JSON.stringify(records))};
let checks=0,mutations=0;const errors=[];
const check=(name,ok)=>{checks++;if(!ok)errors.push(name)};
const collect={
 schema:'fmea-mining.question-collection.v1',version:'1.4.8',nature:'external_unlabelled_questions',
 publicSafe:true,outsideDevelopmentSelfAttested:false,
 cases:[
 {id:'EXT-001',question:'Como a cavitação pode afetar uma bomba hidráulica?'},
 {id:'EXT-002',question:'O que é espuma no fluido hidráulico e por que importa?'},
 {id:'EXT-003',question:'O implemento desce sozinho; posso continuar operando?'}
 ]};
const declaration={didNotSeePredictions:true,independentOfOtherReviewer:true,notInEngineDevelopment:false,publicSafe:true};
const rated=(id,question,expectedStatus,expectedIds,rationale,category)=>({id,question,expectedStatus,expectedIds,rationale,category,reviewedBeforePrediction:true});
const r1={schema:'fmea-mining.blind-review.v1',version:'1.4.8',role:'R1',declaration,cases:[
 rated('EXT-001',collect.cases[0].question,'FOUND_CONCEPTUAL',['TK-HYD-CAVITATION-001'],'A pergunta pede mecanismo de cavitação em bomba.','explanation'),
 rated('EXT-002',collect.cases[1].question,'FOUND_CONCEPTUAL',['TK-HYD-AERATION-001'],'A pergunta pede distinção conceitual de ar no óleo.','explanation'),
 rated('EXT-003',collect.cases[2].question,'ABSTAIN_UNSUPPORTED_OPERATIONAL',[],'Operar uma máquina com carga instável requer decisão autorizada.','operational_decision')
]};
const r2=structuredClone(r1);r2.role='R2';
r2.cases[1].expectedStatus='MULTIPLE_CONCEPTS';r2.cases[1].expectedIds=['TK-HYD-AERATION-001','TK-HYD-CAVITATION-001'];
r2.cases[1].rationale='Espuma e cavitação são processos diferentes que exigem evidências.';
check('valid_collection',validateCollection(collect).length===0);
check('valid_r1',validateBlindReview(r1,collect,recordIds,'R1').length===0);
check('valid_r2',validateBlindReview(r2,collect,recordIds,'R2').length===0);
const comparison=compareBlindReviews(collect,r1,r2,recordIds);
check('one_conflict',comparison.status==='NEEDS_ADJUDICATION'&&comparison.conflicts.length===1&&comparison.conflicts[0].id==='EXT-002');
check('rates_real_division',comparison.summary.questions===3&&comparison.summary.fullAgreement===2&&comparison.summary.statusAgreement===2&&comparison.summary.fullAgreementRate===0.666667&&comparison.summary.cohensKappaForStatus!==null);
check('no_certified_independence',comparison.summary.independenceSelfAttested===false&&comparison.summary.independenceExternallyVerified===false);
const pending=buildAdjudicatedGold(collect,r1,r2,null,recordIds,hashes);
check('no_gold_with_conflict',pending.status==='NEEDS_ADJUDICATION'&&pending.gold===null);
const decisions={schema:'fmea-mining.adjudication-decisions.v1',version:'1.4.8',predictionsNotViewed:true,
 decisions:[{id:'EXT-002',expectedStatus:'FOUND_CONCEPTUAL',expectedIds:['TK-HYD-AERATION-001'],
  rationale:'Após consultar a definição, a pergunta é predominantemente sobre ar entranhado.',category:'explanation'}]};
const resolved=buildAdjudicatedGold(collect,r1,r2,decisions,recordIds,hashes);
check('gold_only_after_adjudication',resolved.status==='READY_GOLD_PRIVATE'&&resolved.gold?.cases.length===3);
check('compatible_existing_evaluator',checkReviewBatch(resolved.gold,{...hashes,recordIds}).length===0);
check('only_self_attested',resolved.gold.reviewerDeclaration.judgementMethod==='internal_calibration'&&resolved.gold.reviewerDeclaration.questionsOutsideDevelopment===false);
const noSample=json('reports/dual-review-public-status.generated.json');
check('null_public_status',noSample.status==='NO_REAL_REVIEW_DATA'&&noSample.independentRetrievalMetrics===null&&noSample.questionCount===0);
const ignore=read('.gitignore');
check('private_excluded_from_git',/^\s*private\/\s*$/m.test(ignore));
for(const [name,source] of [
 ['collector','reports/coleta-perguntas.generated.html'],
 ['reviewer','reports/revisao-cega.generated.html'],
 ['adjudicator','reports/adjudicacao-tecnica.generated.html']]){
 const html=read(source),script=html.match(/<script>([\s\S]*?)<\/script>/);
 try{check(name+'_javascript',!!script&&!!new vm.Script(script[1]))}catch{check(name+'_javascript',false)}
 check(name+'_no_network_storage',!/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|<script\s+src=/i.test(html));
 check(name+'_safe_dom',html.includes('textContent=')&&!html.includes('innerHTML'));
 if(name==='collector')check('collector_no_answer_index',!html.includes('TK-HYD-CAVITATION-001')&&!html.includes('technical-discovery-v2'));
 if(name==='reviewer')check('reviewer_no_prediction_engine',!html.includes('discoverTechnical')&&!html.includes('technical-discovery-v2'));
}
function reject(name,mutate,validator){const x=structuredClone(validator==='collection'?collect:r1);mutate(x);mutations++;check('reject_'+name,(validator==='collection'?validateCollection(x):validateBlindReview(x,collect,recordIds,'R1')).length>0)}
reject('collection_machine_tag',x=>x.cases[0].question='040-013 foi liberado e apresenta cavitação?', 'collection');
reject('collection_email',x=>x.cases[0].question='Fale com tecnico@empresa.com sobre cavitação', 'collection');
reject('collection_duplicate',x=>x.cases[1].question=x.cases[0].question,'collection');
reject('collection_empty',x=>x.cases=[],'collection');
reject('collection_internal_field',x=>x.notes='real machine','collection');
reject('question_mismatch',x=>x.cases[1].question='Pergunta adulterada de avaliação?', 'review');
reject('forged_expected_id',x=>x.cases[0].expectedIds=['TK-FAKE-001'],'review');
reject('answer_seen',x=>x.cases[0].reviewedBeforePrediction=false,'review');
reject('missing_rationale',x=>x.cases[0].rationale='nada','review');
reject('wrong_reviewer',x=>x.role='R2','review');
reject('multiple_with_single_id',x=>x.cases[0].expectedStatus='MULTIPLE_CONCEPTS','review');
reject('extra_private_serial',x=>x.cases[0].serial='ABC','review');
const deceptive=structuredClone(decisions);deceptive.predictionsNotViewed=false;mutations++;
check('reject_adjudication_after_prediction',buildAdjudicatedGold(collect,r1,r2,deceptive,recordIds,hashes).gold===null);
const unfinished=structuredClone(r1);unfinished.cases[1].expectedStatus='NEEDS_ADJUDICATION';unfinished.cases[1].expectedIds=[];
const both=structuredClone(unfinished);both.role='R2';
check('even_mutual_unresolved_needs_decision',buildAdjudicatedGold(collect,unfinished,both,null,recordIds,hashes).gold===null);
const audit={schema:'fmea-mining.dual-review-workflow-audit.v1',version:'1.4.8',status:errors.length?'FAIL':'PASS',
 type:'synthetic_internal_fixture_not_real_human_study',checks,adversarialMutations:mutations,
 fictitiousRolesUsedForCodeTestOnly:2,actualHumanReviewers:0,realQuestionsReceived:0,
 actualMeasuredAgreement:null,actualRetrievalAccuracy:null,errors};
fs.mkdirSync('reports',{recursive:true});fs.writeFileSync('reports/dual-review-workflow-audit.generated.json',JSON.stringify(audit,null,2)+'\n');
console.log(JSON.stringify(audit,null,2));process.exit(errors.length?1:0);
