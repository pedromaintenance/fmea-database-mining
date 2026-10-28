#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
import {buildUnrankedObservability,assessUnrankedObservability} from "./lib/pm-unranked-observability.mjs";
import {buildInspectionDetectability,assessInspectionDetectability} from "./lib/pm-inspection-detectability.mjs";
import {buildMetrologyProvenance,assessMetrologyProvenance} from "./lib/pm-metrology-provenance.mjs";
import {buildEvidenceMaturity,assessEvidenceMaturity,classifySyntheticMaturity} from "./lib/pm-evidence-maturity.mjs";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),"utf8"));
const clone=x=>JSON.parse(JSON.stringify(x));
const seeds=read("data/knowledge/pm-prevention/seed-rules.json");
const maturity=read("data/quality/pm-maturity-matrix.v1.json");
const gaps=read("data/quality/pm-gap-review.v1.json");
const runbook=read("data/governance/pm-private-deployment-runbook.v1.json");
const obsInputs={policy:read("data/quality/pm-unranked-observability-policy.v1.json"),seeds,maturity,gaps,runbook};
const observability=buildUnrankedObservability(obsInputs);
const input={policy:read("data/quality/pm-inspection-detectability-policy.v1.json"),observability,seeds,maturity,gaps,runbook};

const detectability=buildInspectionDetectability(input);
const metaInput={policy:read("data/quality/pm-metrology-provenance-policy.v1.json"),
 detectability,observability,seeds,maturity,gaps,runbook};

const metrology=buildMetrologyProvenance(metaInput);
const maturityInputs={
 policy:read("data/quality/pm-evidence-maturity-policy.v1.json"),
 observability,detectability,metrology,
 detectabilityPolicy:input.policy,metrologyPolicy:metaInput.policy,
 maturity,gaps,runbook};
const report=buildEvidenceMaturity(maturityInputs);
const initial=assessEvidenceMaturity(maturityInputs,report);
const errors=[...initial.errors],attacks=[],probes=[];
const upstream=[
 ["observability",assessUnrankedObservability(obsInputs,observability).status],
 ["detectability",assessInspectionDetectability(input,detectability).status],
 ["metrology",assessMetrologyProvenance(metaInput,metrology).status]];
for(const [id,status] of upstream)if(!status.startsWith("NO_GO_"))errors.push("upstream_"+id+"_"+status);
function probe(name,value,expected){
 const actual=classifySyntheticMaturity(value,{policy:maturityInputs.policy,
   detectabilityPolicy:input.policy,metrologyPolicy:metaInput.policy});
 const ok=JSON.stringify(actual)===JSON.stringify(expected);
 probes.push({name,ok});if(!ok)errors.push("failed_probe_"+name+":"+JSON.stringify(actual));
}
function attack(name,change){
 const src=clone(maturityInputs),out=clone(report);
 try{change(src,out)}catch(e){errors.push("fixture_"+name+"_"+e.message);return}
 let rejected=false;
 try{rejected=assessEvidenceMaturity(src,out).status==="REJECTED"}
 catch(_){rejected=true}
 attacks.push({name,rejected});
 if(!rejected)errors.push("mutation_passed_"+name);
}
for(const p of report.packets){
 const idx=report.packets.findIndex(x=>x.ruleId===p.ruleId);
 for(const sc of maturityInputs.policy.syntheticCases){
   const expected=report.syntheticReviewDrills.find(x=>x.ruleId===p.ruleId&&x.scenarioId===sc.id);
   probe(p.ruleId+"_"+sc.id,{ruleId:p.ruleId,signalState:sc.signalState,scenarioId:sc.id},
    {signalInterpretation:expected.signalInterpretation,
     privateEvidenceQualityRoute:expected.hypotheticalQualityRoute,
     evidenceStatus:"HYPOTHETICAL_AND_UNVERIFIED",
     causalDisposition:"INCONCLUSIVE_ALTERNATIVES_OPEN",
     decision:"NO_GO_SYNTHETIC_ONLY"});
 }
 attack("root_forgery_"+p.ruleId,(_,o)=>o.packets[idx].rootCauseConfirmed=true);
 attack("field_forgery_"+p.ruleId,(_,o)=>o.packets[idx].realInspectionPerformed=true);
 attack("oem_forgery_"+p.ruleId,(_,o)=>o.packets[idx].OEMSerialEffective=true);
 attack("sap_forgery_"+p.ruleId,(_,o)=>o.packets[idx].SAPMappingApproved=true);
 attack("layer_closed_"+p.ruleId,(_,o)=>o.packets[idx].evidenceMaturityStages[0].blockerClosed=true);
 attack("data_forgery_"+p.ruleId,(_,o)=>o.packets[idx].criteriaEvaluated=10);
 attack("priority_forgery_"+p.ruleId,(_,o)=>o.packets[idx].lowRiskInferred=true);
 attack("model_approved_"+p.ruleId,(_,o)=>o.packets[idx].FMEAApproved=true);
}
const invalid={decision:"REJECT_UNSUPPORTED_PUBLIC_INPUT"};
const id=report.packets[0].ruleId;
probe("unknown_rule",{ruleId:"REAL_ASSET_TAG",signalState:"observed",scenarioId:"positive_signal_all_hypothetically_documented"},invalid);
probe("invented_scenario",{ruleId:id,signalState:"observed",scenarioId:"APPROVED"},invalid);
probe("wrong_state_for_scenario",{ruleId:id,signalState:"notObserved",scenarioId:"positive_signal_all_hypothetically_documented"},invalid);
probe("additional_name",{ruleId:id,signalState:"observed",scenarioId:"positive_signal_all_hypothetically_documented",signer:"SOMEONE"},invalid);
probe("additional_measurement",{ruleId:id,signalState:"observed",scenarioId:"positive_signal_all_hypothetically_documented",measurement:1},invalid);
probe("null",null,invalid);
probe("array",[],invalid);
probe("empty",{},invalid);
probe("no_scenario",{ruleId:id,signalState:"observed"},invalid);
probe("numeric_signal",{ruleId:id,signalState:1,scenarioId:"positive_signal_all_hypothetically_documented"},invalid);
const packet=o=>o.packets[0],layer=o=>packet(o).evidenceMaturityStages[0],drill=o=>o.syntheticReviewDrills[0];
attack("remove_packet",(_,o)=>o.packets.pop());
attack("duplicate_packet",(_,o)=>o.packets.push(clone(packet(o))));
attack("suppress_component",(_,o)=>packet(o).candidateComponent="NONE");
attack("change_original_symptom",(_,o)=>packet(o).seedSymptomLiteral="SYNTHETIC_REAL");
attack("change_original_method",(_,o)=>packet(o).seedInspectionMethodLiteral="REAL_PROCEDURE");
attack("falsify_alternative_count",(_,o)=>packet(o).hypothesisCount=1);
attack("remove_counterhypothesis",(_,o)=>packet(o).conceptualAlternativeIds.pop());
attack("remove_detection_trap",(_,o)=>packet(o).qualitativeDetectionTrap="NONE");
attack("remove_missed_detection",(_,o)=>packet(o).qualitativeMissedDetection="NONE");
attack("remove_unsafe_boundary",(_,o)=>packet(o).safetyBoundary="SAFE");
attack("suppress_method_limitation",(_,o)=>packet(o).mandatoryInconclusiveBoundary="CLEAR");
attack("silent_priority",(_,o)=>packet(o).originalPriority="P0");
attack("false_maturity_evidence",(_,o)=>packet(o).evidenceStatus="ACCEPTED");
attack("false_causal_diagnosis",(_,o)=>packet(o).diagnosticDecision="CONFIRMED");
attack("fake_metrology_applicability",(_,o)=>packet(o).applicabilityOfInstrumentUndecided=false);
attack("fake_traceability_acceptance",(_,o)=>packet(o).measurementTraceabilityAccepted=true);
attack("fake_reviewer_signoff",(_,o)=>packet(o).independentEngineeringSignoff=true);
attack("fake_SAP_authorization",(_,o)=>packet(o).SAPMappingApproved=true);
attack("fake_work_authorization",(_,o)=>packet(o).workOrderAllowed=true);
attack("fake_operations_release",(_,o)=>packet(o).operationReleaseAllowed=true);
attack("reduce_blocker_count",(_,o)=>packet(o).blockersRemaining=0);
attack("remove_layer",(_,o)=>packet(o).evidenceMaturityStages.pop());
attack("invent_layer_approval",(_,o)=>layer(o).humanAssessmentRecorded=true);
attack("rewrite_blocker",(_,o)=>layer(o).blockerCode="APPROVED");
attack("rewrite_next_action",(_,o)=>layer(o).nextPrivateVerification="NONE");
attack("fake_criterion_accepted",(_,o)=>packet(o).criteriaUnassessed.pop());
attack("fake_unranked_low_risk",(_,o)=>packet(o).lowRiskInferred=true);
attack("fake_public_GO",(_,o)=>packet(o).publicationDecision="GO");
attack("delete_drill",(_,o)=>o.syntheticReviewDrills.pop());
attack("promote_drill",(_,o)=>drill(o).decision="GO");
attack("approve_drill_engineering",(_,o)=>drill(o).independentCausalConfirmation=true);
attack("approve_drill_sap",(_,o)=>drill(o).SAPChanged=true);
attack("approve_drill_OS",(_,o)=>drill(o).workOrdered=true);
attack("approve_drill_operation",(_,o)=>drill(o).operationReleased=true);
attack("insert_real_receipt",(_,o)=>drill(o).realEvidenceReceived=true);
attack("alter_no_detection_interpretation",(_,o)=>o.syntheticReviewDrills[1].signalInterpretation="HEALTHY");
attack("alter_all_hypothetically_documented",(_,o)=>drill(o).hypotheticalQualityRoute="APPROVED");
attack("fake_root_from_observed",(_,o)=>drill(o).causalDisposition="ROOT_CAUSE_CONFIRMED");
attack("report_fake_field",(_,o)=>o.summary.realInspections=1);
attack("report_fake_oem",(_,o)=>o.summary.validatedOEMSeries=1);
attack("report_fake_signed",(_,o)=>o.summary.authorizedIndependentReviews=1);
attack("report_fake_FMEA",(_,o)=>o.summary.approvedFMEA=15);
attack("report_fake_risk_ranking",(_,o)=>o.summary.recordedRiskRankings=15);
attack("report_fake_sap",(_,o)=>o.summary.approvedSAPRemaps=1);
attack("report_fake_OS",(_,o)=>o.summary.generatedOrders=1);
attack("report_fake_operation",(_,o)=>o.summary.operationReleases=1);
attack("report_no_sap_block",(_,o)=>o.summary.originalPM_SAPBlocks=0);
attack("report_gate_unblocked",(_,o)=>o.summary.corporateGatesBlocked=0);
attack("report_fake_measured_layers",(_,o)=>o.summary.unresolvedMaturityLayerPositions=0);
attack("report_fake_document_slots",(_,o)=>o.summary.unevaluatedQualityRequirements=0);
attack("report_go",(_,o)=>o.status="GO");
attack("policy_remove_layer",(i)=>i.policy.layers.pop());
attack("policy_fake_stage_status",(i)=>i.policy.layers[0].status="APPROVED");
attack("policy_fake_next_step",(i)=>i.policy.layers[0].requiredNext="NO_ACTION");
attack("policy_wrong_blocker",(i)=>i.policy.layers[0].blockerCode="NO_GAP");
attack("policy_automatic_ranking",(i)=>i.policy.guardrails.noOperationalRiskRanking=false);
attack("policy_automatic_workorder",(i)=>i.policy.guardrails.noWorkOrderCreation=false);
attack("policy_fake_favorable_outcome",(i)=>i.policy.routeSemantics.allHypotheticallyComplete="GO");
attack("policy_suppress_no_signal",(i)=>i.policy.routeSemantics.notObserved="HEALTHY");
attack("policy_remove_scenario",(i)=>i.policy.syntheticCases.pop());
attack("policy_change_scenario",(i)=>i.policy.syntheticCases[0].signalState="notObserved");
attack("policy_advance_license",(i)=>i.policy.guardrails.noRealOEMEffectivity=false);
attack("policy_wrong_source_version",(i)=>i.policy.sourceVersions.metrology="1.3.79");
attack("upstream_observability_root",(i)=>i.observability.packets[0].hypotheticalAlternatives[0].rootCauseConfirmed=true);
attack("upstream_observability_measurement",(i)=>i.observability.summary.actualMeasurements=1);
attack("upstream_detectability_sensitivity",(i)=>i.detectability.detectionChecks[0].sensitivity=1);
attack("upstream_detectability_real",(i)=>i.detectability.summary.actualObservations=1);
attack("upstream_metrology_review",(i)=>i.metrology.packets[0].qualityAssessmentApproved=true);
attack("upstream_metrology_real",(i)=>i.metrology.summary.actualEvidenceItemsReceived=1);
attack("upstream_metrology_criterion_signed",(i)=>i.metrology.packets[0].requiredReviewCriteria[0].independentReviewerSigned=true);
attack("upstream_invent_status",(i)=>i.metrologyPolicy.routes.all_synthetic="GO");
attack("upstream_detector_go",(i)=>i.detectabilityPolicy.safeStates.notObserved="HEALTHY");
attack("upstream_maturity_promoted",(i)=>i.maturity.summary.fieldConfirmed=1);
attack("upstream_maturity_priority",(i)=>i.maturity.unrankedRules.pop());
attack("upstream_SAP_unblocked",(i)=>i.gaps.records[0].autoRemapAllowed=true);
attack("upstream_corporate_gate_GO",(i)=>i.runbook.phases[0].gate="GO");
const audit={status:errors.length?"FAIL":"OK",upstreamAudits:upstream.length,
 classificationTests:probes.length,classificationPassed:probes.filter(x=>x.ok).length,
 adversarialMutations:attacks.length,adversarialRejected:attacks.filter(x=>x.rejected).length,
 probes,attacks,errors};
fs.mkdirSync(path.join(root,"reports"),{recursive:true});
fs.writeFileSync(path.join(root,"reports/pm-evidence-maturity.generated.json"),JSON.stringify({...report,audit},null,2)+"\n");
console.log(JSON.stringify({status:audit.status,summary:report.summary,
 upstreamAudits:audit.upstreamAudits,classificationTests:audit.classificationTests,
 classificationPassed:audit.classificationPassed,adversarialMutations:audit.adversarialMutations,
 adversarialRejected:audit.adversarialRejected,errors:audit.errors},null,2));
process.exit(errors.length?1:0);
