/** Public detectability assumptions. No field measurements, calibrated performance or approval. */
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const uniq=a=>new Set(a).size===a.length;
const states=["observed","notObserved","ambiguous"];
const unsafe=s=>/\b(causa raiz confirmada|risco baixo|falha comprovada|aprovado pelo OEM|sap aprovado|operacionalmente liberado|equipamento liberado)\b/i.test(s);
export function classifyInspectionSignal(sample,policy){
 if(!sample||typeof sample!=="object"||Array.isArray(sample)||
   Object.keys(sample).length!==2||
   !Object.hasOwn(sample,"ruleId")||!Object.hasOwn(sample,"signalState")||
   !policy.checks.some(x=>x.ruleId===sample.ruleId)||
   !states.includes(sample.signalState))return "REJECT_UNKNOWN_OR_UNSAFE_SIGNAL";
 return policy.safeStates[sample.signalState];
}
export function buildInspectionDetectability({policy,observability,seeds,maturity,gaps,runbook}){
 const source=new Map(observability.packets.map(x=>[x.ruleId,x]));
 const checks=policy.checks.map(x=>{
   const p=source.get(x.ruleId);
   if(!p)throw Error("unknown_prior_rule_"+x.ruleId);
   return {ruleId:x.ruleId,system:p.system,subgroupCandidate:p.subgroupCandidate,
     seedSymptomLiteral:p.sourceSymptomLiteral,seedMethodLiteral:p.sourceInspectionMethodLiteral,
     sourceObservabilityAlternativeIds:p.hypotheticalAlternatives.map(a=>a.alternativeId),
     conceptualSignal:x.signal,hypotheticalAttributionTrap:x.attributionTrap,
     uncontrolledContext:x.confounder,hypotheticalMissedDetection:x.missedDetection,
     mandatoryInconclusiveBoundary:x.inconclusive,
     capabilityStatus:x.detectionCapabilityClass,
     sensitivity:null,specificity:null,measurementUncertainty:null,
     actualPositiveObservations:0,actualNegativeObservations:0,
     falsePositiveObservedCount:0,falseNegativeObservedCount:0,
     OEMMethodEffective:false,realMeasurementPerformed:false,safetyApprovalReceived:false,
     diagnosis:"NO_CONFIRMED_MECHANISM",riskPriorityAssigned:false,
     SAPChangeAllowed:false,workAuthorized:false,operationsReleased:false,
     disposition:"NO_GO_PUBLIC_OBSERVABILITY_BOUNDARY"};
 });
 const simulations=checks.flatMap(c=>states.map(signalState=>{
   const disposition=classifyInspectionSignal({ruleId:c.ruleId,signalState},policy);
   return {ruleId:c.ruleId,syntheticSignalState:signalState,
     proposedInterpretation:disposition,
     alternativesRemainOpen:true,actualObservationMade:false,
     noSignalDoesNotProveHealth:true,qualifiedMeasurements:0,
     causeRootConfirmed:false,OEMApplicabilityApproved:false,
     humanReviewerSigned:false,confidenceCalibrated:false,
     riskPriorityAssigned:false,SAPUpdated:false,workOrderCreated:false,
     operationalRelease:false,status:"NO_GO_SYNTHETIC_ONLY"};
 }));
 return {schema:"fmea-mining.pm-inspection-detectability.v1",version:policy.version,
   nature:"unvalidated_detection_and_attribution_risks_not_field_performance",
   upstreamVersions:{observability:observability.version,seeds:seeds.version,
     maturity:maturity.version,gaps:gaps.version,runbook:runbook.version},
   summary:{sourceRuleCount:seeds.records.length,unrankedInspections:checks.length,
     conceptualAlternatives:observability.summary.proposedNonexclusiveAlternatives,
     hypotheticalAttributionTraps:checks.length,hypotheticalMissedDetectionPaths:checks.length,
     uncontrolledContextCaveats:checks.length,
     simulatedObservationStates:simulations.length,
     actualObservations:0,validatedSensitivityCount:0,validatedSpecificityCount:0,
     realDiagnosticConfirmations:0,realPriorityAssignments:0,
     OEMSeriesVerified:0,workOrdersCreated:0,SAPChanges:0,operationalReleases:0,
     privateGatesBlocked:runbook.phases.length,SAPExceptionsBlocked:gaps.records.length,
     publicDecision:"NO_GO"},
   terms:policy.terminology,preconditionRequests:policy.requiredNextPrivateChecks,
   detectionChecks:checks,syntheticInterpretationDrills:simulations,
   prioritySemantics:"UNRANKED_IS_NOT_LOW_RISK",
   overallStatus:"NO_GO_METHODOLOGY_NOT_FIELD_VALIDATED"};
}
export function assessInspectionDetectability(input,report){
 const {policy,observability,seeds,maturity,gaps,runbook}=input;
 const errors=[],ck=(ok,id)=>{if(!ok)errors.push(id)};
 let expected;try{expected=buildInspectionDetectability(input)}
 catch(e){return {status:"REJECTED",errors:["build_"+e.message]}};
 ck(eq(expected,report),"generated_report_integrity");
 ck(policy.schema==="fmea-mining.pm-inspection-detectability-policy.v1"&&
  policy.version==="1.3.77"&&policy.predecessor==="1.3.76"&&
  policy.purpose.length>120,"policy_identity");
 ck(policy.terminology.falsePositive.includes("not statistical false-positive rate")&&
  policy.terminology.falseNegative.includes("does not prove equipment or component health")&&
  policy.terminology.inconclusive.includes("no auto-confirmation"),"false_positive_rate_not_estimated");
 ck(eq(policy.syntheticSignals,states)&&
  eq(policy.safeStates,{observed:"EVIDENCE_PENDING_COMPETING_EXPLANATIONS",
   notObserved:"ABSENCE_DOES_NOT_EXCLUDE_FAILURE",
   ambiguous:"INCONCLUSIVE_REQUIRE_HUMAN_REVIEW"}),"signal_state_vocabulary");
 ck(policy.checks.length===15&&uniq(policy.checks.map(x=>x.ruleId))&&
  eq([...policy.checks.map(x=>x.ruleId)].sort(),[...maturity.unrankedRules].sort())&&
  policy.checks.every(x=>[x.signal,x.attributionTrap,x.confounder,x.missedDetection,x.inconclusive]
     .every(s=>typeof s==="string"&&s.length>55&&!unsafe(s))&&
    x.detectionCapabilityClass==="UNVALIDATED_QUALITATIVE_ONLY"&&
    x.validatedSensitivity===null&&x.validatedSpecificity===null&&
    x.measurementUncertainty===null&&x.truePositiveObservations===0&&
    x.falsePositiveObservations===0&&x.falseNegativeObservations===0&&
    x.OEMMethodEffective===false&&x.actualTestPerformed===false&&
    x.safetyAuthorized===false),"per_rule_detection_is_qualitative_not_statistical");
 ck(policy.requiredNextPrivateChecks.length===6&&
  uniq(policy.requiredNextPrivateChecks)&&
  eq(policy.allowedConclusions,["REQUEST_EVIDENCE_ONLY","UNRESOLVED_DIAGNOSIS","DO_NOT_CHANGE_PRIORITY"])&&
  Object.values(policy.guardrails).every(x=>x===true),"strict_no_go_actions");
 ck(seeds.records.length===25&&uniq(seeds.records.map(x=>x.id))&&
  seeds.records.every(x=>x.status==="hipotese_de_protecao_preventiva"&&x.review==="pendente"),"unapproved_seed_rules");
 ck(observability.version==="1.3.76"&&observability.summary.unrankedRules===15&&
  observability.summary.proposedNonexclusiveAlternatives===30&&
  observability.summary.actualMeasurements===0&&
  observability.summary.realPriorityAssignments===0&&
  observability.packets.length===15&&observability.packets.every(p=>
   p.decision==="NO_GO"&&p.mayAuthorizeTesting===false&&
   p.mayPromoteFMEA===false&&p.hypotheticalAlternatives.length===2&&
   p.hypotheticalAlternatives.every(a=>a.physicalDamageConfirmed===false&&a.rootCauseConfirmed===false)),"source_observability_not_promoted");
 ck(maturity.summary.seedRules===25&&maturity.summary.withoutDocumentedPriority===15&&
  maturity.summary.serialOemVerified===0&&maturity.summary.fieldConfirmed===0&&
  maturity.summary.sapMappingsApproved===0&&maturity.unrankedRules.length===15,"maturity_unchanged");
 ck(gaps.records.length===10&&gaps.records.filter(x=>x.priority==="P0").length===5&&
  gaps.records.filter(x=>x.priority==="P1").length===5&&
  gaps.records.every(x=>x.autoRemapAllowed===false&&x.observedFailures===0),"exception_block");
 ck(runbook.version==="1.3.62"&&runbook.phases.length===8&&
  runbook.phases.every(p=>p.gate==="BLOCK"&&p.status==="not_started"&&p.decisionToken===null)&&
  runbook.goNoGo.decision==="NO_GO"&&runbook.goNoGo.realPilotAllowed===false,"private_homologation_block");
 ck(report.schema==="fmea-mining.pm-inspection-detectability.v1"&&
  report.version==="1.3.77"&&report.nature==="unvalidated_detection_and_attribution_risks_not_field_performance","output_identity");
 const s=report.summary;
 ck(s.sourceRuleCount===25&&s.unrankedInspections===15&&
  s.conceptualAlternatives===30&&s.hypotheticalAttributionTraps===15&&
  s.hypotheticalMissedDetectionPaths===15&&s.uncontrolledContextCaveats===15&&
  s.simulatedObservationStates===45&&s.privateGatesBlocked===8&&
  s.SAPExceptionsBlocked===10&&s.publicDecision==="NO_GO","summary_counts");
 ck(["actualObservations","validatedSensitivityCount","validatedSpecificityCount",
  "realDiagnosticConfirmations","realPriorityAssignments","OEMSeriesVerified",
  "workOrdersCreated","SAPChanges","operationalReleases"].every(k=>s[k]===0),"no_field_results");
 ck(report.detectionChecks.length===15&&report.detectionChecks.every(x=>{
  const p=observability.packets.find(y=>y.ruleId===x.ruleId);
  return p&&x.seedSymptomLiteral===p.sourceSymptomLiteral&&
   x.seedMethodLiteral===p.sourceInspectionMethodLiteral&&
   eq(x.sourceObservabilityAlternativeIds,p.hypotheticalAlternatives.map(z=>z.alternativeId))&&
   x.capabilityStatus==="UNVALIDATED_QUALITATIVE_ONLY"&&
   ["sensitivity","specificity","measurementUncertainty"].every(k=>x[k]===null)&&
   ["actualPositiveObservations","actualNegativeObservations","falsePositiveObservedCount",
    "falseNegativeObservedCount"].every(k=>x[k]===0)&&
   ["OEMMethodEffective","realMeasurementPerformed","safetyApprovalReceived",
    "riskPriorityAssigned","SAPChangeAllowed","workAuthorized","operationsReleased"].every(k=>x[k]===false)&&
   x.diagnosis==="NO_CONFIRMED_MECHANISM"&&
   x.disposition==="NO_GO_PUBLIC_OBSERVABILITY_BOUNDARY";
 }),"inspection_not_a_real_test");
 ck(report.syntheticInterpretationDrills.length===45&&report.syntheticInterpretationDrills.every(d=>
  states.includes(d.syntheticSignalState)&&
  d.proposedInterpretation===policy.safeStates[d.syntheticSignalState]&&
  d.alternativesRemainOpen===true&&d.noSignalDoesNotProveHealth===true&&
  d.qualifiedMeasurements===0&&
  ["actualObservationMade","causeRootConfirmed","OEMApplicabilityApproved",
   "humanReviewerSigned","confidenceCalibrated","riskPriorityAssigned",
   "SAPUpdated","workOrderCreated","operationalRelease"].every(k=>d[k]===false)&&
  d.status==="NO_GO_SYNTHETIC_ONLY"),"simulated_states_cannot_promote_root_cause");
 ck(report.prioritySemantics==="UNRANKED_IS_NOT_LOW_RISK"&&
  report.overallStatus==="NO_GO_METHODOLOGY_NOT_FIELD_VALIDATED","no_priority_or_go");
 return {status:errors.length?"REJECTED":"NO_GO_QUALITATIVE_DETECTABILITY",errors,fieldDetectionValidated:false};
}
