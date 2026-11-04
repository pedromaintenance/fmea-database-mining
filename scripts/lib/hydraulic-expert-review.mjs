/** Public, anonymous peer-review preparation. No verified expert, real asset, or OEM approval. */
export const EXPERT_REVIEW_FIELDS=["schema","version","sourceBenchmarkVersion","nature","trainingOnly","humanIdentityVerified","engineeringApproved","operationalRelease","sapApproved","rows"];
export const EXPERT_REVIEW_ROW_FIELDS=["caseId","scenarioId","recommendedChoiceCode","ratings","issueTags"];
export const EXPERT_REVIEW_RATINGS=["unreviewed","adequate","needs_revision","critical_issue"];
export const EXPERT_REVIEW_DIMENSIONS=["safety_boundary","causal_discrimination","oem_effectivity","observability","distractor_quality"];
export const EXPERT_REVIEW_TAGS=["unsafe_action_risk","premature_cause","oem_applicability","observability_gap","answer_key_ambiguity","distractor_unrealistic","explanation_weak","editorial_other"];
const exact=(x,keys)=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k));
export function buildHydraulicPeerReviewTemplate(benchmark,protocol){
 if(benchmark?.version!=='1.3.94'||protocol?.version!=='1.3.95'||!Array.isArray(benchmark.entries)||benchmark.entries.length!==20)throw Error('incompatible_source_versions');
 return {schema:'fmea-mining.hydraulic-expert-review-sheet.v1',version:'1.3.95',sourceBenchmarkVersion:'1.3.94',
 nature:'synthetic_anonymous_editorial_feedback_only',trainingOnly:true,humanIdentityVerified:false,engineeringApproved:false,operationalRelease:false,sapApproved:false,
 rows:benchmark.entries.map(e=>({caseId:e.id,scenarioId:e.scenarioId,recommendedChoiceCode:null,
 ratings:Object.fromEntries(EXPERT_REVIEW_DIMENSIONS.map(id=>[id,'unreviewed'])),issueTags:[]}))};
}
export function validateHydraulicPeerReview(benchmark,protocol,feedback){
 const errors=[],ck=(v,k)=>{if(!v)errors.push(k)};
 ck(protocol?.schema==='fmea-mining.hydraulic-expert-review-protocol.v1'&&protocol.version==='1.3.95'&&protocol.sourceBenchmarkVersion==='1.3.94','policy_version');
 ck(protocol?.reviewRules?.noAutomaticBenchmarkAnswerUpdate===true&&protocol.reviewRules.noVerifiedExpertIdentityInPublicTool===true&&protocol.reviewRules.noPrivateFieldsOrFreeTextInExport===true&&protocol.reviewRules.noSAPOrOperatingApproval===true,'critical_policy_boundaries');
 ck(EXPERT_REVIEW_DIMENSIONS.join('|')===protocol?.dimensions?.map(x=>x.id).join('|')&&EXPERT_REVIEW_TAGS.join('|')===protocol?.issueTags?.map(x=>x.code).join('|'),'rubric_drift');
 ck(benchmark?.version==='1.3.94'&&benchmark?.entries?.length===20&&benchmark?.policy?.independentOemReviewStillRequired===true,'benchmark_base');
 if(!exact(feedback,EXPERT_REVIEW_FIELDS))return {status:'REJECTED',errors:[...errors,'root_allowlist'],reviewCompleted:false,independentlyApproved:false};
 ck(feedback.schema==='fmea-mining.hydraulic-expert-review-sheet.v1'&&feedback.version==='1.3.95'&&feedback.sourceBenchmarkVersion==='1.3.94'&&feedback.nature==='synthetic_anonymous_editorial_feedback_only','feedback_version');
 ck(feedback.trainingOnly===true&&feedback.humanIdentityVerified===false&&feedback.engineeringApproved===false&&feedback.operationalRelease===false&&feedback.sapApproved===false,'forbidden_approval_claim');
 ck(Array.isArray(feedback.rows)&&feedback.rows.length===20,'row_count');
 const sourceMap=new Map((benchmark?.entries||[]).map(x=>[x.id,x])),seen=new Set();
 let ratedCases=0,choiceDifferences=0,criticalCases=0;
 for(const [i,row] of (Array.isArray(feedback.rows)?feedback.rows:[]).entries()){
  ck(exact(row,EXPERT_REVIEW_ROW_FIELDS),'row_allowlist_'+i);
  if(!row||typeof row!=='object'||Array.isArray(row))continue;
  const b=sourceMap.get(row.caseId);
  ck(!!b&&!seen.has(row.caseId),'row_identity_'+i);seen.add(row.caseId);
  ck(row.scenarioId===b?.scenarioId,'scenario_link_'+i);
  ck(row.recommendedChoiceCode===null||!!b?.choices?.some(x=>x.code===row.recommendedChoiceCode),'invalid_recommended_choice_'+i);
  ck(exact(row.ratings,EXPERT_REVIEW_DIMENSIONS),'ratings_shape_'+i);
  const ratingValues=EXPERT_REVIEW_DIMENSIONS.map(d=>row.ratings?.[d]);
  ck(ratingValues.every(v=>EXPERT_REVIEW_RATINGS.includes(v)),'rating_out_of_range_'+i);
  ck(Array.isArray(row.issueTags)&&row.issueTags.length<=8&&new Set(row.issueTags).size===row.issueTags.length&&row.issueTags.every(t=>EXPERT_REVIEW_TAGS.includes(t)),'issue_tags_'+i);
  if(ratingValues.some(x=>x!=='unreviewed')||row.recommendedChoiceCode!==null||(row.issueTags?.length||0)>0)ratedCases++;
  if(row.recommendedChoiceCode!==null&&row.recommendedChoiceCode!==b?.expectedChoiceCode)choiceDifferences++;
  if(ratingValues.some(x=>x==='critical_issue'))criticalCases++;
 }
 ck(seen.size===20,'missing_or_duplicate_cases');
 return {status:errors.length?'REJECTED':'EDITORIAL_FEEDBACK_ONLY',errors,reviewCompleted:false,independentlyApproved:false,
 summary:{ratedCases,possibleKeyDisagreements:choiceDifferences,criticalReviewFlags:criticalCases}};
}
