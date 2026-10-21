/**
 * PRIVATE staging attestation contract: OFFLINE TEST HARNESS ONLY.
 * Ed25519 demo keys are generated in volatile memory. Registry and identity binding in
 * real use MUST come from an independent corporate trust service.
 * A valid signature proves only integrity under a trusted key, not factual accuracy.
 */
import {generateKeyPairSync,sign,verify,createHash} from 'node:crypto';
const TOKEN=/^[A-Z0-9-]{8,128}$/;
const TEST=/^TEST-[A-Z0-9-]{3,123}$/;
const WHO=['result','custody','technical','independent'];
const claims={
 custody:['statementDigest','actorToken','reviewedAt','custodyComplete','licenseChecked','integrityChecked'],
 technical:['statementDigest','custodyDigest','actorToken','reviewedAt','decision','alternativesReviewed','oemEffectivityConsidered'],
 independent:['statementDigest','custodyDigest','technicalDigest','actorToken','reviewedAt','decision','independentReviewComplete']
};
const STATEMENT_KEYS=['schema','runToken','tenantToken','caseToken','originatorToken','scenarioId','sourceAdapterId','issuedAt','expiresAt','probeResults'];
const PACKET_KEYS=['schema','version','recordNature','classification','statement','attestations','release'];
const RESULT_KEYS=['keyId','signature'],SIGNED_KEYS=['keyId','signature','claim'],PROBE_KEYS=['probeId','status','evidenceToken'];
export const SIGNING_TYPES=Object.freeze([...WHO]);
const isObj=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const exact=(x,fields)=>isObj(x)&&Object.keys(x).length===fields.length&&fields.every(k=>Object.hasOwn(x,k));
const stable=x=>Array.isArray(x)?'['+x.map(stable).join(',')+']':isObj(x)?'{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+stable(x[k])).join(',')+'}':JSON.stringify(x);
const digest=x=>createHash('sha256').update('fmea-private-staging-demo-digest-v1\0'+stable(x)).digest('hex');
const signedMessage=(type,payload)=>Buffer.from('fmea-private-staging-demo-'+type+'-v1\0'+stable(payload),'utf8');
const utc=x=>typeof x==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(x)&&Number.isFinite(Date.parse(x))&&new Date(x).toISOString()===x;
const sigText=x=>typeof x==='string'&&/^[A-Za-z0-9+/]{85,88}={0,2}$/.test(x)&&Buffer.from(x,'base64').length===64;
const safeToken=(x,synthetic)=>typeof x==='string'&& (synthetic?TEST:TOKEN).test(x);
export function createEphemeralTestAuthority(){
 const declarations={result:['TEST-KEY-SERVICE','adapter_service','TEST-ADAPTER'],
 custody:['TEST-KEY-CUSTODY','custodian','TEST-CUSTODIAN'],
 technical:['TEST-KEY-TECHNICAL','technical_reviewer','TEST-TECHNICAL'],
 independent:['TEST-KEY-INDEPENDENT','independent_reviewer','TEST-INDEPENDENT']};
 const privateKeys={},keys={};
 for(const [type,[keyId,role,actorToken]] of Object.entries(declarations)){
  const {privateKey,publicKey}=generateKeyPairSync('ed25519');
  privateKeys[type]=privateKey;
  keys[keyId]={publicKey,role,actorToken,active:true};
 }
 return {keys,privateKeys,tenantToken:'TEST-TENANT-A',clock:'2026-10-21T12:05:00.000Z',usedRunTokens:new Set(),syntheticOnly:true};
}
export function resignSyntheticPart(packet,authority,part){
 if(!WHO.includes(part))throw Error('unknown_signer');
 const claim=part==='result'?packet.statement:packet.attestations[part].claim;
 const keyId={result:'TEST-KEY-SERVICE',custody:'TEST-KEY-CUSTODY',technical:'TEST-KEY-TECHNICAL',independent:'TEST-KEY-INDEPENDENT'}[part];
 const signature=sign(null,signedMessage(part,claim),authority.privateKeys[part]).toString('base64');
 packet.attestations[part]={...packet.attestations[part],keyId,signature};
}
export function makeSyntheticPrivateReceipt(contract,stagingPlan,scenarioId,authority){
 if(authority.syntheticOnly!==true)throw Error('mock_authority_only');
 const definition=stagingPlan.domains.find(d=>d.scenarioId===scenarioId);
 if(!definition)throw Error('scenario_not_found');
 const statement={
  schema:'fmea-mining.private-staging-result-statement.v1',
  runToken:'TEST-RUN-001',tenantToken:'TEST-TENANT-A',caseToken:'TEST-CASE-001',
  originatorToken:'TEST-ORIGINATOR',scenarioId,sourceAdapterId:'TEST-ADAPTER',
  issuedAt:'2026-10-21T12:00:00.000Z',expiresAt:'2026-10-21T13:00:00.000Z',
  probeResults:definition.controls.map((v,i)=>({probeId:v.key,status:'pass',evidenceToken:'TEST-PROOF-'+String(i+1).padStart(2,'0')}))
 };
 const statementDigest=digest(statement);
 const custody={statementDigest,actorToken:'TEST-CUSTODIAN',reviewedAt:'2026-10-21T12:01:00.000Z',custodyComplete:true,licenseChecked:true,integrityChecked:true};
 const custodyDigest=digest(custody);
 const technical={statementDigest,custodyDigest,actorToken:'TEST-TECHNICAL',reviewedAt:'2026-10-21T12:02:00.000Z',decision:'reviewed_for_change_board',alternativesReviewed:true,oemEffectivityConsidered:true};
 const technicalDigest=digest(technical);
 const independent={statementDigest,custodyDigest,technicalDigest,actorToken:'TEST-INDEPENDENT',reviewedAt:'2026-10-21T12:03:00.000Z',decision:'reviewed_for_change_board',independentReviewComplete:true};
 const packet={
  schema:'fmea-mining.private-staging-result-attestation.v1',version:'1.3.27',recordNature:'synthetic_test_only',classification:'restricted',statement,
  attestations:{
   result:{keyId:'TEST-KEY-SERVICE',signature:''},
   custody:{claim:custody,keyId:'TEST-KEY-CUSTODY',signature:''},
   technical:{claim:technical,keyId:'TEST-KEY-TECHNICAL',signature:''},
   independent:{claim:independent,keyId:'TEST-KEY-INDEPENDENT',signature:''}
  },
  release:{publicExportAuthorized:false,operationalReleaseApproved:false,rootCauseConfirmed:false,catalogPromotionApproved:false}
 };
 for(const role of WHO)resignSyntheticPart(packet,authority,role);
 return packet;
}
export function verifyPrivateReceipt(policy,contract,packet,trust,{publicHarness=true}={}){
 const errors=[],ck=(ok,msg)=>{if(!ok)errors.push(msg)};
 const isSynthetic=packet?.recordNature==='synthetic_test_only';
 ck(exact(packet,PACKET_KEYS),'invalid_packet_shape');
 if(!isObj(packet))return {accepted:false,decision:'reject',errors};
 ck(packet.schema==='fmea-mining.private-staging-result-attestation.v1'&&packet.version==='1.3.27'&&packet.classification==='restricted','wrong_packet_version_or_classification');
 ck(publicHarness?isSynthetic: ['synthetic_test_only','private_real_staging'].includes(packet.recordNature),'real_case_not_allowed_in_public_harness');
 ck(exact(packet.release,['publicExportAuthorized','operationalReleaseApproved','rootCauseConfirmed','catalogPromotionApproved'])&&Object.values(packet.release||{}).every(v=>v===false),'approval_not_permitted');
 const statement=packet.statement||{};
 ck(exact(statement,STATEMENT_KEYS),'statement_has_unapproved_fields');
 const expectedScenario=contract.probeDefinitions.find(d=>d.scenarioId===statement.scenarioId);
 ck(!!expectedScenario,'unknown_scenario');
 ck(statement.schema==='fmea-mining.private-staging-result-statement.v1','wrong_statement_schema');
 for(const k of ['runToken','tenantToken','caseToken','originatorToken','sourceAdapterId'])ck(safeToken(statement[k],publicHarness),'bad_or_identifying_reference_'+k);
 ck(statement.tenantToken===trust?.tenantToken,'wrong_tenant');
 ck(!trust?.usedRunTokens?.has(statement.runToken),'replay_detected');
 ck(utc(statement.issuedAt)&&utc(statement.expiresAt)&&utc(trust?.clock)&&Date.parse(statement.issuedAt)<=Date.parse(trust.clock)&&Date.parse(statement.expiresAt)>Date.parse(trust.clock)&&Date.parse(statement.expiresAt)>Date.parse(statement.issuedAt),'expired_or_invalid_time');
 ck(Array.isArray(statement.probeResults)&&statement.probeResults.length===4,'probe_count_mismatch');
 const probes=new Set(),tokens=new Set(),expectedIds=expectedScenario?.probes.map(p=>p.id)||[];
 for(const q of Array.isArray(statement.probeResults)?statement.probeResults:[]){
  ck(exact(q,PROBE_KEYS),'probe_has_raw_or_missing_fields');
  if(!isObj(q))continue;
  ck(expectedIds.includes(q.probeId),'unknown_probe');
  ck(!probes.has(q.probeId),'duplicate_probe');probes.add(q.probeId);
  ck(safeToken(q.evidenceToken,publicHarness),'bad_evidence_reference');
  ck(!tokens.has(q.evidenceToken),'duplicate_evidence_reference');tokens.add(q.evidenceToken);
  ck(q.status==='pass','probe_not_passing');
 }
 for(const key of expectedIds)ck(probes.has(key),'missing_required_probe_'+key);
 const att=packet.attestations||{};
 ck(exact(att,WHO),'missing_or_extra_attestation');
 const typemap=policy.trustModel.roles;
 const actorTokens={};
 for(const type of WHO){
  const r=att[type],simple=type==='result';
  ck(exact(r,simple?RESULT_KEYS:SIGNED_KEYS),'invalid_signed_record_'+type);
  if(!isObj(r))continue;
  const key=trust?.keys?.[r.keyId];
  ck(safeToken(r.keyId,publicHarness)&&key!==undefined,'untrusted_key_'+type);
  ck(key?.active===true,'revoked_signing_key_'+type);
  ck(key?.role===typemap[type],'signer_role_mismatch_'+type);
  const payload=simple?statement:r.claim;
  ck(sigText(r.signature),'signature_encoding_invalid_'+type);
  let signatureOK=false;
  try{signatureOK=!!key?.publicKey&&sigText(r.signature)&&verify(null,signedMessage(type,payload),key.publicKey,Buffer.from(r.signature,'base64'));}catch{}
  ck(signatureOK,'signature_invalid_'+type);
  if(simple)ck(key?.actorToken===statement.sourceAdapterId,'source_adapter_identity_mismatch');
  else{
   ck(exact(payload,claims[type]),'claim_fields_invalid_'+type);
   ck(key?.actorToken===payload?.actorToken,'actor_not_bound_to_key_'+type);
   ck(safeToken(payload?.actorToken,publicHarness),'invalid_reviewer_token_'+type);
   ck(utc(payload?.reviewedAt)&&Date.parse(payload.reviewedAt)<=Date.parse(trust.clock),'invalid_reviewer_time_'+type);
   actorTokens[type]=payload?.actorToken;
  }
 }
 const custody=att.custody?.claim||{},tech=att.technical?.claim||{},ind=att.independent?.claim||{};
 const statementDigest=digest(statement),custodyDigest=digest(custody),techDigest=digest(tech);
 ck(custody.statementDigest===statementDigest&&tech.statementDigest===statementDigest&&ind.statementDigest===statementDigest,'statement_digest_not_bound');
 ck(tech.custodyDigest===custodyDigest&&ind.custodyDigest===custodyDigest,'custody_digest_not_bound');
 ck(ind.technicalDigest===techDigest,'technical_review_digest_not_bound');
 ck(custody.custodyComplete===true&&custody.licenseChecked===true&&custody.integrityChecked===true,'custody_not_verified');
 ck(tech.decision==='reviewed_for_change_board'&&tech.alternativesReviewed===true&&tech.oemEffectivityConsidered===true,'technical_review_incomplete');
 ck(ind.decision==='reviewed_for_change_board'&&ind.independentReviewComplete===true,'independent_review_incomplete');
 ck(actorTokens.custody!==statement.originatorToken&&actorTokens.technical!==statement.originatorToken&&actorTokens.independent!==statement.originatorToken,'originator_self_review');
 ck(actorTokens.independent!==actorTokens.technical&&actorTokens.independent!==actorTokens.custody,'reviewer_conflict');
 ck(utc(custody.reviewedAt)&&utc(tech.reviewedAt)&&utc(ind.reviewedAt)&&Date.parse(custody.reviewedAt)>Date.parse(statement.issuedAt)&&Date.parse(tech.reviewedAt)>Date.parse(custody.reviewedAt)&&Date.parse(ind.reviewedAt)>Date.parse(tech.reviewedAt),'review_timeline_invalid');
 const accepted=errors.length===0;
 return {accepted,decision:accepted?'eligible_for_manual_change_control_review':'reject',errors,realCorporateReviewVerified:false,realStagingApproved:false,canPublish:false,rootCauseConfirmed:false};
}
export function inspectPolicyInvariants(policy,contract,plan,infra){
 const errors=[],ck=(v,msg)=>{if(!v)errors.push(msg)};
 ck(policy.schema==='fmea-mining.private-result-custody-contract.v1'&&policy.version==='1.3.27'&&policy.maturity==='private_contract_offline_cryptographic_fixture_only','policy_identification_incorrect');
 ck(policy.sourceIntegrationContract==='data/governance/staging-integration-contract.v1.json'&&policy.sourceStagingPlan==='data/governance/staging-acceptance-plan.v1.json','policy_source_missing');
 ck(Object.values(policy.boundaries).every(v=>v===true||v===false||v===0)&&policy.boundaries.publicTestRecordsOnly===true&&policy.boundaries.realPrivateResultRecordsInPublicRepo===0&&policy.boundaries.realVerifierDeployed===false,'scope_or_real_data_boundary_relaxed');
 ck(policy.trustModel.algorithm==='Ed25519'&&policy.trustModel.trustedKeyRegistrySource==='injected_by_private_service_not_the_result_packet'&&policy.trustModel.signaturesRequired.join('|')===WHO.join('|'),'trust_model_relaxed');
 ck(policy.trustModel.privateTestKeyGeneration==='ephemeral_in_memory_only_never_persisted'&&policy.trustModel.signaturesNotProofOfTruth===true,'simulated_key_semantics_lost');
 ck(policy.evidenceRules.perScenarioProbeCount===4&&policy.evidenceRules.resultMustBindTenantCaseScenarioRun&&policy.evidenceRules.runIdReplayMustBeCheckedInPrivateService&&policy.evidenceRules.resultReviewMustBeSignedToPriorDigest,'evidence_binding_relaxed');
 ck(Object.values(policy.independentReviewRules).every(v=>v===true),'separation_of_duties_relaxed');
 ck(policy.stageOrder.length===6&&policy.stageOrder.at(-1)==='eligible_for_manual_change_control_review','automatic_approval_added');
 ck(policy.mockOnly.syntheticTokenPrefix==='TEST-'&&policy.mockOnly.actualPrivateCases===0,'mock_contamination');
 ck(policy.noDirectPublish===true&&policy.noSapLinkApproval===true&&policy.noneOfThisCertifiesOEM===true&&policy.coreChainsPreserved===24&&policy.coreMechanismsPreserved===15,'technical_or_public_release_claim');
 ck(contract.version==='1.3.26'&&contract.probeDefinitions.length===8&&contract.probeDefinitions.every(d=>d.probes.length===4),'integration_contract_changed');
 ck(plan.counts.domains===8&&plan.counts.actualStagingRuns===0&&infra.maturity==='architecture_specification_no_live_services','infrastructure_falsely_provisioned');
 return errors;
}
