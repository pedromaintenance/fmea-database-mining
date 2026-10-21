#!/usr/bin/env node
// v1.3.24 — verify corporate architecture specification + 42 entirely synthetic cases.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {evaluateAccess,makeDemoEvent,verifyDemoChain,assessDisposal} from './lib/restricted-infrastructure-gates.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const policy=read('data/governance/restricted-infrastructure-design.v1.json');
const cases=read('data/quality/restricted-infrastructure-regressions.v1.json');
const previous=read('data/governance/restricted-evidence-workflow.v1.json');
const d9=read('data/quality/oem-d9-evidence-intake.v1.json');
const original=read('data/knowledge/causal-chains.v1.json');
const ontology=read('data/ontology/concepts.v1.json');
const errors=[],check=(v,msg)=>{if(!v)errors.push(msg)};
const clone=x=>JSON.parse(JSON.stringify(x));
check(policy.schema==='fmea-mining.restricted-infrastructure-design.v1'&&policy.version==='1.3.24'&&policy.maturity==='architecture_specification_no_live_services','Invalid scope');
check(policy.sourcePolicy==='data/governance/restricted-evidence-workflow.v1.json'&&previous.stageOrder.length===6,'Unlinked previous workflow');
check(policy.deployment&&Object.values(policy.deployment).every(v=>v===false),'Unsupported claim that infrastructure is provisioned');
check(policy.architecture.length===7&&policy.architecture.every(x=>x.live===false&&x.required.length>65),'Architecture not completely pending');
check(policy.roles.length===8&&policy.operations.length===11,'Incorrect RBAC surface');
check(Object.keys(policy.permissions).sort().join('|')===policy.roles.slice().sort().join('|'),'Incomplete role permission matrix');
check(policy.roles.slice(0,5).join('|')===previous.roles.join('|'),'Five preexisting roles were changed');
for(const [role,operations] of Object.entries(policy.permissions)){
 check(operations.length>0&&operations.every(op=>policy.operations.includes(op)),'Invalid permission '+role);
 check(!operations.includes('export_public'),'Public export incorrectly approved');
}
check(policy.permissions.security_admin.join('|')==='read_audit_metadata','Security admin must not read OEM evidence');
check(policy.authRequirements&&Object.values(policy.authRequirements).every(x=>x===true),'Identity controls relaxed');
check(policy.audit.requireExternalTrustedAnchor&&policy.audit.requireAppendOnlyLogService&&policy.audit.requireIndependentTimeSource,'Event-chain deployment requirement missing');
check(policy.retention.scheduleDays===null&&policy.retention.definedByCorporateRecordsOwner===false&&policy.retention.legalHoldOverridesDeletion===true,'Retention period or legal hold guessed');
check(policy.retention.implementationStatus==='pure_eligibility_simulator_no_deletion','Deletion capability falsely asserted');
check(policy.privacyAndRights&&Object.values(policy.privacyAndRights).every(v=>v===true),'Publication or OEM rights controls omitted');
check(policy.backlog.length===5&&policy.backlog.every(x=>x.status==='not_implemented'),'Corporate rollout falsely complete');
check(policy.normativeReferences.length===2&&policy.normativeReferences.every(x=>x.url.startsWith('https://csrc.nist.gov/')),'Authority references lost');
check(original.records.length===24&&ontology.mechanismFamilies.length===15&&d9.requiredInputs.filter(x=>x.approved).length===0,'OEM or FMEA records unexpectedly approved');
check(cases.schema==='fmea-mining.restricted-infrastructure-regressions.v1'&&cases.version==='1.3.24'&&cases.nature==='synthetic_only','Fixture origin unsupported');
check(cases.authorizationCases.length===20&&cases.auditCases.length===10&&cases.retentionCases.length===12,'42 regression cases required');
const seen=new Set(),observed={allow:0,reject:0};
const baseAuth=()=>({role:'originator',operation:'create_case',actorToken:'TEST-ACTOR-1',caseToken:'TEST-CASE-1',authenticated:true,mfaVerified:true,activeAccount:true,actorTenant:'TEST-TENANT-1',caseTenant:'TEST-TENANT-1',assignedToCase:true,originatorToken:'TEST-ORIGIN',technicalReviewerToken:'TEST-TECH'});
const defaultActor={originator:'TEST-ORIGIN',custodian:'TEST-CUSTODIAN',technical_reviewer:'TEST-TECH',independent_reviewer:'TEST-INDEPENDENT',change_control_owner:'TEST-CHANGEOWNER',security_admin:'TEST-SECADMIN',records_owner:'TEST-RECORDS',privacy_officer:'TEST-PRIVACY'};
for(const t of cases.authorizationCases){
 check(!seen.has(t.id),'Duplicate case ID');seen.add(t.id);
 let c={...baseAuth(),role:t.role,operation:t.operation,actorToken:defaultActor[t.role]||'TEST-FAKE'};
 const m=t.mutation;
 if(m==='same_originator')c.actorToken=c.originatorToken;
 if(m==='same_technical_reviewer')c.actorToken=c.technicalReviewerToken;
 if(m==='no_mfa')c.mfaVerified=false;
 if(m==='not_assigned')c.assignedToCase=false;
 if(m==='wrong_tenant')c.actorTenant='TEST-OTHER-TENANT';
 if(m==='disabled_identity')c.activeAccount=false;
 if(m==='not_authenticated')c.authenticated=false;
 const val=evaluateAccess(policy,c).allowed?'allow':'reject';
 observed[val]++;check(val===t.expected,'Authorization result mismatch '+t.id);
}
const example=[
 {eventToken:'TEST-EVENT-1',caseToken:'TEST-CASE-1',actorToken:'TEST-ACTOR-1',action:'case_created',occurredAt:'2026-10-21T09:00:00.000Z',detailToken:'TEST-DETAIL-1'},
 {eventToken:'TEST-EVENT-2',caseToken:'TEST-CASE-1',actorToken:'TEST-ACTOR-2',action:'evidence_registered',occurredAt:'2026-10-21T09:01:00.000Z',detailToken:'TEST-DETAIL-2'},
 {eventToken:'TEST-EVENT-3',caseToken:'TEST-CASE-1',actorToken:'TEST-ACTOR-3',action:'custody_attested',occurredAt:'2026-10-21T09:02:00.000Z',detailToken:'TEST-DETAIL-3'}
];
const baseline=[];for(const obj of example)baseline.push(makeDemoEvent(policy,baseline.at(-1),obj));
const anchor=baseline.at(-1).hash;
function mutateAudit(kind,events){
 switch(kind){
 case 'valid':break;
 case 'tamper_event':events[1].detailToken='TEST-DETAIL-CHANGED';break;
 case 'delete_middle':events.splice(1,1);break;
 case 'swap_events':[events[0],events[1]]=[events[1],events[0]];break;
 case 'duplicate_sequence':events[1].seq=1;break;
 case 'forged_anchor':events[2].hash='f'.repeat(64);break;
 case 'embed_raw_url':events[1].rawUrl='https://test.invalid/corporate/private';break;
 case 'invalid_event_type':events[1].action='not_in_policy';break;
 case 'rehash_without_external_anchor':events[1].detailToken='TEST-DETAIL-CHANGED';events[1]=makeDemoEvent(policy,events[0],{...events[1]});events[2]=makeDemoEvent(policy,events[1],{...events[2]});break;
 case 'empty_log':events.splice(0);break;
 default:throw Error('Unknown audit mutation '+kind)
 }
}
for(const t of cases.auditCases){
 check(!seen.has(t.id),'Duplicate case ID');seen.add(t.id);
 const values=clone(baseline);mutateAudit(t.mutation,values);
 const verdict=verifyDemoChain(policy,values,anchor).valid?'allow':'reject';
 observed[verdict]++;check(verdict===t.expected,'Audit chain regression failed '+t.id);
}
const baseRetention=()=>({
 syntheticOnly:true,corporatePolicyApproved:true,scheduleDefined:true,asOf:'2026-10-21T09:00:00.000Z',retentionEnd:'2026-10-20T09:00:00.000Z',
 legalHold:false,caseStatus:'closed',backupCopiesReviewed:true,backupDispositionPlanApproved:true,privacyReviewComplete:true,oemRightsReviewComplete:true,sanitizationProgramApproved:true,restrictedPlatformControlsAttested:true,dispositionReceiptPlanToken:'TEST-DISPOSAL-PLAN',
 approvers:[{role:'records_owner',actorToken:'TEST-RECORDS',approved:true},{role:'privacy_officer',actorToken:'TEST-PRIVACY',approved:true}]
});
function mutateRetention(kind,x){
 switch(kind){
 case 'valid':return;
 case 'legal_hold':x.legalHold=true;break;
 case 'schedule_unknown':x.scheduleDefined=false;break;
 case 'before_due':x.retentionEnd='2026-11-21T09:00:00.000Z';break;
 case 'case_open':x.caseStatus='active';break;
 case 'approvers_same':x.approvers[1].actorToken=x.approvers[0].actorToken;break;
 case 'approver_missing':x.approvers.pop();break;
 case 'backup_plan_missing':x.backupDispositionPlanApproved=false;break;
 case 'disposition_receipt_missing':x.dispositionReceiptPlanToken=null;break;
 case 'privacy_review_missing':x.privacyReviewComplete=false;break;
 case 'no_live_platform':x.restrictedPlatformControlsAttested=false;break;
 case 'policy_not_approved':x.corporatePolicyApproved=false;break;
 default:throw Error('Unknown retention mutation '+kind)
 }
}
for(const t of cases.retentionCases){
 check(!seen.has(t.id),'Duplicate case ID');seen.add(t.id);
 const c=baseRetention();mutateRetention(t.mutation,c);
 const verdict=assessDisposal(policy,c).eligibleForManualDispositionReview?'allow':'reject';
 observed[verdict]++;check(verdict===t.expected,'Retention test failed '+t.id);
}
check(observed.allow===9&&observed.reject===33,'Expected 9 allowed and 33 rejected cases, got '+JSON.stringify(observed));
check(cases.counts.allow===9&&cases.counts.reject===33,'Fixture count mismatch');
const result={status:errors.length?'FAIL':'OK',architectureComponents:policy.architecture.length,roles:policy.roles.length,authorizationCases:cases.authorizationCases.length,auditCases:cases.auditCases.length,retentionCases:cases.retentionCases.length,syntheticAllowed:observed.allow,syntheticRejected:observed.reject,realCases:0,productionAccessConfigured:false,realImmutableLogConfigured:false,operationalDisposalEnabled:false,approvedCoreChanges:0,errors:errors.slice(0,30)};
console.log(JSON.stringify(result,null,2));process.exit(errors.length?1:0);
