/**
 * Synthetic-only state machine: rejected/inconclusive integration probes.
 * In-memory hashes are not immutable enterprise audit logs and do not prove identity.
 */
import {createHash} from 'node:crypto';
const TOK=/^TEST-[A-Z0-9-]{3,123}$/;
const ZERO='0'.repeat(64);
const ACTORS={
 originator:'TEST-ORIGINATOR',
 technical_reviewer:'TEST-TECHNICAL',
 custodian:'TEST-CUSTODIAN',
 independent_reviewer:'TEST-INDEPENDENT'
};
const REASONS={
 open_triage:'observed_problem_needs_triage',
 request_clarification:'clarify_test_and_competing_explanations',
 receive_clarification:'explanation_received_for_review',
 order_retest:'retest_method_and_conditions_reviewed',
 receive_retest:'new_test_run_recorded',
 request_independent_review:'request_second_review'
};
const EVENT_FIELDS=['seq','eventToken','action','from','to','role','actorToken','tenantToken','caseToken','scenarioId','initialRunToken','retestRunToken','initialCategory','outcome','reasonCode','evidenceToken','occurredAt','previousHash','hash'];
const RECORD_FIELDS=['schema','version','nature','tenantToken','caseToken','scenarioId','initialRunToken','classification','status','release','events'];
const RELEASE_FIELDS=['securityApproved','publicReleaseAuthorized','mechanicalRootCauseConfirmed','operationalReleaseApproved','fmeaCorePromoted'];
const payload=e=>Object.fromEntries(EVENT_FIELDS.filter(k=>k!=='hash').map(k=>[k,e[k]]));
const hash=e=>createHash('sha256').update('fmea-exception-demo-v1\0'+JSON.stringify(payload(e))).digest('hex');
const exact=(obj,fields)=>obj!==null&&typeof obj==='object'&&!Array.isArray(obj)&&Object.keys(obj).length===fields.length&&fields.every(k=>Object.hasOwn(obj,k));
const iso=x=>typeof x==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(x)&&Number.isFinite(Date.parse(x))&&new Date(x).toISOString()===x;
export const syntheticActors=Object.freeze({...ACTORS});
export function resealSyntheticEvents(history){
 let prev=ZERO;
 for(let i=0;i<history.events.length;i++){
  const e=history.events[i];e.seq=i+1;e.previousHash=prev;e.hash=hash(e);prev=e.hash;
 }
 return prev;
}
export function makeSyntheticExceptionHistory(policy,plan,scenarioId,category,retestOutcome){
 if(!plan.domains.some(x=>x.scenarioId===scenarioId)||!policy.classification[category]||!policy.allowedRetestOutcomes.includes(retestOutcome))throw Error('Only known synthetic triage cases permitted');
 const terminal=policy.resolutionByRetest[retestOutcome];
 const record={schema:'fmea-mining.staging-exception-case.v1',version:'1.3.28',nature:'synthetic_only',tenantToken:'TEST-TENANT-A',
  caseToken:'TEST-CASE-A',scenarioId,initialRunToken:'TEST-RUN-A',classification:category,status:terminal,
  release:{securityApproved:false,publicReleaseAuthorized:false,mechanicalRootCauseConfirmed:false,operationalReleaseApproved:false,fmeaCorePromoted:false},events:[]};
 for(const [i,t] of policy.transitions.entries()){
  const e={seq:i+1,eventToken:'TEST-EVENT-'+String(i+1).padStart(2,'0'),action:t.action,from:t.from,
   to:t.to==='derived_from_retest'?terminal:t.to,role:t.role,actorToken:ACTORS[t.role],
   tenantToken:record.tenantToken,caseToken:record.caseToken,scenarioId,initialRunToken:record.initialRunToken,
   retestRunToken:t.action==='receive_retest'?'TEST-RUN-B':null,initialCategory:t.action==='open_triage'?category:null,
   outcome:t.action==='open_triage'?policy.classification[category].initialOutcome:t.action==='receive_retest'?retestOutcome:t.action==='conclude_review'?terminal:null,
   reasonCode:t.action==='conclude_review'?policy.resolutionCodes[retestOutcome]:REASONS[t.action],
   evidenceToken:'TEST-PROOF-'+String(i+1).padStart(2,'0'),
   occurredAt:new Date(Date.parse('2026-10-21T12:00:00.000Z')+i*60000).toISOString(),previousHash:ZERO,hash:''};
  record.events.push(e);
 }
 const trustedAnchor=resealSyntheticEvents(record);
 return {record,trustedAnchor};
}
export function verifySyntheticExceptionHistory(policy,plan,record,trust){
 const errors=[],ck=(v,s)=>{if(!v)errors.push(s)};
 ck(exact(record,RECORD_FIELDS),'invalid_record_shape');
 if(record===null||typeof record!=='object')return {valid:false,errors,status:'reject'};
 ck(record.schema==='fmea-mining.staging-exception-case.v1'&&record.version==='1.3.28'&&record.nature==='synthetic_only','invalid_case_identity');
 for(const k of ['tenantToken','caseToken','initialRunToken'])ck(TOK.test(record[k]||''),'non_synthetic_reference_'+k);
 ck(plan.domains.some(x=>x.scenarioId===record.scenarioId),'unknown_scenario');
 const category=policy.classification[record.classification];
 ck(!!category,'unknown_initial_problem');
 ck(exact(record.release,RELEASE_FIELDS)&&RELEASE_FIELDS.every(k=>record.release[k]===false),'forged_security_or_mechanical_approval');
 ck(Array.isArray(record.events)&&record.events.length===7,'complete_seven_step_history_required');
 ck(trust?.tenantToken===record.tenantToken,'tenant_mismatch');
 ck(trust?.usedRunTokens instanceof Set&&!trust.usedRunTokens.has(record.initialRunToken),'original_run_replayed');
 ck(typeof trust?.trustedAnchor==='string'&&/^[0-9a-f]{64}$/.test(trust.trustedAnchor),'external_anchor_missing');
 let priorState=null,prev=ZERO,lastTime=-Infinity,retest=null,retestRun=null;
 const eventTokens=new Set(),evidenceTokens=new Set(),actors=trust?.actors||{};
 for(let i=0;i<(Array.isArray(record.events)?record.events.length:0);i++){
  const e=record.events[i],rule=policy.transitions[i];
  ck(exact(e,EVENT_FIELDS),'unexpected_event_payload_'+i);
  if(!e||!rule)continue;
  ck(e.seq===i+1&&e.action===rule.action&&e.from===priorState,'step_skipped_or_reordered_'+i);
  const wanted=rule.to==='derived_from_retest'?policy.resolutionByRetest[retest]:rule.to;
  ck(e.to===wanted,'illegal_state_transition_'+i);
  ck(e.role===rule.role&&e.actorToken===actors[rule.role]?.actorToken,'incorrect_role_or_actor_'+i);
  ck(actors[rule.role]?.active===true&&actors[rule.role]?.assigned===true&&actors[rule.role]?.tenantToken===record.tenantToken,'untrusted_actor_'+i);
  ck(TOK.test(e.actorToken||''),'non_synthetic_actor_'+i);
  ck(e.tenantToken===record.tenantToken&&e.caseToken===record.caseToken&&e.scenarioId===record.scenarioId&&e.initialRunToken===record.initialRunToken,'case_run_or_tenant_mismatch_'+i);
  ck(TOK.test(e.eventToken||'')&&!eventTokens.has(e.eventToken),'duplicate_or_bad_event_token_'+i);eventTokens.add(e.eventToken);
  ck(TOK.test(e.evidenceToken||'')&&!evidenceTokens.has(e.evidenceToken),'missing_or_duplicate_evidence_'+i);evidenceTokens.add(e.evidenceToken);
  ck(iso(e.occurredAt)&&Date.parse(e.occurredAt)>lastTime&&Date.parse(e.occurredAt)<=Date.parse(trust?.clock),'invalid_event_time_'+i);
  lastTime=Date.parse(e.occurredAt);
  ck(e.previousHash===prev&&e.hash===hash(e),'event_integrity_broken_'+i);
  prev=e.hash;
  if(i===0){
   ck(e.initialCategory===record.classification&&e.outcome===category?.initialOutcome,'initial_condition_laundered');
   ck(e.retestRunToken===null&&e.reasonCode===REASONS.open_triage,'initial_origin_invalid');
  }else if(e.action==='receive_retest'){
   ck(e.initialCategory===null&&policy.allowedRetestOutcomes.includes(e.outcome),'invalid_retest_result');
   ck(TOK.test(e.retestRunToken||'')&&e.retestRunToken!==record.initialRunToken,'retest_must_be_new_run');
   ck(trust.usedRunTokens instanceof Set&&!trust.usedRunTokens.has(e.retestRunToken),'retest_run_replayed');
   ck(e.reasonCode===REASONS.receive_retest,'incorrect_retest_reason');
   retest=e.outcome;retestRun=e.retestRunToken;
  }else if(e.action==='conclude_review'){
   ck(e.initialCategory===null&&e.retestRunToken===null&&e.outcome===policy.resolutionByRetest[retest]&&e.reasonCode===policy.resolutionCodes[retest],'review_decision_does_not_match_retest');
  }else{
   ck(e.initialCategory===null&&e.retestRunToken===null&&e.outcome===null&&e.reasonCode===REASONS[e.action],'incorrect_reason_or_forged_result_'+i);
  }
  priorState=e.to;
 }
 ck(retestRun!==null,'retest_missing');
 ck(prev===trust?.trustedAnchor,'independent_anchor_mismatch');
 ck(record.status===priorState&&['closed_blocked','closed_inconclusive','retest_passed_needs_manual_security_review'].includes(record.status),'unapproved_terminal_state');
 const a=Object.fromEntries(Object.entries(actors).map(([k,v])=>[k,v.actorToken]));
 ck(Object.keys(ACTORS).every(k=>TOK.test(a[k]||'')),'role_mapping_incomplete');
 ck(new Set(Object.values(a)).size===4,'segregation_of_duties_violated');
 ck(a.independent_reviewer!==a.originator&&a.independent_reviewer!==a.technical_reviewer&&a.independent_reviewer!==a.custodian,'independent_review_conflict');
 const valid=errors.length===0;
 return {valid,status:valid?record.status:'reject',errors,actualReviewPerformed:false,realApprovalGranted:false,mechanicalRootCauseConfirmed:false};
}
export function makeSyntheticTrust(){
 return {trustedAnchor:null,tenantToken:'TEST-TENANT-A',clock:'2026-10-21T13:00:00.000Z',usedRunTokens:new Set(),
  actors:Object.fromEntries(Object.entries(ACTORS).map(([role,actorToken])=>[role,{actorToken,active:true,assigned:true,tenantToken:'TEST-TENANT-A'}]))};
}
