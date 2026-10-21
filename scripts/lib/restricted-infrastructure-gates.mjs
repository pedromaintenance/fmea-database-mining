/** Pure, OFFLINE reference model only. No server-side authentication, storage, WORM, signatures or deletion. */
import {createHash} from 'node:crypto';
export const ZERO_HASH='0'.repeat(64);
const TOKEN=/^[A-Z0-9-]{8,128}$/;
const isToken=x=>typeof x==='string'&&TOKEN.test(x);
const exact=(value,keys)=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).length===keys.length&&keys.every(k=>Object.hasOwn(value,k));
const sigPayloadKeys=['seq','eventToken','caseToken','actorToken','action','occurredAt','detailToken','previousHash'];
const eventKeys=[...sigPayloadKeys,'hash'];
const isIso=x=>typeof x==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(x)&&Number.isFinite(Date.parse(x))&&new Date(x).toISOString()===x;
function digest(e){const data=Object.fromEntries(sigPayloadKeys.map(k=>[k,e[k]]));return createHash('sha256').update('fmea-demo-event-v1\0'+JSON.stringify(data)).digest('hex');}
export function evaluateAccess(policy,ctx){
 const errors=[],check=(ok,msg)=>{if(!ok)errors.push(msg)};
 const permissions=policy.permissions?.[ctx.role]||[];
 check(policy.roles.includes(ctx.role),'unknown_role');
 check(policy.operations.includes(ctx.operation),'unknown_operation');
 check(!policy.deniedOperationsRegardlessOfRole.includes(ctx.operation),'public_export_requires_separate_approval');
 check(permissions.includes(ctx.operation),'operation_not_permitted_for_role');
 check(ctx.authenticated===true&&ctx.mfaVerified===true&&ctx.activeAccount===true,'identity_not_proven');
 check(isToken(ctx.actorToken)&&isToken(ctx.caseToken),'invalid_actor_or_case_token');
 check(ctx.actorTenant===ctx.caseTenant&&isToken(ctx.actorTenant),'tenant_scope_mismatch');
 check(ctx.assignedToCase===true,'not_assigned_to_case');
 if(ctx.operation==='review_technical')
  check(ctx.actorToken!==ctx.originatorToken,'self_technical_review');
 if(ctx.operation==='review_independent')
  check(ctx.actorToken!==ctx.originatorToken&&ctx.actorToken!==ctx.technicalReviewerToken,'non_independent_review');
 if(ctx.operation==='approve_disposal')
  check(ctx.actorToken!==ctx.originatorToken,'author_cannot_approve_disposal');
 return {allowed:errors.length===0,errors};
}
export function makeDemoEvent(policy,previous,event){
 const seq=(previous?.seq||0)+1;
 const fields={seq,eventToken:event.eventToken,caseToken:event.caseToken,actorToken:event.actorToken,action:event.action,occurredAt:event.occurredAt,detailToken:event.detailToken,previousHash:previous?.hash||ZERO_HASH};
 if(!policy.audit.allowedActions.includes(fields.action))throw Error('Unrecognized audit action');
 const out={...fields,hash:digest(fields)};
 return out;
}
export function verifyDemoChain(policy,events,externalAnchor){
 const errors=[],check=(ok,msg)=>{if(!ok)errors.push(msg)};
 check(Array.isArray(events)&&events.length>0,'no_events');
 check(typeof externalAnchor==='string'&&/^[0-9a-f]{64}$/.test(externalAnchor),'external_anchor_missing');
 if(!Array.isArray(events)||!events.length)return {valid:false,errors};
 let previousHash=ZERO_HASH,lastTime=0;const seen=new Set();
 for(let i=0;i<events.length;i++){
  const e=events[i];
  if(!exact(e,eventKeys)){errors.push('invalid_event_keys_'+i);continue}
  check(e.seq===i+1,'sequence_invalid_'+i);
  check(!seen.has(e.eventToken),'duplicate_event_token_'+i);seen.add(e.eventToken);
  check(isToken(e.eventToken)&&isToken(e.caseToken)&&isToken(e.actorToken)&&isToken(e.detailToken),'nonopaque_event_identifier_'+i);
  check(policy.audit.allowedActions.includes(e.action),'invalid_action_'+i);
  check(isIso(e.occurredAt),'invalid_time_'+i);
  const ts=Date.parse(e.occurredAt);
  check(ts>=lastTime,'nonmonotonic_time_'+i);lastTime=ts;
  check(e.previousHash===previousHash,'broken_chain_'+i);
  check(e.hash===digest(e),'event_hash_mismatch_'+i);
  previousHash=e.hash;
 }
 check(previousHash===externalAnchor,'anchor_mismatch');
 return {valid:errors.length===0,errors};
}
export function assessDisposal(policy,x){
 const errors=[],check=(ok,msg)=>{if(!ok)errors.push(msg)};
 check(x.syntheticOnly===true,'not_synthetic_simulation');
 check(x.corporatePolicyApproved===true&&x.scheduleDefined===true,'approved_schedule_missing');
 check(isIso(x.asOf)&&isIso(x.retentionEnd)&&Date.parse(x.retentionEnd)<=Date.parse(x.asOf),'retention_window_not_elapsed');
 check(x.legalHold===false,'legal_hold_prevents_disposal');
 check(x.caseStatus==='closed','case_is_not_closed');
 check(x.backupCopiesReviewed===true&&x.backupDispositionPlanApproved===true,'backup_copy_plan_missing');
 check(x.privacyReviewComplete===true&&x.oemRightsReviewComplete===true,'privacy_or_license_review_missing');
 check(x.sanitizationProgramApproved===true&&x.restrictedPlatformControlsAttested===true,'secure_disposal_controls_unverified');
 check(isToken(x.dispositionReceiptPlanToken),'disposition_receipt_plan_missing');
 check(Array.isArray(x.approvers)&&x.approvers.length===2,'dual_approval_required');
 if(Array.isArray(x.approvers)){
  check(x.approvers.map(a=>a.role).sort().join('|')===policy.retention.disposalApproverRoles.slice().sort().join('|'),'incorrect_approval_roles');
  check(x.approvers.every(a=>isToken(a.actorToken)&&a.approved===true),'invalid_approval_record');
  check(new Set(x.approvers.map(a=>a.actorToken)).size===2,'self_approval');
 }
 return {eligibleForManualDispositionReview:errors.length===0,errors,deleted:false};
}
