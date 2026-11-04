/**
 * Avaliador documental não certificador CAT 395.
 * Entrada: registro RESTRITO em ambiente autorizado, nunca armazenado no repositório público.
 * Saída: APENAS agregados e códigos; nenhuma propriedade privada de entrada pode ser copiada.
 */
export const PUBLIC_REPORT_KEYS=[
  'schema','version','nature','documentaryStatus','gateCounts','errorCodes',
  'operationalUseAllowed','approvedSapMapping','actualFailureConfirmed'
];
const hasText=x=>typeof x==='string'&&x.trim().length>=3;
const expectedVariantIds=new Set(['CAT395-BR-TIER3','CAT395-US-T4F','CAT395-FRONT-SHOVEL']);
const expectedStatus=new Set(['NOT_REQUESTED','REQUESTED','RECEIVED_UNVERIFIED','DOCUMENTED_FOR_REVIEW']);
const unique=xs=>new Set(xs).size===xs.length;
function assessment(draft,contract){
 const flags=new Set();
 const counts={MISSING:0,UNVERIFIED:0,CONFLICT:0,DOCUMENTED_FOR_REVIEW:0};
 const mark=c=>flags.add(c);
 const gateIds=Array.isArray(contract?.gates)?contract.gates.map(g=>g.gateId):[];
 const D=draft&&typeof draft==='object'&&!Array.isArray(draft)?draft:{};
 if(D.schema!=='fmea-mining.cat395-private-evidence-draft.v1'||D.contractVersion!=='1.3.92'||D.status!=='DRAFT_FOR_PRIVATE_REVIEW'||D.confidentiality!=='RESTRICTED_CORPORATE')mark('INVALID_RECORD_HEADER');
 if(!D.privacy||D.privacy.authorizedPrivateEnvironment!==true||D.privacy.noPublicExport!==true||D.privacy.externalTransmissionAuthorized!==false)mark('PRIVATE_ENVIRONMENT_NOT_ATTESTED');
 if(D.operationalRelease!==false)mark('OPERATIONAL_RELEASE_FIELD_FORBIDDEN');
 const machine=D.machine||{};
 if(machine.manufacturer!=='Caterpillar'||machine.modelFamily!=='395'||!hasText(machine.serialNumber)||!hasText(machine.arrangementReference)||!expectedVariantIds.has(machine.declaredVariantId))mark('MACHINE_IDENTITY_INCOMPLETE');
 const all=Array.isArray(D.gateEvidence)?D.gateEvidence:[];
 if(all.length!==8||!unique(all.map(g=>g?.gateId)))mark('GATE_SET_INVALID');
 const byId=new Map(all.map(g=>[g?.gateId,g]));
 for(const id of gateIds){
  const e=byId.get(id);
  if(!e){counts.MISSING++;mark('GATE_EVIDENCE_MISSING');continue;}
  if(!expectedStatus.has(e.status)){counts.CONFLICT++;mark('GATE_STATUS_INVALID');continue;}
  if(e.effectiveForSerial===false||(hasText(e.declaredVariantId)&&hasText(machine.declaredVariantId)&&e.declaredVariantId!==machine.declaredVariantId)){
   counts.CONFLICT++;mark('EFFECTIVITY_OR_VARIANT_CONFLICT');continue;
  }
  if(e.status!=='DOCUMENTED_FOR_REVIEW'){
   counts[e.status==='NOT_REQUESTED'?'MISSING':'UNVERIFIED']++;
   continue;
  }
  const valid=hasText(e.privateReference)&&hasText(e.documentRevision)&&
   e.effectiveForSerial===true&&hasText(e.reviewedByRole)&&
   e.declaredVariantId===machine.declaredVariantId;
  if(!valid){counts.UNVERIFIED++;mark('GATE_PROVENANCE_INCOMPLETE');}
  else counts.DOCUMENTED_FOR_REVIEW++;
 }
 if(byId.size!==gateIds.length||gateIds.some(id=>!byId.has(id)))mark('GATE_SET_INVALID');
 const R=D.review||{};
 if(R.independentEngineeringReview!=='HUMAN_REVIEW_DECLARED')mark('INDEPENDENT_REVIEW_NOT_DECLARED');
 if(R.oemEffectivityHumanAttested!==true)mark('OEM_EFFECTIVITY_UNATTESTED');
 if(R.safetyAuthorization!=='AUTHORIZATION_REFERENCED')mark('SAFETY_AUTHORIZATION_UNREFERENCED');
 const S=D.sapReview||{};
 if(S.publicCodePromotion!==false)mark('SAP_PUBLIC_PROMOTION_FORBIDDEN');
 if(S.status!=='PRIVATE_REVIEW_DECLARED')mark('SAP_PRIVATE_REVIEW_PENDING');
 const rows=Array.isArray(D.measurementRows)?D.measurementRows:[];
 if(!Array.isArray(D.measurementRows))mark('INVALID_MEASUREMENT_CONTAINER');
 if(rows.length&&R.actualFieldTestExecution!==true)mark('MEASUREMENT_WITHOUT_EXECUTION_ATTESTATION');
 if(R.actualFieldTestExecution===true&&!rows.length)mark('FIELD_TEST_WITHOUT_TRACEABLE_RESULT');
 if(rows.length&&D.privacy?.authorizedPrivateEnvironment!==true)mark('PRIVATE_MEASUREMENT_EXPOSURE_RISK');
 if(rows.length){
  for(const r of rows){
   if(!r||!hasText(r.oemProcedureReference)||!hasText(r.instrumentRef)||!hasText(r.calibrationRef)||!hasText(r.testConditionRef)||!hasText(r.portRef)||!Number.isFinite(r.value)||r.performedByAuthorizedTeam!==true)mark('MEASUREMENT_PROVENANCE_INCOMPLETE');
   if(!contract?.hypotheses?.some(h=>h.scenarioId===r?.scenarioId))mark('MEASUREMENT_SCENARIO_UNKNOWN');
  }
  if(counts.DOCUMENTED_FOR_REVIEW!==8)mark('MEASUREMENT_BEFORE_DOCUMENTARY_CLOSURE');
 }
 // Schema evaluation, self-attestation and human claims NEVER establish authenticity.
 // Documentary readiness only means required *statements* were provided for manual review.
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
