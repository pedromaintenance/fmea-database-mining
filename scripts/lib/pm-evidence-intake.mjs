/** Offline PM rule evidence intake. Public test envelopes ONLY.
 * This checks structure and transition claims, NOT identity, signature or evidence truth.
 * Do not call with real asset metadata or documents in public CI.
 */
export const CASE_KEYS=['schema','recordNature','classification','tenantToken','caseToken','assetToken','ruleId','bundleId','originatorToken','stage','receipts','events','release'];
export const RECEIPT_KEYS=['kind','evidenceToken','restrictedRef','licenseChecked','integrityChecked','custodyChainVerified','qualityChecked'];
export const EVENT_KEYS=['eventToken','previousEventToken','action','role','actorToken','decision','reasonRecorded','alternativesReviewed','oemEffectivityAssessed','manualRequestToken'];
export const RELEASE_KEYS=['rootCauseConfirmed','sapMappingApproved','catalogPromotionApproved','operationalReleaseApproved','publicExportAuthorized'];
const isObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const exact=(x,keys)=>isObject(x)&&Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k));
const token=x=>typeof x==='string'&&/^TEST-[A-Z0-9-]{4,119}$/.test(x);
const allKinds=['oem_effectivity','oem_procedure','field_observation','counterevidence','measurement_quality'];
const decisions={submit:'submitted',verify_custody:'verified',technical_accept:'accepted',independent_accept:'accepted',request_change_control:'request_only'};
export function assessPmIntakeCase(policy,matrix,c){
 const errors=[],ck=(ok,id)=>{if(!ok)errors.push(id)};
 if(!exact(c,CASE_KEYS))return {status:'rejected',stage:null,errors:['case_shape'],sapBlocker:null};
 ck(c.schema==='fmea-mining.pm-evidence-intake-case.v1'&&c.recordNature==='synthetic_test_only'&&c.classification==='restricted_synthetic_metadata','not_public_synthetic');
 for(const field of ['tenantToken','caseToken','assetToken','originatorToken'])ck(token(c[field]),'unsafe_identifier_'+field);
 const row=matrix.rules.find(x=>x.ruleId===c.ruleId);
 ck(!!row&&row?.bundleId===c.bundleId,'invalid_rule_bundle_link');
 ck(exact(c.release,RELEASE_KEYS)&&RELEASE_KEYS.every(x=>c.release[x]===false),'forbidden_automatic_release');
 ck(Array.isArray(c.receipts)&&c.receipts.length<=12,'receipt_list_invalid');
 ck(Array.isArray(c.events)&&c.events.length<=5,'event_list_invalid');
 let receiptTokens=new Set(),kinds=new Set();
 for(const [i,rec] of (Array.isArray(c.receipts)?c.receipts:[]).entries()){
   ck(exact(rec,RECEIPT_KEYS),'receipt_shape_'+i);
   if(!isObject(rec))continue;
   ck(allKinds.includes(rec.kind),'receipt_kind_'+i);
   ck(token(rec.evidenceToken)&&token(rec.restrictedRef),'receipt_sensitive_value_'+i);
   ck(!receiptTokens.has(rec.evidenceToken),'receipt_duplicate_'+i);
   receiptTokens.add(rec.evidenceToken);kinds.add(rec.kind);
   for(const k of ['licenseChecked','integrityChecked','custodyChainVerified','qualityChecked'])ck(typeof rec[k]==='boolean','receipt_check_missing_'+i+'_'+k);
 }
 let stage='draft',previous=null,actorByRole={originator:c.originatorToken},eventsSeen=new Set();
 for(const [i,e] of (Array.isArray(c.events)?c.events:[]).entries()){
   ck(exact(e,EVENT_KEYS),'event_shape_'+i);
   if(!isObject(e))continue;
   const transition=policy.events[i];
   ck(!!transition&&transition.from===stage&&transition.action===e.action&&transition.role===e.role,'transition_or_role_'+i);
   ck(token(e.eventToken)&&!eventsSeen.has(e.eventToken)&&e.eventToken!==c.caseToken,'duplicate_or_bad_event_token_'+i);
   ck(e.previousEventToken===previous,'broken_event_chain_'+i);
   ck(token(e.actorToken),'actor_token_invalid_'+i);
   ck(e.decision===decisions[e.action]&&typeof e.reasonRecorded==='boolean'&&typeof e.alternativesReviewed==='boolean'&&typeof e.oemEffectivityAssessed==='boolean','decision_shape_'+i);
   ck(e.manualRequestToken===null||token(e.manualRequestToken),'manual_request_token_invalid_'+i);
   if(e.action==='submit')ck(e.actorToken===c.originatorToken,'originator_mismatch');
   if(e.action==='verify_custody'){
     ck(kinds.size===allKinds.length&&allKinds.every(x=>kinds.has(x)),'missing_evidence_kind');
     ck(c.receipts.every(x=>x.licenseChecked===true&&x.integrityChecked===true&&x.custodyChainVerified===true&&x.qualityChecked===true),'failed_custody_evidence');
     ck(e.actorToken!==actorByRole.originator&&e.reasonRecorded===true,'custodian_separation_or_reason');
   }
   if(e.action==='technical_accept')ck(e.actorToken!==actorByRole.originator&&e.actorToken!==actorByRole.custodian&&e.reasonRecorded===true&&e.alternativesReviewed===true&&e.oemEffectivityAssessed===true,'technical_gate');
   if(e.action==='independent_accept')ck(![actorByRole.originator,actorByRole.custodian,actorByRole.technical_reviewer].includes(e.actorToken)&&e.reasonRecorded===true,'independent_gate');
   if(e.action==='request_change_control')ck(e.manualRequestToken!==null&&e.reasonRecorded===true&&e.manualRequestToken!==e.eventToken,'manual_change_request');
   if(e.action!=='request_change_control')ck(e.manualRequestToken===null,'premature_manual_request');
   if(e.action!=='technical_accept')ck(e.alternativesReviewed===false&&e.oemEffectivityAssessed===false,'fabricated_technical_attestation');
   actorByRole[e.role]=e.actorToken;
   eventsSeen.add(e.eventToken);previous=e.eventToken;
   stage=transition?.to??stage;
 }
 ck(c.stage===stage&&policy.stages.includes(c.stage),'claimed_stage_inconsistent');
 ck(policy.sourceMaturityVersion===matrix.version&&policy.version==='1.3.61','policy_matrix_version');
 ck(policy.boundaries.publicSyntheticOnly===true&&policy.boundaries.realCasesInRepository===0&&policy.boundaries.publicRepoMayAcceptRealCases===false,'trust_boundary');
 ck(row?.sap.autoRemapAllowed===false&&row?.approvedSapMappings===0,'sap_not_approved_in_source');
 const blocked=row?.sap.isBlocked===true;
 return {status:errors.length?'rejected':stage==='ready_for_change_control'?'eligible_for_manual_change_control_review':'pending',stage,errors,sapBlocker:blocked?row.sap.blocker:null,sapMappingApproved:false,rootCauseConfirmed:false,operationalReleaseApproved:false,catalogPromotionApproved:false};
}
