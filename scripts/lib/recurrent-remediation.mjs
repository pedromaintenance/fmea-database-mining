/**
 * Synthetic catalog/remediation assessment. Does not open/close corporate incidents,
 * verify repairs, ingest field findings, calculate business SLAs or authorize changes.
 */
export const REFERENCE_NOW='2026-10-21T12:00:00.000Z';
const TOKEN=/^TEST-[A-Z0-9-]{3,120}$/;
const TIMESTAMP=/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/;
const exact=(o,fields)=>o!==null&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).length===fields.length&&fields.every(k=>Object.hasOwn(o,k));
const utc=t=>typeof t==='string'&&TIMESTAMP.test(t)&&Number.isFinite(Date.parse(t))&&new Date(t).toISOString()===t;
const DATA_FIELDS=['caseToken','tenantToken','scenarioId','probeId','classification','profileId','history','originalEvidenceToken','ownerRole','actions','expectedEvidence','review','release','syntheticClassification','recurrence'];
const EVENT_FIELDS=['tenantToken','caseToken','scenarioId','probeId','classification','runToken','observedAt','outcome','evidenceToken','sourceTriageId'];
const REVIEW_FIELDS=['originatorToken','technicalReviewerToken','independentReviewerToken','independentAssessment','actualReviewPerformed','negativeEvidenceRetained','riskAccepted','actionExecuted','closureApproved','manualEscalationPending','recurrenceOverlayApplied','corporateThresholdApproved'];
const RELEASE_FIELDS=['securityApproved','publicationAuthorized','operationalReleaseApproved','sapNoteOpened','mechanicalRootCauseConfirmed','fmeaCorePromoted'];
const OVERLAY='REM-RECURRENCE-001';
const CATEGORY_TO_PROFILE={control_failure:'REM-CONTROL-001',inconclusive_evidence:'REM-EVIDENCE-001',verifier_infrastructure_error:'REM-INFRA-001'};
const CATEGORY_TO_OUTCOME={control_failure:'fail',inconclusive_evidence:'inconclusive',verifier_infrastructure_error:'blocked'};
export const remediationCategories=Object.freeze(Object.keys(CATEGORY_TO_PROFILE));
export function deriveSyntheticRecurrence(policy,caseData,now=REFERENCE_NOW){
 const recur=policy.recurrence;
 const days=recur.syntheticWindowDays,limit=Date.parse(now)-days*86400000;
 let invalidTime=false;
 const matched=(caseData.history||[]).filter(e=>{
  if(!utc(e.observedAt)){invalidTime=true;return false}
  return e.tenantToken===caseData.tenantToken&&e.scenarioId===caseData.scenarioId&&e.probeId===caseData.probeId&&e.classification===caseData.classification&&Date.parse(e.observedAt)>=limit&&Date.parse(e.observedAt)<=Date.parse(now);
 });
 const runs=new Set(matched.map(e=>e.runToken));
 return {distinctRuns:runs.size,recurring:runs.size>=recur.syntheticMinDistinctRuns,invalidTime,fingerprint:[caseData.tenantToken,caseData.scenarioId,caseData.probeId,caseData.classification].join('|')};
}
export function makeSyntheticRemediation(policy,stagingPlan,classification,variant){
 const id=CATEGORY_TO_PROFILE[classification];
 if(!id||!['single','recurrent','different_probe','outside_window'].includes(variant))throw Error('Unsupported synthetic case');
 const profile=policy.profiles.find(x=>x.id===id),overlay=policy.profiles.find(x=>x.id===OVERLAY);
 const scenario=stagingPlan.domains[0],probeId=scenario.controls[0].key,initialOutcome=CATEGORY_TO_OUTCOME[classification];
 const base={tenantToken:'TEST-TENANT-A',caseToken:'TEST-CASE-A',scenarioId:scenario.scenarioId,probeId,classification};
 const row=(runToken,observedAt,n,override={})=>({...base,runToken,observedAt,outcome:initialOutcome,evidenceToken:'TEST-EVIDENCE-'+n,sourceTriageId:'TEST-TRIAGE-'+n,...override});
 const history=[row('TEST-RUN-A','2026-10-15T12:00:00.000Z','1')];
 if(variant!=='single')history.push(row('TEST-RUN-B',variant==='outside_window'?'2026-09-10T12:00:00.000Z':'2026-10-20T12:00:00.000Z','2',variant==='different_probe'?{probeId:scenario.controls[1].key}:{}));
 const stub={...base,history};
 const r=deriveSyntheticRecurrence(policy,stub);
 const recurring=r.recurring;
 const review={originatorToken:'TEST-ORIGINATOR',technicalReviewerToken:'TEST-TECHNICAL',independentReviewerToken:'TEST-INDEPENDENT',independentAssessment:'pending_real_review',actualReviewPerformed:false,negativeEvidenceRetained:true,riskAccepted:false,actionExecuted:false,closureApproved:false,manualEscalationPending:recurring,recurrenceOverlayApplied:recurring,corporateThresholdApproved:false};
 return {...stub,profileId:id,originalEvidenceToken:'TEST-EVIDENCE-1',ownerRole:profile.ownerRole,
  actions:[...profile.requiredActions,...(recurring?overlay.requiredActions:[])],
  expectedEvidence:[...profile.expectedEvidence,...(recurring?overlay.expectedEvidence:[])],
  review,release:Object.fromEntries(RELEASE_FIELDS.map(k=>[k,false])),
  syntheticClassification:recurring?'candidate_recurrent_escalation_plan_only':'candidate_remediation_plan_only',
  recurrence:{observed:recurring,distinctRuns:r.distinctRuns,fingerprint:r.fingerprint,syntheticWindowDays:policy.recurrence.syntheticWindowDays,realSlaApproved:false}
 };
}
export function evaluateSyntheticRemediation(policy,plan,stagingPlan){
 const errors=[],ck=(yes,msg)=>{if(!yes)errors.push(msg)};
 ck(exact(plan,DATA_FIELDS),'unexpected_or_missing_plan_fields');
 if(plan===null||typeof plan!=='object')return {valid:false,decision:'reject',errors};
 const profile=policy.profiles.find(p=>p.id===CATEGORY_TO_PROFILE[plan.classification]);
 const overlay=policy.profiles.find(x=>x.id===OVERLAY);
 ck(profile!==undefined&&plan.profileId===profile?.id,'invalid_classification_profile_pair');
 ck(stagingPlan.domains.some(x=>x.scenarioId===plan.scenarioId&&x.controls.some(c=>c.key===plan.probeId)),'unknown_scenario_or_probe');
 for(const k of ['caseToken','tenantToken','originalEvidenceToken'])ck(TOKEN.test(plan[k]||''),'invalid_reference_'+k);
 ck(plan.ownerRole===profile?.ownerRole,'wrong_corrective_action_owner');
 ck(Array.isArray(plan.history)&&plan.history.length>=1&&plan.history.length<=2,'invalid_synthetic_event_count');
 const runTokens=new Set(),evidenceTokens=new Set(),triages=new Set();
 const history=Array.isArray(plan.history)?plan.history:[];
 for(const [i,e] of history.entries()){
  ck(exact(e,EVENT_FIELDS),'raw_payload_or_missing_evidence_'+i);
  if(e===null||typeof e!=='object')continue;
  ck(TOKEN.test(e.tenantToken||'')&&TOKEN.test(e.caseToken||'')&&TOKEN.test(e.runToken||'')&&TOKEN.test(e.evidenceToken||'')&&TOKEN.test(e.sourceTriageId||''),'non_synthetic_or_missing_event_identity_'+i);
  ck(e.tenantToken===plan.tenantToken&&e.caseToken===plan.caseToken&&e.scenarioId===plan.scenarioId,'case_or_tenant_boundary_violation_'+i);
  ck(stagingPlan.domains.some(x=>x.scenarioId===e.scenarioId&&x.controls.some(c=>c.key===e.probeId)),'event_probe_unknown_'+i);
  ck(CATEGORY_TO_OUTCOME[e.classification]===e.outcome,'misclassified_negative_evidence_'+i);
  ck(utc(e.observedAt)&&Date.parse(e.observedAt)<=Date.parse(REFERENCE_NOW),'invalid_time_'+i);
  ck(!runTokens.has(e.runToken),'duplicate_run_not_a_new_occurrence_'+i);runTokens.add(e.runToken);
  ck(!evidenceTokens.has(e.evidenceToken)&&!triages.has(e.sourceTriageId),'duplicate_source_evidence_'+i);
  evidenceTokens.add(e.evidenceToken);triages.add(e.sourceTriageId);
 }
 ck(history[0]?.evidenceToken===plan.originalEvidenceToken,'original_negative_evidence_removed');
 ck(history[0]?.classification===plan.classification&&history[0]?.probeId===plan.probeId,'initial_case_scope_mismatch');
 const derived=deriveSyntheticRecurrence(policy,plan);
 const recurring=derived.recurring;
 ck(!derived.invalidTime,'bad_event_clock');
 ck(exact(plan.recurrence,['observed','distinctRuns','fingerprint','syntheticWindowDays','realSlaApproved']),'unexpected_recurrence_fields');
 ck(plan.recurrence?.observed===recurring&&plan.recurrence?.distinctRuns===derived.distinctRuns&&plan.recurrence?.fingerprint===derived.fingerprint,'forged_or_suppressed_recurrence');
 ck(plan.recurrence?.syntheticWindowDays===30&&plan.recurrence?.realSlaApproved===false,'corporate_sla_fabricated');
 const actions=[...profile?.requiredActions||[],...(recurring?overlay?.requiredActions||[]:[])];
 const evidence=[...profile?.expectedEvidence||[],...(recurring?overlay?.expectedEvidence||[]:[])];
 ck(JSON.stringify(plan.actions)===JSON.stringify(actions),'corrective_actions_incomplete_or_fabricated');
 ck(JSON.stringify(plan.expectedEvidence)===JSON.stringify(evidence),'verification_proof_list_incomplete_or_fabricated');
 ck(exact(plan.review,REVIEW_FIELDS),'review_metadata_missing_or_extra');
 const review=plan.review||{};
 for(const k of ['originatorToken','technicalReviewerToken','independentReviewerToken'])ck(TOKEN.test(review[k]||''),'reviewer_not_synthetic_'+k);
 ck(new Set([review.originatorToken,review.technicalReviewerToken,review.independentReviewerToken]).size===3,'review_segregation_failed');
 ck(review.independentAssessment==='pending_real_review'&&review.actualReviewPerformed===false&&review.negativeEvidenceRetained===true&&review.riskAccepted===false&&review.actionExecuted===false&&review.closureApproved===false&&review.corporateThresholdApproved===false,'invented_correction_or_approval');
 ck(review.manualEscalationPending===recurring&&review.recurrenceOverlayApplied===recurring,'manual_escalation_not_bound_to_recurrence');
 ck(exact(plan.release,RELEASE_FIELDS)&&RELEASE_FIELDS.every(k=>plan.release?.[k]===false),'security_sap_knowledge_or_operational_release_forged');
 ck(plan.syntheticClassification===(recurring?'candidate_recurrent_escalation_plan_only':'candidate_remediation_plan_only'),'non_synthetic_or_unapproved_plan_status');
 return {valid:errors.length===0,decision:errors.length?'reject':'eligible_for_manual_review',errors,recurring,realCorporateActionExecuted:false,realSecurityApproval:false,mechanicalCauseConfirmed:false};
}
export function verifyCatalogPolicy(policy,exceptionPolicy,stagingPlan){
 const err=[],ck=(v,m)=>{if(!v)err.push(m)};
 ck(policy.schema==='fmea-mining.recurrent-remediation-catalog.v1'&&policy.version==='1.3.29'&&policy.nature==='editorial_control_improvement_catalog_synthetic_only','identity_changed');
 ck(policy.sources.exceptionWorkflow==='data/governance/staging-result-exception-workflow.v1.json'&&exceptionPolicy.version==='1.3.28','source_workflow_changed');
 ck(policy.sources.stagingPlan==='data/governance/staging-acceptance-plan.v1.json'&&stagingPlan.domains.length===8,'staging_plan_changed');
 ck(policy.profiles.length===4&&policy.profiles.map(p=>p.id).join('|')==='REM-CONTROL-001|REM-EVIDENCE-001|REM-INFRA-001|REM-RECURRENCE-001','remediation_catalogue_changed');
 ck(policy.profiles.every(x=>x.requiredActions.length===5&&x.expectedEvidence.length===5&&x.causeBoundary.length>=70),'action_or_evidence_gates_missing');
 ck(policy.recurrence.exampleOnly===true&&policy.recurrence.syntheticWindowDays===30&&policy.recurrence.syntheticMinDistinctRuns===2&&policy.recurrence.realThresholdDays===null&&policy.recurrence.realThresholdCount===null&&policy.recurrence.realCorporateThresholdApproved===false,'fictional_organizational_escalation_threshold');
 ck(policy.recurrence.excludeCrossTenant&&policy.recurrence.excludeCrossProbe&&policy.recurrence.excludeCrossCategory&&policy.recurrence.duplicateRunMustNotIncrement,'unsafe_scoping');
 ck(Object.values(policy.reviewGates).filter(v=>typeof v==='boolean').every(v=>v===true||v===false)&&policy.reviewGates.noAutomaticClosure===true&&policy.reviewGates.allowRealCorrectiveWorkExecution===false,'real_approval_asserted');
 ck(policy.scope.realIncidentRecords===0&&policy.scope.realCorrectiveActions===0&&policy.scope.realCorporateEscalations===0&&policy.confirmedMechanicalRootCauses===0&&policy.coreChainsUnchanged===24&&policy.ontologyMechanismsUnchanged===15,'fmea_or_real_incident_claim');
 return err;
}
