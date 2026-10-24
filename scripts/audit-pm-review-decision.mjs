#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {buildPmReviewDecisionPacket,assessPublicPmReviewDecisionPacket,LANES,CATEGORIES} from './lib/pm-review-decision.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const base={
 policy:read('data/governance/pm-review-decision-policy.v1.json'),
 preflight:read('data/quality/pm-pilot-preflight.v1.json'),
 p0:read('data/quality/pm-p0-documentary-review.v1.json'),
 maturity:read('data/quality/pm-maturity-matrix.v1.json'),
 runbook:read('data/governance/pm-private-deployment-runbook.v1.json'),
 intake:read('data/governance/pm-evidence-intake-policy.v1.json'),
 gaps:read('data/quality/pm-gap-review.v1.json'),
 ontology:read('data/ontology/condition-action-damage.v1.json')
};
const snapshot=read('data/quality/pm-review-decision-packet.v1.json'),clone=x=>JSON.parse(JSON.stringify(x)),same=(x,y)=>JSON.stringify(x)===JSON.stringify(y);
function check(d,s){
 const errors=[],ck=(v,id)=>{if(!v)errors.push(id)};
 const {policy,preflight,p0,maturity,runbook,intake,gaps,ontology}=d;
 const a=assessPublicPmReviewDecisionPacket(d,s);
 ck(a.status==='NO_GO_PUBLIC_REVIEW'&&a.errors.length===0&&a.engineeringApproved===false&&a.sapApproved===false&&a.operationsReleased===false,'assess_'+a.errors.slice(0,3).join('_'));
 ck(policy.schema==='fmea-mining.pm-review-decision-policy.v1'&&policy.version==='1.3.64','policy_version');
 ck(same(policy.decisionLanes.map(x=>x.id),LANES)&&policy.decisionLanes.length===4&&policy.decisionLanes.every(x=>x.privatePossibleOutcome.length>=3&&x.requires.length===3&&x.doesNotAuthorize.length>=2&&x.publicStatus!=='approved'),'lanes_separated');
 ck(same(CATEGORIES,['identity','oem','safe_execution','measurement_quality','diagnosis','independent_review','sap_change']),'checklist_sections');
 ck(policy.criteria.length===7&&policy.criteria.every((x,i)=>x.id==='EC-0'+(i+1)&&x.trigger.length>55&&x.failureEffect.startsWith('hold_')),'seven_decision_criteria');
 ck(policy.trustBoundary.publicAlwaysNoGo===true&&Object.entries(policy.trustBoundary).every(([k,v])=>k==='publicAlwaysNoGo'?v===true:k.endsWith('InRepo')?v===0:v===false),'public_private_boundary');
 ck(policy.forbiddenPromotions.length===7&&policy.publicActions.length===5,'promotion_prevention');
 ck(gaps.records.length===10&&gaps.records.every(x=>x.status==='bloqueado_aguardando_curadoria'&&x.autoRemapAllowed===false&&x.observedFailures===0),'SAP_immutable');
 ck(ontology.version==='1.3.23'&&ontology.bundles.length===25&&ontology.observations.length===0&&ontology.confirmedComponentDamages.length===0&&ontology.workOrderExecutions.length===0,'no_real_field_events');
 ck(maturity.summary.conceptuallyModeled===25&&maturity.summary.sapExceptionsBlocked===10&&maturity.summary.serialOemVerified===0&&maturity.summary.fieldConfirmed===0&&maturity.summary.sapMappingsApproved===0,'no_fictitious_maturity');
 ck(runbook.goNoGo.decision==='NO_GO'&&runbook.goNoGo.realPilotAllowed===false&&runbook.phases.length===8&&runbook.phases.every(x=>x.status==='not_started'&&x.gate==='BLOCK'),'private_runbook_not_live');
 ck(preflight.summary.pilotCandidates===2&&preflight.summary.actualAssetsSelected===0&&preflight.summary.actualPilotsApproved===0&&preflight.summary.overallDecision==='NO_GO','preflight_pending');
 ck(p0.summary.p0Rules===5&&p0.summary.detailedPreparation===2&&p0.summary.fieldEvidenceReceived===0&&p0.summary.approvedSapMappings===0,'P0_pending');
 ck(intake.boundaries.privateStorageImplemented===false&&intake.boundaries.corporateSSOIntegrated===false&&intake.boundaries.realCasesInRepository===0&&intake.boundaries.signedImmutableAuditTrailImplemented===false,'intake_mock_only');
 ck(s.schema==='fmea-mining.pm-review-decision-packet.v1'&&s.version==='1.3.64'&&s.nature==='public_synthetic_unapproved_decision_package','packet_version');
 ck(same(s,buildPmReviewDecisionPacket(d)),'deterministic_snapshot');
 ck(s.summary.candidateCases===2&&s.summary.unverifiedCheckInstances===68&&s.summary.checklistRequirementsPerCase===34&&s.summary.evidenceKindsPerCase===5&&s.summary.decisionLanesPerCase===4&&s.summary.privateGatesBlocked===8&&s.summary.verifiedRealEvidence===0&&s.summary.engineeringApprovals===0&&s.summary.sapApprovals===0&&s.summary.operationalReleases===0&&s.summary.publicDecision==='NO_GO','summary_correct');
 for(const row of s.cases){
  const source=p0.reviews.find(x=>x.ruleId===row.ruleId),before=preflight.cases.find(x=>x.ruleId===row.ruleId);
  ck(row.caseId.startsWith('TEST-')&&row.bundleId===before?.bundleId&&row.blocker===source?.blocker&&row.priority==='P0'&&same(row.minimumEvidence,source?.minimumEvidence),'case_provenance_'+row.ruleId);
  ck(row.decisionLanes.length===4&&same(row.decisionLanes.map(x=>x.laneId),LANES)&&row.decisionLanes.every(x=>x.trustedReviewerToken===null&&x.signatureVerified===false&&x.privateChangeRecord===null&&x.decisionTime===null),'review_separation_'+row.ruleId);
  ck(row.decisionTrail.nature==='synthetic_not_immutable'&&row.decisionTrail.events.length===0&&row.decisionTrail.lastVerifiedEvent===null&&row.decisionTrail.immutableExternalAuditVerified===false,'no_fake_immutable_ledger_'+row.ruleId);
  ck(row.evidenceReceiptKinds.length===5&&row.evidenceReceiptKinds.every(x=>x.status==='not_received'&&x.privateVaultRef===null&&x.custodyVerified===false&&x.licenseVerified===false),'no_private_evidence_'+row.ruleId);
  ck(same(Object.keys(row.requestedChecks),CATEGORIES)&&Object.values(row.requestedChecks).flat().length===34&&Object.values(row.requestedChecks).flat().every(x=>x.state==='unverified'&&x.privateEvidenceReceipt===null&&x.technicalAssessor===null),'checklist_unverified_'+row.ruleId);
  ck(row.counterhypotheses.length===3&&row.counterhypotheses.every(x=>x.alternative.length>25&&x.disposition==='not_assessed'&&x.fieldTestVerified===false),'independent_differentials_'+row.ruleId);
  ck(Object.values(row.evidenceQuality).every(x=>x===false)&&row.actualObservations===0&&row.performedActions===0&&row.confirmedDamages===0&&row.confirmedRootCauses===0&&row.approvedSapMappings===0&&row.engineeringValidated===false&&row.operationallyReleased===false&&row.privatePilotAuthorized===false&&row.publicDecision==='NO_GO','no_real_approval_'+row.ruleId);
 }
 return errors;
}
const errors=check(base,snapshot),attacks=[];
function mutation(name,mutate){
 const a=clone(base),s=clone(snapshot);mutate(a,s);
 let result=[];try{result=check(a,s)}catch(e){result=['validator_exception_'+e.message]}
 const rejected=result.length>0;attacks.push({name,rejected});
 if(!rejected)errors.push('attack_was_accepted_'+name);
}
const one=s=>s.cases[0],two=s=>s.cases[1];
mutation('engineering_false_approval',(_,s)=>one(s).engineeringValidated=true);
mutation('sap_false_approval',(_,s)=>one(s).approvedSapMappings=1);
mutation('operational_false_release',(_,s)=>one(s).operationallyReleased=true);
mutation('root_cause_confirmed',(_,s)=>one(s).confirmedRootCauses=1);
mutation('damages_confirmed',(_,s)=>one(s).confirmedDamages=1);
mutation('observations_fabricated',(_,s)=>one(s).actualObservations=1);
mutation('work_performed_fabricated',(_,s)=>one(s).performedActions=1);
mutation('pilot_falsely_authorized',(_,s)=>one(s).privatePilotAuthorized=true);
mutation('case_public_GO',(_,s)=>one(s).publicDecision='GO');
mutation('real_tag_in_case',(_,s)=>one(s).caseId='CAT-777-REAL');
mutation('case_rule_swapped',(_,s)=>one(s).ruleId='drill-compressor-filter');
mutation('case_bundle_swapped',(_,s)=>one(s).bundleId='BUNDLE-25');
mutation('SAP_blocker_dropped',(_,s)=>one(s).blocker=null);
mutation('document_marked_received',(_,s)=>one(s).evidenceReceiptKinds[0].status='received');
mutation('document_vault_ref',(_,s)=>one(s).evidenceReceiptKinds[0].privateVaultRef='https://private.example.com');
mutation('document_custody_claimed',(_,s)=>one(s).evidenceReceiptKinds[0].custodyVerified=true);
mutation('document_license_claimed',(_,s)=>one(s).evidenceReceiptKinds[0].licenseVerified=true);
mutation('checklist_false_approval',(_,s)=>one(s).requestedChecks.oem[0].state='approved');
mutation('checklist_fake_receipt',(_,s)=>one(s).requestedChecks.identity[0].privateEvidenceReceipt='FAKE');
mutation('checklist_fake_assessor',(_,s)=>one(s).requestedChecks.diagnosis[0].technicalAssessor='FAKE');
mutation('missing_checklist_item',(_,s)=>one(s).requestedChecks.measurement_quality.pop());
mutation('minimum_evidence_removed',(_,s)=>one(s).minimumEvidence.pop());
mutation('counterhypothesis_removed',(_,s)=>one(s).counterhypotheses.pop());
mutation('counterhypothesis_falsely_tested',(_,s)=>one(s).counterhypotheses[0].fieldTestVerified=true);
mutation('counterhypothesis_falsely_resolved',(_,s)=>one(s).counterhypotheses[0].disposition='refuted');
mutation('metrology_falsely_calibrated',(_,s)=>one(s).evidenceQuality.measurementCalibrationVerified=true);
mutation('metrology_falsely_effective',(_,s)=>one(s).evidenceQuality.serialBomVerified=true);
mutation('measurement_uncertainty_faked',(_,s)=>one(s).evidenceQuality.measurementUncertaintyAccepted=true);
mutation('engineering_reviewer_faked',(_,s)=>one(s).decisionLanes[1].trustedReviewerToken='TEST-ACTOR-01');
mutation('engineering_signature_faked',(_,s)=>one(s).decisionLanes[1].signatureVerified=true);
mutation('SAP_change_record_faked',(_,s)=>one(s).decisionLanes[2].privateChangeRecord='TEST-CHANGE');
mutation('operations_lane_faked',(_,s)=>one(s).decisionLanes[3].status='authorized_return_to_service');
mutation('immutable_audit_faked',(_,s)=>one(s).decisionTrail.immutableExternalAuditVerified=true);
mutation('event_inserted',(_,s)=>one(s).decisionTrail.events.push({test:true}));
mutation('second_case_approved',(_,s)=>two(s).decisionLanes[0].status='document_set_ready_for_human_review');
mutation('summary_SAP_approved',(_,s)=>s.summary.sapApprovals=1);
mutation('summary_eng_approved',(_,s)=>s.summary.engineeringApprovals=1);
mutation('summary_ops_released',(_,s)=>s.summary.operationalReleases=1);
mutation('summary_gates_unblocked',(_,s)=>s.summary.privateGatesBlocked=0);
mutation('source_private_go',(a)=>a.runbook.goNoGo.decision='GO');
mutation('source_pilot_go',(a)=>a.preflight.summary.overallDecision='GO');
mutation('source_mat_real_evidence',(a)=>a.maturity.summary.fieldConfirmed=1);
mutation('source_SAP_auto_remap',(a)=>a.gaps.records[0].autoRemapAllowed=true);
mutation('source_ontology_real_event',(a)=>a.ontology.observations.push({invented:true}));
mutation('policy_public_go',(a)=>a.policy.trustBoundary.publicAlwaysNoGo=false);
mutation('policy_real_records',(a)=>a.policy.trustBoundary.realCaseDataInRepo=1);
mutation('policy_SAP_auto',(a)=>a.policy.trustBoundary.sapAutoApproval=true);
mutation('policy_doc_claim_approved',(a)=>a.policy.decisionLanes[0].publicStatus='approved');
mutation('policy_remove_separation',(a)=>a.policy.decisionLanes.pop());
mutation('policy_remove_criterion',(a)=>a.policy.criteria.pop());
mutation('policy_evidence_kind_removed',(a)=>a.policy.evidenceKinds.pop());
mutation('policy_forbidden_promotion_removed',(a)=>a.policy.forbiddenPromotions.pop());
mutation('source_p0_evidence_added',(a)=>a.p0.summary.fieldEvidenceReceived=1);
const total=attacks.length,rejected=attacks.filter(x=>x.rejected).length;
if(total!==53||rejected!==total)errors.push('adversarial_suite_incomplete');
const report={schema:'fmea-mining.pm-review-decision-audit.v1',version:'1.3.64',status:errors.length?'FAIL':'OK',
 summary:snapshot.summary,decisionLanes:LANES,policyCriteria:base.policy.criteria.map(x=>x.id),
 actualHumanApprovals:0,realFieldEvidence:0,realOperationalReleases:0,approvedSapMappings:0,
 adversarialMutationsRejected:rejected,adversarialMutationsTotal:total,errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-review-decision.generated.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));process.exit(errors.length?1:0);
