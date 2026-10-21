#!/usr/bin/env node
/** Staging v1.3.25 quality gate — validates plan and 52 synthetic-only cases, never connects to corporate systems. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validatePublicPlan,evaluateSyntheticDomain,assessRealStagingReadiness,controlCatalogue} from './lib/staging-acceptance-gates.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const p=read('data/governance/staging-acceptance-plan.v1.json');
const f=read('data/quality/staging-acceptance-regressions.v1.json');
const schema=read('schemas/staging-acceptance-plan.schema.json');
const infra=read('data/governance/restricted-infrastructure-design.v1.json');
const prior=read('data/governance/restricted-evidence-workflow.v1.json');
const core=read('data/knowledge/causal-chains.v1.json');
const errors=[],ck=(v,m)=>{if(!v)errors.push(m)};
const clone=x=>JSON.parse(JSON.stringify(x));
const problems=validatePublicPlan(p);ck(problems.length===0,problems.join(' | '));
ck(infra.version==='1.3.24'&&infra.architecture.length===7&&Object.values(infra.deployment).every(v=>v===false),'source architecture claims live components');
ck(prior.stageOrder.length===6&&core.records.length===24,'prior custody or FMEA altered');
ck(schema.properties?.version?.const==='1.3.25'&&schema.additionalProperties===false,'staging JSON schema invalid');
ck(schema.properties.domains.minItems===8&&schema.properties.counts.properties.actualStagingRuns.const===0,'schema permits misleading staging');
ck(f.schema==='fmea-mining.staging-acceptance-regressions.v1'&&f.version==='1.3.25'&&f.nature==='synthetic_only_no_real_staging','non-synthetic fixtures');
ck(f.fixtures?.length===40&&f.mutationCases?.length===12&&f.counts?.total===52&&f.counts.positive===8&&f.counts.negative===32&&f.counts.policyMutations===12,'invalid_regression_count');
const ids=new Set(),byScenario=new Map(),outcomes={eligible:0,blocked:0};
for(const x of f.fixtures||[]){
 ck(!ids.has(x.id),'duplicate fixture');ids.add(x.id);
 ck(x.kind==='synthetic_baseline'||x.kind==='synthetic_missing_control','invalid fixture type');
 const result=evaluateSyntheticDomain(p,x);
 const expected=x.expected;
 ck(result.decision===expected,'scenario mismatch '+x.id+' :'+result.reason?.join(','));
 if(expected==='eligible_for_manual_staging_review')outcomes.eligible++;else outcomes.blocked++;
 const name=x.scenarioId;byScenario.set(name,(byScenario.get(name)||0)+1);
 if(x.kind==='synthetic_baseline')ck(expected==='eligible_for_manual_staging_review','positive test mislabeled');
 if(x.kind==='synthetic_missing_control')ck(expected==='blocked','negative test mislabeled');
}
ck(byScenario.size===8&&[...byScenario.values()].every(n=>n===5),'five fixtures per domain required');
const mutants={
 environment_provisioned:x=>{x.environment.provisioned=true},
 real_evidence_inserted:x=>{x.domains[0].actualEvidenceReference='TEST-MADEUP'},
 release_approved:x=>{x.publicReleaseStatus='approved'},
 fake_execution:x=>{x.domains[0].actualExecutionStatus='accepted_real_staging'},
 fake_corporate_signoff:x=>{x.domains[0].corporateSignOff=true},
 confirm_root_cause:x=>{x.rootCauseConfirmationCount=1},
 approve_signoff:x=>{x.manualAcceptanceRequirements[0].status='approved'},
 delete_domain:x=>{x.domains.pop()},
 delete_control:x=>{x.domains[0].controls.pop()},
 change_source_contract:x=>{x.sourceArchitecture='WRONG'},
 remove_signoff_role:x=>{x.signoffRoles.pop()},
 relax_safety_policy:x=>{x.executionPolicy.noRealRecordsInPublicRepo=false}
};
for(const t of f.mutationCases||[]){
 ck(!ids.has(t.id),'duplicate mutator');ids.add(t.id);
 const mutant=clone(p),mutate=mutants[t.mutation];
 if(!mutate){errors.push('unknown mutation '+t.mutation);continue}
 mutate(mutant);ck(t.expected==='reject'&&validatePublicPlan(mutant).length>0,'false approval/unsafe mutation accepted '+t.id);
}
const live=assessRealStagingReadiness(p);
ck(live.ready===false&&live.canIngestRealCases===false&&live.canPublishEvidence===false&&live.blockers.length>=3,'synthetic tests used as real approval');
ck(outcomes.eligible===8&&outcomes.blocked===32,'fixture status not aligned');
const report={status:errors.length?'FAIL':'OK',acceptanceDomains:p.domains.length,requiredControls:Object.values(controlCatalogue).flat().length,baselineSynthetic:outcomes.eligible,rejectedSynthetic:outcomes.blocked,policyMutationRejections:f.mutationCases.length,syntheticTotal:52,actualStagingRuns:0,actualSecurityApprovals:0,corporateInfrastructureAvailable:false,coreFmeaChanges:0,errors:errors.slice(0,25)};
console.log(JSON.stringify(report,null,2));process.exit(errors.length?1:0);
