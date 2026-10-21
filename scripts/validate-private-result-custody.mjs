#!/usr/bin/env node
// v1.3.27 — 8 synthetic baseline receipts and 40 security/causality tampering scenarios.
// ALL keys are generated in memory. NO private keys, receipts or OEM data are committed.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createEphemeralTestAuthority,makeSyntheticPrivateReceipt,refreshSyntheticProofs,verifyPrivateReceipt,inspectPolicyInvariants} from './lib/private-result-attestation.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const contract=read('data/governance/private-result-custody-contract.v1.json');
const tests=read('data/quality/private-result-custody-regressions.v1.json');
const schema=read('schemas/private-staging-result-attestation.schema.json');
const integration=read('data/governance/staging-integration-contract.v1.json');
const plan=read('data/governance/staging-acceptance-plan.v1.json');
const infra=read('data/governance/restricted-infrastructure-design.v1.json');
const core=read('data/knowledge/causal-chains.v1.json');
const ontology=read('data/ontology/concepts.v1.json');
const errors=[],ck=(v,s)=>{if(!v)errors.push(s)};
errors.push(...inspectPolicyInvariants(contract,integration,plan,infra));
ck(core.records.length===24&&ontology.mechanismFamilies.length===15,'core FMEA mutated');
ck(schema.type==='object'&&schema.additionalProperties===false,'JSON schema does not restrict packet');
ck(schema.properties.version.const==='1.3.27'&&schema.properties.classification.const==='restricted','JSON schema version or classification invalid');
ck(schema.properties.recordNature.enum.includes('private_real_staging')&&schema.properties.recordNature.enum.includes('synthetic_test_only'),'Schema does not document real private boundary');
ck(schema.properties.statement.$ref==='#/$defs/statement'&&schema.$defs.statement.additionalProperties===false,'Private statement schema not strict');
ck(schema.properties.attestations.additionalProperties===false,'Attestation schema permits arbitrary content');
ck(schema.$defs.signature.properties.signature.pattern.startsWith('^'),'Signature syntax missing');
ck(Object.values(schema.properties.release.properties).every(x=>x.const===false),'Unreviewed data cannot authorize publication');
ck(tests.schema==='fmea-mining.private-result-custody-regressions.v1'&&tests.version==='1.3.27'&&tests.nature==='offline_synthetic_only','fixture nature invalid');
ck(tests.baselineCases.length===8&&tests.mutationCases.length===40&&JSON.stringify(tests.counts)===JSON.stringify({baselines:8,attacksRejected:40,total:48,realFieldEvents:0,realReviews:0,realApprovals:0}),'48 fixtures required');
const seen=new Set(),stats={baselinePassed:0,mutationsRejected:0};
const signer=(authority,type)=>authority.keys[{
 result:'TEST-KEY-SERVICE',custody:'TEST-KEY-CUSTODY',technical:'TEST-KEY-TECHNICAL',independent:'TEST-KEY-INDEPENDENT'
}[type]];
const badSignature=att=>{att.signature='A'+att.signature.slice(1)};
function alter(name,p,a){
 const custody=p.attestations.custody,tech=p.attestations.technical,ind=p.attestations.independent;
 const release=p.release;
 switch(name){
 case 'tamper_result':p.statement.probeResults[0].status='fail';break;
 case 'result_signature_invalid':badSignature(p.attestations.result);break;
 case 'result_key_unknown':p.attestations.result.keyId='TEST-KEY-NOTTRUSTED';break;
 case 'result_key_revoked':signer(a,'result').active=false;break;
 case 'result_wrong_role':signer(a,'result').role='technical_reviewer';break;
 case 'wrong_tenant':a.tenantToken='TEST-OTHER-TENANT';break;
 case 'expired_receipt':a.clock='2026-10-21T14:00:00.000Z';break;
 case 'replayed_run':a.usedRunTokens.add(p.statement.runToken);break;
 case 'missing_probe':p.statement.probeResults.pop();break;
 case 'duplicate_probe':p.statement.probeResults[1].probeId=p.statement.probeResults[0].probeId;break;
 case 'unknown_probe':p.statement.probeResults[0].probeId='TEST-UNKNOWN-PROBE';break;
 case 'unsynthetic_identity':p.statement.caseToken='REAL-CAT395-001';break;
 case 'leaked_url':p.statement.probeResults[0].privateUrl='https://test.invalid/restricted';break;
 case 'unexpected_payload':p.debugPayload={mock:true};break;
 case 'invalid_probe_status':p.statement.probeResults[0].status='approved';break;
 case 'mismatched_case_token':p.statement.caseToken='TEST-CASE-OTHER';break;
 case 'custody_signature_invalid':badSignature(custody);break;
 case 'missing_custody':delete p.attestations.custody;break;
 case 'custodian_same_originator':custody.claim.actorToken=p.statement.originatorToken;signer(a,'custody').actorToken=p.statement.originatorToken;refreshSyntheticProofs(p,a);break;
 case 'custody_digest_mismatch':custody.claim.statementDigest='deadbeef';break;
 case 'custody_license_false':custody.claim.licenseChecked=false;refreshSyntheticProofs(p,a);break;
 case 'technical_signature_invalid':badSignature(tech);break;
 case 'missing_technical':delete p.attestations.technical;break;
 case 'technical_same_originator':tech.claim.actorToken=p.statement.originatorToken;signer(a,'technical').actorToken=p.statement.originatorToken;refreshSyntheticProofs(p,a);break;
 case 'technical_alternatives_false':tech.claim.alternativesReviewed=false;refreshSyntheticProofs(p,a);break;
 case 'technical_digest_mismatch':tech.claim.custodyDigest='deadbeef';break;
 case 'independent_signature_invalid':badSignature(ind);break;
 case 'missing_independent':delete p.attestations.independent;break;
 case 'independent_same_technical':ind.claim.actorToken=tech.claim.actorToken;signer(a,'independent').actorToken=tech.claim.actorToken;refreshSyntheticProofs(p,a);break;
 case 'independent_same_originator':ind.claim.actorToken=p.statement.originatorToken;signer(a,'independent').actorToken=p.statement.originatorToken;refreshSyntheticProofs(p,a);break;
 case 'independent_digest_mismatch':ind.claim.technicalDigest='deadbeef';break;
 case 'release_authorized':release.publicExportAuthorized=true;break;
 case 'operational_release':release.operationalReleaseApproved=true;break;
 case 'root_cause_claimed':release.rootCauseConfirmed=true;break;
 case 'record_mode_real':p.recordNature='private_real_staging';break;
 case 'raw_result_data':p.statement.rawDocument='INTERNAL CONTENT';break;
 case 'missing_evidence_token':p.statement.probeResults[0].evidenceToken=null;break;
 case 'signer_identity_mismatch':signer(a,'technical').actorToken='TEST-WRONG-PERSON';break;
 case 'invalid_time_range':p.statement.expiresAt='2026-10-21T11:59:00.000Z';break;
 case 'independent_same_custodian':ind.claim.actorToken=custody.claim.actorToken;signer(a,'independent').actorToken=custody.claim.actorToken;refreshSyntheticProofs(p,a);break;
 default:throw Error('unknown mutation: '+name);
 }
}
for(const x of tests.baselineCases){
 ck(!seen.has(x.id),'duplicate baseline ID');seen.add(x.id);
 const authority=createEphemeralTestAuthority();
 const packet=makeSyntheticPrivateReceipt(contract,plan,x.scenarioId,authority);
 const out=verifyPrivateReceipt(contract,integration,packet,authority);
 ck(out.accepted===true&&out.decision===x.expected&&out.canPublish===false&&out.realCorporateReviewVerified===false,'baseline failed '+x.id+': '+out.errors.join('|'));
 if(out.accepted)stats.baselinePassed++;
}
for(const x of tests.mutationCases){
 ck(!seen.has(x.id),'duplicate mutation ID');seen.add(x.id);
 const authority=createEphemeralTestAuthority();
 const packet=makeSyntheticPrivateReceipt(contract,plan,x.scenarioId,authority);
 alter(x.mutation,packet,authority);
 const out=verifyPrivateReceipt(contract,integration,packet,authority);
 ck(out.accepted===false&&out.decision===x.expected,'malicious mutation accepted '+x.id+': '+x.mutation);
 if(!out.accepted)stats.mutationsRejected++;
}
ck(stats.baselinePassed===8&&stats.mutationsRejected===40,'regression counts mismatch');
// The mock test keys may never be serialized to the repository or report.
const summary={status:errors.length?'FAIL':'OK',syntheticBaselineAttestations:stats.baselinePassed,syntheticAttacksRejected:stats.mutationsRejected,testCoverage:48,signatureAlgorithm:'Ed25519_ephemeral_mock',realCorporateIdentityVerifications:0,realResultRecords:0,actualHumanReviews:0,publicReleasesApproved:0,coreFmeaChains:core.records.length,errors:errors.slice(0,25)};
console.log(JSON.stringify(summary,null,2));process.exit(errors.length?1:0);
