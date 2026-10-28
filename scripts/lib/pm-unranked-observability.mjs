/** Public observability design for unranked preventive rules; not a risk assessment. */
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const uniq=a=>new Set(a).size===a.length;
const sort=a=>[...a].sort((x,y)=>String(x).localeCompare(String(y)));
const hasUnsafePromotion=s=>/\b(causa raiz confirmada|falha comprovada|causa confirmada|procedimento autorizado|risco baixo|risco baixo confirmado|libera[cç][aã]o operacional concedida|sap aprovado|equipamento liberado|dano confirmado)\b/i.test(s);
export function buildUnrankedObservability({policy,seeds,maturity,gaps,runbook}){
 const rules=new Map(seeds.records.map(x=>[x.id,x]));
 const mRules=new Map(maturity.rules.map(x=>[x.ruleId,x]));
 const exceptionIds=new Set(gaps.records.map(x=>x.ruleId));
 const unranked=sort(maturity.unrankedRules);
 const entries=[...policy.entries].sort((a,b)=>a.ruleId.localeCompare(b.ruleId)).map(p=>{
  const source=rules.get(p.ruleId),m=mRules.get(p.ruleId);
  if(!source||!m||!unranked.includes(p.ruleId))throw Error("no_unranked_seed_"+p.ruleId);
  return {
   ruleId:p.ruleId,system:source.system,subgroupCandidate:source.subgroupCode,
   componentCandidate:source.partText,sourceSymptomLiteral:source.symptom,
   sourceInspectionMethodLiteral:source.inspectionMethod,
   inspectionFamily:p.inspectionFamily,
   observableLayer:"SYMPTOM_OR_CONDITION_NOT_A_CONFIRMED_FAILURE",
   hypotheticalAlternatives:p.alternatives.map(x=>({
    alternativeId:x.id,candidateMechanism:x.candidate,
    requestedQualitativeDiscrimination:x.proposedDiscriminatingEvidence,
    hypothesisDisposition:"UNTESTED_NONEXCLUSIVE_ALTERNATIVE",
    evidenceActuallyCollected:false,qualifiedMeasurementPerformed:false,
    competingHypothesisExcluded:false,physicalDamageConfirmed:false,
    rootCauseConfirmed:false,OEMEffectivityVerified:false,
    engineeringSignoff:false,SAPlinkApproved:false
   })),
   essentialSafetyBoundary:p.safeBoundary,
   originalMaturity:m.maturity,originalDecision:m.nextDecision,
   originalModelKeysAreNotActualAssets:true,
   originalRecordedPriority:null,
   publicMaturityNotFieldValidated:true,
   OEMProcedureEffective:false,fieldEvidenceReviewed:false,
   realAssetMapped:false,approvedSAPMapping:false,
   operationalRelease:false,technicalConclusion:"INDETERMINATE_REQUIRES_PRIVATE_EVIDENCE",
   priorityInterpretation:"NOT_ASSIGNED_CANNOT_INFER_LOW_RISK",
   mayAuthorizeTesting:false,mayCreateWorkOrder:false,
   mayPromoteFMEA:false,decision:"NO_GO"
  };
 });
 return {
  schema:"fmea-mining.pm-unranked-observability.v1",version:policy.version,
  nature:"offline_conceptual_differential_evidence_requests_not_actual_diagnostics",
  upstreamVersions:{seeds:seeds.version,maturity:maturity.version,
   gaps:gaps.version,runbook:runbook.version},
  summary:{preventiveRules:seeds.records.length,documentedExceptionRules:gaps.records.length,
   unrankedRules:unranked.length,publicObservabilityPackets:entries.length,
   proposedNonexclusiveAlternatives:entries.reduce((n,x)=>n+x.hypotheticalAlternatives.length,0),
   theoreticalDiscriminatingRequests:entries.reduce((n,x)=>n+x.hypotheticalAlternatives.length,0),
   uniqueSystems:new Set(entries.map(x=>x.system)).size,
   actualAssetCases:0,actualMeasurements:0,OEMSerialEffectivity:0,
   confirmedDamages:0,confirmedRootCauses:0,engineeringSignoffs:0,
   SAPApprovedMappings:0,operationalReleases:0,
   realPriorityAssignments:0,privateGatesBlocked:runbook.phases.length,
   originalSAPExceptionsBlocked:gaps.records.length,decision:"NO_GO"},
  interpretation:policy.prioritySemantics.unranked,
  p0p1OriginalExceptionsUntouched:true,
  packets:entries,
  suggestedNextOwner:"QUALIFIED_ENGINEERING_REVIEW_PRIVATE_OEM_AND_FIELD_EVIDENCE",
  gateDecision:"NO_GO_PUBLIC_OBSERVABILITY_ONLY"
 };
}
export function assessUnrankedObservability(input,report){
 const {policy,seeds,maturity,gaps,runbook}=input;
 const errors=[],ck=(ok,id)=>{if(!ok)errors.push(id)};
 let baseline;try{baseline=buildUnrankedObservability(input)}
 catch(e){return {status:"REJECTED",errors:["build_"+e.message]}};
 ck(equal(baseline,report),"deterministic_snapshot");
 ck(policy.schema==="fmea-mining.pm-unranked-observability-policy.v1"&&policy.version==="1.3.76"&&policy.predecessor==="1.3.75"&&policy.purpose.length>100,"policy_identity");
 ck(policy.prioritySemantics.unranked==="NO_DOCUMENTED_PRIORITY_NOT_LOW_RISK"&&
 policy.prioritySemantics.noPriorityAssignment===true&&policy.prioritySemantics.noNumericalRiskScore===true,"unranked_not_low_risk");
 ck(policy.sourceSemantics.literalSeedSymptomsAndMethods==="verbatim_from_seed_rules"&&
 policy.sourceSemantics.alternatives==="proposed_engineering_hypotheses_not_source_facts"&&
 policy.sourceSemantics.proofs==="qualitative_requests_not_executed_field_tests"&&
 policy.sourceSemantics.safety==="generic_hazards_not_a_job_procedure","inference_provenance");
 ck(equal(policy.allowedActions,["READ_PUBLIC_SEED_INSPECTION_METHOD","REQUEST_PRIVATE_OEM_EFFECTIVITY","REQUEST_QUALIFIED_COUNTEREVIDENCE","DEFER_CAUSAL_CONCLUSION"])&&
 equal(policy.neverActions,["RANK_BY_COUNT","TREAT_UNRANKED_AS_LOW_RISK","CONFIRM_CAUSE_FROM_SINGLE_OBSERVATION",
 "DEFINE_OEM_LIMIT_WITHOUT_SERIES","RELEASE_OPERATION","EXECUTE_ACTIVE_TEST","APPROVE_SAP_REMAP"]),"action_boundary");
 ck(Object.values(policy.guardrails).every(x=>x===true),"all_safety_guards");
 ck(seeds.records.length===25&&uniq(seeds.records.map(x=>x.id))&&seeds.records.every(x=>
  x.status==="hipotese_de_protecao_preventiva"&&x.review==="pendente"),"no_seed_promotions");
 ck(maturity.summary.seedRules===25&&maturity.summary.conceptuallyModeled===25&&
  maturity.summary.candidatePreventiveLinks===115&&maturity.summary.serialOemVerified===0&&
  maturity.summary.fieldConfirmed===0&&maturity.summary.sapMappingsApproved===0&&
  maturity.unrankedRules.length===15&&uniq(maturity.unrankedRules)&&
  maturity.rules.length===25&&maturity.rules.every(x=>x.fieldObservations===0&&
  x.performedActions===0&&x.confirmedDamages===0&&x.approvedSapMappings===0),
 "maturity_not_actual_and_unranked");
 ck(gaps.records.length===10&&
  gaps.records.filter(x=>x.priority==="P0").length===5&&
  gaps.records.filter(x=>x.priority==="P1").length===5&&
  gaps.records.every(x=>x.status==="bloqueado_aguardando_curadoria"&&x.autoRemapAllowed===false&&x.observedFailures===0),
 "original_SAP_blocks_not_touched");
 ck(new Set(maturity.unrankedRules).size+new Set(gaps.records.map(x=>x.ruleId)).size===25&&
  maturity.unrankedRules.every(id=>!gaps.records.some(x=>x.ruleId===id)),"no_rank_from_gaps");
 ck(runbook.version==="1.3.62"&&runbook.phases.length===8&&
  runbook.phases.every(x=>x.gate==="BLOCK"&&x.status==="not_started"&&x.decisionToken===null)&&
  runbook.goNoGo.decision==="NO_GO"&&runbook.goNoGo.realPilotAllowed===false,"private_gates_still_blocked");
 ck(policy.entries.length===15&&uniq(policy.entries.map(x=>x.ruleId))&&
  equal(sort(policy.entries.map(x=>x.ruleId)),sort(maturity.unrankedRules))&&
  policy.entries.every(p=>p.inspectionFamily.length>8&&p.safeBoundary.length>60&&
   p.alternatives.length===2&&uniq(p.alternatives.map(a=>a.id))&&
   p.alternatives.every((a,i)=>a.id===p.ruleId+"-ALT-"+(i+1)&&
    a.candidate.length>18&&a.proposedDiscriminatingEvidence.length>55&&
    a.hypothesisStatus==="UNTESTED_CONCEPTUAL_NONEXCLUSIVE"&&
    !hasUnsafePromotion(a.candidate)&&!hasUnsafePromotion(a.proposedDiscriminatingEvidence))&&
   p.priorityFromRepository===null&&p.fieldEvidenceReceived===false&&
   p.OEMSerialVerified===false&&p.engineeringReviewApproved===false&&
   p.SAPMappingApproved===false),"15_conceptual_packets_not_evidence");
 ck(report.schema==="fmea-mining.pm-unranked-observability.v1"&&report.version==="1.3.76"&&
  report.nature==="offline_conceptual_differential_evidence_requests_not_actual_diagnostics","report_identity");
 const s=report.summary;
 ck(s.preventiveRules===25&&s.documentedExceptionRules===10&&s.unrankedRules===15&&
  s.publicObservabilityPackets===15&&s.proposedNonexclusiveAlternatives===30&&
  s.theoreticalDiscriminatingRequests===30&&
  s.realPriorityAssignments===0&&s.privateGatesBlocked===8&&
  s.originalSAPExceptionsBlocked===10&&s.decision==="NO_GO","model_counts");
 ck(["actualAssetCases","actualMeasurements","OEMSerialEffectivity","confirmedDamages","confirmedRootCauses",
 "engineeringSignoffs","SAPApprovedMappings","operationalReleases"].every(k=>s[k]===0),"zero_verified_field_facts");
 ck(report.packets.length===15&&report.packets.every(x=>{
   const rule=seeds.records.find(v=>v.id===x.ruleId);
   return !!rule&&x.sourceSymptomLiteral===rule.symptom&&
   x.sourceInspectionMethodLiteral===rule.inspectionMethod&&
   x.observableLayer==="SYMPTOM_OR_CONDITION_NOT_A_CONFIRMED_FAILURE"&&
   x.originalRecordedPriority===null&&x.publicMaturityNotFieldValidated===true&&
   x.realAssetMapped===false&&x.OEMProcedureEffective===false&&x.fieldEvidenceReviewed===false&&
   x.approvedSAPMapping===false&&x.operationalRelease===false&&
   x.technicalConclusion==="INDETERMINATE_REQUIRES_PRIVATE_EVIDENCE"&&
   x.priorityInterpretation==="NOT_ASSIGNED_CANNOT_INFER_LOW_RISK"&&
   x.mayAuthorizeTesting===false&&x.mayCreateWorkOrder===false&&
   x.mayPromoteFMEA===false&&x.decision==="NO_GO"&&
   x.hypotheticalAlternatives.length===2&&x.hypotheticalAlternatives.every(h=>
     h.hypothesisDisposition==="UNTESTED_NONEXCLUSIVE_ALTERNATIVE"&&
     ["evidenceActuallyCollected","qualifiedMeasurementPerformed",
      "competingHypothesisExcluded","physicalDamageConfirmed","rootCauseConfirmed",
      "OEMEffectivityVerified","engineeringSignoff","SAPlinkApproved"].every(k=>h[k]===false));
 }),"no_equipment_or_root_cause_promotion");
 ck(report.interpretation==="NO_DOCUMENTED_PRIORITY_NOT_LOW_RISK"&&
 report.p0p1OriginalExceptionsUntouched===true&&
 report.gateDecision==="NO_GO_PUBLIC_OBSERVABILITY_ONLY","nonrisk_state");
 return {status:errors.length?"REJECTED":"NO_GO_PUBLIC_DIFFERENTIAL_CATALOG",errors,realTestsPerformed:false};
}
