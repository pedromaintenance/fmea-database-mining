#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {fileURLToPath} from "node:url";
import {buildUnrankedObservability,assessUnrankedObservability} from "./lib/pm-unranked-observability.mjs";
import {buildInspectionDetectability,assessInspectionDetectability} from "./lib/pm-inspection-detectability.mjs";
import {buildMetrologyProvenance,assessMetrologyProvenance,classifySyntheticMetrology,routeMetrologyStatuses} from "./lib/pm-metrology-provenance.mjs";
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
const report=buildMetrologyProvenance(metaInput);
const initial=assessMetrologyProvenance(metaInput,report);
const errors=[...initial.errors],attacks=[],probes=[];
const upstream=[
 ["observability",assessUnrankedObservability(obsInputs,observability).status],
 ["detectability",assessInspectionDetectability(input,detectability).status]
];
for(const [id,status] of upstream)if(!status.startsWith("NO_GO_"))errors.push("upstream_invalid_"+id+"_"+status);
function probe(id,sample,expected){
 const actual=classifySyntheticMetrology(sample,metaInput.policy);
 const ok=actual===expected;
 probes.push({id,expected,actual,ok});
 if(!ok)errors.push("classification_failed_"+id);
}
function attack(id,fn){
 const inputs=clone(metaInput),out=clone(report);
 try{fn(inputs,out)}catch(e){errors.push("broken_attack_fixture_"+id+"_"+e.message);return}
 let rejected=false;
 try{rejected=assessMetrologyProvenance(inputs,out).status==="REJECTED"}catch(e){rejected=true}
 attacks.push({id,rejected});
 if(!rejected)errors.push("mutation_not_rejected_"+id);
}
const full=Object.fromEntries(metaInput.policy.sequence.map(id=>[id,"hypothetically_documented"]));
for(const packet of report.packets){
 const index=report.packets.findIndex(p=>p.ruleId===packet.ruleId);
 for(const sc of metaInput.policy.scenarios){
   const statuses={...full,...sc.override};
   probe(packet.ruleId+"_"+sc.id,{ruleId:packet.ruleId,statuses},sc.expected);
 }
 attack("fake_calibration_"+packet.ruleId,(_,o)=>o.packets[index].calibrationVerified=true);
 attack("fake_instrument_"+packet.ruleId,(_,o)=>o.packets[index].instrumentVerified=true);
 attack("fake_method_"+packet.ruleId,(_,o)=>o.packets[index].serialSpecificOEMMethod="OEM-SERIAL");
 attack("fake_sample_"+packet.ruleId,(_,o)=>o.packets[index].actualSampleCollected=true);
 attack("fake_measurement_"+packet.ruleId,(_,o)=>o.packets[index].measuredValue=2.2);
 attack("fake_uncertainty_"+packet.ruleId,(_,o)=>o.packets[index].uncertainty=0.12);
 attack("fake_root_cause_"+packet.ruleId,(_,o)=>o.packets[index].rootCauseConfirmed=true);
 attack("fake_approval_"+packet.ruleId,(_,o)=>o.packets[index].qualityAssessmentApproved=true);
 attack("fake_specific_criterion_"+packet.ruleId,(_,o)=>o.packets[index].requiredReviewCriteria[0].status="DOCUMENT_APPROVED");
 attack("policy_fake_evidence_"+packet.ruleId,(i)=>i.policy.criteria[0].actualEvidenceReceived=true);
}
probe("unknown_rule",{ruleId:"REAL-777-001",statuses:{...full}},"REJECT_UNSUPPORTED_SYNTHETIC_EVIDENCE");
probe("missing_rule",{statuses:{...full}},"REJECT_UNSUPPORTED_SYNTHETIC_EVIDENCE");
probe("missing_statuses",{ruleId:report.packets[0].ruleId},"REJECT_UNSUPPORTED_SYNTHETIC_EVIDENCE");
probe("extra_identity_field",{ruleId:report.packets[0].ruleId,statuses:{...full},signer:"REAL"},"REJECT_UNSUPPORTED_SYNTHETIC_EVIDENCE");
probe("extra_metric",{ruleId:report.packets[0].ruleId,statuses:{...full,measuredValue:27}},"REJECT_UNSUPPORTED_SYNTHETIC_EVIDENCE");
probe("calibration_verified_is_not_a_state",{ruleId:report.packets[0].ruleId,statuses:{...full,calibration:"verified"}},"REJECT_UNSUPPORTED_SYNTHETIC_EVIDENCE");
probe("unsafe_only_safety",{ruleId:report.packets[0].ruleId,statuses:{...full,calibration:"unsafe"}},"REJECT_UNSUPPORTED_SYNTHETIC_EVIDENCE");
probe("na_not_permitted_for_identity",{ruleId:report.packets[0].ruleId,statuses:{...full,asset_identity:"hypothetically_not_applicable"}},"REJECT_UNSUPPORTED_SYNTHETIC_EVIDENCE");
probe("empty",{},"REJECT_UNSUPPORTED_SYNTHETIC_EVIDENCE");
probe("null",null,"REJECT_UNSUPPORTED_SYNTHETIC_EVIDENCE");
probe("array",[],"REJECT_UNSUPPORTED_SYNTHETIC_EVIDENCE");
probe("unsafe_has_priority",{ruleId:report.packets[0].ruleId,statuses:{...full,safety:"unsafe",asset_identity:"not_demonstrated"}},"STOP_UNAUTHORIZED_OPERATION_REQUEST_SAFETY_REVIEW");
const p=o=>o.packets[0],c=o=>o.packets[0].requiredReviewCriteria[0],s=o=>o.syntheticQualityDrills[0];
attack("report_public_go",(_,o)=>o.disposition="GO");
attack("report_priority_changed",(_,o)=>o.summary.riskPrioritiesChanged=15);
attack("report_fake_inspection",(_,o)=>o.summary.realInspections=1);
attack("report_fake_calibration",(_,o)=>o.summary.calibrationsVerified=1);
attack("report_fake_instrument",(_,o)=>o.summary.realInstrumentsChecked=1);
attack("report_fake_sample",(_,o)=>o.summary.actualSamples=1);
attack("report_fake_uncertainty",(_,o)=>o.summary.uncertaintyStudiesValidated=1);
attack("report_fake_document",(_,o)=>o.summary.actualEvidenceItemsReceived=1);
attack("report_fake_reviewer",(_,o)=>o.summary.privateReviewerApprovals=1);
attack("report_fake_root",(_,o)=>o.summary.confirmedRootCauses=1);
attack("report_fake_SAP",(_,o)=>o.summary.approvedSAPChanges=1);
attack("report_fake_order",(_,o)=>o.summary.createdWorkOrders=1);
attack("report_fake_release",(_,o)=>o.summary.operationalReleases=1);
attack("report_gates_unblocked",(_,o)=>o.summary.privateGatesBlocked=0);
attack("report_SAP_exceptions_unblocked",(_,o)=>o.summary.pmSapExceptionBlocks=0);
attack("report_number_of_rules",(_,o)=>o.summary.sourceUnrankedRules=14);
attack("report_faux_evidence_slot",(_,o)=>o.summary.unassessedPrivateEvidenceSlots=149);
attack("report_remove_packet",(_,o)=>o.packets.pop());
attack("report_duplicate_packet",(_,o)=>o.packets.push(clone(p(o))));
attack("report_remove_criterion",(_,o)=>p(o).requiredReviewCriteria.pop());
attack("report_criterion_signature",(_,o)=>c(o).independentReviewerSigned=true);
attack("report_criterion_custody",(_,o)=>c(o).documentAuthenticityVerified=true);
attack("report_criterion_received",(_,o)=>c(o).actualEvidenceReceived=true);
attack("report_criterion_licensed",(_,o)=>c(o).methodLicenseVerified=true);
attack("report_criterion_applicability",(_,o)=>c(o).methodApplicability="EFFECTIVE");
attack("report_criterion_shortcut",(_,o)=>c(o).privateProofToRequest="none");
attack("report_method_relabel",(_,o)=>p(o).sourceInspectionMethodLiteral="UNCONTROLLED");
attack("report_source_symptom_relabel",(_,o)=>p(o).sourceSymptomLiteral="CONFIRMED");
attack("report_wrong_system",(_,o)=>p(o).system="CAT999");
attack("report_alternative_suppressed",(_,o)=>p(o).sourceAlternativeIds.pop());
attack("report_safety_suppressed",(_,o)=>p(o).sourceSafetyBoundary="SAFE");
attack("report_real_asset",(_,o)=>p(o).realAssetIdentifier="REAL-EQUIPMENT");
attack("report_operator_signature",(_,o)=>p(o).signedReviewReference="SIGNED");
attack("report_real_custody",(_,o)=>p(o).actualCustodyReference="REAL_DOCUMENT");
attack("report_real_context",(_,o)=>p(o).contextRecord="PRIVATE");
attack("report_real_repeatability",(_,o)=>p(o).repeatabilityStudy="SYNTH");
attack("report_quality_GO",(_,o)=>p(o).finalEvidenceJudgment="ACCEPTED");
attack("report_SAP_write",(_,o)=>p(o).SAPWriteAllowed=true);
attack("report_operation_release",(_,o)=>p(o).operationalRelease=true);
attack("synthetic_promoted",(_,o)=>s(o).decision="GO");
attack("synthetic_laundered_evidence",(_,o)=>s(o).qualifiedEvidenceAccepted=true);
attack("synthetic_fake_engineer",(_,o)=>s(o).engineeringApproved=true);
attack("synthetic_fake_private_case",(_,o)=>s(o).actualCaseReceived=true);
attack("synthetic_fake_SAP",(_,o)=>s(o).SAPUpdated=true);
attack("synthetic_fake_workorder",(_,o)=>s(o).workOrderCreated=true);
attack("synthetic_fake_operational",(_,o)=>s(o).operationReleased=true);
attack("synthetic_fake_reviewer",(_,o)=>s(o).privateReviewerAuthenticated=true);
attack("synthetic_fake_closure",(_,o)=>s(o).caseClosed=true);
attack("synthetic_route_changed",(_,o)=>s(o).proposedQualityRoute="APPROVED");
attack("synthetic_safety_rewritten",(_,o)=>s(o).syntheticStatuses.safety="unsafe");
attack("synthetic_deleted",(_,o)=>o.syntheticQualityDrills.pop());
attack("policy_lost_rule",(i)=>i.policy.ruleIds.pop());
attack("policy_invented_rule",(i)=>i.policy.ruleIds.push("ASSET_REAL"));
attack("policy_fake_certificate",(i)=>i.policy.criteria[4].corporateApprovalReceived=true);
attack("policy_missing_criterion",(i)=>i.policy.criteria.pop());
attack("policy_duplicate_criterion",(i)=>i.policy.criteria.push(clone(i.policy.criteria[0])));
attack("policy_removed_status",(i)=>i.policy.statusEnums.conditional.pop());
attack("policy_all_fake_good_go",(i)=>i.policy.routes.all_synthetic="GO");
attack("policy_unsafe_made_safe",(i)=>i.policy.routes.unsafe="SAFE");
attack("policy_na_accepted",(i)=>i.policy.routes.not_applicable="APPROVED");
attack("policy_uncontrolled_safety",(i)=>i.policy.guardrails.noFieldTestAuthorized=false);
attack("policy_uncontrolled_oem",(i)=>i.policy.guardrails.noOEMDocumentCopied=false);
attack("policy_shortened_evidence",(i)=>i.policy.criteria[0].privateProof="verified");
attack("policy_created_data",(i)=>i.policy.scope.actualDataStored=1);
attack("policy_missing_scenario",(i)=>i.policy.scenarios.pop());
attack("policy_fake_scenario",(i)=>i.policy.scenarios[0].expected="GO");
attack("source_detectability_real",(i)=>i.detectability.summary.actualObservations=1);
attack("source_detectability_claim_efficacy",(i)=>i.detectability.summary.validatedSensitivityCount=1);
attack("source_observability_real",(i)=>i.observability.summary.actualMeasurements=1);
attack("source_observability_authorized",(i)=>i.observability.packets[0].mayAuthorizeTesting=true);
attack("source_seed_approved",(i)=>i.seeds.records[0].review="aprovado");
attack("source_maturity_promoted",(i)=>i.maturity.summary.fieldConfirmed=1);
attack("source_gaps_approved",(i)=>i.gaps.records[0].autoRemapAllowed=true);
attack("source_gaps_deleted",(i)=>i.gaps.records.pop());
attack("source_corporate_gate_unblocked",(i)=>i.runbook.phases[0].gate="GO");
attack("source_corporate_signature",(i)=>i.runbook.phases[0].decisionToken="SIGNED");
const audit={
 status:errors.length?"FAIL":"OK",
 upstreamAudits:upstream.length,syntheticProbes:probes.length,
 passed:probes.filter(x=>x.ok).length,negativeMutations:attacks.length,
 rejected:attacks.filter(x=>x.rejected).length,probes,attacks,errors
};
fs.mkdirSync(path.join(root,"reports"),{recursive:true});
fs.writeFileSync(path.join(root,"reports/pm-metrology-provenance.generated.json"),JSON.stringify({...report,audit},null,2)+"\n");
console.log(JSON.stringify({status:audit.status,summary:report.summary,
 upstreamAudits:audit.upstreamAudits,probes:audit.syntheticProbes,passed:audit.passed,
 mutations:audit.negativeMutations,rejected:audit.rejected,errors},null,2));
process.exit(errors.length?1:0);
