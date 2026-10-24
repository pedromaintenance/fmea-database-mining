#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {buildPmPilotPreflight,assessPublicPmPilotPreflight,REQUIRED_SECTIONS,PILOT_TARGETS} from './lib/pm-pilot-preflight.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const data={
 policy:read('data/governance/pm-pilot-readiness-policy.v1.json'),
 runbook:read('data/governance/pm-private-deployment-runbook.v1.json'),
 p0:read('data/quality/pm-p0-documentary-review.v1.json'),
 maturity:read('data/quality/pm-maturity-matrix.v1.json'),
 gaps:read('data/quality/pm-gap-review.v1.json'),
 intake:read('data/governance/pm-evidence-intake-policy.v1.json')
};
const snapshot=read('data/quality/pm-pilot-preflight.v1.json'),clone=x=>JSON.parse(JSON.stringify(x)),eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function check(d,s){
 const errors=[],ck=(ok,id)=>{if(!ok)errors.push(id)};
 const r=assessPublicPmPilotPreflight(d,s);
 ck(r.status==='NO_GO_PUBLIC_PREFLIGHT'&&r.pilotAuthorized===false&&r.sapApproved===false&&r.errors.length===0,'base_preflight_or_policy');
 ck(d.policy.version==='1.3.63'&&d.policy.schema==='fmea-mining.pm-pilot-readiness-policy.v1'&&d.policy.sourceDeploymentVersion===d.runbook.version&&d.policy.sourceDocumentaryVersion===d.p0.version&&d.policy.sourceMaturityVersion===d.maturity.version&&d.policy.sourceIntakeVersion===d.intake.version,'source_contract_versions');
 ck(d.runbook.goNoGo.decision==='NO_GO'&&d.runbook.phases.length===8&&d.runbook.phases.every(x=>x.status==='not_started'&&x.gate==='BLOCK')&&d.runbook.infrastructureState.realCasesAccepted===0,'private_authority_absent');
 ck(d.intake.boundaries.realCasesInRepository===0&&d.intake.boundaries.trustedActorRolesProven===false&&d.intake.boundaries.corporateKeyAndSignatureVerificationImplemented===false&&d.intake.boundaries.privateStorageImplemented===false,'identity_storage_not_live');
 ck(d.gaps.records.length===10&&d.gaps.records.every(x=>x.status==='bloqueado_aguardando_curadoria'&&x.autoRemapAllowed===false),'sap_blockers_preserved');
 ck(d.maturity.summary.conceptuallyModeled===25&&d.maturity.summary.serialOemVerified===0&&d.maturity.summary.fieldConfirmed===0&&d.maturity.summary.sapMappingsApproved===0,'maturity_not_approval');
 ck(d.p0.summary.p0Rules===5&&d.p0.summary.detailedPreparation===2&&d.p0.summary.approvedSapMappings===0&&d.p0.summary.fieldEvidenceReceived===0,'P0_no_real_evidence');
 ck(eq(s.cases.map(x=>x.ruleId),PILOT_TARGETS),'candidate_identity');
 ck(s.summary.privateDeploymentGatesBlocked===8&&s.summary.actualAssetsSelected===0&&s.summary.actualPilotsApproved===0&&s.summary.actualInspectionsCompleted===0&&s.summary.confirmedDamages===0&&s.summary.approvedSapMappings===0,'summary_false_approval');
 const checklistSizes={identity:4,oem:5,safe_execution:5,measurement_quality:8,diagnosis:4,independent_review:4,sap_change:4};
 ck(eq(Object.keys(d.policy.checklists),REQUIRED_SECTIONS)&&REQUIRED_SECTIONS.every(x=>d.policy.checklists[x].length===checklistSizes[x]),'checklist_coverage');
 const allChecks=REQUIRED_SECTIONS.flatMap(x=>d.policy.checklists[x]);
 ck(new Set(allChecks.map(x=>x.id)).size===34&&allChecks.every(x=>x.id.length>=7&&x.requirement.length>=48),'no_empty_or_duplicate_requirements');
 ck(eq(d.policy.gates.map(x=>x.id),['G-DEPLOY','G-ASSET','G-OEM','G-SAFE','G-MEASURE','G-DIAG','G-REVIEW','G-SAP'])&&d.policy.gates[0].approvalStatus==='BLOCKED'&&d.policy.gates[7].approvalStatus==='BLOCKED','stage_gates');
 ck(d.policy.decisions.publicPreflight==='NO_GO'&&d.policy.decisions.privatePilotApproval===null&&d.policy.decisions.committeeApprovalRequired===true&&Object.entries(d.policy.decisions).every(([k,v])=>['publicPreflight','privatePilotApproval','committeeApprovalRequired'].includes(k)||v===false),'decision_flags');
 for(const item of s.cases){
  const source=d.p0.reviews.find(x=>x.ruleId===item.ruleId),matrix=d.maturity.rules.find(x=>x.ruleId===item.ruleId);
  ck(item.candidateId.startsWith('TEST-PILOT-')&&item.nature==='synthetic_candidate_no_asset_assignment'&&item.priority==='P0'&&item.bundleId===matrix?.bundleId&&item.sourceBlocker===source?.blocker,'case_provenance_'+item.ruleId);
  ck(eq(item.minimumEvidence,source?.minimumEvidence)&&eq(item.competingMechanisms.map(x=>x.id),source?.differentialQuestions.map(x=>x.id)),'min_evidence_and_differentials_'+item.ruleId);
  ck(item.realAssetAssigned===false&&item.serialEffectivityVerified===false&&item.bomVerified===false&&item.oemLimitsVerified===false&&item.measurementPerformed===false&&item.qualifiedPersonAssigned===false&&item.evidenceVaultLinked===false&&item.qualityReviewCompleted===false&&item.independentEngineeringApproval===false&&item.sapBlocked===true,'premature_assignment_'+item.ruleId);
  ck(item.publicPreflightDecision==='NO_GO'&&item.eligibleForPrivatePilot===false&&item.fieldEvidenceCount===0&&item.confirmedDamageCount===0&&item.approvedSapMappingCount===0,'fake_results_'+item.ruleId);
  ck(eq(Object.keys(item.checks),REQUIRED_SECTIONS)&&REQUIRED_SECTIONS.every(key=>eq(item.checks[key].map(x=>x.id),d.policy.checklists[key].map(x=>x.id))&&item.checks[key].every(x=>x.state==='pending'&&x.evidenceToken===null&&x.reviewToken===null)),'checks_promoted_'+item.ruleId);
  ck(item.measurementProtocol.instrumentVerified===false&&item.measurementProtocol.calibrationVerified===false&&item.measurementProtocol.samplingBeforeIntervention===null&&item.measurementProtocol.operatingContextVerified===false&&item.measurementProtocol.repeatabilityVerified===false&&item.measurementProtocol.uncertaintyReviewed===false&&item.measurementProtocol.oemAcceptanceCriteriaApproved===false&&item.measurementProtocol.methodExecutionRecorded===false,'measurement_quality_faked_'+item.ruleId);
  ck(item.reviewDecision.status==='not_submitted'&&item.reviewDecision.technicalDecisionToken===null&&item.reviewDecision.independentDecisionToken===null&&item.reviewDecision.corporateSignerVerified===false&&item.reviewDecision.sapChangeRequest===null,'review_not_signed_'+item.ruleId);
 }
 return errors;
}
const errors=check(data,snapshot),tests=[];
function attack(id,fn){const d=clone(data),s=clone(snapshot);fn(d,s);const rejected=check(d,s).length>0;tests.push({id,rejected});if(!rejected)errors.push('mutation_accepted_'+id);}
const one=s=>s.cases[0],two=s=>s.cases[1];
attack('case_real_asset',(_,s)=>one(s).realAssetAssigned=true);
attack('case_real_tag',(_,s)=>one(s).candidateId='777-040-001');
attack('case_serial_effectivity',(_,s)=>one(s).serialEffectivityVerified=true);
attack('case_bom_verified',(_,s)=>one(s).bomVerified=true);
attack('case_oem_limit_verified',(_,s)=>one(s).oemLimitsVerified=true);
attack('case_measurement_performed',(_,s)=>one(s).measurementPerformed=true);
attack('case_person_assigned',(_,s)=>one(s).qualifiedPersonAssigned=true);
attack('case_vault_linked',(_,s)=>one(s).evidenceVaultLinked=true);
attack('case_quality_accepted',(_,s)=>one(s).qualityReviewCompleted=true);
attack('case_independent_approved',(_,s)=>one(s).independentEngineeringApproval=true);
attack('case_sap_unblocked',(_,s)=>one(s).sapBlocked=false);
attack('case_field_observation',(_,s)=>one(s).fieldEvidenceCount=1);
attack('case_confirmed_damage',(_,s)=>one(s).confirmedDamageCount=1);
attack('case_approved_sap',(_,s)=>one(s).approvedSapMappingCount=1);
attack('case_private_pilot_claim',(_,s)=>one(s).eligibleForPrivatePilot=true);
attack('case_public_GO',(_,s)=>one(s).publicPreflightDecision='GO');
attack('case_wrong_rule',(_,s)=>one(s).ruleId='drill-compressor-filter');
attack('case_wrong_bundle',(_,s)=>one(s).bundleId='BUNDLE-25');
attack('case_swapped_code',(_,s)=>one(s).requestedDamageCode='99.99');
attack('case_missing_counterhypothesis',(_,s)=>one(s).competingMechanisms.pop());
attack('case_missing_minimum_evidence',(_,s)=>one(s).minimumEvidence.pop());
attack('case_measurement_calibrated',(_,s)=>one(s).measurementProtocol.calibrationVerified=true);
attack('case_measurement_threshold_approved',(_,s)=>one(s).measurementProtocol.oemAcceptanceCriteriaApproved=true);
attack('case_measurement_not_pre',(_,s)=>one(s).measurementProtocol.samplingBeforeIntervention=false);
attack('case_missing_uncertainty',(_,s)=>one(s).measurementProtocol.uncertaintyReviewed=true);
attack('case_check_falsely_completed',(_,s)=>one(s).checks.oem[0].state='approved');
attack('case_evidence_token',(_,s)=>one(s).checks.measurement_quality[0].evidenceToken='REAL-SOURCE');
attack('case_reviewer_token',(_,s)=>one(s).checks.independent_review[0].reviewToken='TEST-FALSE');
attack('case_fake_signature',(_,s)=>one(s).reviewDecision.corporateSignerVerified=true);
attack('case_fake_review_decision',(_,s)=>one(s).reviewDecision.status='approved');
attack('case_fake_sap_request',(_,s)=>one(s).reviewDecision.sapChangeRequest='SAP-REQ-1');
attack('case_other_rule_approved',(_,s)=>two(s).publicPreflightDecision='GO');
attack('summary_claims_one_pilot',(_,s)=>s.summary.actualPilotsApproved=1);
attack('summary_claims_inspection',(_,s)=>s.summary.actualInspectionsCompleted=1);
attack('source_deployment_go',(d)=>d.runbook.goNoGo.decision='GO');
attack('source_deployment_phase_approved',(d)=>d.runbook.phases[0].gate='GO');
attack('source_private_storage_active',(d)=>d.intake.boundaries.privateStorageImplemented=true);
attack('source_sap_gap_unblocked',(d)=>d.gaps.records[0].autoRemapAllowed=true);
attack('source_maturity_field_confirmed',(d)=>d.maturity.summary.fieldConfirmed=1);
attack('source_p0_changed_minimum',(d)=>d.p0.reviews.find(x=>x.ruleId==='cooling-radiator-blockage').minimumEvidence.pop());
attack('policy_allows_private_pilot',(d)=>d.policy.decisions.privatePilotAuthorized=true);
attack('policy_removes_quality_check',(d)=>d.policy.checklists.measurement_quality.pop());
attack('policy_fakes_approval_gate',(d)=>d.policy.gates[0].approvalStatus='APPROVED');
attack('policy_replaces_oem_requirement',(d)=>d.policy.checklists.oem[0].requirement='short');
attack('policy_changes_version',(d)=>d.policy.version='1.3.62');
attack('source_candidate_deleted',(d)=>d.p0.reviews=d.p0.reviews.filter(x=>x.ruleId!=='fuel-filter-contamination'));
const rejected=tests.filter(x=>x.rejected).length;if(tests.length!==46||rejected!==46)errors.push('adversarial_count');
const report={schema:'fmea-mining.pm-pilot-preflight-audit.v1',version:'1.3.63',status:errors.length?'FAIL':'OK',candidateRules:PILOT_TARGETS,checklistRequirements:34,operationalPilotStatus:'NO_GO',actualAssets:0,actualMeasurements:0,approvedSapMappings:0,mutationsRejected:rejected,mutationsTotal:tests.length,errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});fs.writeFileSync(path.join(root,'reports/pm-pilot-preflight.generated.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));process.exit(errors.length?1:0);
