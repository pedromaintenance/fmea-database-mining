#!/usr/bin/env node
/** Contract-first synthetic validation; fails closed and NEVER makes network calls. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createOfflineMockAdapter,makeSyntheticScenarioResult,validateSyntheticEnvelope,validateContractSafety,expectedEnvelopeKeys,expectedProbeKeys} from './lib/staging-integration-adapter.mjs';
const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(base,p),'utf8'));
const contract=read('data/governance/staging-integration-contract.v1.json');
const tests=read('data/quality/staging-integration-regressions.v1.json');
const schema=read('schemas/staging-probe-result.schema.json');
const plan=read('data/governance/staging-acceptance-plan.v1.json');
const architecture=read('data/governance/restricted-infrastructure-design.v1.json');
const core=read('data/knowledge/causal-chains.v1.json');
const errors=[],ck=(v,m)=>{if(!v)errors.push(m)},clone=x=>JSON.parse(JSON.stringify(x));
errors.push(...validateContractSafety(contract,plan,architecture));
ck(core.records.length===24&&contract.coreFmeaChainsUnchanged===24,'Core FMEA changed');
ck(schema.type==='object'&&schema.additionalProperties===false&&expectedEnvelopeKeys.every(x=>schema.required.includes(x)),'Schema envelope changed');
ck(schema.properties.mode.const==='synthetic_offline_only'&&schema.properties.realSecurityApproval.const===false&&schema.properties.publicationAuthorized.const===false,'Schema allows real case or approval');
ck(schema.properties.results.items.additionalProperties===false&&expectedProbeKeys.every(x=>schema.properties.results.items.required.includes(x)),'Raw data can sneak into probe output');
ck(tests.schema==='fmea-mining.staging-adapter-regressions.v1'&&tests.version==='1.3.26'&&tests.nature==='synthetic_only','Fixture scope violation');
ck(tests.fixtures.length===56&&JSON.stringify(tests.counts)===JSON.stringify({positive:8,negativeOutcomes:32,invalidEnvelopes:16,total:56,realStagingRuns:0,corporateApprovals:0}),'56 fixtures expected');
const adapter=createOfflineMockAdapter(contract);
const seen=new Set(),found={synthetic_complete:0,synthetic_incomplete:0,reject:0};
const mutate={
 wrong_scenario:x=>{x.scenarioId='STG-MISSING-999'},
 missing_probe:x=>{x.results.pop()},
 extra_probe:x=>{x.results.push({probeId:'FAKE',status:'pass',evidenceToken:'TEST-EVIDENCE-09'})},
 duplicate_probe:x=>{x.results[1].probeId=x.results[0].probeId},
 real_mode:x=>{x.mode='authorized_private_staging'},
 false_synthetic_id:x=>{x.caseRef='CAT-395-REAL'},
 raw_url:x=>{x.results[0].privateUrl='https://test.invalid/private'},
 credential_field:x=>{x.accessToken='TEST-TOKEN'},
 privately_classified_data:x=>{x.results[1].assetSerial='TEST-SERIAL-REAL'},
 approval_forged:x=>{x.realSecurityApproval=true},
 publication_forged:x=>{x.publicationAuthorized=true},
 status_forged:x=>{x.status='real_staging_accepted'},
 missing_evidence:x=>{x.results[0].evidenceToken=null},
 impossible_time:x=>{x.finishedAt='2026-10-20T12:00:00.000Z'},
 unknown_adapter:x=>{x.adapterId='corporate_live'},
 malformed_result:x=>{x.results[0]=null}
};
for(const x of tests.fixtures){
 ck(!seen.has(x.id),'Duplicate fixture '+x.id);seen.add(x.id);
 ck(x.id.startsWith('TEST-')&&x.scenarioId.startsWith('STG-')&&!Object.hasOwn(x,'rawPayload'),'Fixture contains suspicious identity');
 const baseline=await makeSyntheticScenarioResult(contract,adapter,x.scenarioId,{failProbeId:x.mutation==='probe_failed'?x.targetProbe:null});
 if(x.mutation&&x.mutation!=='probe_failed'){
  ck(typeof mutate[x.mutation]==='function','Unknown mutation '+x.mutation);
  mutate[x.mutation]?.(baseline);
 }
 const got=validateSyntheticEnvelope(contract,baseline),actual=got.valid?got.decision:'reject';
 found[actual]++;ck(actual===x.expected,'Regression '+x.id+' expected '+x.expected+' got '+actual);
}
ck(found.synthetic_complete===8&&found.synthetic_incomplete===32&&found.reject===16,'Outcome distribution incorrect');
let refused=false;try{await adapter.executeProbe({scenarioId:plan.domains[0].scenarioId,probeId:plan.domains[0].controls[0].key,caseRef:'CAT-REAL-001',correlationId:'TEST-CORR-001',syntheticOnly:true});}catch{refused=true}
ck(refused,'Mock accepted a non-synthetic case identity');
refused=false;try{await makeSyntheticScenarioResult(contract,{adapterId:'corporate_live',executeProbe:()=>Promise.resolve({})},plan.domains[0].scenarioId);}catch{refused=true}
ck(refused,'Runner accepted a live adapter');
const report={status:errors.length?'FAIL':'OK',adapterKind:'offline_mock',mappedScenarios:8,probes:32,positiveSynthetic:found.synthetic_complete,negativeSynthetic:found.synthetic_incomplete,malformedRejected:found.reject,regressions:56,realStagingRuns:0,realCredentialsUsed:0,realApprovals:0,coreChains:core.records.length,errors:errors.slice(0,25)};
console.log(JSON.stringify(report,null,2));process.exit(errors.length?1:0);
