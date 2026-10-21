#!/usr/bin/env node
/** Synthetic v1.3.29 remediation/recurrence regression suite. No real tickets or OEM data. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {makeSyntheticRemediation,evaluateSyntheticRemediation,verifyCatalogPolicy} from './lib/recurrent-remediation.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const catalog=read('data/governance/recurrent-remediation-catalog.v1.json');
const cases=read('data/quality/recurrent-remediation-regressions.v1.json');
const schema=read('schemas/recurrent-remediation-plan.schema.json');
const exceptions=read('data/governance/staging-result-exception-workflow.v1.json');
const staging=read('data/governance/staging-acceptance-plan.v1.json');
const core=read('data/knowledge/causal-chains.v1.json');
const ontology=read('data/ontology/concepts.v1.json');
const errors=[],ck=(v,m)=>{if(!v)errors.push(m)};
const baseErrors=verifyCatalogPolicy(catalog,exceptions,staging);ck(baseErrors.length===0,'Policy invariants: '+baseErrors.join(' | '));
ck(core.records.length===24&&ontology.mechanismFamilies.length===15,'FMEA/ME main catalogue changed');
ck(schema.additionalProperties===false&&schema.properties.history.items.additionalProperties===false&&schema.properties.review.additionalProperties===false,'Schemas allow private evidence payload');
ck(schema.properties.release.properties.mechanicalRootCauseConfirmed.const===false&&schema.properties.syntheticClassification.enum.length===2,'Schemas allow unjustified approval');
ck(cases.schema==='fmea-mining.recurrent-remediation-regressions.v1'&&cases.version==='1.3.29'&&cases.nature==='synthetic_only','Test provenance missing');
ck(cases.baselines.length===12&&cases.mutations.length===40&&JSON.stringify(cases.counts)===JSON.stringify({positive:12,negative:40,total:52,realPlans:0,realEscalations:0,confirmedMechanicalCauses:0}),'52 fixtures required');
const mutate={
 wrong_profile:x=>{x.profileId=x.profileId==='REM-INFRA-001'?'REM-EVIDENCE-001':'REM-INFRA-001'},
 fake_real_case:x=>{x.syntheticClassification='private_real_case'},
 real_asset_serial:x=>{x.caseToken='CAT-777-REAL-SERIAL'},
 unsafe_url:x=>{x.privateUrl='https://test.invalid/private'},
 raw_document:x=>{x.rawDocument='RESTRICTED FAKE'},
 missing_original_evidence:x=>{x.originalEvidenceToken=null},
 clear_history:x=>{x.history=[]},
 duplicate_run_token:x=>{x.history[1].runToken=x.history[0].runToken},
 alter_same_run_outcome:x=>{x.history[0].outcome='pass'},
 cross_tenant_marked_recurrent:x=>{x.history[1].tenantToken='TEST-TENANT-B'},
 cross_probe_marked_recurrent:x=>{x.history[1].probeId=staging.domains[0].controls[1].key},
 cross_category_marked_recurrent:x=>{x.history[1].classification='inconclusive_evidence'},
 outside_window_marked_recurrent:x=>{x.recurrence.observed=true},
 single_run_marked_recurrent:x=>{x.recurrence.observed=true},
 recurrence_flag_suppressed:x=>{x.recurrence.observed=false},
 delete_action:x=>{x.actions.pop()},
 invent_action:x=>{x.actions.push('mark_resolved_without_work')},
 delete_expected_evidence:x=>{x.expectedEvidence.pop()},
 modify_expected_evidence:x=>{x.expectedEvidence[0]='claim_only'},
 change_owner:x=>{x.ownerRole='unsupported_owner'},
 invent_oem_limit:x=>{x.oemThreshold=3000},
 mark_root_cause:x=>{x.release.mechanicalRootCauseConfirmed=true},
 approve_security:x=>{x.release.securityApproved=true},
 approve_operation:x=>{x.release.operationalReleaseApproved=true},
 approve_publication:x=>{x.release.publicationAuthorized=true},
 approve_sap:x=>{x.release.sapNoteOpened=true},
 declare_real_review:x=>{x.review.actualReviewPerformed=true},
 originator_independent_same:x=>{x.review.independentReviewerToken=x.review.originatorToken},
 technical_independent_same:x=>{x.review.independentReviewerToken=x.review.technicalReviewerToken},
 ignore_negative_evidence:x=>{x.review.negativeEvidenceRetained=false},
 close_nonconformity:x=>{x.review.closureApproved=true},
 backdate_invalid_timestamp:x=>{x.history[0].observedAt='not-a-valid-date'},
 missing_timestamp:x=>{delete x.history[0].observedAt},
 bad_probe_id:x=>{x.probeId='NOT-A-PROBE'},
 wrong_tenant_reference:x=>{x.tenantToken='TEST-TENANT-B'},
 alter_scope_fingerprint:x=>{x.recurrence.fingerprint='WRONG'},
 fabricate_verifier_pass:x=>{x.history[0].outcome='pass'},
 omit_independent_review:x=>{x.review.independentReviewerToken=null},
 escalate_without_recurrence:x=>{x.review.manualEscalationPending=true},
 false_corporate_threshold:x=>{x.review.corporateThresholdApproved=true}
};
const overrides={duplicate_run_token:'recurrent',cross_tenant_marked_recurrent:'recurrent',cross_probe_marked_recurrent:'recurrent',cross_category_marked_recurrent:'recurrent',outside_window_marked_recurrent:'outside_window',single_run_marked_recurrent:'single',recurrence_flag_suppressed:'recurrent',escalate_without_recurrence:'single'};
const seen=new Set(),stats={passed:0,rejected:0,recurringBaselines:0};
for(const f of cases.baselines){
 ck(!seen.has(f.id),'Duplicate baseline '+f.id);seen.add(f.id);
 const plan=makeSyntheticRemediation(catalog,staging,f.classification,f.variant);
 const out=evaluateSyntheticRemediation(catalog,plan,staging);
 ck(out.valid&&out.decision===f.expected&&plan.profileId===f.profileId,'Unexpected baseline '+f.id+': '+out.errors.join('|'));
 if(out.valid)stats.passed++;
 if(out.recurring)stats.recurringBaselines++;
}
for(const f of cases.mutations){
 ck(!seen.has(f.id),'Duplicate mutation '+f.id);seen.add(f.id);
 const variant=overrides[f.mutation]||f.variant;
 const plan=makeSyntheticRemediation(catalog,staging,f.classification,variant);
 const run=mutate[f.mutation];
 if(!run){errors.push('Unknown mutation '+f.id);continue}
 run(plan);
 const out=evaluateSyntheticRemediation(catalog,plan,staging);
 ck(out.valid===false&&out.decision===f.expected,'Unsafe mutation accepted '+f.id+': '+f.mutation);
 if(!out.valid)stats.rejected++;
}
ck(stats.passed===12&&stats.rejected===40&&stats.recurringBaselines===3,'Regression outcomes wrong');
const result={status:errors.length?'FAIL':'OK',remediationProfiles:catalog.profiles.length,syntheticBaselines:stats.passed,syntheticRecurrenceBaselines:stats.recurringBaselines,adversarialRejections:stats.rejected,regressionTotal:52,actualCorporateIncidents:0,actualCorrections:0,actualReviews:0,automatedClosures:0,confirmedMechanicalCauses:0,coreFmeaChains:core.records.length,errors:errors.slice(0,30)};
console.log(JSON.stringify(result,null,2));process.exit(errors.length?1:0);
