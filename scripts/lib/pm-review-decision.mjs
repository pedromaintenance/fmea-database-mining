/** Synthetic public evidence decision dossier, NOT a corporate decision or release. */
export const LANES=['documentary_readiness','engineering_validation','sap_masterdata_change','operational_release'];
export const CATEGORIES=['identity','oem','safe_execution','measurement_quality','diagnosis','independent_review','sap_change'];
const stable=x=>JSON.stringify(x);
export function buildPmReviewDecisionPacket({policy,preflight,p0,maturity,runbook,intake}){
 const p0map=new Map(p0.reviews.map(x=>[x.ruleId,x])),mmap=new Map(maturity.rules.map(x=>[x.ruleId,x]));
 const rows=preflight.cases.map(c=>{
  const review=p0map.get(c.ruleId),maturityRow=mmap.get(c.ruleId);
  if(!review||!maturityRow||c.bundleId!==maturityRow.bundleId||review.reviewDepth!=='detailed_preparation')throw Error('review_provenance_missing_'+c.ruleId);
  const requested=Object.fromEntries(CATEGORIES.map(name=>[name,c.checks[name].map(x=>({checkId:x.id,state:'unverified',privateEvidenceReceipt:null,technicalAssessor:null}))]));
  return {caseId:c.candidateId,caseNature:'synthetic_public_workflow_only',ruleId:c.ruleId,bundleId:c.bundleId,priority:review.priority,
    blocker:review.blocker,modelCandidates:[...c.modelCandidates],
    evidenceReceiptKinds:policy.evidenceKinds.map(kind=>({kind,status:'not_received',privateVaultRef:null,custodyVerified:false,licenseVerified:false})),
    requestedChecks:requested,
    minimumEvidence:[...review.minimumEvidence],
    counterhypotheses:review.differentialQuestions.map(x=>({id:x.id,hypothesis:x.hypothesis,alternative:x.competingExplanation,disposition:'not_assessed',fieldTestVerified:false})),
    decisionLanes:policy.decisionLanes.map(lane=>({laneId:lane.id,ownerRole:lane.ownerRole,status:lane.publicStatus,reason:'no_private_verified_case_or_authority',
      trustedReviewerToken:null,decisionTime:null,signatureVerified:false,privateChangeRecord:null})),
    decisionTrail:{nature:'synthetic_not_immutable',lastVerifiedEvent:null,events:[],immutableExternalAuditVerified:false},
    evidenceQuality:{oemEffectivityVerified:false,serialBomVerified:false,measurementCalibrationVerified:false,operatingContextVerified:false,
      measurementUncertaintyAccepted:false,samplingSequenceVerified:false,independentCounterevidenceAssessed:false},
    actualObservations:0,performedActions:0,confirmedDamages:0,confirmedRootCauses:0,approvedSapMappings:0,
    engineeringValidated:false,operationallyReleased:false,
    publicDecision:'NO_GO',privatePilotAuthorized:false};
 });
 return {schema:'fmea-mining.pm-review-decision-packet.v1',version:policy.version,nature:'public_synthetic_unapproved_decision_package',
   sourceVersions:{preflight:preflight.version,p0:p0.version,maturity:maturity.version,runbook:runbook.version,intake:intake.version},
   summary:{candidateCases:rows.length,checklistRequirementsPerCase:CATEGORIES.reduce((n,k)=>n+preflight.cases[0].checks[k].length,0),
    unverifiedCheckInstances:rows.reduce((n,x)=>n+CATEGORIES.reduce((i,k)=>i+x.requestedChecks[k].length,0),0),
    evidenceKindsPerCase:policy.evidenceKinds.length,decisionLanesPerCase:LANES.length,
    verifiedRealEvidence:0,engineeringApprovals:0,sapApprovals:0,operationalReleases:0,privateGatesBlocked:runbook.phases.filter(x=>x.gate==='BLOCK').length,publicDecision:'NO_GO'},
   cases:rows};
}
export function assessPublicPmReviewDecisionPacket(sources,packet){
 const {policy,preflight,p0,maturity,runbook,intake}=sources,errors=[];
 const ck=(v,k)=>{if(!v)errors.push(k)};
 let expected;try{expected=buildPmReviewDecisionPacket(sources);}catch(e){return {status:'REJECTED',errors:['builder_'+e.message]};}
 ck(stable(expected)===stable(packet),'snapshot_mismatch');
 ck(policy.version==='1.3.64'&&policy.nature==='public_synthetic_decision_boundary_not_authority_to_approve','policy_version');
 ck(preflight.version==='1.3.63'&&p0.version==='1.3.62'&&maturity.version==='1.3.60'&&runbook.version==='1.3.62'&&intake.version==='1.3.61','source_versions');
 ck(preflight.summary.overallDecision==='NO_GO'&&preflight.summary.actualAssetsSelected===0,'preflight_is_mock');
 ck(runbook.goNoGo.decision==='NO_GO'&&runbook.goNoGo.realPilotAllowed===false&&runbook.phases.length===8&&runbook.phases.every(x=>x.gate==='BLOCK'&&x.status==='not_started'),'private_deployment_blocked');
 ck(intake.boundaries.publicSyntheticOnly===true&&intake.boundaries.privateStorageImplemented===false&&intake.boundaries.trustedActorRolesProven===false,'private_identity_not_implemented');
 ck(maturity.summary.sapExceptionsBlocked===10&&maturity.summary.sapMappingsApproved===0&&maturity.summary.serialOemVerified===0&&maturity.summary.fieldConfirmed===0,'maturity_unvalidated');
 ck(stable(policy.decisionLanes.map(x=>x.id))===stable(LANES)&&policy.decisionLanes.every(x=>x.publicStatus&&x.privatePossibleOutcome.length>=3&&x.requires.length===3&&x.doesNotAuthorize.length>=2),'four_distinct_decision_lanes');
 ck(stable(policy.evidenceKinds)===stable(['oem_effectivity','oem_procedure','field_observation','counterevidence','measurement_quality']),'evidence_kinds');
 ck(stable(policy.criteria.map(x=>x.id))===stable(['EC-01','EC-02','EC-03','EC-04','EC-05','EC-06','EC-07']),'seven_decision_criteria');
 ck(policy.trustBoundary.publicAlwaysNoGo===true&&Object.entries(policy.trustBoundary).every(([k,v])=>k==='publicAlwaysNoGo'?v===true:k.endsWith('InRepo')?v===0:v===false),'trust_boundary');
 ck(policy.forbiddenPromotions.length===7&&policy.publicActions.length===5,'scope_and_prohibitions');
 ck(packet.cases.length===2&&packet.summary.unverifiedCheckInstances===68&&packet.summary.decisionLanesPerCase===4&&packet.summary.publicDecision==='NO_GO'&&packet.summary.privateGatesBlocked===8,'summary');
 for(const row of packet.cases){
  ck(row.caseId.startsWith('TEST-')&&row.publicDecision==='NO_GO'&&row.actualObservations===0&&row.performedActions===0&&row.confirmedDamages===0&&row.confirmedRootCauses===0&&row.approvedSapMappings===0&&row.engineeringValidated===false&&row.operationallyReleased===false&&row.privatePilotAuthorized===false,'fake_case_approval_'+row.ruleId);
  ck(row.decisionLanes.every(x=>x.trustedReviewerToken===null&&x.signatureVerified===false&&x.privateChangeRecord===null&&x.decisionTime===null)&&row.decisionTrail.events.length===0&&row.decisionTrail.immutableExternalAuditVerified===false,'false_decision_custody_'+row.ruleId);
  ck(row.evidenceReceiptKinds.every(x=>x.status==='not_received'&&x.privateVaultRef===null&&x.custodyVerified===false&&x.licenseVerified===false),'fabricated_document_'+row.ruleId);
  ck(row.counterhypotheses.length===3&&row.counterhypotheses.every(x=>x.disposition==='not_assessed'&&x.fieldTestVerified===false),'differential_ignored_'+row.ruleId);
  ck(Object.values(row.evidenceQuality).every(x=>x===false),'fake_metrology_'+row.ruleId);
 }
 return {status:errors.length?'REJECTED':'NO_GO_PUBLIC_REVIEW',errors,documentaryApproved:false,engineeringApproved:false,sapApproved:false,operationsReleased:false};
}
