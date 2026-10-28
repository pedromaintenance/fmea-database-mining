#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
import {buildUnrankedObservability,assessUnrankedObservability} from "./lib/pm-unranked-observability.mjs";
import {buildInspectionDetectability,assessInspectionDetectability,classifyInspectionSignal} from "./lib/pm-inspection-detectability.mjs";
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
const report=buildInspectionDetectability(input);
const initial=assessInspectionDetectability(input,report);
const errors=[...initial.errors],attacks=[],probes=[];
if(assessUnrankedObservability(obsInputs,observability).status!=="NO_GO_PUBLIC_DIFFERENTIAL_CATALOG")
 errors.push("upstream_observability_invalid");
function attack(id,fn){
 const source=clone(input),out=clone(report);
 try{fn(source,out)}catch(e){errors.push("test_fixture_failed_"+id+"_"+e.message);return}
 let rejected=false;
 try{rejected=assessInspectionDetectability(source,out).status==="REJECTED"}catch(e){rejected=true}
 attacks.push({id,rejected});if(!rejected)errors.push("mutation_accepted_"+id);
}
function probe(id,payload,expected){
 const actual=classifyInspectionSignal(payload,input.policy);
 const pass=actual===expected;probes.push({id,expected,actual,pass});
 if(!pass)errors.push("classifier_"+id);
}
for(const x of report.detectionChecks){
 const i=report.detectionChecks.findIndex(d=>d.ruleId===x.ruleId);
 for(const signalState of ["observed","notObserved","ambiguous"])
   probe("state_"+x.ruleId+"_"+signalState,{ruleId:x.ruleId,signalState},input.policy.safeStates[signalState]);
 attack("confirm_diagnosis_"+x.ruleId,(_,o)=>o.detectionChecks[i].diagnosis="CONFIRMED_CAUSE");
 attack("fake_sensitivity_"+x.ruleId,(_,o)=>o.detectionChecks[i].sensitivity=0.97);
 attack("fake_specificity_"+x.ruleId,(_,o)=>o.detectionChecks[i].specificity=0.95);
 attack("fake_OEM_effectivity_"+x.ruleId,(_,o)=>o.detectionChecks[i].OEMMethodEffective=true);
 attack("fake_measurement_"+x.ruleId,(_,o)=>o.detectionChecks[i].realMeasurementPerformed=true);
 attack("fake_priority_"+x.ruleId,(_,o)=>o.detectionChecks[i].riskPriorityAssigned=true);
 attack("false_negative_is_healthy_"+x.ruleId,(_,o)=>o.syntheticInterpretationDrills[i*3+1].noSignalDoesNotProveHealth=false);
 attack("proof_missing_alternative_"+x.ruleId,(_,o)=>o.detectionChecks[i].sourceObservabilityAlternativeIds.pop());
 attack("actual_false_positive_count_"+x.ruleId,(_,o)=>o.detectionChecks[i].falsePositiveObservedCount=1);
 attack("policy_fake_performance_"+x.ruleId,(s)=>s.policy.checks[i].validatedSensitivity=0.98);
}
probe("unknown_rule",{ruleId:"REAL-001",signalState:"observed"},"REJECT_UNKNOWN_OR_UNSAFE_SIGNAL");
probe("unknown_signal",{ruleId:report.detectionChecks[0].ruleId,signalState:"CONFIRMED"},"REJECT_UNKNOWN_OR_UNSAFE_SIGNAL");
probe("missing_state",{ruleId:report.detectionChecks[0].ruleId},"REJECT_UNKNOWN_OR_UNSAFE_SIGNAL");
probe("extra_signature",{ruleId:report.detectionChecks[0].ruleId,signalState:"observed",signer:"confirmed"},"REJECT_UNKNOWN_OR_UNSAFE_SIGNAL");
probe("numeric_signal",{ruleId:report.detectionChecks[0].ruleId,signalState:1},"REJECT_UNKNOWN_OR_UNSAFE_SIGNAL");
probe("null_payload",null,"REJECT_UNKNOWN_OR_UNSAFE_SIGNAL");
probe("array_payload",[],"REJECT_UNKNOWN_OR_UNSAFE_SIGNAL");
probe("blank_payload",{},"REJECT_UNKNOWN_OR_UNSAFE_SIGNAL");
const d=o=>o.detectionChecks[0],s=o=>o.syntheticInterpretationDrills[0];
attack("summary_real_case",(_,o)=>o.summary.actualObservations=1);
attack("summary_specificity_validated",(_,o)=>o.summary.validatedSpecificityCount=1);
attack("summary_root_confirmed",(_,o)=>o.summary.realDiagnosticConfirmations=1);
attack("summary_fake_priority",(_,o)=>o.summary.realPriorityAssignments=1);
attack("summary_sap_unblocked",(_,o)=>o.summary.SAPExceptionsBlocked=0);
attack("summary_gates_unblocked",(_,o)=>o.summary.privateGatesBlocked=0);
attack("summary_sap_write",(_,o)=>o.summary.SAPChanges=1);
attack("summary_workorder",(_,o)=>o.summary.workOrdersCreated=1);
attack("summary_operation_release",(_,o)=>o.summary.operationalReleases=1);
attack("summary_no_go_rewritten",(_,o)=>o.summary.publicDecision="GO");
attack("source_symptom_corrupted",(_,o)=>d(o).seedSymptomLiteral="No issue");
attack("source_method_corrupted",(_,o)=>d(o).seedMethodLiteral="manual guess");
attack("source_system_corrupted",(_,o)=>d(o).system="TRASH");
attack("signal_claim_changed",(_,o)=>d(o).conceptualSignal="Cause confirmed");
attack("false_attribution_risk_removed",(_,o)=>d(o).hypotheticalAttributionTrap="none");
attack("false_negative_boundary_removed",(_,o)=>d(o).hypotheticalMissedDetection="never");
attack("confounding_context_removed",(_,o)=>d(o).uncontrolledContext="none");
attack("inconclusive_boundary_removed",(_,o)=>d(o).mandatoryInconclusiveBoundary="GO");
attack("detector_calibrated",(_,o)=>d(o).capabilityStatus="VALIDATED");
attack("real_uncertainty_fabricated",(_,o)=>d(o).measurementUncertainty=0.1);
attack("test_authorized",(_,o)=>d(o).safetyApprovalReceived=true);
attack("SAP_allowed",(_,o)=>d(o).SAPChangeAllowed=true);
attack("field_work_authorized",(_,o)=>d(o).workAuthorized=true);
attack("operation_release",(_,o)=>d(o).operationsReleased=true);
attack("packet_removed",(_,o)=>o.detectionChecks.pop());
attack("packet_duplicated",(_,o)=>o.detectionChecks.push(clone(d(o))));
attack("state_health_inferred",(_,o)=>s(o).noSignalDoesNotProveHealth=false);
attack("state_alternatives_closed",(_,o)=>s(o).alternativesRemainOpen=false);
attack("state_fake_observation",(_,o)=>s(o).actualObservationMade=true);
attack("state_qualified_measurement_claim",(_,o)=>s(o).qualifiedMeasurements=1);
attack("state_root_confirmed",(_,o)=>s(o).causeRootConfirmed=true);
attack("state_oem_applicable",(_,o)=>s(o).OEMApplicabilityApproved=true);
attack("state_signer_forged",(_,o)=>s(o).humanReviewerSigned=true);
attack("state_confidence_calibrated",(_,o)=>s(o).confidenceCalibrated=true);
attack("state_sap_updated",(_,o)=>s(o).SAPUpdated=true);
attack("state_operation_released",(_,o)=>s(o).operationalRelease=true);
attack("state_disposition_go",(_,o)=>s(o).status="GO");
attack("state_classification_go",(_,o)=>s(o).proposedInterpretation="CAUSE_CONFIRMED");
attack("state_unknown",(_,o)=>s(o).syntheticSignalState="cleared");
attack("state_missing",(_,o)=>o.syntheticInterpretationDrills.pop());
attack("policy_normalizes_low_risk",(i)=>i.policy.guardrails.noAutomaticRiskRanking=false);
attack("policy_calibrated_spec",(i)=>i.policy.checks[0].validatedSpecificity=0.5);
attack("policy_fake_actual_test",(i)=>i.policy.checks[0].actualTestPerformed=true);
attack("policy_false_positive_recorded",(i)=>i.policy.checks[0].falsePositiveObservations=1);
attack("policy_safe_state_go",(i)=>i.policy.safeStates.observed="GO");
attack("policy_health_from_absence",(i)=>i.policy.safeStates.notObserved="HEALTHY");
attack("policy_remove_ambiguity",(i)=>i.policy.syntheticSignals.pop());
attack("policy_make_statistical_claim",(i)=>i.policy.terminology.falsePositive="Measured 100% specificity");
attack("policy_invalidate_context",(i)=>i.policy.checks[0].confounder="NA");
attack("policy_invalidate_missed_detection",(i)=>i.policy.checks[0].missedDetection="NA");
attack("policy_confirm_damage",(i)=>i.policy.checks[0].attributionTrap="causa raiz confirmada");
attack("policy_remove_one_rule",(i)=>i.policy.checks.pop());
attack("policy_duplicate_rule",(i)=>i.policy.checks.push(clone(i.policy.checks[0])));
attack("source_observation_fabricated",(i)=>i.observability.summary.actualMeasurements=1);
attack("source_obs_promoted",(i)=>i.observability.packets[0].mayPromoteFMEA=true);
attack("source_seed_verified",(i)=>i.seeds.records[0].review="aprovado");
attack("source_maturity_changed",(i)=>i.maturity.summary.fieldConfirmed=1);
attack("source_sap_exception_removed",(i)=>i.gaps.records.pop());
attack("source_sap_remap_approved",(i)=>i.gaps.records[0].autoRemapAllowed=true);
attack("source_private_gate_go",(i)=>i.runbook.phases[0].gate="GO");
attack("source_private_gate_signed",(i)=>i.runbook.phases[0].decisionToken="YES");
const audit={status:errors.length?"FAIL":"OK",priorAuditPassed:errors.every(e=>!e.includes("upstream_observability_invalid")),
 samples:probes.length,passed:probes.filter(x=>x.pass).length,
 negativeMutations:attacks.length,rejected:attacks.filter(x=>x.rejected).length,
 probes,attacks,errors};
fs.mkdirSync(path.join(root,"reports"),{recursive:true});
fs.writeFileSync(path.join(root,"reports/pm-inspection-detectability.generated.json"),JSON.stringify({...report,audit},null,2)+"\n");
console.log(JSON.stringify({status:audit.status,summary:report.summary,
 classificationTests:audit.samples,classificationPassed:audit.passed,
 adversarialMutations:audit.negativeMutations,adversarialRejected:audit.rejected,errors},null,2));
process.exit(errors.length?1:0);
