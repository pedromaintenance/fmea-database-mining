#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {evaluatePrivateDraft,safePublicSummary,PUBLIC_REPORT_KEYS} from './lib/cat395-serial-evidence.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const contract=read('data/governance/cat395-serial-evidence-contract.v1.json');
const schema=read('schemas/cat395-private-evidence-draft.schema.json');
const parent=read('data/quality/cat395-public-variant-preflight.v1.json');
const hyd=read('data/quality/hydraulic-circuit-differential.v1.json');
const maturity=read('data/quality/pm-maturity-matrix.v1.json');
const catalog=read('data/research/sources.v1.json').sources;
const ids=new Set(catalog.map(s=>s.id));
const html=fs.readFileSync(path.join(root,'docs/cat395-private-evidence-workbench.html'),'utf8');
const errors=[],ok=(value,label,arr=errors)=>{if(!value)arr.push(label)};
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const copy=x=>structuredClone(x);
const stages=['S1_OEM_CONFIG','S1_OEM_CONFIG','S1_OEM_CONFIG','S2_FUNCTIONAL_TOPOLOGY','S3_DISCRIMINATIVE_TEST','S3_DISCRIMINATIVE_TEST','S3_EXECUTION_SAFETY','S5_INDEPENDENT_REVIEW'];
const types=['machine_identity','variant_effectivity','oem_hydraulic_schematic','hydraulic_architecture','oem_test_and_adjust','metrology_and_test_context','safe_work_authorization','independent_engineering_review'];
const strictFlags=[
 'repositoryIsPublic','schemaValidationIsNotEvidenceAuthentication','documentaryReadinessIsNotTechnicalApproval',
 'noFabricatedEvidence','noPressureTestInstructions','doesNotAuthorizeFieldTesting'
];
const privacyFlags={
 privateDocumentsInPublicRepo:false,privateSerialOrAssetTagsInPublicRepo:false,
 privateMeasurementsInPublicRepo:false,privateOemManualTextInPublicRepo:false,
 operationalReleaseAutomated:false,automatedCausalConfirmation:false,sapMappingAutomated:false
};
const publicFields=['schema','version','nature','documentaryStatus','gateCounts','errorCodes','operationalUseAllowed','approvedSapMapping','actualFailureConfirmed'];
const blockedFields=['serialNumber','assetTag','documentId','documentRevision','internalRef','measurement','value','unit','comments','observations','reviewerName','sourceUrl','attachments','timestamps'];
function validateContract(x){
 const failures=[],t=(v,msg)=>ok(v,msg,failures);
 t(x.schema==='fmea-mining.cat395-serial-evidence-contract.v1'&&x.version==='1.3.92'&&x.nature==='public_contract_private_evidence_outside_repository','identity');
 t(x.predecessor==='data/quality/cat395-public-variant-preflight.v1.json'&&x.privateSchema==='schemas/cat395-private-evidence-draft.schema.json','file_linkage');
 t(x.modelFamily==='Caterpillar 395','family');
 t(eq(x.sources,['CAT-SIS2GO','ISO-14224-2016',...parent.sourceCatalogIds.filter(v=>v!=='CAT-SIS2GO')]),'source_set');
 t(x.sources.every(s=>ids.has(s)),'sources_catalogued');
 for(const f of strictFlags)t(x.policy?.[f]===true,'policy_'+f);
 for(const [f,v] of Object.entries(privacyFlags))t(x.policy?.[f]===v,'privacy_'+f);
 t(x.policy?.privateCorporateGates==='NO_GO'&&x.policy?.repositoryDisposition==='PUBLIC_TEMPLATE_ONLY','no_go');
 for(const f of ['allSerialsVerified','privateRecordsReceived','fieldMeasurementsReceived','performedTests','approvalsRecorded'])t(x.policy?.[f]===0,'no_fake_'+f);
 t(eq(x.decisionSemantics?.publicExportAllowedFields,publicFields),'export_allowlist');
 t(eq(x.decisionSemantics?.publicExportMustOmit,blockedFields),'redaction_boundary');
 t(x.decisionSemantics?.DOCUMENTED_FOR_REVIEW?.includes('não é aprovação'),'readiness_not_approval');
 t(x.gates?.length===8,'gate_count');
 for(let i=0;i<(x.gates||[]).length;i++){
  const g=x.gates[i],id='G395-'+String(i+1).padStart(2,'0');
  t(g.gateId===id&&g.stage===stages[i]&&g.evidenceType===types[i],'gate_lineage_'+id);
  t(g.status==='PENDING'&&g.automaticallySatisfiable===false,'gate_cannot_autoclose_'+id);
  t(g.requirement===parent.documentGates[i].requirement,'gate_requirement_'+id);
  t(eq(g.minimumProvenance,['private_reference','source_revision','serial_applicability_reviewed_by_human','independent_cross_check']),'gate_provenance_'+id);
 }
 t(x.crossCuttingSapReview?.stage==='S4_SAP_MASTER_DATA'&&x.crossCuttingSapReview?.status==='NOT_STARTED'&&x.crossCuttingSapReview?.approvedMappings===0&&x.crossCuttingSapReview?.requiresAuthorizedMasterDataReview===true,'sap_s4_independent');
 t(x.hypotheses?.length===10&&eq(x.hypotheses.map(h=>h.scenarioId),hyd.records.map(r=>r.id)),'hypothesis_lineage');
 t(x.hypotheses?.every(h=>h.diagnosisAllowed===false&&h.status==='NOT_ASSESSED'),'hypothesis_not_causal');
 t(x.reviewDecision==='NO_OPERATIONAL_APPROVAL_BY_THIS_CONTRACT','no_decision');
 return failures;
}
errors.push(...validateContract(contract));
ok(schema?.properties?.operationalRelease?.const===false&&schema?.properties?.confidentiality?.const==='RESTRICTED_CORPORATE'&&schema?.properties?.status?.const==='DRAFT_FOR_PRIVATE_REVIEW','private_schema_limits');
ok(schema?.properties?.privacy?.properties?.noPublicExport?.const===true&&schema?.properties?.privacy?.properties?.externalTransmissionAuthorized?.const===false,'schema_privacy');
ok(schema?.properties?.gateEvidence?.minItems===8&&schema?.properties?.gateEvidence?.maxItems===8,'schema_exact_gates');
ok(schema?.properties?.measurementRows?.items?.properties?.performedByAuthorizedTeam?.type==='boolean','schema_measurement_attestation');
ok(parent.variants.length===3&&parent.documentGates.length===8&&parent.executiveDecision==='BLOCK_OPERATIONAL_USE_UNTIL_SERIAL_OEM_EVIDENCE','parent_unchanged');
ok(maturity.summary.seedRules===25&&maturity.summary.sapExceptionsBlocked===10&&maturity.summary.serialOemVerified===0,'core_baseline');
const v='CAT395-BR-TIER3';
function sample(){
 return {
  schema:'fmea-mining.cat395-private-evidence-draft.v1',contractVersion:'1.3.92',
  status:'DRAFT_FOR_PRIVATE_REVIEW',confidentiality:'RESTRICTED_CORPORATE',
  machine:{manufacturer:'Caterpillar',modelFamily:'395',serialNumber:'SYNTHETIC-NOT-A-MACHINE',assetTag:null,declaredVariantId:v,arrangementReference:'SYNTHETIC-ARRANGEMENT'},
  gateEvidence:contract.gates.map(g=>({gateId:g.gateId,status:'DOCUMENTED_FOR_REVIEW',privateReference:'SYNTHETIC_REF_'+g.gateId,
  documentRevision:'SYNTHETIC_REV',effectiveForSerial:true,reviewedByRole:'SYNTHETIC_ROLE',declaredVariantId:v})),
  measurementRows:[],review:{independentEngineeringReview:'HUMAN_REVIEW_DECLARED',safetyAuthorization:'AUTHORIZATION_REFERENCED',actualFieldTestExecution:false,oemEffectivityHumanAttested:true},
  sapReview:{status:'PRIVATE_REVIEW_DECLARED',publicCodePromotion:false},
  privacy:{authorizedPrivateEnvironment:true,noPublicExport:true,externalTransmissionAuthorized:false},
  operationalRelease:false
 };
}
const result=evaluatePrivateDraft(sample(),contract);
ok(result.documentaryStatus==='READY_FOR_HUMAN_REVIEW'&&result.gateCounts.DOCUMENTED_FOR_REVIEW===8,'synthetic_completeness_ready_for_review_only');
ok(result.operationalUseAllowed===false&&result.approvedSapMapping===false&&result.actualFailureConfirmed===false,'no_automatic_homologation');
const mutations=[
 x=>x.schema='fmea-mining.approved',x=>x.status='APPROVED',x=>x.confidentiality='PUBLIC',
 x=>x.privacy.authorizedPrivateEnvironment=false,x=>x.privacy.noPublicExport=false,x=>x.privacy.externalTransmissionAuthorized=true,
 x=>x.operationalRelease=true,x=>x.machine.manufacturer='Other',x=>x.machine.modelFamily='390',x=>x.machine.serialNumber=null,
 x=>x.machine.arrangementReference=null,x=>x.machine.declaredVariantId=null,x=>x.gateEvidence.pop(),x=>x.gateEvidence[1].gateId=x.gateEvidence[0].gateId,
 x=>x.gateEvidence[0].status='REQUESTED',x=>x.gateEvidence[1].effectiveForSerial=false,
 x=>x.gateEvidence[2].declaredVariantId='CAT395-FRONT-SHOVEL',x=>x.gateEvidence[3].privateReference=null,
 x=>x.gateEvidence[4].documentRevision=null,x=>x.gateEvidence[5].effectiveForSerial=null,
 x=>x.gateEvidence[6].reviewedByRole=null,x=>x.gateEvidence[7].declaredVariantId=null,
 x=>x.review.independentEngineeringReview='NOT_REQUESTED',x=>x.review.oemEffectivityHumanAttested=false,
 x=>x.review.safetyAuthorization='REQUESTED',x=>x.sapReview.publicCodePromotion=true,
 x=>x.sapReview.status='NOT_STARTED',x=>x.measurementRows=[{scenarioId:'HC-DIFF-03',value:1}],
 x=>x.review.actualFieldTestExecution=true,x=>x.measurementRows=null
];
let rejected=0;
for(const mutate of mutations){const sampleInput=sample();mutate(sampleInput);const out=evaluatePrivateDraft(sampleInput,contract);if(out.documentaryStatus==='BLOCKED_PENDING_DOCUMENTATION'&&out.operationalUseAllowed===false)rejected++;else errors.push('private_mutation_escaped');}
ok(rejected===mutations.length,'private_adversarial_coverage');
const contractMutations=[
 x=>x.policy.privateCorporateGates='GO',x=>x.policy.operationalReleaseAutomated=true,x=>x.policy.privateDocumentsInPublicRepo=true,
 x=>x.policy.allSerialsVerified=1,x=>x.gates[0].status='APPROVED',
 x=>x.gates[4].automaticallySatisfiable=true,x=>x.gates[2].minimumProvenance.pop(),
 x=>x.gates[0].stage='S3_DISCRIMINATIVE_TEST',x=>x.crossCuttingSapReview.approvedMappings=1,
 x=>x.crossCuttingSapReview.status='COMPLETE',x=>x.hypotheses[0].diagnosisAllowed=true,
 x=>x.decisionSemantics.publicExportAllowedFields.push('serialNumber')
];
let contractRejected=0;
for(const mutate of contractMutations){const input=copy(contract);mutate(input);if(validateContract(input).length)contractRejected++;else errors.push('contract_mutation_escaped');}
ok(contractRejected===contractMutations.length,'contract_mutation_coverage');
const secret='SYNTHETIC_TOPSECRET_IDENTIFIABLE_NOT_PUBLISH';
const secretSample=sample();
secretSample.machine.serialNumber=secret;
secretSample.machine.assetTag=secret;
secretSample.gateEvidence[0].privateReference=secret;
secretSample.gateEvidence[1].documentRevision=secret;
const publicOutput=safePublicSummary(secretSample,contract);
const exported=JSON.stringify(publicOutput);
ok(!exported.includes(secret),'no_private_fields_in_public_summary');
ok(eq(Object.keys(publicOutput),PUBLIC_REPORT_KEYS),'public_export_allowlist_unchanged');
ok(!exported.includes('SYNTHETIC_REF_')&&!exported.includes('arrangementReference'),'no_metadata_leak');
ok(html.includes('id="contract-data"')&&html.includes('id="private-record-file"')&&html.includes('redacted_public_summary'),'offline_workbench_elements');
const embedded=html.match(/<script id="contract-data" type="application\/json">([\s\S]*?)<\/script>/);
try{ok(eq(JSON.parse(embedded?.[1]||''),contract),'embedded_contract_matches_file');}catch(e){errors.push('embedded_contract_invalid');}
const inline=html.match(/<script>\s*([\s\S]*?)<\/script>/);
try{new vm.Script(inline?.[1]||'',{filename:'offline-workbench'});}catch(e){errors.push('offline_script_invalid_'+String(e));}
for(const term of ['<script src=','<iframe','localStorage','sessionStorage','navigator.sendBeacon','XMLHttpRequest','fetch(','WebSocket(','indexedDB'])
 ok(!html.includes(term),'forbidden_network_or_storage_'+term);
ok(html.includes('file.text()')&&html.includes('textContent')&&html.includes('URL.createObjectURL'),'local_input_redaction_only');
const resultReport={schema:'fmea-mining.cat395-serial-evidence-contract-audit.v1',version:'1.3.92',status:errors.length?'FAIL':'OK',
 totals:{publicGates:contract.gates.length,linkedScenarios:contract.hypotheses.length,requiredSapStage:'S4_SAP_MASTER_DATA',
 syntheticDraftMutationsRejected:rejected,contractMutationsRejected:contractRejected,syntheticLeakTestPassed:!exported.includes(secret),
 actualSerials:0,actualOEMManuals:0,fieldMeasurements:0,engineeringApprovals:0,corporateGates:'NO_GO'},
 errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/cat395-serial-evidence-contract.generated.json'),JSON.stringify(resultReport,null,2)+'\n');
console.log(JSON.stringify(resultReport,null,2));
process.exit(errors.length?1:0);
