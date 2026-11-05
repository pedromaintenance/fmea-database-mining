import {validateHydraulicPeerReview,EXPERT_REVIEW_DIMENSIONS} from './hydraulic-expert-review.mjs';
const isObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const exact=(x,keys)=>isObject(x)&&Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k));
export const TRIAGE_STATUSES=['AWAITING_REVIEW','SAFETY_HOLD','CRITICAL_EDITORIAL_REVIEW','ANSWER_DISAGREEMENT','REVISION_BACKLOG','NO_ISSUE_REPORTED'];
export const TRIAGE_FLAGS=['SAFETY_HOLD','CRITICAL_EDITORIAL_REVIEW','ANSWER_DISAGREEMENT','REVISION_BACKLOG'];
const RISK_TAGS=['unsafe_action_risk'];
export function triageHydraulicReviewBatch(benchmark,protocol,sheets){
 if(!Array.isArray(sheets)||sheets.length===0||sheets.length>100)throw Error('invalid_batch_size');
 if(sheets.some(x=>!isObject(x)))throw Error('invalid_sheet');
 for(const sheet of sheets){
  const checked=validateHydraulicPeerReview(benchmark,protocol,sheet);
  if(checked.status!=='EDITORIAL_FEEDBACK_ONLY'||checked.errors.length)throw Error('invalid_review_sheet:'+checked.errors.join(','));
 }
 const entries=benchmark.entries, results=[];
 for(const item of entries){
  const answers=[],flags=new Set(),counts=Object.fromEntries(EXPERT_REVIEW_DIMENSIONS.map(d=>[d,{unreviewed:0,adequate:0,needs_revision:0,critical_issue:0}]));
  let observed=0;
  for(const sheet of sheets){
   const row=sheet.rows.find(r=>r.caseId===item.id);
   if(!row)throw Error('missing_case');
   if(row.recommendedChoiceCode!==null)answers.push(row.recommendedChoiceCode);
   const seen=row.recommendedChoiceCode!==null||row.issueTags.length>0||EXPERT_REVIEW_DIMENSIONS.some(d=>row.ratings[d]!=='unreviewed');
   if(seen)observed++;
   if(row.ratings.safety_boundary==='critical_issue'||row.issueTags.some(tag=>RISK_TAGS.includes(tag)))flags.add('SAFETY_HOLD');
   if(EXPERT_REVIEW_DIMENSIONS.some(d=>d!=='safety_boundary'&&row.ratings[d]==='critical_issue'))flags.add('CRITICAL_EDITORIAL_REVIEW');
   if(EXPERT_REVIEW_DIMENSIONS.some(d=>row.ratings[d]==='needs_revision')||row.issueTags.some(t=>t!=='unsafe_action_risk'))flags.add('REVISION_BACKLOG');
   if(row.issueTags.includes('answer_key_ambiguity'))flags.add('ANSWER_DISAGREEMENT');
   for(const d of EXPERT_REVIEW_DIMENSIONS)counts[d][row.ratings[d]]++;
  }
  if(new Set(answers).size>1)flags.add('ANSWER_DISAGREEMENT');
  const priority=TRIAGE_FLAGS.find(f=>flags.has(f));
  const status=observed===0?'AWAITING_REVIEW':(priority||'NO_ISSUE_REPORTED');
  results.push({caseId:item.id,scenarioId:item.scenarioId,status,flags:TRIAGE_FLAGS.filter(f=>flags.has(f)),nonIndependentAnonymousSubmissions:observed,choiceCodesObserved:[...new Set(answers)].sort(),dimensionCounts:counts,editorialOnly:true,equipmentEvidence:false,independentlyApproved:false});
 }
 const statusCounts=Object.fromEntries(TRIAGE_STATUSES.map(s=>[s,results.filter(r=>r.status===s).length]));
 return {schema:'fmea-mining.hydraulic-editorial-triage.v1',version:'1.3.96',sourceBenchmarkVersion:'1.3.94',sourceReviewVersion:'1.3.95',nature:'synthetic_anonymous_editorial_triage_only',humanIdentityVerified:false,engineeringApproved:false,operationalRelease:false,sapApproved:false,reviewBatchSize:sheets.length,independentReviewerCount:null,statusCounts,cases:results};
}
export function validateTriageExport(value){
 const root=['schema','version','sourceBenchmarkVersion','sourceReviewVersion','nature','humanIdentityVerified','engineeringApproved','operationalRelease','sapApproved','reviewBatchSize','independentReviewerCount','statusCounts','cases'];
 if(!exact(value,root))return false;
 if(value.schema!=='fmea-mining.hydraulic-editorial-triage.v1'||value.version!=='1.3.96'||value.sourceBenchmarkVersion!=='1.3.94'||value.sourceReviewVersion!=='1.3.95'||value.nature!=='synthetic_anonymous_editorial_triage_only')return false;
 if(value.humanIdentityVerified!==false||value.engineeringApproved!==false||value.operationalRelease!==false||value.sapApproved!==false||value.independentReviewerCount!==null||!Number.isInteger(value.reviewBatchSize)||value.reviewBatchSize<1||value.reviewBatchSize>100)return false;
 if(!exact(value.statusCounts,TRIAGE_STATUSES)||!TRIAGE_STATUSES.every(s=>Number.isInteger(value.statusCounts[s])&&value.statusCounts[s]>=0))return false;
 if(!Array.isArray(value.cases)||value.cases.length!==20)return false;
 const seen=new Set();
 for(const c of value.cases){
  if(!exact(c,['caseId','scenarioId','status','flags','nonIndependentAnonymousSubmissions','choiceCodesObserved','dimensionCounts','editorialOnly','equipmentEvidence','independentlyApproved']))return false;
  if(!/^HY-DRILL-(0[1-9]|1[0-9]|20)$/.test(c.caseId)||seen.has(c.caseId)||!/^HC-DIFF-(0[1-9]|10)$/.test(c.scenarioId))return false;
  seen.add(c.caseId);
  if(!TRIAGE_STATUSES.includes(c.status)||!Array.isArray(c.flags)||new Set(c.flags).size!==c.flags.length||c.flags.some(f=>!TRIAGE_FLAGS.includes(f))||!Number.isInteger(c.nonIndependentAnonymousSubmissions)||c.nonIndependentAnonymousSubmissions<0||c.nonIndependentAnonymousSubmissions>value.reviewBatchSize)return false;
  if(!Array.isArray(c.choiceCodesObserved)||c.choiceCodesObserved.some(s=>typeof s!=='string'||!/^[A-Z_]+$/.test(s))||new Set(c.choiceCodesObserved).size!==c.choiceCodesObserved.length)return false;
  if(!exact(c.dimensionCounts,EXPERT_REVIEW_DIMENSIONS)||!EXPERT_REVIEW_DIMENSIONS.every(d=>exact(c.dimensionCounts[d],['unreviewed','adequate','needs_revision','critical_issue'])&&Object.values(c.dimensionCounts[d]).every(v=>Number.isInteger(v)&&v>=0)&&Object.values(c.dimensionCounts[d]).reduce((a,b)=>a+b,0)===value.reviewBatchSize))return false;
  if(c.editorialOnly!==true||c.equipmentEvidence!==false||c.independentlyApproved!==false)return false;
  const expected=c.nonIndependentAnonymousSubmissions===0?'AWAITING_REVIEW':TRIAGE_FLAGS.find(f=>c.flags.includes(f))||'NO_ISSUE_REPORTED';
  if(c.status!==expected)return false;
 }
 return Object.values(value.statusCounts).reduce((a,b)=>a+b,0)===20&&TRIAGE_STATUSES.every(s=>value.statusCounts[s]===value.cases.filter(c=>c.status===s).length);
}
