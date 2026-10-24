#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {assessPmIntakeCase,CASE_KEYS,RECEIPT_KEYS,EVENT_KEYS,RELEASE_KEYS} from './lib/pm-evidence-intake.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const policy=read('data/governance/pm-evidence-intake-policy.v1.json');
const matrix=read('data/quality/pm-maturity-matrix.v1.json');
const restricted=read('data/governance/restricted-evidence-workflow.v1.json');
const privateCustody=read('data/governance/private-result-custody-contract.v1.json');
const schema=read('schemas/pm-evidence-intake-case.schema.json');
const gaps=read('data/quality/pm-gap-review.v1.json');
const ontology=read('data/ontology/condition-action-damage.v1.json');
const clone=x=>JSON.parse(JSON.stringify(x));
const errors=[],check=(v,k)=>{if(!v)errors.push(k)};
const kinds=['oem_effectivity','oem_procedure','field_observation','counterevidence','measurement_quality'];
const sequence=['submit','verify_custody','technical_accept','independent_accept','request_change_control'];
const actors=['TEST-ORIGINATOR-001','TEST-CUSTODIAN-001','TEST-TECHNICAL-001','TEST-INDEPENDENT-001','TEST-CHANGEBOARD-001'];
const decisions=['submitted','verified','accepted','accepted','request_only'];
const ids=matrix.rules.map(x=>x.ruleId);
function caseFor(row){
 return {schema:'fmea-mining.pm-evidence-intake-case.v1',recordNature:'synthetic_test_only',classification:'restricted_synthetic_metadata',
 tenantToken:'TEST-TENANT-001',caseToken:'TEST-CASE-001',assetToken:'TEST-ASSET-001',ruleId:row.ruleId,bundleId:row.bundleId,originatorToken:actors[0],stage:'draft',receipts:[],events:[],
 release:{rootCauseConfirmed:false,sapMappingApproved:false,catalogPromotionApproved:false,operationalReleaseApproved:false,publicExportAuthorized:false}};
}
function fullCase(row){
 const c=caseFor(row);
 c.receipts=kinds.map((kind,i)=>({kind,evidenceToken:'TEST-EVIDENCE-'+String(i+1).padStart(3,'0'),restrictedRef:'TEST-PRIVATE-REF-'+String(i+1).padStart(3,'0'),
 licenseChecked:true,integrityChecked:true,custodyChainVerified:true,qualityChecked:true}));
 let previous=null;
 for(let i=0;i<sequence.length;i++){
  const t=policy.events[i],eventToken='TEST-EVENT-'+String(i+1).padStart(3,'0');
  c.events.push({eventToken,previousEventToken:previous,action:sequence[i],role:t.role,actorToken:actors[i],decision:decisions[i],
  reasonRecorded:i>0,alternativesReviewed:i===2,oemEffectivityAssessed:i===2,manualRequestToken:i===4?'TEST-MANUAL-REQUEST-001':null});
  previous=eventToken;
 }
 c.stage='ready_for_change_control';return c;
}
const blocked=matrix.rules.find(x=>x.sap.isBlocked),unblocked=matrix.rules.find(x=>!x.sap.isBlocked);
check(policy.version==='1.3.61'&&policy.status==='public_offline_synthetic_contract_no_corporate_backend','policy_current');
check(policy.sourceMaturityVersion===matrix.version&&policy.sourceMaturityMatrix==='data/quality/pm-maturity-matrix.v1.json','matrix_bind');
check(JSON.stringify(policy.stages)===JSON.stringify(restricted.stageOrder),'shared_custody_stages');
check(JSON.stringify(policy.roles)===JSON.stringify(restricted.roles),'shared_roles');
check(JSON.stringify(policy.requiredEvidenceKinds)===JSON.stringify(kinds)&&JSON.stringify(restricted.evidenceKinds)===JSON.stringify(kinds),'receipt_kinds');
check(policy.sourceRestrictedCustody==='data/governance/restricted-evidence-workflow.v1.json'&&policy.sourceResultCustody==='data/governance/private-result-custody-contract.v1.json'&&privateCustody.boundaries.automatedFmeaPromotionAllowed===false,'existing_restricted_controls');
check(policy.events.length===5&&policy.events.every((x,i)=>x.action===sequence[i]&&x.from===policy.stages[i]&&x.to===policy.stages[i+1]),'transition_sequence');
check(policy.boundaries.publicSyntheticOnly===true&&policy.boundaries.realCasesInRepository===0&&policy.boundaries.privateStorageImplemented===false&&policy.boundaries.corporateSSOIntegrated===false&&policy.boundaries.trustedActorRolesProven===false&&policy.boundaries.replayPreventionPersisted===false&&policy.boundaries.signedImmutableAuditTrailImplemented===false&&policy.boundaries.preventsDirectSapWrites===true,'no_fake_backend_or_approval');
check(policy.requiredForRealImplementation.length===6,'private_implementation_gap_list');
check(schema.properties.recordNature.const==='synthetic_test_only'&&schema.properties.classification.const==='restricted_synthetic_metadata'&&schema.additionalProperties===false,'public_schema_scope');
check(JSON.stringify(schema.properties.ruleId.enum)===JSON.stringify(ids)&&JSON.stringify(schema.properties.stage.enum)===JSON.stringify(policy.stages),'schema_model_contract');
check(schema.properties.receipts.maxItems===12&&schema.properties.events.maxItems===5&&Object.keys(schema.$defs).length===3,'schema_record_limits');
check(JSON.stringify(schema.required)===JSON.stringify(CASE_KEYS)&&JSON.stringify(schema.$defs.receipt.required)===JSON.stringify(RECEIPT_KEYS)&&JSON.stringify(schema.$defs.event.required)===JSON.stringify(EVENT_KEYS)&&JSON.stringify(schema.properties.release.required)===JSON.stringify(RELEASE_KEYS),'schema_exact_allowlist');
check(matrix.rules.length===25&&matrix.summary.sapExceptionsBlocked===10&&matrix.summary.documentedP0===5&&matrix.summary.documentedP1===5&&matrix.summary.serialOemVerified===0&&matrix.summary.fieldConfirmed===0&&matrix.summary.sapMappingsApproved===0,'maturity_baseline');
check(gaps.records.length===10&&gaps.records.every(x=>x.status==='bloqueado_aguardando_curadoria'&&x.autoRemapAllowed===false),'SAP_exception_immutable');
check(ontology.bundles.length===25&&ontology.observations.length===0&&ontology.confirmedComponentDamages.length===0,'ontology_not_promoted');
for(const row of matrix.rules){
 const result=assessPmIntakeCase(policy,matrix,caseFor(row));
 check(result.status==='pending'&&result.stage==='draft'&&result.errors.length===0&&result.sapBlocker===(row.sap.isBlocked?row.sap.blocker:null),'draft_case_'+row.ruleId);
}
for(const row of [blocked,unblocked]){
 const complete=fullCase(row);
 const result=assessPmIntakeCase(policy,matrix,complete);
 check(result.status==='eligible_for_manual_change_control_review'&&result.errors.length===0&&result.sapMappingApproved===false&&result.rootCauseConfirmed===false&&result.catalogPromotionApproved===false&&result.operationalReleaseApproved===false,'full_flow_'+row.ruleId);
 check(result.sapBlocker===(row.sap.isBlocked?row.sap.blocker:null),'blocked_preserved_'+row.ruleId);
 for(let n=0;n<6;n++){
  const c=clone(complete);c.events=c.events.slice(0,n);c.stage=policy.stages[n];
  const r=assessPmIntakeCase(policy,matrix,c);
  check(r.errors.length===0&&r.stage===policy.stages[n]&&r.status===(n===5?'eligible_for_manual_change_control_review':'pending'),'stage_prefix_'+n+'_'+row.ruleId);
 }
}
const baseline=fullCase(blocked),attacks=[];
function attack(id,edit){const x=clone(baseline),p=clone(policy),m=clone(matrix);edit(x,p,m);const r=assessPmIntakeCase(p,m,x);const rejected=r.status==='rejected'&&r.errors.length>0;attacks.push({id,rejected});if(!rejected)errors.push('mutation_accepted_'+id);}
attack('real_case_nature',x=>x.recordNature='restricted_real_case');
attack('classification_leak',x=>x.classification='public');
attack('real_asset_id',x=>x.assetToken='DR410i-REAL-SERIAL');
attack('external_evidence_link',x=>x.receipts[0].restrictedRef='https://sharepoint.example/doc');
attack('real_file_path',x=>x.receipts[0].restrictedRef='/mnt/data/private-oem.pdf');
attack('license_denied',x=>x.receipts[0].licenseChecked=false);
attack('custody_not_verified',x=>x.receipts[1].custodyChainVerified=false);
attack('integrity_not_verified',x=>x.receipts[1].integrityChecked=false);
attack('quality_not_verified',x=>x.receipts[1].qualityChecked=false);
attack('duplicate_receipt',x=>x.receipts[1].evidenceToken=x.receipts[0].evidenceToken);
attack('missing_counterevidence',x=>x.receipts=x.receipts.filter(y=>y.kind!=='counterevidence'));
attack('wrong_bundle',x=>x.bundleId=unblocked.bundleId);
attack('unknown_pm_rule',x=>x.ruleId='made-up-rule');
attack('improper_SAP_release',x=>x.release.sapMappingApproved=true);
attack('claimed_root_cause',x=>x.release.rootCauseConfirmed=true);
attack('catalog_promotion',x=>x.release.catalogPromotionApproved=true);
attack('public_export',x=>x.release.publicExportAuthorized=true);
attack('operational_release',x=>x.release.operationalReleaseApproved=true);
attack('actor_role_forgery',x=>x.events[2].role='custodian');
attack('wrong_action_order',x=>x.events[1].action='technical_accept');
attack('technical_originator_same',x=>x.events[2].actorToken=x.originatorToken);
attack('independent_same_as_technical',x=>x.events[3].actorToken=x.events[2].actorToken);
attack('independent_same_as_custodian',x=>x.events[3].actorToken=x.events[1].actorToken);
attack('technical_without_alternatives',x=>x.events[2].alternativesReviewed=false);
attack('technical_without_effectivity',x=>x.events[2].oemEffectivityAssessed=false);
attack('technical_without_reason',x=>x.events[2].reasonRecorded=false);
attack('independent_without_reason',x=>x.events[3].reasonRecorded=false);
attack('change_control_without_request',x=>x.events[4].manualRequestToken=null);
attack('manual_request_too_early',x=>x.events[1].manualRequestToken='TEST-EARLY-REQUEST');
attack('event_replayed',x=>x.events[3].eventToken=x.events[2].eventToken);
attack('broken_previous_token',x=>x.events[3].previousEventToken='TEST-WRONG-PREV');
attack('missing_transition',x=>x.events.splice(1,1));
attack('stage_jump',x=>x.stage='draft');
attack('hidden_raw_field',x=>x.serialNumber='REAL-SERIAL-1234');
attack('receipt_extra_PN',x=>x.receipts[0].partNumber='OEM-PN-SENSITIVE');
attack('event_extra_signature',x=>x.events[2].signature='fake');
attack('claim_OEM_direct_approval',(x,p)=>p.boundaries.publicSyntheticOnly=false);
attack('policy_untrusted_version',(x,p)=>p.version='1.3.60');
attack('matrix_rule_SAP_approved',(x,p,m)=>m.rules.find(z=>z.ruleId===x.ruleId).approvedSapMappings=1);
attack('matrix_rule_auto_remap',(x,p,m)=>m.rules.find(z=>z.ruleId===x.ruleId).sap.autoRemapAllowed=true);
const rejected=attacks.filter(x=>x.rejected).length;
check(attacks.length===40&&rejected===40,'mutation_cardinality');
const report={schema:'fmea-mining.pm-evidence-intake-audit.v1',version:'1.3.61',status:errors.length?'FAIL':'OK',scope:{pmRules:25,exceptionsStillBlocked:10,publicRealCases:0,livePrivateBackend:false,realSignaturesVerified:false,syntheticReviewFlowOnly:true},stages:policy.stages,syntheticCasesTested:27,prefixStageTests:12,mutationsRejected:rejected,mutationsTotal:attacks.length,nextRequiredAction:'deploy_authorized_private_intake_with_identity_custody_and_manual_engineering_approval',errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});fs.writeFileSync(path.join(root,'reports/pm-evidence-intake.generated.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,scope:report.scope,mutationsRejected:rejected,totalMutations:attacks.length,errors},null,2));
process.exit(errors.length?1:0);
