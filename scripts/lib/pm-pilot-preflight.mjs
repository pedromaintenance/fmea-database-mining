/** Deterministic PUBLIC synthetic pilot preflight: no authorization or real evidence. */
export const PILOT_TARGETS=['cooling-radiator-blockage','fuel-filter-contamination'];
export const REQUIRED_SECTIONS=['identity','oem','safe_execution','measurement_quality','diagnosis','independent_review','sap_change'];
export function buildPmPilotPreflight({policy,runbook,p0,maturity,gaps,intake}){
 const gapById=new Map(gaps.records.map(x=>[x.ruleId,x])), rowById=new Map(maturity.rules.map(x=>[x.ruleId,x]));
 const caseById=new Map(p0.reviews.map(x=>[x.ruleId,x]));
 const cases=PILOT_TARGETS.map((ruleId,i)=>{
  const gap=gapById.get(ruleId),row=rowById.get(ruleId),review=caseById.get(ruleId);
  if(!gap||!row||!review||review.reviewDepth!=='detailed_preparation')throw Error('missing_P0_documentary_source_'+ruleId);
  const checks=Object.fromEntries(REQUIRED_SECTIONS.map(section=>[section,policy.checklists[section].map(x=>({id:x.id,state:'pending',evidenceToken:null,reviewToken:null}))]));
  return {candidateId:'TEST-PILOT-'+(i===0?'RADIATOR':'FUELFILTER')+'-001',nature:'synthetic_candidate_no_asset_assignment',
   ruleId,bundleId:row.bundleId,priority:'P0',system:row.system,subgroupCandidate:row.subgroupCode,modelCandidates:[...row.modelCandidates],
   realAssetAssigned:false,serialEffectivityVerified:false,bomVerified:false,oemLimitsVerified:false,measurementPerformed:false,qualifiedPersonAssigned:false,
   evidenceVaultLinked:false,qualityReviewCompleted:false,independentEngineeringApproval:false,sapBlocked:true,
   sourceBlocker:gap.expectedBlocker,requestedDamageCode:gap.ruleId===ruleId?row.sap.requestedDamageId:null,
   requestedCauseCode:row.sap.requestedCauseId,sourceIds:[...review.sourceIds],
   minimumEvidence:[...review.minimumEvidence],
   competingMechanisms:review.differentialQuestions.map(x=>({id:x.id,hypothesis:x.hypothesis,competingExplanation:x.competingExplanation,disposition:'not_evaluated'})),
   checks,measurementProtocol:{instrumentVerified:false,calibrationVerified:false,samplingBeforeIntervention:null,operatingContextVerified:false,repeatabilityVerified:false,uncertaintyReviewed:false,oemAcceptanceCriteriaApproved:false,methodExecutionRecorded:false},
   reviewDecision:{status:'not_submitted',technicalDecisionToken:null,independentDecisionToken:null,corporateSignerVerified:false,sapChangeRequest:null},
   eligibleForPrivatePilot:false,publicPreflightDecision:'NO_GO',fieldEvidenceCount:0,confirmedDamageCount:0,approvedSapMappingCount:0};
 });
 return {schema:'fmea-mining.pm-pilot-preflight.v1',version:policy.version,nature:'synthetic_public_planning_only',
  referencedRunbookVersion:runbook.version,referencedIntakeVersion:intake.version,referencedMaturityVersion:maturity.version,
  summary:{conceptuallyModeledRules:maturity.summary.conceptuallyModeled,pilotCandidates:cases.length,privateDeploymentGatesBlocked:runbook.phases.filter(x=>x.gate==='BLOCK').length,
   actualAssetsSelected:0,actualPilotsApproved:0,actualInspectionsCompleted:0,confirmedDamages:0,approvedSapMappings:0,overallDecision:'NO_GO'},
  cases};
}
export function assessPublicPmPilotPreflight({policy,runbook,p0,maturity,gaps,intake},snapshot){
 const errors=[],ck=(ok,k)=>{if(!ok)errors.push(k)};
 let expected;try{expected=buildPmPilotPreflight({policy,runbook,p0,maturity,gaps,intake});}catch(e){return {status:'REJECTED',errors:['build_error_'+e.message]};}
 ck(JSON.stringify(expected)===JSON.stringify(snapshot),'preflight_snapshot_mutated');
 ck(policy.version==='1.3.63'&&policy.nature==='public_synthetic_preflight_not_executable_asset_pilot','policy_identity');
 ck(runbook.goNoGo.decision==='NO_GO'&&runbook.goNoGo.realPilotAllowed===false&&runbook.phases.length===8&&runbook.phases.every(x=>x.gate==='BLOCK'&&x.status==='not_started'),'private_gates_still_blocked');
 ck(intake.boundaries.publicSyntheticOnly===true&&intake.boundaries.privateStorageImplemented===false&&intake.boundaries.corporateSSOIntegrated===false,'intake_not_production');
 ck(maturity.summary.sapExceptionsBlocked===10&&maturity.summary.serialOemVerified===0&&maturity.summary.fieldConfirmed===0&&maturity.summary.sapMappingsApproved===0,'maturity_not_homologated');
 ck(gaps.records.length===10&&gaps.records.every(x=>x.status==='bloqueado_aguardando_curadoria'&&x.autoRemapAllowed===false),'sap_locks');
 ck(policy.gates.length===8&&policy.gates[0].approvalStatus==='BLOCKED'&&policy.gates[7].approvalStatus==='BLOCKED'&&policy.gates.slice(1,7).every(x=>x.approvalStatus==='PENDING'),'gate_policy');
 ck(Object.entries(policy.decisions).every(([k,v])=>k==='publicPreflight'?v==='NO_GO':k==='privatePilotApproval'?v===null:k==='committeeApprovalRequired'?v===true:v===false),'policy_decisions');
 ck(policy.prohibitedFields.length===11&&policy.prohibitedFields.includes('real serial')&&policy.prohibitedFields.includes('measurements'),'protected_fields');
 ck(REQUIRED_SECTIONS.every(section=>policy.checklists[section]?.length>=4),'incomplete_quality_checklists');
 ck(snapshot.summary.pilotCandidates===2&&snapshot.summary.actualAssetsSelected===0&&snapshot.summary.actualPilotsApproved===0&&snapshot.summary.overallDecision==='NO_GO','not_a_real_pilot');
 ck(snapshot.cases.length===2&&snapshot.cases.every(c=>c.nature==='synthetic_candidate_no_asset_assignment'&&c.publicPreflightDecision==='NO_GO'&&c.realAssetAssigned===false&&c.fieldEvidenceCount===0),'fake_asset_case');
 return {status:errors.length?'REJECTED':'NO_GO_PUBLIC_PREFLIGHT',errors,pilotAuthorized:false,sapApproved:false};
}
