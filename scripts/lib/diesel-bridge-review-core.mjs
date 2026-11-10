/** Portable fail-closed reviewer output contract: Node and standalone browser share this code. */
export const REVIEW_RELATIONS=['INDEPENDENT','SHARED_CONTEXT','POSSIBLE_COUPLING','MEASUREMENT_ARTIFACT','UNDETERMINED'];
export const REVIEW_RATINGS=['unreviewed','adequate','needs_revision','critical_issue'];
export const REVIEW_DIMENSIONS=['mechanismCoherence','causalBoundary','oemApplicability','evidenceDiscrimination','operationalSafety'];
export const REVIEW_TAGS=['premature_causal_link','unsupported_oem_effectivity','mechanical_inconsistency','weak_counterevidence','sampling_provenance_gap','instrumentation_ambiguity','unsafe_operational_implication','other_editorial_issue'];
const isRecord=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const exact=(obj,fields)=>isRecord(obj)&&Object.keys(obj).sort().join('|')===[...fields].sort().join('|');
const rowFields=['alternativeId','relationSuggestion','ratings','issueTags'];
const topFields=['schema','version','bridgeVersion','sourceSha256','nature','reviewerIdentityVerified','humanReviewCertified','engineeringApproval','operationRelease','sapApproval','rows'];
export function createEmptyDieselReview(ids,digest){
 if(!Array.isArray(ids)||ids.length!==18||!ids.every(x=>/^BR-S0[1-6]-[ABC]$/.test(x))||typeof digest!=='string'||!(/^[a-f0-9]{64}$/.test(digest)))throw Error('Refusing invalid source fingerprint or identifiers');
 return {schema:'fmea-mining.diesel-bridge-review-sheet.v1',version:'1.4.17',bridgeVersion:'1.4.16',sourceSha256:digest,
 nature:'anonymous_editorial_opinion_not_authenticated_expert_review',
 reviewerIdentityVerified:false,humanReviewCertified:false,engineeringApproval:false,operationRelease:false,sapApproval:false,
 rows:ids.map(alternativeId=>({alternativeId,relationSuggestion:null,ratings:Object.fromEntries(REVIEW_DIMENSIONS.map(k=>[k,'unreviewed'])),issueTags:[]}))};
}
export function validateDieselReview(obj,ids,digest){
 const errors=[],ck=(yes,key)=>{if(!yes)errors.push(key)};
 ck(exact(obj,topFields),'top_level_allowlist');
 if(!isRecord(obj))return errors;
 ck(obj.schema==='fmea-mining.diesel-bridge-review-sheet.v1'&&obj.version==='1.4.17'&&obj.bridgeVersion==='1.4.16','versions');
 ck(typeof digest==='string'&&/^[a-f0-9]{64}$/.test(digest)&&obj.sourceSha256===digest,'fingerprint');
 ck(obj.nature==='anonymous_editorial_opinion_not_authenticated_expert_review','nature');
 ck(obj.reviewerIdentityVerified===false&&obj.humanReviewCertified===false&&obj.engineeringApproval===false&&obj.operationRelease===false&&obj.sapApproval===false,'no_implied_authority');
 ck(Array.isArray(ids)&&ids.length===18,'expected_ids');
 ck(Array.isArray(obj.rows)&&obj.rows.length===18,'row_count');
 for(let i=0;i<18;i++){
  const x=Array.isArray(obj.rows)?obj.rows[i]:null;
  ck(exact(x,rowFields),'row_allowlist_'+i);
  if(!isRecord(x))continue;
  ck(x.alternativeId===ids?.[i],'row_order_id_'+i);
  ck(x.relationSuggestion===null||REVIEW_RELATIONS.includes(x.relationSuggestion),'relation_'+i);
  ck(exact(x.ratings,REVIEW_DIMENSIONS),'rating_keys_'+i);
  if(isRecord(x.ratings))for(const d of REVIEW_DIMENSIONS)ck(REVIEW_RATINGS.includes(x.ratings[d]),'rating_'+i+'_'+d);
  ck(Array.isArray(x.issueTags)&&x.issueTags.length<=8&&x.issueTags.every(v=>REVIEW_TAGS.includes(v))&&new Set(x.issueTags).size===x.issueTags.length,'tags_'+i);
 }
 return errors;
}
export function assessDieselReview(obj,ids,digest){
 const errors=validateDieselReview(obj,ids,digest);
 if(errors.length)return {status:'INVALID_EDITORIAL_FEEDBACK',errors};
 const completed=obj.rows.filter(r=>r.relationSuggestion!==null&&REVIEW_DIMENSIONS.every(d=>r.ratings[d]!=='unreviewed')).length;
 const urgent=obj.rows.filter(r=>Object.values(r.ratings).includes('critical_issue')||r.issueTags.includes('unsafe_operational_implication')).map(r=>r.alternativeId);
 const concerns=obj.rows.filter(r=>r.issueTags.length||Object.values(r.ratings).some(x=>x==='needs_revision'||x==='critical_issue')).map(r=>r.alternativeId);
 return {status:'EDITORIAL_FEEDBACK_ONLY',errors:[],completeRows:completed,totalRows:18,needsManualReview:concerns,criticalSafetyFlags:urgent,
 verifiedExpertReviews:0,independentReviewerIdentities:0,operationalApprovals:0,automaticChangesToDossier:0};
}
