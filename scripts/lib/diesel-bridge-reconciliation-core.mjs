/** Strict local comparison of two anonymous editorial review JSONs.
 * Shared across browser, Node CLI and adversarial QA. No authority inferred. */
import {validateDieselReview,REVIEW_DIMENSIONS} from './diesel-bridge-review-core.mjs';
export const DIESEL_RECONCILIATION_STATES=['SAFETY_CONCERN','INCOMPLETE','RELATION_DISAGREEMENT','RUBRIC_DISAGREEMENT','UNDETERMINED_OR_EDITORIAL_CONCERN','CONCORDANT_NOT_APPROVED'];
const isRated=r=>r.relationSuggestion!==null&&REVIEW_DIMENSIONS.every(d=>r.ratings[d]!=='unreviewed');
const safety=r=>Object.values(r.ratings).includes('critical_issue')||r.issueTags.includes('unsafe_operational_implication');
const concerns=r=>r.issueTags.length>0||Object.values(r.ratings).some(x=>x==='needs_revision'||x==='critical_issue');
const equivalent=(l,r)=>l.rows.every((a,i)=>{
 const b=r.rows[i];
 return a.relationSuggestion===b.relationSuggestion&&REVIEW_DIMENSIONS.every(d=>a.ratings[d]===b.ratings[d])&&
 a.issueTags.length===b.issueTags.length&&a.issueTags.every(t=>b.issueTags.includes(t));
});
export function reconcileDieselBridgeReviews(left,right,ids,digest){
 const leftErrors=validateDieselReview(left,ids,digest);
 const rightErrors=validateDieselReview(right,ids,digest);
 if(leftErrors.length||rightErrors.length)
  return {schema:'fmea-mining.diesel-bridge-reconciliation-local.v1',version:'1.4.18',
   status:'INVALID_INPUT_REJECTED',errors:{left:leftErrors,right:rightErrors},rows:[],
   editorialOnly:true,verifiedIndependentReviewers:0,engineeringApprovals:0,confirmedCauses:0,automaticPromotions:0};
 const rows=ids.map((id,i)=>{
  const l=left.rows[i],r=right.rows[i],bothRated=isRated(l)&&isRated(r);
  let state;
  if(safety(l)||safety(r))state='SAFETY_CONCERN';
  else if(!bothRated)state='INCOMPLETE';
  else if(l.relationSuggestion!==r.relationSuggestion)state='RELATION_DISAGREEMENT';
  else if(REVIEW_DIMENSIONS.some(d=>l.ratings[d]!==r.ratings[d]))state='RUBRIC_DISAGREEMENT';
  else if(l.relationSuggestion==='UNDETERMINED'||r.relationSuggestion==='UNDETERMINED'||concerns(l)||concerns(r))state='UNDETERMINED_OR_EDITORIAL_CONCERN';
  else state='CONCORDANT_NOT_APPROVED';
  return {alternativeId:id,state,
    leftRelation:l.relationSuggestion,rightRelation:r.relationSuggestion,
    flags:[...new Set([...l.issueTags,...r.issueTags])].sort(),
    bothFullyRated:bothRated,requiresManualAdjudication:true};
 });
 const anyContent=left.rows.some(r=>r.relationSuggestion!==null||r.issueTags.length||REVIEW_DIMENSIONS.some(d=>r.ratings[d]!=='unreviewed'))||
                  right.rows.some(r=>r.relationSuggestion!==null||r.issueTags.length||REVIEW_DIMENSIONS.some(d=>r.ratings[d]!=='unreviewed'));
 const duplicate=equivalent(left,right);
 const status=!anyContent?'NO_REVIEW_EVIDENCE':duplicate?'POSSIBLE_DUPLICATE_SUBMISSIONS':'EDITORIAL_TRIAGE_REQUIRES_HUMAN_ADJUDICATION';
 const counts=Object.fromEntries(DIESEL_RECONCILIATION_STATES.map(state=>[state,rows.filter(x=>x.state===state).length]));
 return {schema:'fmea-mining.diesel-bridge-reconciliation-local.v1',version:'1.4.18',status,sourceSha256:digest,
   totals:{rows:18,bothFullyRated:rows.filter(x=>x.bothFullyRated).length,counts},
   rows,errors:{left:[],right:[]},editorialOnly:true,identicalStructuredSubmissions:duplicate,
   verifiedIndependentReviewers:0,engineeringApprovals:0,confirmedCauses:0,automaticPromotions:0};
}
/** Privacy-reduced local handoff: no raw opinions, ratings, tags or identities. */
export function reducedDieselReconciliation(result){
 if(!result||result.schema!=='fmea-mining.diesel-bridge-reconciliation-local.v1'||result.status==='INVALID_INPUT_REJECTED')
   throw Error('Cannot export an invalid reconciliation');
 return {schema:'fmea-mining.diesel-bridge-reconciliation-handoff.v1',version:'1.4.18',
   status:result.status,sourceSha256:result.sourceSha256,totals:result.totals,
   rows:result.rows.map(x=>({alternativeId:x.alternativeId,state:x.state})),
   verifiedIndependentReviewers:0,automaticPromotions:0,engineeringApprovals:0,operationalReleases:0,
   advisory:'Local editorial triage only; private custody and independent human adjudication still required.'};
}
