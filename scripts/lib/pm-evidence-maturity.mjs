/** Consolidated public evidence maturity. Never interprets synthetic completeness as an approved diagnosis. */
import {classifyInspectionSignal} from "./pm-inspection-detectability.mjs";
import {classifySyntheticMetrology} from "./pm-metrology-provenance.mjs";
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const distinct=a=>new Set(a).size===a.length;
const exact=(x,fields)=>x!==null&&typeof x==="object"&&!Array.isArray(x)&&
 Object.keys(x).length===fields.length&&fields.every(k=>Object.hasOwn(x,k));
export function classifySyntheticMaturity(sample,{policy,detectabilityPolicy,metrologyPolicy}){
 if(!exact(sample,["ruleId","signalState","scenarioId"])||
  !metrologyPolicy.ruleIds.includes(sample.ruleId)||
  !policy.syntheticCases.some(x=>x.id===sample.scenarioId&&x.signalState===sample.signalState))
  return {decision:"REJECT_UNSUPPORTED_PUBLIC_INPUT"};
 const sc=policy.syntheticCases.find(x=>x.id===sample.scenarioId);
 const met=metrologyPolicy.scenarios.find(x=>x.id===sc.metrologyScenarioId);
 if(!met)return {decision:"REJECT_UNSUPPORTED_PUBLIC_INPUT"};
 const statuses=Object.fromEntries(metrologyPolicy.sequence.map(id=>[id,"hypothetically_documented"]));
 Object.assign(statuses,met.override);
 const signal=classifyInspectionSignal({ruleId:sample.ruleId,signalState:sample.signalState},detectabilityPolicy);
 const quality=classifySyntheticMetrology({ruleId:sample.ruleId,statuses},metrologyPolicy);
 if(signal.startsWith("REJECT_")||quality.startsWith("REJECT_"))return {decision:"REJECT_UNSUPPORTED_PUBLIC_INPUT"};
 return {signalInterpretation:signal,privateEvidenceQualityRoute:quality,
  evidenceStatus:"HYPOTHETICAL_AND_UNVERIFIED",
  causalDisposition:"INCONCLUSIVE_ALTERNATIVES_OPEN",
  decision:"NO_GO_SYNTHETIC_ONLY"};
}
export function buildEvidenceMaturity({policy,observability,detectability,metrology,detectabilityPolicy,metrologyPolicy,maturity,gaps,runbook}){
 const base=new Map(observability.packets.map(x=>[x.ruleId,x]));
 const det=new Map(detectability.detectionChecks.map(x=>[x.ruleId,x]));
 const m=new Map(metrology.packets.map(x=>[x.ruleId,x]));
 const unranked=[...maturity.unrankedRules].sort();
 const packets=unranked.map(id=>{
  const a=base.get(id),b=det.get(id),c=m.get(id);
  if(!a||!b||!c)throw Error("missing_prior_quality_layer_"+id);
  const blockers=policy.layers.map(x=>({layerId:x.id,
   blockerCode:x.blockerCode,documentaryState:x.status,
   nextPrivateVerification:x.requiredNext,
   humanAssessmentRecorded:false,blockerClosed:false}));
  return {
   ruleId:id,system:a.system,
   seedSymptomLiteral:a.sourceSymptomLiteral,
   seedInspectionMethodLiteral:a.sourceInspectionMethodLiteral,
   candidateComponent:a.componentCandidate,
   originalPriority:null,lowRiskInferred:false,
   conceptualAlternativeIds:a.hypotheticalAlternatives.map(x=>x.alternativeId),
   hypothesisCount:a.hypotheticalAlternatives.length,
   qualitativeDetectionTrap:b.hypotheticalAttributionTrap,
   qualitativeMissedDetection:b.hypotheticalMissedDetection,
   mandatoryInconclusiveBoundary:b.mandatoryInconclusiveBoundary,
   safetyBoundary:a.essentialSafetyBoundary,
   criteriaUnassessed:c.requiredReviewCriteria.map(x=>x.criterionId),
   criteriaEvaluated:0,applicabilityOfInstrumentUndecided:true,
   evidenceMaturityStages:blockers,blockersRemaining:blockers.length,
   originalModelsAreNotVerifiedAssets:true,
   realInspectionPerformed:false,physicalDamageConfirmed:false,
   rootCauseConfirmed:false,OEMSerialEffective:false,
   measurementTraceabilityAccepted:false,independentEngineeringSignoff:false,
   FMEAApproved:false,SAPMappingApproved:false,workOrderAllowed:false,
   operationReleaseAllowed:false,
   evidenceStatus:"NO_REAL_EVIDENCE_YET",
   diagnosticDecision:"INCONCLUSIVE_CAUSAL_ATTRIBUTION",
   publicationDecision:"NO_GO"
  };
 });
 const scenarios=packets.flatMap(p=>policy.syntheticCases.map(x=>{
  const derived=classifySyntheticMaturity({ruleId:p.ruleId,signalState:x.signalState,scenarioId:x.id},
   {policy,detectabilityPolicy,metrologyPolicy});
  return {ruleId:p.ruleId,scenarioId:x.id,
   syntheticSignal:x.signalState,
   signalInterpretation:derived.signalInterpretation,
   hypotheticalQualityRoute:derived.privateEvidenceQualityRoute,
   evidenceStatus:derived.evidenceStatus,causalDisposition:derived.causalDisposition,
   humanReviewRecorded:false,realEvidenceReceived:false,
   independentCausalConfirmation:false,SAPChanged:false,workOrdered:false,
   operationReleased:false,decision:derived.decision};
 }));
 return {schema:"fmea-mining.pm-evidence-maturity.v1",version:policy.version,
  nature:"consolidated_public_unverified_evidence_dependencies_not_a_risk_score",
  upstreamVersions:{observability:observability.version,detectability:detectability.version,
   metrology:metrology.version,maturity:maturity.version,gaps:gaps.version,runbook:runbook.version},
  summary:{allConceptualSeeds:maturity.summary.seedRules,
   unrankedRules:packets.length,conceptualAlternatives:packets.reduce((n,p)=>n+p.hypothesisCount,0),
   qualitativeDetectionBoundaries:packets.length,
   unevaluatedQualityRequirements:packets.reduce((n,p)=>n+p.criteriaUnassessed.length,0),
   unresolvedMaturityLayerPositions:packets.reduce((n,p)=>n+p.blockersRemaining,0),
   syntheticTraceabilityScenarios:scenarios.length,
   realInspections:0,documentaryEvidenceReceived:0,validatedOEMSeries:0,
   confirmedRootCauses:0,authorizedIndependentReviews:0,
   approvedFMEA:0,recordedRiskRankings:0,approvedSAPRemaps:0,
   generatedOrders:0,operationReleases:0,
   corporateGatesBlocked:runbook.phases.length,
   originalPM_SAPBlocks:gaps.records.length,decision:"NO_GO"},
  layerLegend:policy.layers,
  packets,syntheticReviewDrills:scenarios,
  status:"NO_GO_NO_REAL_EVIDENCE_NO_AUTOMATIC_PROMOTION",
  nextQualifiedActivity:"PRIVATE_OEM_AND_FIELD_EVIDENCE_REVIEW_WITH_INDEPENDENT_ENGINEERING_SIGNOFF"};
}
export function assessEvidenceMaturity(input,report){
 const {policy,observability,detectability,metrology,detectabilityPolicy,metrologyPolicy,maturity,gaps,runbook}=input;
 const errors=[],ck=(v,id)=>{if(!v)errors.push(id)};
 let expected;try{expected=buildEvidenceMaturity(input)}
 catch(e){return {status:"REJECTED",errors:["build_"+e.message]}};
 ck(eq(expected,report),"report_source_drift");
 ck(policy.schema==="fmea-mining.pm-evidence-maturity-policy.v1"&&policy.version==="1.3.79"&&
  policy.predecessor==="1.3.78"&&policy.scope==="all_15_unranked_pm_rules_not_new_operational_priority"&&
  policy.purpose.length>125,"policy_scope");
 ck(eq(policy.sourceVersions,{observability:"1.3.76",detectability:"1.3.77",
  metrology:"1.3.78",maturity:"1.3.60"})&&
  observability.version==="1.3.76"&&detectability.version==="1.3.77"&&
  metrology.version==="1.3.78"&&maturity.version==="1.3.60","source_version_lock");
 const stages=["conceptual_model","detection_limits","measurement_quality",
   "oem_effectivity","qualified_review","execution_and_sap"];
 ck(policy.layers.length===6&&eq(policy.layers.map(x=>x.id),stages)&&
  policy.layers.every(x=>x.label.length>14&&x.blockerCode.length>17&&
    x.requiredNext.length>50&&x.status.length>22)&&
  policy.noGoSummary==="MODEL_COVERAGE_IS_NOT_EVIDENCE_QUALITY_OR_OPERATIONAL_READINESS",
  "six_dependency_stages_not_priorities");
 ck(eq(policy.privateQualityCriteria,metrologyPolicy.sequence)&&
  policy.privateQualityCriteria.length===10&&
  policy.syntheticCases.length===6&&distinct(policy.syntheticCases.map(x=>x.id))&&
  eq(policy.syntheticCases.map(x=>[x.signalState,x.metrologyScenarioId]),[
   ["observed","apparently_complete_remains_blocked"],
   ["notObserved","apparently_complete_remains_blocked"],
   ["ambiguous","apparently_complete_remains_blocked"],
   ["observed","missing_oem_method"],
   ["ambiguous","unsafe_condition"],
   ["observed","not_applicable_requires_decision"]])&&
  eq(policy.routeSemantics,{observed:"EVIDENCE_PENDING_COMPETING_EXPLANATIONS",
   notObserved:"ABSENCE_DOES_NOT_EXCLUDE_FAILURE",
   ambiguous:"INCONCLUSIVE_REQUIRE_HUMAN_REVIEW",
   allHypotheticallyComplete:"HOLD_INDEPENDENT_PRIVATE_QUALIFIED_REVIEW",
   unsafe:"STOP_UNAUTHORIZED_OPERATION_REQUEST_SAFETY_REVIEW",
   OEMMissing:"HOLD_OEM_METHOD_PRIVATE_EVIDENCE",
   notApplicable:"HOLD_METHOD_APPLICABILITY_JUSTIFICATION"})&&
  Object.values(policy.guardrails).every(v=>v===true),"synthetic_routing_guardrails");
 ck(maturity.summary.seedRules===25&&maturity.unrankedRules.length===15&&
  maturity.summary.withoutDocumentedPriority===15&&maturity.summary.fieldConfirmed===0&&
  maturity.summary.serialOemVerified===0&&maturity.summary.sapMappingsApproved===0&&
  maturity.summary.candidatePreventiveLinks===115,"unpromoted_maturity");
 ck(observability.packets.length===15&&
  observability.summary.actualMeasurements===0&&
  observability.summary.realPriorityAssignments===0&&
  observability.packets.every(x=>x.hypotheticalAlternatives.length===2&&
   x.originalRecordedPriority===null&&x.mayPromoteFMEA===false&&
   x.realAssetMapped===false&&x.decision==="NO_GO"&&
   x.hypotheticalAlternatives.every(a=>a.rootCauseConfirmed===false&&
    a.physicalDamageConfirmed===false&&a.OEMEffectivityVerified===false&&
    a.evidenceActuallyCollected===false&&a.engineeringSignoff===false&&
    a.SAPlinkApproved===false)),"conceptual_observability");
 ck(detectability.detectionChecks.length===15&&detectability.summary.actualObservations===0&&
  detectability.summary.validatedSensitivityCount===0&&
  detectability.summary.validatedSpecificityCount===0&&
  detectability.detectionChecks.every(x=>x.sensitivity===null&&x.specificity===null&&
   x.realMeasurementPerformed===false&&x.diagnosis==="NO_CONFIRMED_MECHANISM"),
   "detectability_unvalidated");
 ck(metrology.packets.length===15&&metrology.summary.unassessedPrivateEvidenceSlots===150&&
  metrology.summary.actualEvidenceItemsReceived===0&&
  metrology.summary.privateReviewerApprovals===0&&
  metrology.packets.every(x=>x.requiredReviewCriteria.length===10&&
    x.qualityAssessmentApproved===false&&x.realMeasurementTaken===false&&
    x.requiredReviewCriteria.every(c=>c.status==="UNASSESSED_NO_REAL_EVIDENCE"&&
    c.independentReviewerSigned===false)),"metrology_not_real");
 ck(eq(metrologyPolicy.ruleIds,[...maturity.unrankedRules].sort())&&
  metrologyPolicy.scenarios.length===13&&
  detectabilityPolicy.checks.length===15&&
  eq(detectabilityPolicy.safeStates,{
   observed:"EVIDENCE_PENDING_COMPETING_EXPLANATIONS",
   notObserved:"ABSENCE_DOES_NOT_EXCLUDE_FAILURE",
   ambiguous:"INCONCLUSIVE_REQUIRE_HUMAN_REVIEW"})&&
  metrologyPolicy.routes.all_synthetic==="HOLD_INDEPENDENT_PRIVATE_QUALIFIED_REVIEW"&&
  metrologyPolicy.routes.unsafe==="STOP_UNAUTHORIZED_OPERATION_REQUEST_SAFETY_REVIEW",
  "downstream_routes_cannot_approve");
 ck(gaps.records.length===10&&gaps.records.filter(x=>x.priority==="P0").length===5&&
  gaps.records.filter(x=>x.priority==="P1").length===5&&
  gaps.records.every(x=>x.autoRemapAllowed===false&&x.observedFailures===0)&&
  runbook.phases.length===8&&runbook.phases.every(x=>
   x.gate==="BLOCK"&&x.status==="not_started"&&x.decisionToken===null)&&
  runbook.goNoGo.decision==="NO_GO","SAP_and_corporate_gates");
 const s=report.summary;
 ck(report.schema==="fmea-mining.pm-evidence-maturity.v1"&&report.version==="1.3.79"&&
  report.nature==="consolidated_public_unverified_evidence_dependencies_not_a_risk_score",
  "report_identity");
 ck(s.allConceptualSeeds===25&&s.unrankedRules===15&&
  s.conceptualAlternatives===30&&s.qualitativeDetectionBoundaries===15&&
  s.unevaluatedQualityRequirements===150&&s.unresolvedMaturityLayerPositions===90&&
  s.syntheticTraceabilityScenarios===90&&s.corporateGatesBlocked===8&&
  s.originalPM_SAPBlocks===10&&s.decision==="NO_GO","report_counts");
 ck(["realInspections","documentaryEvidenceReceived","validatedOEMSeries","confirmedRootCauses",
   "authorizedIndependentReviews","approvedFMEA","recordedRiskRankings","approvedSAPRemaps",
   "generatedOrders","operationReleases"].every(k=>s[k]===0),"zero_verification_or_operations");
 ck(report.packets.length===15&&distinct(report.packets.map(x=>x.ruleId))&&
  report.packets.every(p=>{
   const a=observability.packets.find(x=>x.ruleId===p.ruleId);
   const b=detectability.detectionChecks.find(x=>x.ruleId===p.ruleId);
   const c=metrology.packets.find(x=>x.ruleId===p.ruleId);
   return a&&b&&c&&p.seedSymptomLiteral===a.sourceSymptomLiteral&&
     p.seedInspectionMethodLiteral===a.sourceInspectionMethodLiteral&&
     p.qualitativeDetectionTrap===b.hypotheticalAttributionTrap&&
     p.safetyBoundary===a.essentialSafetyBoundary&&
     eq(p.conceptualAlternativeIds,c.sourceAlternativeIds)&&
     eq(p.criteriaUnassessed,metrologyPolicy.sequence)&&
     p.criteriaEvaluated===0&&p.blockersRemaining===6&&
     eq(p.evidenceMaturityStages.map(x=>x.layerId),stages)&&
     p.evidenceMaturityStages.every(x=>x.blockerClosed===false&&
       x.humanAssessmentRecorded===false)&&
     p.originalPriority===null&&p.lowRiskInferred===false&&
     p.originalModelsAreNotVerifiedAssets===true&&
     ["realInspectionPerformed","physicalDamageConfirmed","rootCauseConfirmed",
      "OEMSerialEffective","measurementTraceabilityAccepted","independentEngineeringSignoff",
      "FMEAApproved","SAPMappingApproved","workOrderAllowed","operationReleaseAllowed"]
       .every(k=>p[k]===false)&&
     p.diagnosticDecision==="INCONCLUSIVE_CAUSAL_ATTRIBUTION"&&
     p.evidenceStatus==="NO_REAL_EVIDENCE_YET"&&p.publicationDecision==="NO_GO";
  }),"15_causal_explanations_are_unapproved");
 ck(report.syntheticReviewDrills.length===90&&report.syntheticReviewDrills.every(x=>
  x.decision==="NO_GO_SYNTHETIC_ONLY"&&
  x.causalDisposition==="INCONCLUSIVE_ALTERNATIVES_OPEN"&&
  x.evidenceStatus==="HYPOTHETICAL_AND_UNVERIFIED"&&
  ["humanReviewRecorded","realEvidenceReceived","independentCausalConfirmation",
   "SAPChanged","workOrdered","operationReleased"].every(k=>x[k]===false))&&
  report.status==="NO_GO_NO_REAL_EVIDENCE_NO_AUTOMATIC_PROMOTION","drills_are_not_approvals");
 return {status:errors.length?"REJECTED":"NO_GO_CONSOLIDATED_EVIDENCE_READINESS",errors};
}
