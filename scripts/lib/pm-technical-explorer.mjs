/** Public read-only technical explorer catalog. Not a field diagnostic, FMEA approval, or work-order interface. */
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const ids=x=>x.map(y=>y.ruleId);
const distinct=x=>new Set(x).size===x.length;
export function normalizeSearch(q){
 return String(q??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR").trim();
}
export function queryExplorer(data,{system="all",track="all",priority="all",query=""}={}){
 if(!data||!Array.isArray(data.records))return [];
 const q=normalizeSearch(query);
 return data.records.filter(p=>{
  if(system!=="all"&&p.system!==system)return false;
  if(track!=="all"&&p.reviewTrack!==track)return false;
  if(priority!=="all"&&p.documentaryPriority!==priority)return false;
  const hay=normalizeSearch([
   p.ruleId,p.system,p.component,p.subgroupCode,p.symptom,p.inspectionMethod,
   p.signal,p.attributionTrap,p.missedDetection,p.confounder,p.reviewTrack,p.documentaryPriority,
   p.sapException?.finding,p.sapException?.nextInspection,p.sapException?.expectedBlocker,
   ...(p.sapException?.minimumEvidence||[]),...(p.sapException?.sourceIds||[]),
   ...p.alternatives.flatMap(x=>[x.candidate,x.requestedEvidence]),
   ...p.qualityCriteria.flatMap(x=>[x.label,x.question])
  ].join(" "));
  return !q||hay.includes(q);
 });
}
export function buildTechnicalExplorer({seeds,observabilityPolicy,detectabilityPolicy,metrologyPolicy,evidencePolicy,maturity,gaps,runbook}){
 const rules=new Map(seeds.records.map(x=>[x.id,x]));
 const obs=new Map(observabilityPolicy.entries.map(x=>[x.ruleId,x]));
 const det=new Map(detectabilityPolicy.checks.map(x=>[x.ruleId,x]));
 const unrankedRecords=[...maturity.unrankedRules].sort().map(id=>{
  const seed=rules.get(id),o=obs.get(id),d=det.get(id);
  if(!seed||!o||!d)throw Error("source_missing_"+id);
  return {ruleId:id,reviewTrack:"UNRANKED_DETECTABILITY",documentaryPriority:null,sapException:null,
   system:seed.system,subgroupCode:seed.subgroupCode,
   component:seed.partText,symptom:seed.symptom,inspectionMethod:seed.inspectionMethod,
   signal:d.signal,attributionTrap:d.attributionTrap,confounder:d.confounder,
   missedDetection:d.missedDetection,inconclusiveBoundary:d.inconclusive,
   safetyBoundary:o.safeBoundary,
   alternatives:o.alternatives.map(a=>({id:a.id,candidate:a.candidate,
    requestedEvidence:a.proposedDiscriminatingEvidence,status:"HYPOTHESIS_NOT_VERIFIED"})),
   qualityCriteria:metrologyPolicy.criteria.map(x=>({id:x.id,label:x.label,
    question:x.reviewQuestion,privateProof:x.privateProof,
    status:"NOT_ASSESSED_PRIVATE_ONLY"})),
   blockers:evidencePolicy.layers.map(x=>({id:x.id,label:x.label,description:x.requiredNext,
    blockerCode:x.blockerCode,status:"OPEN_UNVERIFIED"})),
   priorityStatus:"UNRANKED_NOT_LOW_RISK",
   sourceDataStatus:"CONCEPTUAL_NO_FIELD_OBSERVATION",
   diagnosisStatus:"INCONCLUSIVE_ROOT_CAUSE_NOT_CONFIRMED",
   OEMSeriesEffective:false,approvedSAPMapping:false,operationReleased:false};
 });
 const reviewedQueue=new Map(maturity.reviewQueue.map(x=>[x.ruleId,x]));
 const exceptionalRecords=gaps.records.map(g=>{
  const seed=rules.get(g.ruleId),review=reviewedQueue.get(g.ruleId);
  if(!seed||!review||!["P0","P1"].includes(g.priority)||
     review.priority!==g.priority||review.blocker!==g.expectedBlocker)
    throw Error("invalid_source_exception_"+g.ruleId);
  return {ruleId:g.ruleId,reviewTrack:"PM_SAP_DOCUMENTARY_EXCEPTION",
   documentaryPriority:g.priority,
   sapException:{expectedBlocker:g.expectedBlocker,finding:g.finding,
    nextInspection:g.nextInspection,sourceIds:[...g.sourceIds],
    reviewDiscipline:review.reviewDiscipline,minimumEvidence:[...review.minimumEvidence],
    disposition:g.status,autoRemapAllowed:false},
   system:seed.system,subgroupCode:seed.subgroupCode,component:seed.partText,
   symptom:seed.symptom,inspectionMethod:seed.inspectionMethod,
   signal:null,attributionTrap:null,confounder:null,missedDetection:null,
   inconclusiveBoundary:null,safetyBoundary:null,
   alternatives:[],qualityCriteria:[],blockers:[],
   priorityStatus:"DOCUMENTED_QUEUE_PRIORITY_NOT_OPERATIONAL_RISK",
   sourceDataStatus:"SAP_MAPPING_EXCEPTION_NOT_FIELD_DIAGNOSIS",
   diagnosisStatus:"INCONCLUSIVE_ROOT_CAUSE_NOT_CONFIRMED",
   OEMSeriesEffective:false,approvedSAPMapping:false,operationReleased:false};
 });
 const records=[...unrankedRecords,...exceptionalRecords].sort((a,b)=>a.ruleId.localeCompare(b.ruleId));
 return {schema:"fmea-mining.pm-technical-explorer.v1",version:"1.3.83",
  asOfDate:"2026-10-28",nature:"PUBLIC_CONCEPTUAL_READ_ONLY",
  provenance:{preventiveSeeds:seeds.version,observability:observabilityPolicy.version,
   detectability:detectabilityPolicy.version,metrology:metrologyPolicy.version,
   evidenceMaturity:evidencePolicy.version,legacyMaturity:maturity.version},
  summary:{conceptualSeedCount:seeds.records.length,explorableRules:records.length,unrankedRules:unrankedRecords.length,
   documentedSapExceptions:exceptionalRecords.length,
   documentedP0:exceptionalRecords.filter(x=>x.documentaryPriority==="P0").length,
   documentedP1:exceptionalRecords.filter(x=>x.documentaryPriority==="P1").length,
   systems:new Set(records.map(x=>x.system)).size,
   proposedAlternatives:records.reduce((n,x)=>n+x.alternatives.length,0),
   unassessedPrivateQualityChecks:records.reduce((n,x)=>n+x.qualityCriteria.length,0),
   openEvidenceMaturityLayers:records.reduce((n,x)=>n+x.blockers.length,0),
   blockedSapExceptions:gaps.records.length,blockedCorporateGates:runbook.phases.length,
   verifiedFieldCases:0,confirmedRootCauses:0,approvedSapLinks:0,
   operationalReleases:0,decision:"NO_GO"},
  boundaries:{offlineStandalone:true,noExternalNetworkCalls:true,noRealAssetData:true,
   noFieldEvidence:true,noRiskScore:true,noRealOEMEffectiveClaims:true,
   noAutomaticDiagnosis:true,noSAPWrites:true,noWorkOrders:true,noOperationalRelease:true},
  records};
}
export function assessTechnicalExplorer(input,output){
 const errors=[],check=(ok,id)=>{if(!ok)errors.push(id)};
 let expected;try{expected=buildTechnicalExplorer(input)}
 catch(e){return {status:"REJECTED",errors:["build_"+e.message]}};
 const {seeds,observabilityPolicy,detectabilityPolicy,metrologyPolicy,evidencePolicy,maturity,gaps,runbook}=input;
 check(equal(expected,output),"generated_source_drift");
 check(seeds.records.length===25&&distinct(seeds.records.map(x=>x.id))&&
  seeds.records.every(x=>x.status==="hipotese_de_protecao_preventiva"&&x.review==="pendente"),"seed_not_approved");
 check(maturity.version==="1.3.60"&&maturity.unrankedRules.length===15&&
  maturity.summary.withoutDocumentedPriority===15&&maturity.summary.fieldConfirmed===0&&
  maturity.summary.serialOemVerified===0&&maturity.summary.sapMappingsApproved===0&&
  maturity.summary.candidatePreventiveLinks===115&&maturity.reviewQueue.length===10&&
  distinct(ids(maturity.reviewQueue)),"legacy_maturity_not_real");
 check(observabilityPolicy.version==="1.3.76"&&observabilityPolicy.entries.length===15&&
  equal([...ids(observabilityPolicy.entries)].sort(),[...maturity.unrankedRules].sort())&&
  observabilityPolicy.entries.every(x=>x.alternatives.length===2&&
   x.fieldEvidenceReceived===false&&x.OEMSerialVerified===false&&
   x.SAPMappingApproved===false&&x.engineeringReviewApproved===false),"observation_hypotheses_not_verified");
 check(detectabilityPolicy.version==="1.3.77"&&detectabilityPolicy.checks.length===15&&
  equal([...ids(detectabilityPolicy.checks)].sort(),[...maturity.unrankedRules].sort())&&
  detectabilityPolicy.checks.every(x=>x.actualTestPerformed===false&&
   x.validatedSensitivity===null&&x.validatedSpecificity===null&&
   x.OEMMethodEffective===false)&&
  Object.values(detectabilityPolicy.guardrails).every(x=>x===true),"detectability_unvalidated");
 check(metrologyPolicy.version==="1.3.78"&&metrologyPolicy.criteria.length===10&&
  equal(metrologyPolicy.ruleIds,[...maturity.unrankedRules].sort())&&
  metrologyPolicy.criteria.every(x=>x.actualEvidenceReceived===false&&
   x.corporateApprovalReceived===false)&&
  Object.values(metrologyPolicy.guardrails).every(x=>x===true),"metrology_unassessed");
 check(evidencePolicy.version==="1.3.79"&&evidencePolicy.layers.length===6&&
  Object.values(evidencePolicy.guardrails).every(x=>x===true),"evidence_review_unapproved");
 check(gaps.records.length===10&&distinct(ids(gaps.records))&&
  gaps.records.every(x=>!maturity.unrankedRules.includes(x.ruleId))&&
  gaps.records.filter(x=>x.priority==="P0").length===5&&
  gaps.records.filter(x=>x.priority==="P1").length===5&&
  gaps.records.every(x=>x.autoRemapAllowed===false&&x.observedFailures===0&&
   x.status==="bloqueado_aguardando_curadoria"&&x.reviewer===null&&
   x.approvedModelIds.length===0&&x.confirmedSapLocationIds.length===0&&
   x.verifiedPartCodes.length===0),"ten_sap_exceptions_locked");
 check(runbook.phases.length===8&&runbook.phases.every(x=>
  x.gate==="BLOCK"&&x.status==="not_started"&&x.decisionToken===null)&&
  runbook.goNoGo.decision==="NO_GO","eight_corporate_gates_locked");
 check(output.schema==="fmea-mining.pm-technical-explorer.v1"&&output.version==="1.3.83"&&
  output.nature==="PUBLIC_CONCEPTUAL_READ_ONLY","schema_and_public_boundary");
 check(output.summary.explorableRules===25&&output.summary.unrankedRules===15&&
  output.summary.documentedSapExceptions===10&&output.summary.documentedP0===5&&
  output.summary.documentedP1===5&&output.summary.proposedAlternatives===30&&
  output.summary.unassessedPrivateQualityChecks===150&&
  output.summary.openEvidenceMaturityLayers===90&&
  output.summary.blockedSapExceptions===10&&output.summary.blockedCorporateGates===8&&
  output.summary.verifiedFieldCases===0&&output.summary.confirmedRootCauses===0&&
  output.summary.approvedSapLinks===0&&output.summary.operationalReleases===0&&
  output.summary.decision==="NO_GO"&&Object.values(output.boundaries).every(x=>x===true),"no_go_scope");
 check(output.records.length===25&&distinct(ids(output.records))&&
  output.records.filter(p=>p.reviewTrack==="UNRANKED_DETECTABILITY").length===15&&
  output.records.filter(p=>p.reviewTrack==="PM_SAP_DOCUMENTARY_EXCEPTION").length===10&&
  output.records.filter(p=>p.reviewTrack==="UNRANKED_DETECTABILITY").every(p=>{
   const seed=seeds.records.find(x=>x.id===p.ruleId);
   const o=observabilityPolicy.entries.find(x=>x.ruleId===p.ruleId);
   const d=detectabilityPolicy.checks.find(x=>x.ruleId===p.ruleId);
   return p.reviewTrack==="UNRANKED_DETECTABILITY"&&p.documentaryPriority===null&&
    p.sapException===null&&!!seed&&!!o&&!!d&&p.system===seed.system&&p.component===seed.partText&&
    p.symptom===seed.symptom&&p.inspectionMethod===seed.inspectionMethod&&
    p.signal===d.signal&&p.attributionTrap===d.attributionTrap&&
    p.missedDetection===d.missedDetection&&p.safetyBoundary===o.safeBoundary&&
    p.alternatives.length===2&&p.alternatives.every(x=>x.status==="HYPOTHESIS_NOT_VERIFIED")&&
    p.qualityCriteria.length===10&&p.qualityCriteria.every(x=>x.status==="NOT_ASSESSED_PRIVATE_ONLY")&&
    p.blockers.length===6&&p.blockers.every(x=>x.status==="OPEN_UNVERIFIED")&&
    p.priorityStatus==="UNRANKED_NOT_LOW_RISK"&&
    p.diagnosisStatus==="INCONCLUSIVE_ROOT_CAUSE_NOT_CONFIRMED"&&
    p.OEMSeriesEffective===false&&p.approvedSAPMapping===false&&p.operationReleased===false;
  }),"every_unranked_record_preserves_provenance");
 check(output.records.filter(p=>p.reviewTrack==="PM_SAP_DOCUMENTARY_EXCEPTION").every(p=>{
  const seed=seeds.records.find(x=>x.id===p.ruleId),gap=gaps.records.find(x=>x.ruleId===p.ruleId);
  const review=maturity.reviewQueue.find(x=>x.ruleId===p.ruleId);
  return !!seed&&!!gap&&!!review&&p.system===seed.system&&
   p.component===seed.partText&&p.symptom===seed.symptom&&
   p.inspectionMethod===seed.inspectionMethod&&p.documentaryPriority===gap.priority&&
   p.priorityStatus==="DOCUMENTED_QUEUE_PRIORITY_NOT_OPERATIONAL_RISK"&&
   p.sourceDataStatus==="SAP_MAPPING_EXCEPTION_NOT_FIELD_DIAGNOSIS"&&
   p.sapException?.expectedBlocker===gap.expectedBlocker&&
   p.sapException.finding===gap.finding&&p.sapException.nextInspection===gap.nextInspection&&
   equal(p.sapException.sourceIds,gap.sourceIds)&&
   equal(p.sapException.minimumEvidence,review.minimumEvidence)&&
   p.sapException.reviewDiscipline===review.reviewDiscipline&&
   p.sapException.disposition===gap.status&&p.sapException.autoRemapAllowed===false&&
   p.signal===null&&p.attributionTrap===null&&p.confounder===null&&
   p.missedDetection===null&&p.inconclusiveBoundary===null&&p.safetyBoundary===null&&
   p.alternatives.length===0&&p.qualityCriteria.length===0&&p.blockers.length===0&&
   p.diagnosisStatus==="INCONCLUSIVE_ROOT_CAUSE_NOT_CONFIRMED"&&
   p.OEMSeriesEffective===false&&p.approvedSAPMapping===false&&p.operationReleased===false;
 }),"every_documented_exception_is_distinct_and_blocked");
 return {status:errors.length?"REJECTED":"NO_GO_READ_ONLY_CATALOG",errors};
}
