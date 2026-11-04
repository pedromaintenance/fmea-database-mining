/**
 * CAT 395 — avaliador documental fail-closed (v1.3.93).
 * Este arquivo deve ser embutido no workbench offline sem alterar a lógica.
 * Nenhum valor OEM, medição, identidade ou texto livre entra na saída pública.
 * Passar na validação significa SOMENTE prontidão para revisão humana.
 */
export const PUBLIC_REPORT_KEYS=[
 'schema','version','nature','documentaryStatus','gateCounts','errorCodes',
 'operationalUseAllowed','approvedSapMapping','actualFailureConfirmed'
];
export const PRIVATE_FIELDS={
 draft:['schema','contractVersion','status','confidentiality','machine','gateEvidence','measurementRows','review','sapReview','privacy','operationalRelease'],
 machine:['manufacturer','modelFamily','serialNumber','assetTag','declaredVariantId','arrangementReference'],
 gate:['gateId','status','privateReference','documentRevision','effectiveForSerial','reviewedByRole','declaredVariantId'],
 measurement:['scenarioId','oemProcedureReference','instrumentRef','calibrationRef','testConditionRef','portRef','quantity','value','unit','performedByAuthorizedTeam'],
 review:['independentEngineeringReview','safetyAuthorization','actualFieldTestExecution','oemEffectivityHumanAttested'],
 sap:['status','publicCodePromotion'],
 privacy:['authorizedPrivateEnvironment','noPublicExport','externalTransmissionAuthorized']
};
const expectedVariants=new Set(['CAT395-BR-TIER3','CAT395-US-T4F','CAT395-FRONT-SHOVEL']);
const expectedGateStatuses=new Set(['NOT_REQUESTED','REQUESTED','RECEIVED_UNVERIFIED','DOCUMENTED_FOR_REVIEW']);
const expectedReviewStatuses=new Set(['NOT_REQUESTED','REQUESTED','HUMAN_REVIEW_DECLARED']);
const expectedSafetyStatuses=new Set(['NOT_REQUESTED','REQUESTED','AUTHORIZATION_REFERENCED']);
const expectedSapStatuses=new Set(['NOT_STARTED','PRIVATE_REVIEW_REQUESTED','PRIVATE_REVIEW_DECLARED']);
const quantityUnits={
 pressure:['kPa','bar'],flow:['L/min'],time:['s'],temperature:['°C'],displacement:['mm']
};
const isRecord=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const hasText=(x,min=3,max=256)=>typeof x==='string'&&x.trim().length>=min&&x.length<=max;
const hasNullableText=(x,min,max)=>x===null||hasText(x,min,max);
const exactFields=(x,keys)=>{
 if(!isRecord(x))return false;
 const names=Object.keys(x);
 return names.length===keys.length&&keys.every(key=>Object.prototype.hasOwnProperty.call(x,key));
};
function assessment(draft,contract){
 const flags=new Set(),mark=x=>flags.add(x);
 const counts={MISSING:0,UNVERIFIED:0,CONFLICT:0,DOCUMENTED_FOR_REVIEW:0};
 const D=isRecord(draft)?draft:{};
 if(!exactFields(D,PRIVATE_FIELDS.draft))mark('INVALID_TOP_LEVEL_SHAPE');
 if(D.schema!=='fmea-mining.cat395-private-evidence-draft.v1'||
    D.contractVersion!=='1.3.92'||D.status!=='DRAFT_FOR_PRIVATE_REVIEW'||
    D.confidentiality!=='RESTRICTED_CORPORATE')mark('INVALID_RECORD_HEADER');
 const P=D.privacy;
 if(!exactFields(P,PRIVATE_FIELDS.privacy))mark('INVALID_PRIVACY_SHAPE');
 if(!isRecord(P)||P.authorizedPrivateEnvironment!==true||
    P.noPublicExport!==true||P.externalTransmissionAuthorized!==false)
    mark('PRIVATE_ENVIRONMENT_NOT_ATTESTED');
 if(D.operationalRelease!==false)mark('OPERATIONAL_RELEASE_FIELD_FORBIDDEN');
 const M=D.machine;
 if(!exactFields(M,PRIVATE_FIELDS.machine))mark('INVALID_MACHINE_SHAPE');
 if(!isRecord(M)||M.manufacturer!=='Caterpillar'||M.modelFamily!=='395'||
    !hasText(M.serialNumber,3,80)||!hasNullableText(M.assetTag,2,120)||
    !hasText(M.arrangementReference,2,256)||!expectedVariants.has(M.declaredVariantId))
    mark('MACHINE_IDENTITY_INCOMPLETE');
 const gateIds=Array.isArray(contract?.gates)?contract.gates.map(g=>g?.gateId):[];
 const validGateIds=gateIds.length===8&&gateIds.every((id,i)=>id==='G395-0'+String(i+1))&&
    contract?.schema==='fmea-mining.cat395-serial-evidence-contract.v1'&&
    contract?.version==='1.3.92'&&contract?.reviewDecision==='NO_OPERATIONAL_APPROVAL_BY_THIS_CONTRACT'&&
    contract?.policy?.privateCorporateGates==='NO_GO'&&
    contract?.gates?.every(g=>g?.status==='PENDING'&&g?.automaticallySatisfiable===false);
 if(!validGateIds)mark('INVALID_PUBLIC_CONTRACT');
 const all=Array.isArray(D.gateEvidence)?D.gateEvidence:[];
 if(!Array.isArray(D.gateEvidence)||all.length!==8||
    new Set(all.map(g=>g?.gateId)).size!==all.length)mark('GATE_SET_INVALID');
 const byId=new Map(all.map(g=>[g?.gateId,g]));
 for(const id of ['G395-01','G395-02','G395-03','G395-04','G395-05','G395-06','G395-07','G395-08']){
  const e=byId.get(id);
  if(!e){counts.MISSING++;mark('GATE_EVIDENCE_MISSING');continue;}
  if(!exactFields(e,PRIVATE_FIELDS.gate)){
   counts.CONFLICT++;mark('INVALID_GATE_SHAPE');continue;
  }
  if(!expectedGateStatuses.has(e.status)){counts.CONFLICT++;mark('GATE_STATUS_INVALID');continue;}
  if(e.effectiveForSerial===false||
     (expectedVariants.has(e.declaredVariantId)&&expectedVariants.has(M?.declaredVariantId)&&
      e.declaredVariantId!==M.declaredVariantId)){
   counts.CONFLICT++;mark('EFFECTIVITY_OR_VARIANT_CONFLICT');continue;
  }
  if(e.status!=='DOCUMENTED_FOR_REVIEW'){
   counts[e.status==='NOT_REQUESTED'?'MISSING':'UNVERIFIED']++;continue;
  }
  const valid=hasText(e.privateReference,5,256)&&
    hasText(e.documentRevision,1,80)&&
    e.effectiveForSerial===true&&hasText(e.reviewedByRole,3,120)&&
    expectedVariants.has(e.declaredVariantId)&&e.declaredVariantId===M?.declaredVariantId;
  if(valid)counts.DOCUMENTED_FOR_REVIEW++;
  else{counts.UNVERIFIED++;mark('GATE_PROVENANCE_INCOMPLETE');}
 }
 if(byId.size!==8||['G395-01','G395-02','G395-03','G395-04','G395-05','G395-06','G395-07','G395-08'].some(id=>!byId.has(id)))
   mark('GATE_SET_INVALID');
 const R=D.review;
 if(!exactFields(R,PRIVATE_FIELDS.review))mark('INVALID_REVIEW_SHAPE');
 if(!isRecord(R)||!expectedReviewStatuses.has(R.independentEngineeringReview)||
    !expectedSafetyStatuses.has(R.safetyAuthorization)||
    typeof R.actualFieldTestExecution!=='boolean'||
    typeof R.oemEffectivityHumanAttested!=='boolean')mark('INVALID_REVIEW_VALUES');
 if(R?.independentEngineeringReview!=='HUMAN_REVIEW_DECLARED')mark('INDEPENDENT_REVIEW_NOT_DECLARED');
 if(R?.oemEffectivityHumanAttested!==true)mark('OEM_EFFECTIVITY_UNATTESTED');
 if(R?.safetyAuthorization!=='AUTHORIZATION_REFERENCED')mark('SAFETY_AUTHORIZATION_UNREFERENCED');
 const S=D.sapReview;
 if(!exactFields(S,PRIVATE_FIELDS.sap))mark('INVALID_SAP_SHAPE');
 if(!isRecord(S)||!expectedSapStatuses.has(S.status))mark('INVALID_SAP_STATUS');
 if(S?.publicCodePromotion!==false)mark('SAP_PUBLIC_PROMOTION_FORBIDDEN');
 if(S?.status!=='PRIVATE_REVIEW_DECLARED')mark('SAP_PRIVATE_REVIEW_PENDING');
 const rows=Array.isArray(D.measurementRows)?D.measurementRows:[];
 if(!Array.isArray(D.measurementRows)||rows.length>500)mark('INVALID_MEASUREMENT_CONTAINER');
 if(rows.length&&R?.actualFieldTestExecution!==true)mark('MEASUREMENT_WITHOUT_EXECUTION_ATTESTATION');
 if(R?.actualFieldTestExecution===true&&!rows.length)mark('FIELD_TEST_WITHOUT_TRACEABLE_RESULT');
 if(rows.length&&P?.authorizedPrivateEnvironment!==true)mark('PRIVATE_MEASUREMENT_EXPOSURE_RISK');
 const scenarioIds=new Set(Array.isArray(contract?.hypotheses)?contract.hypotheses.map(h=>h.scenarioId):[]);
 if(scenarioIds.size!==10||[...scenarioIds].some(id=>!/^HC-DIFF-(0[1-9]|10)$/.test(id)))mark('INVALID_SCENARIO_CONTRACT');
 for(const row of rows){
  if(!exactFields(row,PRIVATE_FIELDS.measurement)){
   mark('INVALID_MEASUREMENT_SHAPE');continue;
  }
  if(!scenarioIds.has(row.scenarioId))mark('MEASUREMENT_SCENARIO_UNKNOWN');
  if(!Object.prototype.hasOwnProperty.call(quantityUnits,row.quantity)||
     !quantityUnits[row.quantity].includes(row.unit))mark('MEASUREMENT_UNIT_QUANTITY_CONFLICT');
  if(!hasText(row.oemProcedureReference,3,256)||!hasText(row.instrumentRef,3,256)||
     !hasText(row.calibrationRef,3,256)||!hasText(row.testConditionRef,3,256)||
     !hasText(row.portRef,3,256)||!Number.isFinite(row.value)||
     row.performedByAuthorizedTeam!==true)mark('MEASUREMENT_PROVENANCE_INCOMPLETE');
 }
 if(rows.length&&counts.DOCUMENTED_FOR_REVIEW!==8)mark('MEASUREMENT_BEFORE_DOCUMENTARY_CLOSURE');
 // No schema or self-attested human statement can authenticate an OEM document.
 // A complete record is merely a *request for independent human review*.
 const documentaryStatus=flags.size===0&&counts.DOCUMENTED_FOR_REVIEW===8
   ?'READY_FOR_HUMAN_REVIEW':'BLOCKED_PENDING_DOCUMENTATION';
 return Object.freeze({
  schema:'fmea-mining.cat395-public-readiness-result.v1',
  version:'1.3.92',
  nature:'redacted_documentary_completeness_not_technical_validation',
  documentaryStatus,
  gateCounts:Object.freeze({...counts}),
  errorCodes:Object.freeze([...flags].sort()),
  operationalUseAllowed:false,
  approvedSapMapping:false,
  actualFailureConfirmed:false
 });
}
export const evaluatePrivateDraft=assessment;
export function safePublicSummary(draft,contract){
 const r=assessment(draft,contract);
 return Object.fromEntries(PUBLIC_REPORT_KEYS.map(k=>[k,r[k]]));
}
