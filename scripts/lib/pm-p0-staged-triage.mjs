/** Deterministic, public-only P0 applicability triage; never OEM/SAP authorization. */
import {ROOT_SCOPES} from '../pm-system-scope.mjs';
const order=x=>[...x].sort((a,b)=>a.localeCompare(b));
export function buildPmP0StagedTriage({policy,readiness,seeds,gaps,maturity,runbook}){
  const seedById=new Map(seeds.records.map(x=>[x.id,x]));
  const gapById=new Map(gaps.records.map(x=>[x.ruleId,x]));
  const packetById=new Map(readiness.packets.map(x=>[x.ruleId,x]));
  const keys=order(new Set(readiness.slots.map(x=>x.modelCandidateKey)));
  const keyTemplates=keys.map(modelCandidateKey=>{
    const related=readiness.slots.filter(x=>x.modelCandidateKey===modelCandidateKey);
    return {modelCandidateKey,distinctAssetCount:null,verifiedModel:false,
      publicCrosswalkStatus:'TEMPLATE_ONLY_NO_PRIVATE_EVIDENCE',
      relevantRules:order(related.map(x=>x.ruleId)),
      systemCandidates:order(new Set(related.map(x=>x.system))),
      privateEvidenceReceipt:null,realRequestsSent:0,
      possiblePrivateOutcomes:[...policy.firstGate.privatePossibleOutcomes]};
  });
  const candidatePositions=readiness.slots.map(slot=>{
    const seed=seedById.get(slot.ruleId),gap=gapById.get(slot.ruleId),packet=packetById.get(slot.ruleId);
    if(!seed||!gap||!packet||!ROOT_SCOPES[seed.system]||!seed.models.includes(slot.modelCandidateKey))
      throw Error('invalid_P0_candidate_'+slot.slotId);
    return {candidateSlotId:slot.slotId,ruleId:slot.ruleId,bundleId:slot.bundleId,
      modelCandidateKey:slot.modelCandidateKey,system:seed.system,
      subgroupCandidate:seed.subgroupCode,existingSapBlocker:gap.expectedBlocker,
      rootFilterCandidates:[...ROOT_SCOPES[seed.system]],
      rootsAreProvisionalOnly:true,subgroupOnlyMatchAccepted:false,
      installedFunctionConfirmed:false,realAssetIdentityInPublicReport:null,
      identityGate:{requestId:policy.firstGate.requestId,status:'UNVERIFIED',
        privateApplicability:null,privateCrosswalkReceipt:null},
      deferredRequestIds:[...policy.deferredRequestIds],
      deferredStatus:'NOT_SENT_PENDING_PRIVATE_APPLICABILITY',
      proposedHypothesisCount:packet.proposedHypotheses.length,
      hypothesisVerified:false,damageConfirmed:false,causeConfirmed:false,
      OEMSerialEffectivityVerified:false,sapMappingApproved:false,
      engineeringSignedOff:false,fieldWorkAuthorized:false,operationallyReleased:false,
      decision:'NO_GO'};
  }).sort((a,b)=>a.candidateSlotId.localeCompare(b.candidateSlotId));
  return {schema:'fmea-mining.pm-p0-staged-triage.v1',version:policy.version,
    nature:'public_templates_not_fleet_or_field_evidence',
    sourceVersions:{readiness:readiness.version,maturity:maturity.version,runbook:runbook.version},
    summary:{p0Rules:readiness.packets.length,distinctUnverifiedKeyTemplates:keyTemplates.length,
      conditionalRuleKeyPositions:candidatePositions.length,
      firstGateIdentityCandidatePositions:candidatePositions.length,
      deferredDocumentClassPositions:candidatePositions.length*policy.deferredRequestIds.length,
      theoreticalDocumentClassPositions:candidatePositions.length*(1+policy.deferredRequestIds.length),
      actualAssetsVerified:0,privateRequestsSent:0,OEMSerialEffectivityApproved:0,
      realFieldTests:0,realSapMappingsApproved:0,realEngineeringApprovals:0,realOperationalReleases:0,
      remainingSapExceptionBlocks:gaps.records.length,
      remainingPrivateInfrastructureBlocks:runbook.phases.filter(x=>x.gate==='BLOCK').length,
      result:'NO_GO'},
    keyTemplates,candidatePositions};
}
export function assessPmP0StagedTriage(inputs,output){
  const {policy,readiness,seeds,gaps,maturity,runbook}=inputs;
  const errors=[],ck=(condition,code)=>{if(!condition)errors.push(code)};
  let rebuilt;
  try{rebuilt=buildPmP0StagedTriage(inputs)}
  catch(e){return {status:'REJECTED',errors:['build_'+e.message]}};
  ck(JSON.stringify(rebuilt)===JSON.stringify(output),'reconstruction_drift');
  ck(policy.schema==='fmea-mining.pm-p0-staged-triage-policy.v1'&&policy.version==='1.3.66'&&policy.predecessor==='1.3.65','policy_version');
  ck(policy.firstGate.requestId==='ASSET-ID'&&policy.firstGate.distinctKeyTemplates===7&&policy.firstGate.ruleByKeyPositions===35,'first_gate_contract');
  ck(policy.firstGate.privatePossibleOutcomes.join('|')==='applicable|not_applicable|requires_more_evidence'&&policy.firstGate.publicStatus==='unverified','public_private_outcome');
  ck(policy.deferredRequestIds.join('|')==='OEM-MANUAL|OEM-SCHEMATIC|OEM-BOM|OEM-TEST|FIELD-EVIDENCE|SAP-BOM','six_deferred_classes');
  ck(policy.stages.length===5&&policy.stages.every((x,i)=>x.level===i),'ordered_stages');
  ck(policy.requiredPrivateFunctionalChecks.length===8&&Object.values(policy.publicAssumptions).every(v=>v===false),'evidence_never_pretended');
  ck(Object.values(policy.safety).every(v=>v===true),'safety_governance');
  ck(readiness.version==='1.3.65'&&readiness.summary.modelKeySlots===35&&readiness.summary.candidateDocumentRequests===245&&readiness.summary.overallDecision==='NO_GO','upstream_readiness');
  ck(readiness.packets.length===5&&readiness.slots.length===35&&new Set(readiness.slots.map(x=>x.slotId)).size===35,'five_p0_thirtyfive_slots');
  ck(readiness.slots.every(x=>x.candidateKeyIsRealEquipment===false&&x.assetTag===null&&x.serialNumber===null&&x.OEMSerialManualVerified===false&&x.sapApproval===false&&x.operationalRelease===false),'source_is_not_field_truth');
  ck(seeds.records.length===25&&maturity.summary.conceptuallyModeled===25&&maturity.summary.sapMappingsApproved===0&&maturity.summary.serialOemVerified===0&&maturity.summary.fieldConfirmed===0,'conceptual_maturity_only');
  ck(gaps.records.length===10&&gaps.records.filter(x=>x.priority==='P0').length===5&&gaps.records.every(x=>x.autoRemapAllowed===false&&x.observedFailures===0&&x.approvedModelIds.length===0&&x.confirmedSapLocationIds.length===0),'sap_exceptions_unapproved');
  ck(runbook.goNoGo.decision==='NO_GO'&&runbook.phases.length===8&&runbook.phases.every(x=>x.gate==='BLOCK'&&x.status==='not_started'),'private_runbook_no_go');
  ck(output.schema==='fmea-mining.pm-p0-staged-triage.v1'&&output.version==='1.3.66'&&output.nature==='public_templates_not_fleet_or_field_evidence','output_identity');
  const sum=output.summary;
  ck(sum.p0Rules===5&&sum.distinctUnverifiedKeyTemplates===7&&sum.conditionalRuleKeyPositions===35&&sum.firstGateIdentityCandidatePositions===35&&sum.deferredDocumentClassPositions===210&&sum.theoreticalDocumentClassPositions===245,'derived_queue_accounting');
  ck(sum.actualAssetsVerified===0&&sum.privateRequestsSent===0&&sum.OEMSerialEffectivityApproved===0&&sum.realFieldTests===0&&sum.realSapMappingsApproved===0&&sum.realEngineeringApprovals===0&&sum.realOperationalReleases===0&&sum.remainingSapExceptionBlocks===10&&sum.remainingPrivateInfrastructureBlocks===8&&sum.result==='NO_GO','no_go_invariant');
  const keySet=new Set(readiness.summary.distinctCandidateModelKeys);
  ck(output.keyTemplates.length===7&&output.candidatePositions.length===35,'row_counts');
  for(const k of output.keyTemplates){
    ck(keySet.has(k.modelCandidateKey)&&k.relevantRules.length===5&&k.systemCandidates.length===3&&k.distinctAssetCount===null&&k.verifiedModel===false&&k.publicCrosswalkStatus==='TEMPLATE_ONLY_NO_PRIVATE_EVIDENCE'&&k.privateEvidenceReceipt===null&&k.realRequestsSent===0,'no_assumed_model_'+k.modelCandidateKey);
  }
  for(const p of output.candidatePositions){
    const seed=seeds.records.find(x=>x.id===p.ruleId),gap=gaps.records.find(x=>x.ruleId===p.ruleId);
    ck(seed?.models.includes(p.modelCandidateKey)&&seed.system===p.system&&seed.subgroupCode===p.subgroupCandidate&&gap?.priority==='P0'&&gap.expectedBlocker===p.existingSapBlocker,'candidate_provenance_'+p.candidateSlotId);
    ck(JSON.stringify(p.rootFilterCandidates)===JSON.stringify(ROOT_SCOPES[p.system])&&p.rootsAreProvisionalOnly===true&&p.subgroupOnlyMatchAccepted===false&&p.installedFunctionConfirmed===false&&p.realAssetIdentityInPublicReport===null,'root_not_OEM_approval_'+p.candidateSlotId);
    ck(p.identityGate.requestId==='ASSET-ID'&&p.identityGate.status==='UNVERIFIED'&&p.identityGate.privateApplicability===null&&p.identityGate.privateCrosswalkReceipt===null,'identity_gate_pending_'+p.candidateSlotId);
    ck(p.deferredRequestIds.length===6&&p.deferredStatus==='NOT_SENT_PENDING_PRIVATE_APPLICABILITY'&&p.proposedHypothesisCount===3,'conditional_requests_'+p.candidateSlotId);
    ck(p.hypothesisVerified===false&&p.damageConfirmed===false&&p.causeConfirmed===false&&p.OEMSerialEffectivityVerified===false&&p.sapMappingApproved===false&&p.engineeringSignedOff===false&&p.fieldWorkAuthorized===false&&p.operationallyReleased===false&&p.decision==='NO_GO','no_false_approval_'+p.candidateSlotId);
  }
  return {status:errors.length?'REJECTED':'NO_GO_PUBLIC_STAGED_TRIAGE',errors};
}
