/** Public metrology and provenance review requirements; synthetic inputs never prove a measurement. */
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const unique=a=>new Set(a).size===a.length;
const exact=(x,keys)=>x!==null&&typeof x==="object"&&!Array.isArray(x)&&
 Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k));
export function classifySyntheticMetrology(sample,policy){
 if(!exact(sample,["ruleId","statuses"])||
    !Array.isArray(policy.ruleIds)||!policy.ruleIds.includes(sample.ruleId))
   return "REJECT_UNSUPPORTED_SYNTHETIC_EVIDENCE";
 return routeMetrologyStatuses(sample.statuses,policy);
}
export function routeMetrologyStatuses(statuses,policy){
 const ids=policy.sequence;
 if(!exact(statuses,ids)||!ids.every(id=>{
   const allowed=id==="safety"?policy.statusEnums.safety:
      policy.conditionalIds.includes(id)?policy.statusEnums.conditional:policy.statusEnums.general;
   return Array.isArray(allowed)&&allowed.includes(statuses[id]);
 }))return "REJECT_UNSUPPORTED_SYNTHETIC_EVIDENCE";
 if(statuses.safety==="unsafe")return policy.routes.unsafe;
 if(policy.conditionalIds.some(id=>statuses[id]==="hypothetically_not_applicable"))
   return policy.routes.not_applicable;
 for(const id of ids)if(statuses[id]==="not_demonstrated")return policy.routes["missing_"+id];
 return policy.routes.all_synthetic;
}
export function buildMetrologyProvenance({policy,detectability,observability,seeds,maturity,gaps,runbook}){
 const source=new Map(detectability.detectionChecks.map(x=>[x.ruleId,x]));
 const parent=new Map(observability.packets.map(x=>[x.ruleId,x]));
 const packets=[...source.values()].sort((a,b)=>a.ruleId.localeCompare(b.ruleId)).map(x=>{
   const original=parent.get(x.ruleId);
   if(!original)throw Error("missing_observability_"+x.ruleId);
   return {ruleId:x.ruleId,system:x.system,subgroupCandidate:x.subgroupCandidate,
     sourceSymptomLiteral:x.seedSymptomLiteral,sourceInspectionMethodLiteral:x.seedMethodLiteral,
     detectionTrap:x.hypotheticalAttributionTrap,
     missedDetection:x.hypotheticalMissedDetection,
     sourceAlternativeIds:[...x.sourceObservabilityAlternativeIds],
     sourceSafetyBoundary:original.essentialSafetyBoundary,
     requiredReviewCriteria:policy.criteria.map(c=>({
       criterionId:c.id,reviewQuestion:c.reviewQuestion,
       privateProofToRequest:c.privateProof,
       methodApplicability:"NOT_ASSESSED_PRIVATE_METHOD_REVIEW_REQUIRED",
       actualEvidenceReceived:false,methodLicenseVerified:false,
       documentAuthenticityVerified:false,independentReviewerSigned:false,
       status:"UNASSESSED_NO_REAL_EVIDENCE"})),
     measurementApplicabilityUnresolved:true,
     instrumentInUse:null,calibrationRecord:null,measuredValue:null,
     measurementUnit:null,uncertainty:null,
     repeatabilityStudy:null,contextRecord:null,actualCustodyReference:null,
     realAssetIdentifier:null,serialSpecificOEMMethod:null,
     signedReviewReference:null,
     actualSampleCollected:false,realMeasurementTaken:false,
     instrumentVerified:false,calibrationVerified:false,
     qualityAssessmentApproved:false,rootCauseConfirmed:false,
     SAPWriteAllowed:false,operationalRelease:false,
     finalEvidenceJudgment:"INCONCLUSIVE_PENDING_PRIVATE_METHOD_AND_QUALITY_REVIEW",
     decision:"NO_GO"
   };
 });
 const seedStatuses=Object.fromEntries(policy.sequence.map(id=>[id,"hypothetically_documented"]));
 const drills=packets.flatMap(p=>policy.scenarios.map(s=>{
   const statuses={...seedStatuses,...s.override};
   return {ruleId:p.ruleId,scenarioId:s.id,syntheticStatuses:statuses,
     proposedQualityRoute:routeMetrologyStatuses(statuses,policy),
     hypotheticalOnly:true,actualCaseReceived:false,
     qualifiedEvidenceAccepted:false,actualInstrumentVerified:false,
     privateReviewerAuthenticated:false,engineeringApproved:false,
     FMEAPromoted:false,SAPUpdated:false,workOrderCreated:false,
     operationReleased:false,caseClosed:false,decision:"NO_GO_SYNTHETIC_ONLY"};
 }));
 return {schema:"fmea-mining.pm-metrology-provenance.v1",version:policy.version,
   nature:"public_criteria_for_future_private_metrology_review_not_a_field_measurement",
   upstreamVersions:{detectability:detectability.version,
     observability:observability.version,seeds:seeds.version,maturity:maturity.version,
     gaps:gaps.version,runbook:runbook.version},
   summary:{sourcePreventiveRules:seeds.records.length,sourceUnrankedRules:packets.length,
     evidenceQualityCriteriaPerRule:policy.criteria.length,
     unassessedPrivateEvidenceSlots:packets.length*policy.criteria.length,
     syntheticEvidenceScenariosPerRule:policy.scenarios.length,
     simulatedMetrologyRoutes:drills.length,
     realInspections:0,realInstrumentsChecked:0,calibrationsVerified:0,
     actualSamples:0,uncertaintyStudiesValidated:0,
     actualEvidenceItemsReceived:0,privateReviewerApprovals:0,
     confirmedRootCauses:0,approvedSAPChanges:0,createdWorkOrders:0,
     operationalReleases:0,riskPrioritiesChanged:0,
     privateGatesBlocked:runbook.phases.length,
     pmSapExceptionBlocks:gaps.records.length,publicDecision:"NO_GO"},
   interpretation:"QUALITY_OF_POTENTIAL_EVIDENCE_NOT_VERIFIED_DIAGNOSTIC_ACCURACY",
   packets,syntheticQualityDrills:drills,
   nextPrivateAction:"QUALIFIED_METHOD_REVIEW_AND_EVIDENCE_CUSTODY_OUTSIDE_PUBLIC_REPO",
   disposition:"NO_GO_PUBLIC_EVIDENCE_QUALITY_DESIGN"};
}
export function assessMetrologyProvenance(input,report){
 const {policy,detectability,observability,seeds,maturity,gaps,runbook}=input;
 const errors=[],ck=(v,id)=>{if(!v)errors.push(id)};
 let expected;try{expected=buildMetrologyProvenance(input)}
 catch(e){return {status:"REJECTED",errors:["build_"+e.message]}};
 ck(eq(report,expected),"derived_report_drift");
 ck(policy.schema==="fmea-mining.pm-metrology-provenance-policy.v1"&&
   policy.version==="1.3.78"&&policy.predecessor==="1.3.77"&&policy.purpose.length>125,
   "policy_identity");
 const ids=["safety","asset_identity","oem_method","instrument","calibration","conditions",
   "repeatability","uncertainty","custody","counterevidence"];
 ck(eq(policy.ruleIds,[...detectability.detectionChecks.map(x=>x.ruleId)].sort()),"rule_allowlist_traceability");
 ck(eq(policy.sequence,ids)&&policy.criteria.length===10&&unique(policy.criteria.map(x=>x.id))&&
   eq(policy.criteria.map(x=>x.id),ids)&&policy.criteria.every(c=>
   c.label.length>8&&c.reviewQuestion.length>64&&c.privateProof.length>60&&
   c.source==="proposed_engineering_requirement_not_verified_oem"&&
   c.actualEvidenceReceived===false&&c.corporateApprovalReceived===false),
   "ten_documentary_quality_requirements");
 ck(eq(policy.statusEnums.general,["not_demonstrated","hypothetically_documented"])&&
   eq(policy.statusEnums.safety,["not_demonstrated","hypothetically_documented","unsafe"])&&
   eq(policy.statusEnums.conditional,["not_demonstrated","hypothetically_documented","hypothetically_not_applicable"])&&
   eq(policy.conditionalIds,["instrument","calibration","repeatability","uncertainty"]),
   "qualitative_evidence_states");
 ck(policy.scenarios.length===13&&unique(policy.scenarios.map(x=>x.id))&&
   eq(policy.scenarios.slice(0,10).map(x=>x.id),ids.map(x=>"missing_"+x))&&
   policy.scenarios.every(sc=>{
     const s=Object.fromEntries(ids.map(id=>[id,"hypothetically_documented"]));
     return routeMetrologyStatuses({...s,...sc.override},policy)===sc.expected;
   })&&policy.scenarios.at(-1).expected==="HOLD_INDEPENDENT_PRIVATE_QUALIFIED_REVIEW"&&
   policy.routes.unsafe==="STOP_UNAUTHORIZED_OPERATION_REQUEST_SAFETY_REVIEW"&&
   policy.routes.not_applicable==="HOLD_METHOD_APPLICABILITY_JUSTIFICATION"&&
   policy.routes.all_synthetic==="HOLD_INDEPENDENT_PRIVATE_QUALIFIED_REVIEW",
   "thirteen_fail_closed_scenarios");
 ck(Object.values(policy.privateReviewBoundaries).every(x=>x===true)&&
   Object.values(policy.guardrails).every(x=>x===true)&&
   policy.scope.rules==="fifteen_unranked_preventive_inspections"&&
   Object.entries(policy.scope).filter(([k])=>k!=="rules").every(([,v])=>v===0),
   "quality_review_not_execution");
 ck(detectability.version==="1.3.77"&&
   detectability.summary.unrankedInspections===15&&
   detectability.summary.actualObservations===0&&
   detectability.summary.validatedSensitivityCount===0&&
   detectability.summary.validatedSpecificityCount===0&&
   detectability.detectionChecks.length===15&&
   detectability.detectionChecks.every(x=>x.realMeasurementPerformed===false&&
     x.OEMMethodEffective===false&&x.diagnosis==="NO_CONFIRMED_MECHANISM"),
   "upstream_detectability_not_validated");
 ck(observability.version==="1.3.76"&&observability.packets.length===15&&
   observability.summary.actualMeasurements===0&&
   observability.packets.every(p=>p.originalRecordedPriority===null&&
     p.mayAuthorizeTesting===false&&p.hypotheticalAlternatives.length===2),
   "upstream_hypotheses_untested");
 ck(seeds.records.length===25&&seeds.records.every(x=>
   x.status==="hipotese_de_protecao_preventiva"&&x.review==="pendente")&&
   maturity.summary.seedRules===25&&maturity.summary.withoutDocumentedPriority===15&&
   maturity.summary.fieldConfirmed===0&&maturity.summary.serialOemVerified===0&&
   maturity.summary.sapMappingsApproved===0,
   "maturity_not_promoted");
 ck(gaps.records.length===10&&gaps.records.filter(x=>x.priority==="P0").length===5&&
   gaps.records.filter(x=>x.priority==="P1").length===5&&
   gaps.records.every(x=>x.autoRemapAllowed===false&&x.observedFailures===0)&&
   runbook.phases.length===8&&runbook.phases.every(x=>x.gate==="BLOCK"&&
     x.status==="not_started"&&x.decisionToken===null)&&
   runbook.goNoGo.decision==="NO_GO","all_private_gates_still_blocked");
 ck(report.schema==="fmea-mining.pm-metrology-provenance.v1"&&
   report.version==="1.3.78"&&
   report.nature==="public_criteria_for_future_private_metrology_review_not_a_field_measurement",
   "report_identity");
 const sum=report.summary;
 ck(sum.sourcePreventiveRules===25&&sum.sourceUnrankedRules===15&&
   sum.evidenceQualityCriteriaPerRule===10&&sum.unassessedPrivateEvidenceSlots===150&&
   sum.syntheticEvidenceScenariosPerRule===13&&sum.simulatedMetrologyRoutes===195&&
   sum.privateGatesBlocked===8&&sum.pmSapExceptionBlocks===10&&
   sum.publicDecision==="NO_GO","report_totals");
 ck(["realInspections","realInstrumentsChecked","calibrationsVerified","actualSamples",
   "uncertaintyStudiesValidated","actualEvidenceItemsReceived","privateReviewerApprovals",
   "confirmedRootCauses","approvedSAPChanges","createdWorkOrders","operationalReleases",
   "riskPrioritiesChanged"].every(k=>sum[k]===0),"no_field_or_authorization_claim");
 ck(report.packets.length===15&&unique(report.packets.map(x=>x.ruleId))&&
   report.packets.every(p=>{
     const src=detectability.detectionChecks.find(x=>x.ruleId===p.ruleId);
     return src&&p.sourceSymptomLiteral===src.seedSymptomLiteral&&
       p.sourceInspectionMethodLiteral===src.seedMethodLiteral&&
       p.requiredReviewCriteria.length===10&&
       eq(p.requiredReviewCriteria.map(x=>x.criterionId),ids)&&
       p.requiredReviewCriteria.every(x=>x.status==="UNASSESSED_NO_REAL_EVIDENCE"&&
         x.methodApplicability==="NOT_ASSESSED_PRIVATE_METHOD_REVIEW_REQUIRED"&&
         ["actualEvidenceReceived","methodLicenseVerified","documentAuthenticityVerified",
          "independentReviewerSigned"].every(k=>x[k]===false))&&
       ["instrumentInUse","calibrationRecord","measuredValue","measurementUnit","uncertainty",
        "repeatabilityStudy","contextRecord","actualCustodyReference","realAssetIdentifier",
        "serialSpecificOEMMethod","signedReviewReference"].every(k=>p[k]===null)&&
       p.measurementApplicabilityUnresolved===true&&
       ["actualSampleCollected","realMeasurementTaken","instrumentVerified","calibrationVerified",
        "qualityAssessmentApproved","rootCauseConfirmed","SAPWriteAllowed",
        "operationalRelease"].every(k=>p[k]===false)&&
       p.finalEvidenceJudgment==="INCONCLUSIVE_PENDING_PRIVATE_METHOD_AND_QUALITY_REVIEW"&&
       p.decision==="NO_GO";
   }),"review_slots_not_real_data");
 ck(report.syntheticQualityDrills.length===195&&
   report.syntheticQualityDrills.every(d=>
     d.proposedQualityRoute===routeMetrologyStatuses(d.syntheticStatuses,policy)&&
     d.hypotheticalOnly===true&&
     ["actualCaseReceived","qualifiedEvidenceAccepted","actualInstrumentVerified",
       "privateReviewerAuthenticated","engineeringApproved","FMEAPromoted",
       "SAPUpdated","workOrderCreated","operationReleased","caseClosed"].every(k=>d[k]===false)&&
     d.decision==="NO_GO_SYNTHETIC_ONLY"),"scenario_not_approval");
 ck(report.interpretation==="QUALITY_OF_POTENTIAL_EVIDENCE_NOT_VERIFIED_DIAGNOSTIC_ACCURACY"&&
   report.disposition==="NO_GO_PUBLIC_EVIDENCE_QUALITY_DESIGN",
   "public_quality_policy_only");
 return {status:errors.length?"REJECTED":"NO_GO_PUBLIC_METROLOGY_DESIGN",errors};
}
