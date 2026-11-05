#!/usr/bin/env node
/** Synthetic-only repeatable stress audit; never import private observations here. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {triageHydraulicReviewBatch,validateTriageExport} from './lib/hydraulic-editorial-triage.mjs';
import {validateHydraulicPeerReview} from './lib/hydraulic-expert-review.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const benchmark=read('data/quality/hydraulic-diagnostic-reasoning-benchmark.v1.json');
const protocol=read('data/quality/hydraulic-expert-review-protocol.v1.json');
const template=read('data/quality/hydraulic-expert-review-sheet.v1.json');
const clone=x=>structuredClone(x);
const checks=[];const failures=[];
function check(name,ok){checks.push(name);if(!ok)failures.push(name);}
function assertRejected(name,sheets){
 let rejected=false;try{triageHydraulicReviewBatch(benchmark,protocol,sheets);}catch{rejected=true;}
 check(name,rejected);
}
const labels=['SAFETY_HOLD','ANSWER_DISAGREEMENT','CRITICAL_EDITORIAL_REVIEW','REVISION_BACKLOG','NO_ISSUE_REPORTED','AWAITING_REVIEW','SAFETY_HOLD','ANSWER_DISAGREEMENT','SAFETY_HOLD','CRITICAL_EDITORIAL_REVIEW'];
const sheets=Array.from({length:6},()=>clone(template));
function choice(rowIndex,submissionIndex){const entry=benchmark.entries[rowIndex];return entry.choices[submissionIndex%2].code;}
function setRating(i,j,dim,rating){sheets[j].rows[i].ratings[dim]=rating;}
for(let i=0;i<20;i++){
 if(i===5)continue; // Entirely blank across every synthetic submission.
 for(let j=0;j<6;j++){
  const row=sheets[j].rows[i];
  row.recommendedChoiceCode=benchmark.entries[i].choices[0].code;
  for(const d of Object.keys(row.ratings))row.ratings[d]='adequate';
 }
}
setRating(0,0,'safety_boundary','critical_issue');
sheets[1].rows[1].recommendedChoiceCode=choice(1,1);
setRating(2,0,'observability','critical_issue');
setRating(3,0,'distractor_quality','needs_revision');
sheets[0].rows[6].issueTags=['unsafe_action_risk'];
sheets[0].rows[7].issueTags=['answer_key_ambiguity'];
setRating(8,0,'safety_boundary','critical_issue');
sheets[1].rows[9].recommendedChoiceCode=choice(9,1);
setRating(9,0,'oem_effectivity','critical_issue');
for(let j=0;j<sheets.length;j++){
 const validated=validateHydraulicPeerReview(benchmark,protocol,sheets[j]);
 check('valid_input_'+j,validated.status==='EDITORIAL_FEEDBACK_ONLY'&&validated.errors.length===0);
}
const baseline=triageHydraulicReviewBatch(benchmark,protocol,sheets);
check('export_contract',validateTriageExport(baseline));
check('case_count',baseline.cases.length===20);
for(let i=0;i<labels.length;i++)check('routing_case_'+(i+1),baseline.cases[i].status===labels[i]);
for(let i=10;i<20;i++)check('no_problem_case_'+(i+1),baseline.cases[i].status==='NO_ISSUE_REPORTED');
check('summary_safety',baseline.statusCounts.SAFETY_HOLD===3);
check('summary_critical',baseline.statusCounts.CRITICAL_EDITORIAL_REVIEW===2);
check('summary_answer',baseline.statusCounts.ANSWER_DISAGREEMENT===2);
check('summary_revision',baseline.statusCounts.REVISION_BACKLOG===1);
check('summary_adequate',baseline.statusCounts.NO_ISSUE_REPORTED===11);
check('summary_waiting',baseline.statusCounts.AWAITING_REVIEW===1);
check('no_false_approval',baseline.independentReviewerCount===null&&baseline.engineeringApproved===false&&baseline.operationalRelease===false&&baseline.sapApproved===false);
check('preserve_multi_flags',baseline.cases[9].flags.includes('ANSWER_DISAGREEMENT')&&baseline.cases[9].flags.includes('CRITICAL_EDITORIAL_REVIEW'));
check('never_infer_independent_reviewers',baseline.reviewBatchSize===6&&baseline.independentReviewerCount===null);
// Metamorphic: neither submission order nor review sheet row order changes semantic results.
function invariant(name,variant){
 const got=triageHydraulicReviewBatch(benchmark,protocol,variant);
 check(name,JSON.stringify(got)===JSON.stringify(baseline));
}
invariant('order_reverse_submissions',sheets.slice().reverse());
invariant('order_rotate_submissions',[...sheets.slice(1),sheets[0]]);
invariant('order_reverse_case_rows',sheets.map(s=>({...s,rows:s.rows.slice().reverse()})));
invariant('order_rotate_case_rows',sheets.map(s=>({...s,rows:[...s.rows.slice(1),s.rows[0]]})));
// A safety warning is monotonic: adding favorable reports cannot remove it.
const positive=clone(template);
for(let i=0;i<20;i++){
 positive.rows[i].recommendedChoiceCode=benchmark.entries[i].choices[0].code;
 for(const dim of Object.keys(positive.rows[i].ratings))positive.rows[i].ratings[dim]='adequate';
}
for(let n=1;n<=20;n++){
 const expanded=[...sheets,...Array.from({length:n},()=>clone(positive))];
 const got=triageHydraulicReviewBatch(benchmark,protocol,expanded);
 check('safety_monotonic_add_'+n,[0,6,8].every(i=>got.cases[i].status==='SAFETY_HOLD'));
 check('approval_never_promoted_'+n,got.independentReviewerCount===null&&got.engineeringApproved===false);
}
// Negative cases: batch bad inputs and schema mutations.
const adversarial=[
 ['private_identity',(s)=>s[0].rows[0].reviewerName='Private'],
 ['private_serial',(s)=>s[0].rows[0].serialNumber='SERIAL-SECRET'],
 ['additional_root',(s)=>s[0].metadata='private'],
 ['approval_claim',(s)=>s[0].engineeringApproved=true],
 ['invalid_choice',(s)=>s[0].rows[0].recommendedChoiceCode='REPLACE_PUMP_NOW'],
 ['invalid_case',(s)=>s[0].rows[0].caseId='REAL-ASSET'],
 ['duplicated_case',(s)=>s[0].rows[1].caseId=s[0].rows[0].caseId],
 ['invalid_dimension',(s)=>s[0].rows[0].ratings.safety_boundary='certified'],
 ['unregistered_tag',(s)=>s[0].rows[0].issueTags=['OEM_SERIAL_123']],
 ['missing_row',(s)=>s[0].rows.pop()],
 ['wrong_nature',(s)=>s[0].nature='field_evidence'],
 ['fake_SAP',(s)=>s[0].sapApproved=true]
];
for(const [label,mutate] of adversarial){const copy=clone(sheets);mutate(copy);assertRejected('reject_'+label,copy);}
const badExport=clone(baseline);badExport.cases[0].serialNumber='PRIVATE';
check('reject_export_private_field',validateTriageExport(badExport)===false);
const falseApproval=clone(baseline);falseApproval.operationalRelease=true;
check('reject_export_false_release',validateTriageExport(falseApproval)===false);
const report={
 schema:'fmea-mining.hydraulic-synthetic-triage-stress-report.v1',
 version:'1.3.97',sourceEngineVersion:'1.3.96',synthetic:true,
 humanReviewsReceived:0,realAssetsUsed:0,operationalApprovals:0,sapChanges:0,
 scenarioSubmissions:6,scenarios:20,metamorphicChecks:4,positiveReplayExtensions:20,adversarialMutations:adversarial.length+2,
 statusCounts:baseline.statusCounts,checkedAssertions:checks.length,passedAssertions:checks.length-failures.length,
 status:failures.length?'FAIL':'PASS',failures
};
const out=path.join(root,'reports/hydraulic-synthetic-triage-stress.generated.json');
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
if(process.argv.includes('--emit-demo')){
 const demo=path.join(root,'reports/hydraulic-synthetic-triage-demo.generated.json');
 fs.writeFileSync(demo,JSON.stringify(baseline,null,2)+'\n');
}
console.log(JSON.stringify(report,null,2));process.exit(failures.length?1:0);
