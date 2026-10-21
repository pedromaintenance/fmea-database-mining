#!/usr/bin/env node
/** Validate restricted-evidence policy, JSON Schema and synthetic-only regression cases. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {assessRestrictedTransition,expectedCaseKeys,expectedReceiptKeys} from './lib/restricted-evidence-workflow.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const policy=read('data/governance/restricted-evidence-workflow.v1.json');
const cases=read('data/quality/restricted-evidence-regressions.v1.json');
const schema=read('schemas/restricted-evidence-case.schema.json');
const proposals=read('data/quality/proposed-causal-chains.v1.json');
const refinements=read('data/quality/mechanism-refinements.v1.json');
const d9=read('data/quality/oem-d9-evidence-intake.v1.json');
const core=read('data/knowledge/causal-chains.v1.json');
const ontology=read('data/ontology/concepts.v1.json');
const errors=[],ck=(v,m)=>{if(!v)errors.push(m)};
const clone=x=>JSON.parse(JSON.stringify(x));
ck(policy.schema==='fmea-mining.restricted-evidence-policy.v1'&&policy.version==='1.3.23','Incorrect policy version');
ck(policy.scope.realCasesInPublicRepository===0&&policy.scope.existingCoreChains===24&&policy.scope.existingOntologyMechanisms===15&&policy.scope.automaticApproval===false,'Policy claims of approval');
ck(policy.scope.proposalIds.length===3&&policy.scope.proposalIds.every(id=>proposals.records.some(p=>p.id===id)),'Policy proposals mismatch');
ck(policy.scope.refinementKinds.length===2&&refinements.records.length===4,'Refinement coverage mismatch');
ck(core.records.length===24&&ontology.mechanismFamilies.length===15&&d9.requiredInputs.every(x=>x.approved===false),'Existing core or OEM pilot altered');
ck(policy.dataBoundary.publicForbidden.length>=6&&policy.dataBoundary.publicAllowed.length>=3&&policy.dataBoundary.restrictedRequiredControls.length>=5,'Information classification rules inadequate');
ck(policy.claimRules&&Object.values(policy.claimRules).every(v=>v===true),'Causal/operational information boundary relaxed');
ck(policy.noLiveImplementation?.doesNotProvisionIdentityOrAccess===true&&policy.noLiveImplementation?.doesNotStoreRealDocuments===true,'Misleading operational implementation claim');
ck(JSON.stringify(policy.stageOrder)===JSON.stringify(['draft','restricted_intake','custody_verified','technical_reviewed','independent_reviewed','ready_for_change_control']),'Review stages modified');
ck(policy.transitionRoles.length===5,'Missing/extra review transitions');
ck(JSON.stringify(policy.evidenceKinds)===JSON.stringify(['oem_effectivity','oem_procedure','field_observation','counterevidence','measurement_quality']),'Missing independent source category');
ck(schema.properties.caseNature.enum.includes('restricted_real_case')&&schema.properties.stage.enum.length===6,'Restricted schema incomplete');
ck(schema.additionalProperties===false&&schema.properties.receipts.items.additionalProperties===false,'Schema permits embedded evidence payloads');
ck(expectedCaseKeys.every(k=>schema.required.includes(k))&&expectedReceiptKeys.every(k=>schema.properties.receipts.items.required.includes(k)),'Library schema field mismatch');
ck(schema.properties.proposalId.enum.every(id=>policy.scope.proposalIds.includes(id)),'Schema permits extraneous proposal');
ck(cases.schema==='fmea-mining.restricted-evidence-regressions.v1'&&cases.version==='1.3.23'&&cases.nature==='synthetic_only','Regression provenance invalid');
ck(cases.caseTemplate.caseNature==='synthetic_test_only'&&cases.caseTemplate.caseId.startsWith('TEST-')&&cases.caseTemplate.originatorId.startsWith('TEST-'),'Only fake case IDs permitted');
ck(cases.caseTemplate.receipts.every(r=>r.evidenceToken.startsWith('TEST-')&&r.restrictedRef.startsWith('TEST-')),'Fixtures contain non-synthetic evidence references');
ck(cases.totals.allow===5&&cases.totals.reject===24&&cases.totals.syntheticOnly===true&&cases.cases.length===29,'Unexpected test coverage');
const mutations={
 missing_oem:c=>{c.receipts=c.receipts.filter(x=>x.kind!=='oem_effectivity')},
 duplicate_token:c=>{c.receipts[1].evidenceToken=c.receipts[0].evidenceToken},
 bad_license:c=>{c.receipts[0].licenseChecked=false},
 bad_integrity:c=>{c.receipts[0].integrityChecked=false},
 bad_custody:c=>{c.receipts[0].custodyChainVerified=false},
 leaked_url:c=>{c.receipts[0].restrictedRef='https://corp.private/doc'},
 embedded_raw_document:c=>{c.receipts[0].rawData='TEST-CONTENT'},
 same_originator_technical:c=>{c.technicalReview.reviewerId=c.originatorId},
 same_technical_independent:c=>{c.independentReview.reviewerId=c.technicalReview.reviewerId},
 same_originator_independent:c=>{c.independentReview.reviewerId=c.originatorId},
 reject_technical:c=>{c.technicalReview.decision='rejected'},
 reject_independent:c=>{c.independentReview.decision='rejected'},
 missing_change_request:c=>{c.changeRequest.registered=false},
 root_cause_claim:c=>{c.rootCauseConfirmed=true},
 operational_approval:c=>{c.operationalReleaseApproved=true},
 publication_approval:c=>{c.publicationAuthorized=true},
 real_case_public:c=>{c.caseNature='restricted_real_case'},
 bad_proposal:c=>{c.proposalId='CAND-FAKE'},
 missing_alternatives:c=>{c.technicalReview.alternativeHypothesesReviewed=false},
 bad_quality:c=>{c.receipts[0].qualityChecked=false},
 reidentifiable_asset:c=>{c.assetSerial='TEST-REAL-SERIAL'},
 promotion_approval:c=>{c.catalogPromotionApproved=true}
};
const visited=new Set(),summary={allow:0,reject:0};
for(const t of cases.cases){
 ck(!visited.has(t.id),'Duplicate fixture '+t.id);visited.add(t.id);
 const c=clone(cases.caseTemplate);c.stage=t.from;
 ck(c.caseNature==='synthetic_test_only'&&c.caseId.startsWith('TEST-'),'Fixture may not be real');
 if(t.mutation){
  ck(!!mutations[t.mutation],'Unknown mutation '+t.mutation);
  mutations[t.mutation]?.(c);
 }
 const result=assessRestrictedTransition(policy,c,{from:t.from,to:t.to,actorRole:t.actorRole,actorId:t.actorId});
 // Test harness refuses even the *metadata* of a real case in the public repository.
 const allowed=result.allowed&&c.caseNature==='synthetic_test_only';
 const observed=allowed?'allow':'reject';
 summary[observed]++;
 ck(observed===t.expected,'Mutation or gate mismatch '+t.id+' expected '+t.expected+' got '+observed);
}
ck(summary.allow===5&&summary.reject===24,'Unexpected transition regression outcomes');
const result={status:errors.length?'FAIL':'OK',policyStages:policy.stageOrder.length,requiredEvidenceKinds:policy.evidenceKinds.length,allowedSyntheticTransitions:summary.allow,rejectedSyntheticTransitions:summary.reject,realCaseRecords:0,oemTechnicalApprovals:0,rootCausesConfirmed:0,coreChains:core.records.length,errors:errors.slice(0,35)};
console.log(JSON.stringify(result,null,2));process.exit(errors.length?1:0);
