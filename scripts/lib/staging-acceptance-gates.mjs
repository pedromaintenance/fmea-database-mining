/**
 * Pure specification/testing harness for FUTURE corporate staging.
 * No live identity, vault, logging, network, backup or production approval.
 */
export const controlCatalogue=Object.freeze({
identity_and_revocation:["sso_identity_asserted","mfa_challenge_verified","revoked_account_denied","revocation_logged"],
tenant_and_case_isolation:["server_authorization_enforced","wrong_tenant_denied","unassigned_case_denied","guessed_object_ref_denied"],
segregated_reviews:["originator_self_review_denied","reviewer_identity_server_verified","independent_reviewer_distinct","change_control_does_not_approve_publication"],
licensed_evidence_custody:["synthetic_vault_object_private","license_policy_gate_enforced","oem_effectivity_flag_reviewed","raw_content_absent_from_public_artifacts"],
audit_integrity_alerting:["append_only_sink_configured","external_anchor_verified","tampering_alert_triggered","trusted_time_and_log_access_verified"],
backup_restore_and_recovery:["encrypted_backup_restored","restored_tenant_case_acls_verified","restored_audit_chain_verified","recovery_result_documented"],
retention_and_legal_hold:["approved_schedule_applied","active_hold_blocks_disposal","two_distinct_disposal_approvers_checked","backup_and_disposition_record_verified"],
separate_public_release_gate:["oem_license_and_rights_reviewed","privacy_reidentification_screened","human_release_board_approved","public_diff_and_checksum_checked"]
});
const expectedSignoffs=["identity_and_hosting_approved","vault_and_backup_staging_deployed","external_audit_and_incident_review","rights_privacy_retention_approved","engineering_test_execution_review","cross_role_acceptance_signed"];
const expectedOwners=["security_it","platform_it","maintenance_engineering","records_privacy"];
const exactKeys=(obj,names)=>obj&&typeof obj==='object'&&!Array.isArray(obj)&&Object.keys(obj).length===names.length&&names.every(k=>Object.hasOwn(obj,k));
const count=(a,v)=>Object.values(a).filter(x=>x===v).length;
export function validatePublicPlan(plan){
 const errors=[],ck=(v,msg)=>{if(!v)errors.push(msg)};
 if(!plan||typeof plan!=='object')return ['missing_plan'];
 ck(plan.schema==='fmea-mining.staging-acceptance-plan.v1'&&plan.version==='1.3.25'&&plan.nature==='corporate_staging_approval_plan_not_live_implementation','invalid_identity');
 ck(plan.sourceArchitecture==='data/governance/restricted-infrastructure-design.v1.json'&&plan.sourceWorkflow==='data/governance/restricted-evidence-workflow.v1.json','source_provenance_lost');
 const e=plan.environment||{};ck(Object.keys(e).length===11&&e.name==='future_restricted_staging'&&count(e,false)===10,'future_environment_falsely_live');
 const p=plan.executionPolicy||{};ck(Object.keys(p).length===9&&count(p,true)===9,'safety_policy_relaxed');
 ck(Array.isArray(plan.domains)&&plan.domains.length===8,'eight_domains_required');
 const seen=new Set();
 for(const d of plan.domains||[]){
  const base=controlCatalogue[d.id];
  ck(!!base&&!seen.has(d.id),'unknown_or_duplicate_domain');seen.add(d.id);
  if(!base)continue;
  ck(d.scenarioId?.startsWith('STG-')&&d.objective?.length>=45&&d.owner?.length>=8&&d.acceptanceEvidence?.length>=70,'incomplete_scenario_'+d.id);
  ck(Array.isArray(d.controls)&&d.controls.length===4&&d.controls.every(x=>x.required===true),'four_required_controls_'+d.id);
  ck(JSON.stringify(d.controls?.map(x=>x.key))===JSON.stringify(base),'test_control_catalogue_changed_'+d.id);
  ck(d.actualExecutionStatus==='not_executed'&&d.actualEvidenceReference===null&&d.actualReviewer===null&&d.actualFinding===null&&d.actualDecision==='pending'&&d.verifiedInRealStaging===false&&d.corporateSignOff===false,'false_real_result_'+d.id);
 }
 ck(Object.keys(controlCatalogue).every(x=>seen.has(x)),'missing_domain');
 ck(JSON.stringify(plan.counts)===JSON.stringify({domains:8,requiredControls:32,syntheticFixtures:52,actualStagingRuns:0,actualCorporateApprovals:0,coreFmeaChanges:0}),'invalid_counts');
 ck(JSON.stringify(plan.signoffRoles)===JSON.stringify(expectedOwners),'signoff_roles_modified');
 ck(plan.manualAcceptanceRequirements?.length===6&&plan.manualAcceptanceRequirements.every((s,i)=>s.key===expectedSignoffs[i]&&s.status==='pending'&&s.evidenceRef===null),'real_signoff_claimed');
 ck(plan.unmetExternalDependencies?.length===5&&plan.acceptanceMeaning?.length>=110,'unresolved_dependencies_missing');
 ck(plan.publicReleaseStatus==='not_approved'&&plan.oemEffectivityApprovalStatus==='not_reviewed'&&plan.rootCauseConfirmationCount===0,'causal_or_public_approval_invented');
 return errors;
}
export function evaluateSyntheticDomain(plan,fixture){
 const problems=[],ck=(v,m)=>{if(!v)problems.push(m)};
 const domain=plan.domains?.find(d=>d.scenarioId===fixture?.scenarioId);
 ck(fixture?.syntheticOnly===true&&fixture?.actualStagingResult===null&&/^TEST-STG-/.test(fixture.id||''),'synthetic_fixture_only');
 ck(domain!==undefined,'scenario_absent');
 const controls=domain?controlCatalogue[domain.id]:null,flags=fixture?.controls;
 ck(controls&&exactKeys(flags,controls),'unexpected_or_missing_control');
 if(controls&&flags)for(const key of controls)ck(typeof flags[key]==='boolean','control_must_be_boolean');
 if(problems.length)return {decision:'blocked',reason:problems};
 const eligible=controls.every(key=>flags[key]===true);
 return {decision:eligible?'eligible_for_manual_staging_review':'blocked',reason:eligible?[]:['one_or_more_controls_not_verified'],realStagingPerformed:false,approvalGranted:false};
}
export function assessRealStagingReadiness(plan){
 const blockers=validatePublicPlan(plan);
 const e=plan.environment||{};
 if(Object.values(e).some(x=>x!==true))blockers.push('corporate_environment_not_provisioned_and_attested');
 if(plan.domains.some(d=>d.actualExecutionStatus!=='accepted_real_staging'||!d.verifiedInRealStaging||!d.corporateSignOff))blockers.push('real_staging_results_and_signoffs_missing');
 if(plan.manualAcceptanceRequirements.some(s=>s.status!=='approved'||!s.evidenceRef))blockers.push('signed_external_review_missing');
 return {ready:false,blockers,canIngestRealCases:false,canPublishEvidence:false,rootCauseConfirmed:false};
}
