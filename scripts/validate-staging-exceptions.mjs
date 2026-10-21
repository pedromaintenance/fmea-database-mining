#!/usr/bin/env node
// Regression gate v1.3.28. Pure synthetic checks; does not fetch private results or approve failures.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {makeSyntheticExceptionHistory,verifySyntheticExceptionHistory,makeSyntheticTrust,resealSyntheticEvents} from './lib/staging-exception-workflow.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const policy=read('data/governance/staging-result-exception-workflow.v1.json');
const test=read('data/quality/staging-exception-regressions.v1.json');
const schema=read('schemas/staging-exception-case.schema.json');
const staging=read('data/governance/staging-acceptance-plan.v1.json');
const custody=read('data/governance/private-result-custody-contract.v1.json');
const adapter=read('data/governance/staging-integration-contract.v1.json');
const core=read('data/knowledge/causal-chains.v1.json');
const errors=[],ck=(v,m)=>{if(!v)errors.push(m)};
const originalTransitions=[
 'open_triage','request_clarification','receive_clarification','order_retest','receive_retest','request_independent_review','conclude_review'
];
ck(policy.schema==='fmea-mining.staging-result-exception-workflow.v1'&&policy.version==='1.3.28'&&policy.kind==='public_synthetic_exception_workflow_no_private_case_storage','bad_version');
ck(policy.sourceReceiptContract==='data/governance/private-result-custody-contract.v1.json'&&custody.version==='1.3.27','custody_link_missing');
ck(policy.sourceStagingPlan==='data/governance/staging-acceptance-plan.v1.json'&&staging.domains.length===8,'staging_source_bad');
ck(policy.sourceIntegrationContract==='data/governance/staging-integration-contract.v1.json'&&adapter.version==='1.3.26','adapter_source_bad');
ck(JSON.stringify(policy.transitions.map(x=>x.action))===JSON.stringify(originalTransitions),'stages_modified');
ck(policy.states.length===9&&policy.roles.length===4,'state_or_role_count_changed');
ck(Object.values(policy.restrictions).every(v=>v===true),'safety_policy_relaxed');
ck(policy.ledger.realImmutabilityProvided===false&&policy.ledger.realIdentityVerified===false&&policy.ledger.realStorageProvided===false,'false_live_audit_claim');
ck(policy.realCases===0&&policy.realCorporateReviews===0&&policy.realSecurityApprovals===0&&policy.confirmedMechanicalCauses===0,'invented_case_or_cause');
ck(core.records.length===24&&policy.coreChainsUnchanged===24&&policy.ontologyMechanismsUnchanged===15,'fmea_core_changed');
ck(JSON.stringify(policy.resolutionByRetest)===JSON.stringify({pass:'retest_passed_needs_manual_security_review',fail:'closed_blocked',inconclusive:'closed_inconclusive'}),'retest_closure_rules_changed');
ck(schema.additionalProperties===false&&schema.properties.release.additionalProperties===false&&schema.properties.events.items.additionalProperties===false,'schema_allows_unexpected_data');
ck(schema.properties.version.const==='1.3.28'&&schema.properties.nature.const==='synthetic_only'&&schema.properties.release.properties.securityApproved.const===false,'schema_allows_live_or_approval');
ck(test.schema==='fmea-mining.staging-exception-regressions.v1'&&test.version==='1.3.28'&&test.nature==='synthetic_only','fixtures_not_synthetic');
ck(test.baselineCases.length===24&&test.adversarialCases.length===40&&JSON.stringify(test.counts)===JSON.stringify({validBaselineHistories:24,rejectedMutations:40,totalCases:64,realEvents:0,realReviews:0,realApprovals:0}),'64_cases_required');
const fixed=new Set(),summary={valid:0,rejected:0};
function fixture(scenarioId,category,outcome){
 const {record,trustedAnchor}=makeSyntheticExceptionHistory(policy,staging,scenarioId,category,outcome);
 const trust=makeSyntheticTrust();trust.trustedAnchor=trustedAnchor;return {record,trust};
}
const attackers={
 alter_event_no_rehash:(r)=>{r.events[2].reasonCode='changed'},
 anchor_changed:(r,t)=>{t.trustedAnchor='f'.repeat(64)},
 remove_clarification:r=>r.events.splice(2,1),
 skip_retest:r=>r.events.splice(4,1),
 delete_middle:r=>r.events.splice(3,1),
 duplicate_event:r=>r.events.splice(2,0,{...r.events[1]}),
 swap_events:r=>{[r.events[1],r.events[2]]=[r.events[2],r.events[1]]},
 same_run_id:r=>{r.events[4].retestRunToken=r.initialRunToken},
 replayed_run:(r,t)=>{t.usedRunTokens.add(r.events[4].retestRunToken)},
 unknown_actor:(r,t)=>{t.actors.independent_reviewer.actorToken='TEST-UNKNOWN-REVIEWER'},
 disabled_actor:(r,t)=>{t.actors.technical_reviewer.active=false},
 wrong_tenant:(r,t)=>{t.actors.custodian.tenantToken='TEST-OTHER-TENANT'},
 not_assigned:(r,t)=>{t.actors.technical_reviewer.assigned=false},
 independent_is_originator:(r,t)=>{t.actors.independent_reviewer.actorToken=t.actors.originator.actorToken;r.events[6].actorToken=t.actors.originator.actorToken},
 independent_is_technical:(r,t)=>{t.actors.independent_reviewer.actorToken=t.actors.technical_reviewer.actorToken;r.events[6].actorToken=t.actors.technical_reviewer.actorToken},
 independent_is_custodian:(r,t)=>{t.actors.independent_reviewer.actorToken=t.actors.custodian.actorToken;r.events[6].actorToken=t.actors.custodian.actorToken},
 wrong_action_role:r=>{r.events[1].role='custodian'},
 missing_evidence:r=>{r.events[2].evidenceToken=null},
 extra_url_field:r=>{r.events[2].sourceUrl='https://test.invalid/secret'},
 raw_document_field:r=>{r.document='TEST-FAKE-DOCUMENT'},
 actual_asset_id:r=>{r.caseToken='CAT-777-SERIAL'},
 non_synthetic_actor:r=>{r.events[6].actorToken='INTERNAL-USER'},
 invalid_time:r=>{r.events[3].occurredAt='yesterday'},
 reverse_time:r=>{r.events[3].occurredAt=r.events[2].occurredAt},
 wrong_case:r=>{r.events[4].caseToken='TEST-CASE-DIFFERENT'},
 wrong_scenario:r=>{r.events[0].scenarioId='STG-UNKNOWN-999'},
 unknown_action:r=>{r.events[2].action='bypass_review'},
 wrong_reason:r=>{r.events[1].reasonCode='incorrect'},
 missing_reason:r=>{r.events[1].reasonCode=null},
 fake_public_approval:r=>{r.release.publicReleaseAuthorized=true},
 fake_root_cause:r=>{r.release.mechanicalRootCauseConfirmed=true},
 fake_operational_release:r=>{r.release.operationalReleaseApproved=true},
 wrong_resolution:r=>{r.status=r.status==='closed_blocked'?'closed_inconclusive':'closed_blocked'},
 missing_second_review:r=>{r.events.pop()},
 unsupported_retest:r=>{r.events[4].outcome='probably_ok'},
 event_after_terminal:r=>{r.events.push({...r.events[6]})},
 missing_anchor:(r,t)=>{t.trustedAnchor=null},
 initial_status_mismatch:r=>{r.events[0].outcome='pass'},
 originator_is_technical:(r,t)=>{t.actors.technical_reviewer.actorToken=t.actors.originator.actorToken;r.events[1].actorToken=t.actors.originator.actorToken;r.events[3].actorToken=t.actors.originator.actorToken;r.events[5].actorToken=t.actors.originator.actorToken},
 original_evidence_removed:r=>{r.events[0].evidenceToken=null}
};
const preserveHash=new Set(['alter_event_no_rehash','anchor_changed','replayed_run','missing_anchor']);
for(const t of test.baselineCases){
 ck(!fixed.has(t.id),'duplicate_case_id');fixed.add(t.id);
 const {record,trust}=fixture(t.scenarioId,t.category,t.retestOutcome);
 const v=verifySyntheticExceptionHistory(policy,staging,record,trust);
 ck(v.valid&&v.status===t.expectedStatus&&t.expected==='valid_synthetic_history'&&v.realApprovalGranted===false,'baseline_invalid_'+t.id+':'+v.errors.join('|'));
 if(v.valid)summary.valid++;
}
for(const t of test.adversarialCases){
 ck(!fixed.has(t.id),'duplicate_case_id');fixed.add(t.id);
 const {record,trust}=fixture(t.scenarioId,t.category,t.retestOutcome);
 const fn=attackers[t.mutation];if(!fn){errors.push('unknown_attack_'+t.id);continue}
 fn(record,trust);
 if(!preserveHash.has(t.mutation))trust.trustedAnchor=resealSyntheticEvents(record);
 const v=verifySyntheticExceptionHistory(policy,staging,record,trust);
 ck(!v.valid&&v.status===t.expected,'unsafe_history_accepted_'+t.id+':'+t.mutation);
 if(!v.valid)summary.rejected++;
}
ck(summary.valid===24&&summary.rejected===40,'unexpected_validation_counts');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',baselineHistories:summary.valid,syntheticMutationsRejected:summary.rejected,totalTests:64,recordedRealEvents:0,actualIndependentReviews:0,confirmedMechanicalRootCauses:0,coreChains:24,errors:errors.slice(0,30)},null,2));
process.exit(errors.length?1:0);
