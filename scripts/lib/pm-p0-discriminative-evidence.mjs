/** P0 diagnostic discrimination templates: no physical or SAP approval may be inferred. */
const sorted=a=>[...a].sort((x,y)=>String(x).localeCompare(String(y)));
export function buildPmP0DiscriminativeEvidence({policy,originalPolicy,readiness,workpacks,gaps,maturity}){
 const refs=new Map(originalPolicy.evidenceRequests.map(x=>[x.id,x]));
 const packetMap=new Map(readiness.packets.map(x=>[x.ruleId,x]));
 const exceptions=workpacks.exceptions.filter(x=>x.priorityFromExistingGap==='P0');
 if(exceptions.length!==5||new Set(exceptions.map(x=>x.ruleId)).size!==5)throw Error('P0_queue_incomplete');
 const packets=exceptions.map(x=>{
   const src=packetMap.get(x.ruleId),requested=originalPolicy.hypothesisDifferentials[x.ruleId];
   const designs=policy.hypothesisChecks[x.ruleId];
   if(!src||!requested||!designs||designs.length!==requested.length)throw Error('missing_P0_source_'+x.ruleId);
   const originalById=new Map(requested.map(h=>[h.id,h]));
   const differentials=designs.map(d=>{
     const origin=originalById.get(d.hypothesisId);
     if(!origin||!d.evidenceRequestIds.includes('ASSET-ID')||d.evidenceRequestIds.some(id=>!refs.has(id)))
       throw Error('untraceable_hypothesis_'+d.hypothesisId);
     return {
       hypothesisId:origin.id,originalKind:origin.kind,causalInterpretation:policy.causalLayers[origin.kind],
       candidate:origin.candidate,originalConfirmationHint:origin.confirmWith,
       originalAlternativeHint:origin.refuteOrCompete,
       qualitativeDistinguishingObservation:d.discriminatingObservation,
       independentCompetingExplanationCheck:d.competingExplanationCheck,
       falsificationOrInconclusiveBoundary:d.negativeOrInconclusiveFinding,
       requiredEvidenceRequests:d.evidenceRequestIds.map(id=>({id,type:refs.get(id).type,
         publiclyEvidenced:false,privateReceipt:null})),
       otherOpenHypotheses:sorted(requested.filter(h=>h.id!==origin.id).map(h=>h.id)),
       exclusiveOfOtherHypotheses:false,
       testPerformed:false,evidenceReceived:false,physicalDamageConfirmed:false,
       rootCauseConfirmed:false,OEMProcedureEffective:false,
       disposition:'UNASSESSED_UNTIL_PRIVATE_QUALIFIED_EVIDENCE',
       diagnosisPromotionAllowed:false,SAPCodePromotionAllowed:false
     };
   });
   const sourceIds=src.publicReferences.map(s=>s.id);
   return {
     reviewId:'P0-DIFF-'+x.ruleId,ruleId:x.ruleId,bundleId:src.bundleId,
     system:x.system,preexistingPriority:x.priorityFromExistingGap,
     preexistingBlocker:x.blocker,subgroupCandidate:x.subgroupCandidate,
     modelCandidateKeys:[...src.modelCandidateKeys],
     modelKeysAreNotMachines:true,sourceRegistryIds:sourceIds,
     independentAlternativeFromUpstream:src.independentAlternative,
     minimumEvidenceFromUpstream:[...src.originalMinimumEvidence],
     originalDocumentaryNextInspection:x.originalNextInspection,
     firstPrivateRequest:'ASSET-ID',privateGates:[...policy.gateOrder],
     hypothesisCount:differentials.length,differentials,
     actualAssetIdentified:false,serialOemVerified:false,fieldTestApproved:false,
     engineeringSignOff:false,SAPChangeApproved:false,operationsReleased:false,
     status:'NO_GO_PUBLIC_TEST_DESIGN_ONLY'
   };
 }).sort((a,b)=>a.ruleId.localeCompare(b.ruleId));
 const models=sorted(new Set(packets.flatMap(p=>p.modelCandidateKeys)));
 const all=packets.flatMap(p=>p.differentials);
 return {
   schema:'fmea-mining.pm-p0-discriminative-evidence.v1',version:policy.version,
   nature:'public_hypothesis_discrimination_protocol_no_testing_or_live_approval',
   sourceVersions:{originalPolicy:originalPolicy.version,readiness:readiness.version,
     reviewWorkpacks:workpacks.version,maturity:maturity.version},
   summary:{p0Rules:packets.length,distinctModelKeyTokens:models.length,
     theoreticalRuleModelPositions:readiness.summary.modelKeySlots,
     designedDifferentials:all.length,nonexclusiveHypothesisPairs:all.length,
     evidenceRequestClassAssignments:all.reduce((sum,d)=>sum+d.requiredEvidenceRequests.length,0),
     uniqueEvidenceClasses:refs.size,observedCases:0,physicalTestsPerformed:0,
     confirmedComponentDamages:0,confirmedRootCauses:0,OEMSerialEffectivityVerified:0,
     approvedSAPMappings:0,engineeringApprovals:0,operationalReleases:0,
     privateRequestsSent:0,unchangedSapExceptionBlocks:gaps.records.length,
     decision:'NO_GO'
   },
   packets
 };
}
export function assessPmP0DiscriminativeEvidence(inputs,output){
 const {policy,originalPolicy,readiness,workpacks,gaps,maturity}=inputs;
 const errors=[],ck=(v,id)=>{if(!v)errors.push(id)};
 let expected;try{expected=buildPmP0DiscriminativeEvidence(inputs)}
 catch(e){return {status:'REJECTED',errors:['build_'+e.message]}};
 ck(JSON.stringify(expected)===JSON.stringify(output),'derived_report_drift');
 ck(policy.schema==='fmea-mining.pm-p0-discriminative-evidence-policy.v1'&&policy.version==='1.3.69'&&policy.predecessor==='1.3.68','policy_version');
 ck(policy.scope.rules===5&&policy.scope.hypothesesPerRule===3&&policy.scope.uniqueHypotheses===15&&policy.scope.conditionalModelPositions===35&&policy.scope.modelKeysRemainUnverified===7,'expected_scope');
 ck(policy.gateOrder.length===7&&policy.gateOrder[0]==='identity_and_variant'&&policy.gateOrder.at(-1)==='operations_separate_authorization','gate_order');
 ck(Object.values(policy.safeguards).every(x=>x===true)&&Object.values(policy.allPublicFlags).every(x=>x===0),'fail_closed_policy');
 ck(policy.interpretation.hypotheses==='may_coexist_and_must_not_be_force_ranked_from_public_sources','nonexclusive_mechanisms');
 ck(originalPolicy.version==='1.3.65'&&originalPolicy.evidenceRequests.length===7&&new Set(originalPolicy.evidenceRequests.map(x=>x.id)).size===7,'upstream_document_classes');
 ck(readiness.version==='1.3.65'&&readiness.summary.overallDecision==='NO_GO'&&readiness.summary.p0Rules===5&&readiness.summary.modelKeySlots===35&&readiness.summary.unverifiedDocumentRequests===245,'upstream_readiness_no_go');
 ck(readiness.packets.length===5&&readiness.packets.every(x=>x.proposedHypotheses.length===3&&x.proposedHypotheses.every(h=>h.verified===false)&&x.serialOemApproval===false&&x.sapMappingApproved===false),'upstream_unvalidated');
 ck(readiness.slots.length===35&&readiness.slots.every(x=>x.candidateKeyIsRealEquipment===false&&x.assetTag===null&&x.serialNumber===null&&x.modelMappingConfirmed===false&&x.OEMSerialManualVerified===false&&x.engineeringApproval===false&&x.sapApproval===false&&x.operationalRelease===false),'source_key_never_real_asset');
 ck(workpacks.version==='1.3.68'&&workpacks.summary.p0Exceptions===5&&workpacks.summary.exceptions===10&&workpacks.summary.publicDecision==='NO_GO'&&workpacks.exceptions.length===10,'review_queue_unmodified');
 ck(gaps.records.length===10&&gaps.records.filter(x=>x.priority==='P0').length===5&&gaps.records.every(x=>x.autoRemapAllowed===false&&x.observedFailures===0&&x.approvedModelIds.length===0),'SAP_exception_locks');
 ck(maturity.summary.seedRules===25&&maturity.summary.conceptuallyModeled===25&&maturity.summary.candidatePreventiveLinks===115&&maturity.summary.serialOemVerified===0&&maturity.summary.fieldConfirmed===0&&maturity.summary.sapMappingsApproved===0,'maturity_not_advanced');
 const ids=sorted(Object.keys(policy.hypothesisChecks)),expectedIds=sorted(gaps.records.filter(x=>x.priority==='P0').map(x=>x.ruleId));
 ck(JSON.stringify(ids)===JSON.stringify(expectedIds),'only_original_P0_rules');
 ck(Object.values(policy.hypothesisChecks).every(ds=>ds.length===3&&ds.every(d=>d.evidenceRequestIds.length>=3&&new Set(d.evidenceRequestIds).size===d.evidenceRequestIds.length&&d.discriminatingObservation.length>65&&d.competingExplanationCheck.length>65&&d.negativeOrInconclusiveFinding.length>60)),'15_differentials_well_defined');
 ck(Object.keys(policy.causalLayers).length===8&&Object.values(policy.causalLayers).every(x=>x.length>20),'causal_layer_taxonomy');
 ck(output.schema==='fmea-mining.pm-p0-discriminative-evidence.v1'&&output.version==='1.3.69'&&output.nature==='public_hypothesis_discrimination_protocol_no_testing_or_live_approval','output_identity');
 const s=output.summary;
 ck(s.p0Rules===5&&s.distinctModelKeyTokens===7&&s.theoreticalRuleModelPositions===35&&s.designedDifferentials===15&&s.nonexclusiveHypothesisPairs===15&&s.uniqueEvidenceClasses===7&&s.unchangedSapExceptionBlocks===10&&s.decision==='NO_GO','summary_counts');
 ck(s.evidenceRequestClassAssignments===output.packets.flatMap(x=>x.differentials).reduce((n,d)=>n+d.requiredEvidenceRequests.length,0),'evidence_assignments');
 ck(s.observedCases===0&&s.physicalTestsPerformed===0&&s.confirmedComponentDamages===0&&s.confirmedRootCauses===0&&s.OEMSerialEffectivityVerified===0&&s.approvedSAPMappings===0&&s.engineeringApprovals===0&&s.operationalReleases===0&&s.privateRequestsSent===0,'no_fake_progress');
 ck(output.packets.length===5&&new Set(output.packets.map(x=>x.ruleId)).size===5,'packet_uniqueness');
 for(const p of output.packets){
   const upstream=readiness.packets.find(x=>x.ruleId===p.ruleId),
         gap=gaps.records.find(x=>x.ruleId===p.ruleId),
         exception=workpacks.exceptions.find(x=>x.ruleId===p.ruleId);
   ck(p.preexistingBlocker===gap?.expectedBlocker&&p.system===exception?.system&&p.subgroupCandidate===exception?.subgroupCandidate&&p.bundleId===upstream?.bundleId,'packet_provenance_'+p.ruleId);
   ck(JSON.stringify(p.sourceRegistryIds)===JSON.stringify(upstream?.publicReferences.map(x=>x.id))&&JSON.stringify(p.minimumEvidenceFromUpstream)===JSON.stringify(upstream?.originalMinimumEvidence)&&p.independentAlternativeFromUpstream===upstream?.independentAlternative,'upstream_evidence_'+p.ruleId);
   ck(p.modelCandidateKeys.length===7&&p.modelKeysAreNotMachines===true&&p.firstPrivateRequest==='ASSET-ID'&&p.hypothesisCount===3&&p.differentials.length===3,'design_scope_'+p.ruleId);
   ck(p.actualAssetIdentified===false&&p.serialOemVerified===false&&p.fieldTestApproved===false&&p.engineeringSignOff===false&&p.SAPChangeApproved===false&&p.operationsReleased===false&&p.status==='NO_GO_PUBLIC_TEST_DESIGN_ONLY','no_approval_'+p.ruleId);
   const orig=originalPolicy.hypothesisDifferentials[p.ruleId]||[];
   ck(orig.length===3&&new Set(p.differentials.map(x=>x.hypothesisId)).size===3,'hypothesis_coverage_'+p.ruleId);
   for(const h of p.differentials){
     const raw=orig.find(x=>x.id===h.hypothesisId);
     ck(!!raw&&h.originalKind===raw.kind&&h.candidate===raw.candidate&&h.originalConfirmationHint===raw.confirmWith&&h.originalAlternativeHint===raw.refuteOrCompete,'hypothesis_provenance_'+h.hypothesisId);
     ck(h.causalInterpretation===policy.causalLayers[raw?.kind]&&h.causalInterpretation?.length>15&&h.exclusiveOfOtherHypotheses===false&&h.otherOpenHypotheses.length===2,'causal_nonexclusion_'+h.hypothesisId);
     ck(h.requiredEvidenceRequests[0]?.id==='ASSET-ID'&&h.requiredEvidenceRequests.every(x=>x.publiclyEvidenced===false&&x.privateReceipt===null),'documentary_only_'+h.hypothesisId);
     ck(h.testPerformed===false&&h.evidenceReceived===false&&h.physicalDamageConfirmed===false&&h.rootCauseConfirmed===false&&h.OEMProcedureEffective===false&&h.disposition==='UNASSESSED_UNTIL_PRIVATE_QUALIFIED_EVIDENCE'&&h.diagnosisPromotionAllowed===false&&h.SAPCodePromotionAllowed===false,'test_no_go_'+h.hypothesisId);
   }
 }
 return {status:errors.length?'REJECTED':'NO_GO_PUBLIC_DIFFERENTIAL_DESIGN',errors,fieldTestsAuthorized:false,SAPChangesApproved:false};
}
