/** Deterministic public investigation readiness for 5 P0 PM rules x 7 model KEYS (not actual machines). */
export function buildPmP0InvestigationReadiness({policy,seeds,gaps,evidence,maturity,p0,sources,runbook}){
 const catalogue=new Map(sources.sources.map(x=>[x.id,x])), gapMap=new Map(gaps.records.map(x=>[x.ruleId,x]));
 const seedMap=new Map(seeds.records.map(x=>[x.id,x])),evMap=new Map(evidence.records.map(x=>[x.ruleId,x]));
 const maturityMap=new Map(maturity.rules.map(x=>[x.ruleId,x])),reviewMap=new Map(p0.reviews.map(x=>[x.ruleId,x]));
 const prioritized=gaps.records.filter(x=>x.priority==='P0').sort((a,b)=>a.ruleId.localeCompare(b.ruleId));
 const packets=prioritized.map(g=>{
  const seed=seedMap.get(g.ruleId),ev=evMap.get(g.ruleId),mat=maturityMap.get(g.ruleId),review=reviewMap.get(g.ruleId);
  if(!seed||!ev||!mat||!review||!policy.hypothesisDifferentials[g.ruleId])throw Error('P0_sources_incomplete_'+g.ruleId);
  const sourceRoles=g.sourceIds.map(id=>{
   const s=catalogue.get(id);if(!s)throw Error('unknown_registered_source_'+id);
   return {id,organization:s.organization,role:s.role,limitation:s.limitation,serialEffectivityVerified:false};
  });
  const modelCandidates=[...seed.models].sort((a,b)=>a.localeCompare(b));
  return {ruleId:g.ruleId,bundleId:mat.bundleId,system:seed.system,partText:seed.partText,subgroupCandidate:seed.subgroupCode,
    priorityFromExistingGap:g.priority,blocker:g.expectedBlocker,state:'not_ready_for_real_investigation',
    publicReferences:sourceRoles,modelCandidateKeys:modelCandidates,modelKeysAreNotAssets:true,
    originalMinimumEvidence:[...ev.minimumEvidence],independentAlternative:ev.independentAlternative,
    proposedHypotheses:policy.hypothesisDifferentials[g.ruleId].map(x=>({...x,verified:false})),
    firstDocumentationRequest:g.nextInspection,
    documentedReviewDepth:review.reviewDepth,sourceReviewRequest:review.nextDecision,
    serialOemApproval:false,physicalDamageConfirmed:false,causeConfirmed:false,sapMappingApproved:false,blockedInSAP:true,
    reviewRequirements:[...policy.gateOrder],safeExecutionConstraints:[...policy.safetyConstraints.common,...policy.safetyConstraints[seed.system]]
  };
 });
 const slots=packets.flatMap(p=>p.modelCandidateKeys.map(modelCandidateKey=>({
  slotId:'P0SLOT-'+p.ruleId+'-'+modelCandidateKey,ruleId:p.ruleId,bundleId:p.bundleId,
  system:p.system,modelCandidateKey,candidateKeyIsRealEquipment:false,assetTag:null,serialNumber:null,
  manufacturerVariantConfirmed:false,modelMappingConfirmed:false,installedComponentVerified:false,
  requiredRequestIds:policy.evidenceRequests.map(x=>x.id),requestStatus:'not_evidenced_in_public_repository',
  authorizedPrivateEvidenceCount:0,OEMSerialManualVerified:false,OEMPartBookVerified:false,
  OEMDiagnosticCriteriaVerified:false,physicalFieldTestConfirmed:false,
  engineeringApproval:false,sapApproval:false,operationalRelease:false,
  result:'NO_GO_DOCUMENT_REQUEST_ONLY'
 })));
 const groupSystems=[...new Set(packets.map(x=>x.system))].sort((a,b)=>a.localeCompare(b));
 return {schema:'fmea-mining.pm-p0-investigation-readiness.v1',version:policy.version,
  nature:'public_document_request_matrix_not_fleet_asset_inventory',
  referenceVersions:{maturity:maturity.version,documentaryReview:p0.version,runbook:runbook.version},
  summary:{p0Rules:packets.length,systemFamilies:groupSystems,modelKeySlots:slots.length,
   candidateModelKeysPerRule:policy.scope.candidateModelKeysPerRule,
   distinctCandidateModelKeys:[...new Set(slots.map(x=>x.modelCandidateKey))].sort((a,b)=>a.localeCompare(b)),
   actualEquipmentCountKnown:0,serialEffectivityVerified:0,fieldCasesReceived:0,realInspectionsPerformed:0,
   hypothesisPhysicalDamagesConfirmed:0,sapExceptionBlocks:gaps.records.length,approvedSapMappings:0,
   privateInfrastructureGatesBlocked:runbook.phases.filter(x=>x.gate==='BLOCK').length,
   candidateDocumentRequests:slots.length*policy.evidenceRequests.length,
   unverifiedDocumentRequests:slots.length*policy.evidenceRequests.length,overallDecision:'NO_GO'},
  packets,slots};
}
export function assessPublicPmP0InvestigationReadiness(inputs,matrix){
 const errors=[],ck=(v,id)=>{if(!v)errors.push(id)};
 let rebuilt;try{rebuilt=buildPmP0InvestigationReadiness(inputs);}catch(e){return {status:'REJECTED',errors:['build_'+e.message]};}
 const {policy,seeds,gaps,evidence,maturity,p0,runbook}=inputs;
 ck(JSON.stringify(rebuilt)===JSON.stringify(matrix),'snapshot_drift');
 ck(policy.version==='1.3.65'&&policy.decisionRule==='PUBLIC_NO_GO_UNTIL_CORPORATE_PRIVATE_VERIFICATION','policy');
 ck(seeds.records.length===25&&gaps.records.length===10&&evidence.records.length===10&&maturity.summary.sapExceptionsBlocked===10&&p0.summary.p0Rules===5,'source_counts');
 ck(runbook.goNoGo.decision==='NO_GO'&&runbook.phases.every(x=>x.gate==='BLOCK'&&x.status==='not_started'),'private_infrastructure_not_approved');
 ck(policy.scope.expectedCandidateSlots===35&&policy.scope.actualFleetAssetsConfirmed===0&&policy.scope.actualSerialNumbersConfirmed===0&&policy.scope.realOEMManualsApplied===0,'no_real_asset_assumptions');
 ck(policy.evidenceRequests.length===7&&new Set(policy.evidenceRequests.map(x=>x.id)).size===7,'evidence_reqs');
 ck(policy.gateOrder.length===7&&policy.safetyConstraints.common.length===4,'gates_safety');
 ck(policy.noAutoRemap===true&&policy.noCommonOEMThresholds===true&&policy.noRiskScoreWithoutCriticality===true&&policy.noRealActionExecution===true,'no_unsafe_promotion');
 ck(matrix.summary.p0Rules===5&&matrix.summary.modelKeySlots===35&&matrix.summary.candidateDocumentRequests===245&&matrix.summary.unverifiedDocumentRequests===245,'coverage_and_document_count');
 ck(matrix.summary.actualEquipmentCountKnown===0&&matrix.summary.serialEffectivityVerified===0&&matrix.summary.fieldCasesReceived===0&&matrix.summary.realInspectionsPerformed===0&&matrix.summary.hypothesisPhysicalDamagesConfirmed===0&&matrix.summary.approvedSapMappings===0&&matrix.summary.privateInfrastructureGatesBlocked===8&&matrix.summary.overallDecision==='NO_GO','no_false_approval');
 ck(matrix.packets.length===5&&matrix.slots.length===35&&matrix.packets.every(x=>x.proposedHypotheses.length===3&&x.proposedHypotheses.every(h=>h.verified===false&&h.confirmWith.length>40&&h.refuteOrCompete.length>40)&&x.publicReferences.every(r=>!r.serialEffectivityVerified)),'mechanical_differentials');
 ck(matrix.packets.every(x=>x.blockedInSAP===true&&x.serialOemApproval===false&&x.physicalDamageConfirmed===false&&x.causeConfirmed===false&&x.sapMappingApproved===false),'SAP_no_approval');
 ck(matrix.slots.every(x=>x.candidateKeyIsRealEquipment===false&&x.assetTag===null&&x.serialNumber===null&&x.manufacturerVariantConfirmed===false&&x.modelMappingConfirmed===false&&x.installedComponentVerified===false&&x.authorizedPrivateEvidenceCount===0&&x.OEMSerialManualVerified===false&&x.OEMPartBookVerified===false&&x.OEMDiagnosticCriteriaVerified===false&&x.physicalFieldTestConfirmed===false&&x.engineeringApproval===false&&x.sapApproval===false&&x.operationalRelease===false&&x.result==='NO_GO_DOCUMENT_REQUEST_ONLY'),'model_keys_not_assets');
 return {status:errors.length?'REJECTED':'NO_GO_DOCUMENTARY_INVESTIGATION',errors,realInvestigationAuthorized:false,sapApproved:false,fieldWorkAuthorized:false};
}
