#!/usr/bin/env node
/**
 * v1.3.93: Fail-closed regression against malformed/private records.
 * Purely synthetic; NO field measurements, serials, OEM files or approvals.
 */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {evaluatePrivateDraft,safePublicSummary,PRIVATE_FIELDS,PUBLIC_REPORT_KEYS} from './lib/cat395-serial-evidence.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const contract=read('data/governance/cat395-serial-evidence-contract.v1.json');
const schema=read('schemas/cat395-private-evidence-draft.schema.json');
const maturity=read('data/quality/pm-maturity-matrix.v1.json');
const html=fs.readFileSync(path.join(root,'docs/cat395-private-evidence-workbench.html'),'utf8');
const moduleText=fs.readFileSync(path.join(root,'scripts/lib/cat395-serial-evidence.mjs'),'utf8');
const errors=[],ck=(v,msg)=>{if(!v)errors.push(msg)};
const clone=x=>structuredClone(x);
const ready='READY_FOR_HUMAN_REVIEW',blocked='BLOCKED_PENDING_DOCUMENTATION';
const variant='CAT395-BR-TIER3';
const expectedUnits={pressure:['kPa','bar'],flow:['L/min'],time:['s'],temperature:['°C'],displacement:['mm']};
const identical=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function sample(){
 return {
  schema:'fmea-mining.cat395-private-evidence-draft.v1',contractVersion:'1.3.92',
  status:'DRAFT_FOR_PRIVATE_REVIEW',confidentiality:'RESTRICTED_CORPORATE',
  machine:{manufacturer:'Caterpillar',modelFamily:'395',serialNumber:'SYNTHETIC-EXAMPLE-NOT-A-SERIAL',
   assetTag:null,declaredVariantId:variant,arrangementReference:'SYNTHETIC-NONPRODUCTION-ARRANGEMENT'},
  gateEvidence:contract.gates.map(g=>({gateId:g.gateId,status:'DOCUMENTED_FOR_REVIEW',
   privateReference:'SIMULATED_ONLY-'+g.gateId,documentRevision:'SYNTHETIC-REV',
   effectiveForSerial:true,reviewedByRole:'SIMULATED-REVIEW-ROLE',declaredVariantId:variant})),
  measurementRows:[],
  review:{independentEngineeringReview:'HUMAN_REVIEW_DECLARED',safetyAuthorization:'AUTHORIZATION_REFERENCED',
   actualFieldTestExecution:false,oemEffectivityHumanAttested:true},
  sapReview:{status:'PRIVATE_REVIEW_DECLARED',publicCodePromotion:false},
  privacy:{authorizedPrivateEnvironment:true,noPublicExport:true,externalTransmissionAuthorized:false},
  operationalRelease:false
 };
}
const measure=()=>({
 scenarioId:'HC-DIFF-03',oemProcedureReference:'SYNTHETIC-OEM',
 instrumentRef:'SYNTHETIC-INSTRUMENT',calibrationRef:'SYNTHETIC-CALIBRATION',
 testConditionRef:'SYNTHETIC-CONDITION',portRef:'SYNTHETIC-PORT',
 quantity:'pressure',value:124,unit:'kPa',performedByAuthorizedTeam:true
});
const measureReady=()=>{const x=sample();x.measurementRows=[measure()];x.review.actualFieldTestExecution=true;return x;};

const topFields=schema.required.slice().sort();
ck(identical([...PRIVATE_FIELDS.draft].sort(),topFields),'top_schema_library_parity');
for(const [alias,prop] of [
 ['machine',schema.properties.machine],
 ['gate',schema.properties.gateEvidence.items],
 ['measurement',schema.properties.measurementRows.items],
 ['review',schema.properties.review],
 ['sap',schema.properties.sapReview],
 ['privacy',schema.properties.privacy]]){
 ck(identical([...PRIVATE_FIELDS[alias]].sort(),[...prop.required].sort()),'required_fields_'+alias);
 ck(identical([...PRIVATE_FIELDS[alias]].sort(),Object.keys(prop.properties).sort()),'allowed_fields_'+alias);
 ck(prop.additionalProperties===false,'schema_no_extra_fields_'+alias);
}
ck(schema.additionalProperties===false,'schema_no_extra_fields_top');
ck(schema.properties.measurementRows.maxItems===500,'schema_max_measurements');
for(const item of schema.properties.measurementRows.items.allOf||[]){
 const kind=item.if?.properties?.quantity?.const;
 ck(identical(item.then?.properties?.unit?.enum,expectedUnits[kind]),'schema_unit_'+kind);
}
const inline=html.match(/<script>\s*([\s\S]*?)<\/script>/);
ck(Boolean(inline),'offline_script_found');
let browser=null;
if(inline){
 const script=inline[1],begin=script.indexOf('/**'),end=script.indexOf('const CONTRACT=JSON.parse(');
 ck(begin!==-1&&end>begin,'offline_module_boundaries');
 if(begin!==-1&&end>begin){
  const embedded=script.slice(begin,end).trim(),expected=moduleText.replace(/^export /gm,'').trim();
  ck(embedded===expected,'offline_module_exact_sync');
  try{
   browser=vm.runInNewContext(script.slice(0,end)+'\n({evaluatePrivateDraft,safePublicSummary,PUBLIC_REPORT_KEYS,PRIVATE_FIELDS})',
    {},{timeout:1000});
  }catch(e){errors.push('offline_evaluator_unavailable_'+e.name);}
 }
}
function compare(input,label,contractInput=contract){
 let result,browserResult;
 try{result=safePublicSummary(input,contractInput);}catch(e){errors.push('node_crash_'+label+'_'+e.name);return null;}
 ck(identical(Object.keys(result),PUBLIC_REPORT_KEYS),'summary_allowlist_'+label);
 ck(result.operationalUseAllowed===false&&result.approvedSapMapping===false&&result.actualFailureConfirmed===false,'no_release_'+label);
 ck(!JSON.stringify(result).includes('SYNTHETIC-NONPRODUCTION-ARRANGEMENT'),'private_identifier_leak_'+label);
 if(browser){
  try{browserResult=browser.safePublicSummary(input,contractInput);
   ck(identical(result,browserResult),'offline_parity_'+label);
  }catch(e){errors.push('browser_crash_'+label+'_'+e.name);}
 }
 return result;
}
ck(compare(sample(),'nominal')?.documentaryStatus===ready,'synthetic_nominal_should_be_ready_only');
ck(compare(measureReady(),'synthetic_measurement')?.documentaryStatus===ready,'synthetic_measurement_should_be_ready_only');
ck(compare({},"empty_object")?.documentaryStatus===blocked,'empty_must_block');
ck(compare(null,"null_root")?.documentaryStatus===blocked,'null_must_block');

const mutations=[
 ['top_extra',x=>x.approvedRootCause=true],
 ['top_missing',x=>delete x.status],
 ['machine_extra',x=>x.machine.pressureLimit=350],
 ['machine_missing',x=>delete x.machine.modelFamily],
 ['asset_tag_invalid_type',x=>x.machine.assetTag=42],
 ['asset_tag_empty_string',x=>x.machine.assetTag=''],
 ['serial_too_long',x=>x.machine.serialNumber='X'.repeat(81)],
 ['serial_whitespace',x=>x.machine.serialNumber='    '],
 ['arrangement_too_short',x=>x.machine.arrangementReference=' '],
 ['gate_extra',x=>x.gateEvidence[0].autoApproved=true],
 ['gate_missing',x=>delete x.gateEvidence[1].documentRevision],
 ['gate_null',x=>x.gateEvidence[2]=null],
 ['gate_boolean',x=>x.gateEvidence[3]=false],
 ['gate_unknown_status',x=>x.gateEvidence[4].status='AUTO_APPROVED'],
 ['gate_unknown_variant',x=>x.gateEvidence[5].declaredVariantId='CAT395-UNKNOWN'],
 ['gate_provenance_wrong_type',x=>x.gateEvidence[6].privateReference=123],
 ['gate_ref_too_long',x=>x.gateEvidence[7].privateReference='S'.repeat(257)],
 ['gate_rev_too_long',x=>x.gateEvidence[0].documentRevision='R'.repeat(81)],
 ['gate_role_too_short',x=>x.gateEvidence[1].reviewedByRole='  '],
 ['review_extra',x=>x.review.operationalApproval=true],
 ['review_missing',x=>delete x.review.actualFieldTestExecution],
 ['review_false_execution_type',x=>x.review.actualFieldTestExecution='false'],
 ['review_oem_flag_type',x=>x.review.oemEffectivityHumanAttested='true'],
 ['review_unknown_status',x=>x.review.independentEngineeringReview='APPROVED'],
 ['review_unknown_safety',x=>x.review.safetyAuthorization='CLEARED'],
 ['sap_extra',x=>x.sapReview.approvedDamageCode='D0'],
 ['sap_missing',x=>delete x.sapReview.publicCodePromotion],
 ['sap_status_unknown',x=>x.sapReview.status='APPROVED'],
 ['privacy_extra',x=>x.privacy.telemetryAllowed=true],
 ['privacy_missing',x=>delete x.privacy.noPublicExport],
 ['privacy_obj_as_array',x=>x.privacy=[]],
 ['rows_as_string',x=>x.measurementRows='measured'],
 ['rows_many',x=>x.measurementRows=Array(501).fill(null)],
 ['rows_unknown_fields',x=>{x.measurementRows=[{...measure(),setpoint:123}];x.review.actualFieldTestExecution=true}],
 ['rows_missing_fields',x=>{const m=measure();delete m.unit;x.measurementRows=[m];x.review.actualFieldTestExecution=true}],
 ['rows_null_item',x=>{x.measurementRows=[null];x.review.actualFieldTestExecution=true}],
 ['rows_unknown_scenario',x=>{x.measurementRows=[{...measure(),scenarioId:'HC-DIFF-77'}];x.review.actualFieldTestExecution=true}],
 ['rows_wrong_unit_pressure',x=>{x.measurementRows=[{...measure(),unit:'L/min'}];x.review.actualFieldTestExecution=true}],
 ['rows_wrong_unit_flow',x=>{x.measurementRows=[{...measure(),quantity:'flow',unit:'kPa'}];x.review.actualFieldTestExecution=true}],
 ['rows_wrong_unit_time',x=>{x.measurementRows=[{...measure(),quantity:'time',unit:'bar'}];x.review.actualFieldTestExecution=true}],
 ['rows_wrong_unit_temp',x=>{x.measurementRows=[{...measure(),quantity:'temperature',unit:'mm'}];x.review.actualFieldTestExecution=true}],
 ['rows_unknown_quantity',x=>{x.measurementRows=[{...measure(),quantity:'velocity'}];x.review.actualFieldTestExecution=true}],
 ['rows_invalid_value',x=>{x.measurementRows=[{...measure(),value:'124'}];x.review.actualFieldTestExecution=true}],
 ['rows_unsigned',x=>{x.measurementRows=[{...measure(),performedByAuthorizedTeam:'yes'}];x.review.actualFieldTestExecution=true}],
 ['rows_null_measure_container',x=>x.measurementRows=null],
 ['top_array',x=>x.machine=[]]
];
let adversarialRejected=0;
for(const [label,mutate] of mutations){
 const x=sample();mutate(x);
 const result=compare(x,label);
 if(result?.documentaryStatus===blocked)adversarialRejected++;else errors.push('unsafe_ready_'+label);
}
ck(adversarialRejected===mutations.length,'mutation_coverage');
const malformedInputs=[
 null,undefined,0,'text',[],[null],
 {gateEvidence:[null,null,null,null,null,null,null,null]},
 {gateEvidence:[{gateId:'G395-01'}]},
 {machine:{},review:{},privacy:{}}
];
let malformedBlocked=0;
for(const [i,x] of malformedInputs.entries()){
 const result=compare(x,'malformed_'+i);
 if(result?.documentaryStatus===blocked)malformedBlocked++;else errors.push('malformed_accepted_'+i);
}
ck(malformedBlocked===malformedInputs.length,'malformed_fails_closed');
const contractAttacks=[
 ['gate_null',x=>x.gates[0]=null],
 ['gate_removed',x=>x.gates.pop()],
 ['contract_version',x=>x.version='1.3.93'],
 ['gate_approved',x=>x.gates[1].status='APPROVED'],
 ['gate_autoclose',x=>x.gates[2].automaticallySatisfiable=true],
 ['private_gate_go',x=>x.policy.privateCorporateGates='GO'],
 ['review_decision',x=>x.reviewDecision='GO'],
 ['unknown_hypothesis',x=>x.hypotheses[0].scenarioId='HC-DIFF-99']
];
let contractRejected=0;
for(const [label,edit] of contractAttacks){
 const x=clone(contract);edit(x);
 const result=compare(sample(),'contract_'+label,x);
 if(result?.documentaryStatus===blocked)contractRejected++;else errors.push('tampered_contract_ready_'+label);
}
ck(contractRejected===contractAttacks.length,'contract_fail_closed');
const secret='SYNTHETIC_SECRET_DO_NOT_EXPOSE_93817';
const secrets=sample();
secrets.machine.serialNumber=secret;
secrets.machine.assetTag=secret;
secrets.machine.arrangementReference=secret;
for(const g of secrets.gateEvidence){g.privateReference=secret;g.documentRevision=secret;g.reviewedByRole=secret;}
secrets.measurementRows=[{...measure(),oemProcedureReference:secret,instrumentRef:secret,calibrationRef:secret,testConditionRef:secret,portRef:secret}];
secrets.review.actualFieldTestExecution=true;
const redacted=compare(secrets,'private_leak_canary');
ck(redacted!==null&&!JSON.stringify(redacted).includes(secret),'canary_did_not_leak');
const report={schema:'fmea-mining.cat395-evidence-hardening-audit.v1',version:'1.3.93',
 status:errors.length?'FAIL':'OK',
 totals:{adversarialRecordsRejected:adversarialRejected,malformedInputsRejected:malformedBlocked,
 contractTamperingsRejected:contractRejected,offlineRuntimeParity:browser!==null,
 syntheticLeakCanaryBlocked:true,operationalApprovals:0,realSerials:0,performedFieldTests:0,
 approvedSapMappings:0,corporateGates:'NO_GO',
 baselinePmRules:maturity.summary.seedRules,baselineSapBlockers:maturity.summary.sapExceptionsBlocked},
 errors};
ck(maturity.summary.seedRules===25&&maturity.summary.sapExceptionsBlocked===10&&maturity.summary.engineeringApprovalsRecorded===0,'legacy_baseline');
report.status=errors.length?'FAIL':'OK';report.errors=errors;
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/cat395-evidence-hardening.generated.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));process.exit(errors.length?1:0);
