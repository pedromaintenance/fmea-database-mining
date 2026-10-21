/**
 * OFFLINE contract harness for a possible future private staging adapter.
 * Does NOT connect to IAM, vault, logs, networks or production. Accepts TEST-* only.
 */
const TOKEN=/^TEST-[A-Z0-9-]{4,80}$/;
const ISO=/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/;
const ENVELOPE_KEYS=['schema','version','mode','runId','scenarioId','caseRef','startedAt','finishedAt','adapterId','results','status','realSecurityApproval','publicationAuthorized'];
const PROBE_KEYS=['probeId','status','evidenceToken'];
const isObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const exact=(x,keys)=>isObject(x)&&Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k));
const utc=x=>typeof x==='string'&&ISO.test(x)&&Number.isFinite(Date.parse(x))&&new Date(x).toISOString()===x;
export const expectedEnvelopeKeys=Object.freeze([...ENVELOPE_KEYS]);
export const expectedProbeKeys=Object.freeze([...PROBE_KEYS]);
export function createOfflineMockAdapter(contract){
 if(contract?.maturity!=='public_contract_and_offline_mock_only')throw Error('Only offline contract is supported');
 const defs=new Map(contract.probeDefinitions.map(x=>[x.scenarioId,new Set(x.probes.map(p=>p.id))]));
 return Object.freeze({
  adapterId:'offline_mock',
  async executeProbe(query){
   if(!exact(query,['scenarioId','probeId','caseRef','correlationId','syntheticOnly'])||query.syntheticOnly!==true||!TOKEN.test(query.caseRef)||!TOKEN.test(query.correlationId)||!defs.get(query.scenarioId)?.has(query.probeId))
    throw Error('Mock refuses unknown/non-synthetic probe');
   const position=contract.probeDefinitions.find(x=>x.scenarioId===query.scenarioId).probes.findIndex(x=>x.id===query.probeId);
   return {scenarioId:query.scenarioId,probeId:query.probeId,caseRef:query.caseRef,correlationId:query.correlationId,status:'pass',evidenceToken:'TEST-EVIDENCE-'+String(position+1).padStart(2,'0')};
  }
 });
}
export async function makeSyntheticScenarioResult(contract,adapter,scenarioId,{failProbeId=null}={}){
 if(adapter?.adapterId!=='offline_mock')throw Error('No live adapter accepted by public mock runner');
 const item=contract.probeDefinitions.find(x=>x.scenarioId===scenarioId);
 if(!item)throw Error('Unknown staging scenario');
 if(failProbeId&&!item.probes.some(x=>x.id===failProbeId))throw Error('Unknown failure target');
 const caseRef='TEST-CASE-001',correlationId='TEST-CORR-001';
 const results=[];
 for(const p of item.probes){
  const result=await adapter.executeProbe({scenarioId,probeId:p.id,caseRef,correlationId,syntheticOnly:true});
  if(!exact(result,['scenarioId','probeId','caseRef','correlationId','status','evidenceToken'])||result.scenarioId!==scenarioId||result.probeId!==p.id||result.caseRef!==caseRef||result.correlationId!==correlationId)
   throw Error('Mock output cannot be reidentified or coerced');
  results.push({probeId:p.id,status:p.id===failProbeId?'fail':result.status,evidenceToken:result.evidenceToken});
 }
 return {schema:'fmea-mining.staging-probe-result.v1',version:'1.3.26',mode:'synthetic_offline_only',runId:'TEST-RUN-001',scenarioId,caseRef,startedAt:'2026-10-21T12:00:00.000Z',finishedAt:'2026-10-21T12:01:00.000Z',adapterId:'offline_mock',results,status:'simulation_only',realSecurityApproval:false,publicationAuthorized:false};
}
export function validateSyntheticEnvelope(contract,envelope){
 const errors=[],ck=(ok,msg)=>{if(!ok)errors.push(msg)};
 ck(exact(envelope,ENVELOPE_KEYS),'envelope_unexpected_fields_or_missing');
 if(!isObject(envelope))return {valid:false,errors,decision:'reject'};
 ck(envelope.schema==='fmea-mining.staging-probe-result.v1'&&envelope.version==='1.3.26','invalid_envelope_version');
 ck(envelope.mode==='synthetic_offline_only'&&envelope.adapterId==='offline_mock'&&envelope.status==='simulation_only','forbidden_real_mode_or_approval');
 ck(envelope.realSecurityApproval===false&&envelope.publicationAuthorized===false,'false_security_or_publication_approval');
 ck(TOKEN.test(envelope.runId||'')&&TOKEN.test(envelope.caseRef||''),'non_synthetic_identity');
 ck(utc(envelope.startedAt)&&utc(envelope.finishedAt)&&Date.parse(envelope.finishedAt)>=Date.parse(envelope.startedAt),'invalid_time_order');
 const definition=contract.probeDefinitions.find(x=>x.scenarioId===envelope.scenarioId);
 ck(!!definition,'unknown_scenario');
 ck(Array.isArray(envelope.results)&&envelope.results.length===4,'not_four_probe_results');
 const allowed=contract.resultEnvelope.allowedProbeOutcomes;
 const required=definition?.probes.map(x=>x.id)||[];
 const ids=new Set(),tokens=new Set();
 for(const p of Array.isArray(envelope.results)?envelope.results:[]){
  ck(exact(p,PROBE_KEYS),'probe_payload_leak_or_missing');
  if(!isObject(p))continue;
  ck(required.includes(p.probeId),'unknown_probe');
  ck(!ids.has(p.probeId),'duplicate_probe');ids.add(p.probeId);
  ck(allowed.includes(p.status),'invalid_probe_outcome');
  ck(TOKEN.test(p.evidenceToken||''),'evidence_token_not_synthetic');
  ck(!tokens.has(p.evidenceToken),'duplicate_evidence_token');tokens.add(p.evidenceToken);
 }
 for(const id of required)ck(ids.has(id),'missing_required_probe');
 if(errors.length)return {valid:false,errors,decision:'reject'};
 const passed=envelope.results.every(x=>x.status==='pass');
 return {valid:true,errors:[],decision:passed?'synthetic_complete':'synthetic_incomplete',realStagingValidated:false,securityApprovalGranted:false};
}
export function validateContractSafety(contract,plan,architecture){
 const errors=[],ck=(ok,msg)=>{if(!ok)errors.push(msg)};
 ck(contract.schema==='fmea-mining.staging-integration-adapter-contract.v1'&&contract.version==='1.3.26','contract_invalid');
 ck(contract.maturity==='public_contract_and_offline_mock_only'&&contract.sourceAcceptancePlan==='data/governance/staging-acceptance-plan.v1.json','maturity_or_source_invalid');
 ck(contract.implementations.offlineMockImplemented===true&&Object.entries(contract.implementations).filter(([k])=>k!=='offlineMockImplemented').every(([,v])=>v===false),'live_impl_fabricated');
 ck(contract.executionModes.publicRepository==='synthetic_offline_only'&&contract.executionModes.publicMayAcceptRealResults===false&&contract.executionModes.publicMayHoldLiveEndpoints===false&&contract.executionModes.publicMayHoldTokensOrCredentials===false,'public_boundary_relaxed');
 ck(contract.probeDefinitions.length===8,'missing_staging_scenarios');
 for(const s of plan.domains){
  const def=contract.probeDefinitions.find(x=>x.scenarioId===s.scenarioId);
  ck(def&&def.domainId===s.id&&def.owner===s.owner,'scenario_mapping_mismatch');
  ck(JSON.stringify(def?.probes.map(x=>x.id))===JSON.stringify(s.controls.map(x=>x.key)),'probe_catalogue_diverged');
  ck(def?.probes.every(x=>x.mandatory===true),'probe_made_optional');
 }
 ck(contract.resultEnvelope.maxProbeRecords===4&&contract.resultEnvelope.syntheticRunPrefix==='TEST-'&&contract.resultEnvelope.syntheticEvidencePrefix==='TEST-','result_contract_relaxed');
 ck(contract.technicalAcceptance.allProbesMandatory===true&&contract.technicalAcceptance.privateSecurityAcceptanceRequiresSeparateHumanDecision===true&&Object.entries(contract.technicalAcceptance).filter(([,v])=>typeof v==='boolean').every(([,v])=>v===true),'acceptance_relaxed');
 ck(Object.values(contract.liveReadiness).every(v=>v===false||v===0),'fabricated_live_readiness');
 ck(Object.values(contract.humanSignoffs).every(x=>x==='pending'),'fake_human_approval');
 ck(contract.forbiddenActions.length===7&&contract.safeguards.length>=5,'data_guardrails_missing');
 ck(contract.coreFmeaChainsUnchanged===24&&contract.coreOntologyMechanismsUnchanged===15&&contract.mechanicalRootCausesConfirmed===0,'fmea_core_claim_altered');
 ck(architecture.maturity==='architecture_specification_no_live_services'&&Object.values(architecture.deployment).every(x=>x===false),'corporate_service_falsely_online');
 return errors;
}
