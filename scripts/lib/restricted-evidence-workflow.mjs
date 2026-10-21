/** State-machine gate for restricted review. Pure functions: never read, copy or publish evidence files. */
export const expectedCaseKeys=['schema','caseNature','caseId','proposalId','stage','dataClassification','originatorId','receipts','technicalReview','independentReview','changeRequest','rootCauseConfirmed','operationalReleaseApproved','catalogPromotionApproved','publicationAuthorized'];
export const expectedReceiptKeys=['kind','evidenceToken','restrictedRef','licenseChecked','integrityChecked','custodyChainVerified','qualityChecked','oemEffectivityConfirmed'];
const onlyKeys=(x,allowed)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).every(k=>allowed.includes(k))&&allowed.every(k=>Object.hasOwn(x,k));
const opaque=/^[A-Z0-9-]{8,128}$/;
const forbiddenPattern=/(https?:\/\/|www\.|sharepoint|s3:\/\/|file:\/\/|\\\\|\/mnt\/|\/home\/)/i;
function baseErrors(policy,c){
 const errors=[],check=(condition,message)=>{if(!condition)errors.push(message)};
 check(onlyKeys(c,expectedCaseKeys),'Unexpected or missing case fields; no raw evidence allowed');
 if(!c||typeof c!=='object')return errors;
 check(c.schema==='fmea-mining.restricted-evidence-case.v1','Invalid case schema');
 check(['synthetic_test_only','restricted_real_case'].includes(c.caseNature),'Invalid evidence nature');
 check(opaque.test(c.caseId||'')&&opaque.test(c.originatorId||''),'Case identity must be opaque');
 check(policy.scope.proposalIds.includes(c.proposalId),'Unknown proposal');
 check(policy.stageOrder.includes(c.stage),'Invalid source stage');
 check(c.dataClassification==='restricted','Data classification must be restricted');
 for(const k of ['rootCauseConfirmed','operationalReleaseApproved','catalogPromotionApproved','publicationAuthorized'])
  check(c[k]===false,'No automatic cause, operational, catalog, or publication approval: '+k);
 check(Array.isArray(c.receipts)&&c.receipts.length<=24,'Invalid evidence receipt list');
 const tokens=new Set();
 for(const rec of Array.isArray(c.receipts)?c.receipts:[]){
  check(onlyKeys(rec,expectedReceiptKeys),'Receipt may not include attachments or raw case metadata');
  if(!rec||typeof rec!=='object')continue;
  check(policy.evidenceKinds.includes(rec.kind),'Invalid evidence class');
  check(opaque.test(rec.evidenceToken||'')&&opaque.test(rec.restrictedRef||'')&&!forbiddenPattern.test(rec.restrictedRef||''),'Receipt needs opaque restricted token, not URL/path/content');
  check(!tokens.has(rec.evidenceToken),'Duplicate evidence token');tokens.add(rec.evidenceToken);
  for(const f of ['licenseChecked','integrityChecked','custodyChainVerified','qualityChecked'])
   check(typeof rec[f]==='boolean','Receipt check must be explicit boolean: '+f);
  check([true,false,null].includes(rec.oemEffectivityConfirmed),'OEM effectivity flag invalid');
 }
 const t=c.technicalReview||{},i=c.independentReview||{},change=c.changeRequest||{};
 check(onlyKeys(t,['reviewerId','decision','reasonRecorded','oemEffectivityAssessment','alternativeHypothesesReviewed']),'Unrecognized technical review payload');
 check(onlyKeys(i,['reviewerId','decision','reasonRecorded']),'Unrecognized independent review payload');
 check(onlyKeys(change,['requestToken','registered','manualApprovalPending']),'Unrecognized change-control payload');
 check(['pending','accepted_for_change_control_review','rejected'].includes(t.decision),'Invalid technical decision');
 check(['pending','accepted_for_change_control_review','rejected'].includes(i.decision),'Invalid independent decision');
 return errors;
}
export function assessRestrictedTransition(policy,c,action){
 const errors=baseErrors(policy,c),check=(ok,msg)=>{if(!ok)errors.push(msg)};
 if(!c||typeof c!=='object')return {allowed:false,errors};
 const edge=policy.transitionRoles.find(t=>t.from===action.from&&t.to===action.to);
 check(!!edge,'Illegal stage transition');
 check(c.stage===action.from,'Source stage differs from persisted state');
 check(edge?.role===action.actorRole,'Separation of roles violated');
 check(opaque.test(action.actorId||''),'Actor reference missing/not opaque');
 if(['custody_verified','technical_reviewed','independent_reviewed','ready_for_change_control'].includes(action.to)){
  const kinds=new Set((c.receipts||[]).map(x=>x.kind));
  for(const kind of policy.gateRequirements.custody_verified.allKinds)check(kinds.has(kind),'Missing required evidence category: '+kind);
  for(const rec of c.receipts||[]){
   check(rec.licenseChecked===true&&rec.integrityChecked===true&&rec.custodyChainVerified===true&&rec.qualityChecked===true,'Unverified receipt or custody');
   if(rec.kind==='oem_effectivity'||rec.kind==='oem_procedure')check(rec.oemEffectivityConfirmed===true,'Applicable OEM literature not verified');
  }
 }
 if(['technical_reviewed','independent_reviewed','ready_for_change_control'].includes(action.to)){
  const t=c.technicalReview||{};
  check(t.reviewerId===action.actorId || action.to!=='technical_reviewed','Technical reviewer actor mismatch');
  check(t.reviewerId!==c.originatorId&&opaque.test(t.reviewerId||''),'Author cannot be technical reviewer');
  check(t.decision==='accepted_for_change_control_review'&&t.reasonRecorded===true&&t.oemEffectivityAssessment==='checked_for_applicability'&&t.alternativeHypothesesReviewed===true,'Technical review and competing explanations not completed');
 }
 if(['independent_reviewed','ready_for_change_control'].includes(action.to)){
  const t=c.technicalReview||{},i=c.independentReview||{};
  check(i.reviewerId===action.actorId || action.to!=='independent_reviewed','Independent reviewer actor mismatch');
  check(i.reviewerId!==c.originatorId&&i.reviewerId!==t.reviewerId&&opaque.test(i.reviewerId||''),'Independent reviewer must differ from originator and technical reviewer');
  check(i.decision==='accepted_for_change_control_review'&&i.reasonRecorded===true,'Independent rationale/decision absent');
 }
 if(action.to==='ready_for_change_control'){
  const cr=c.changeRequest||{};
  check(cr.registered===true&&opaque.test(cr.requestToken||'')&&cr.manualApprovalPending===true,'Separate manual change control required');
 }
 return {allowed:errors.length===0,errors};
}
