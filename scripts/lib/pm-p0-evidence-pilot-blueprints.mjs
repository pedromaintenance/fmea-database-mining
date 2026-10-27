/** Synthetic P0 pilot evidence blueprint joining existing governance contracts. Never accepts live evidence. */
const order=x=>[...x].sort((a,b)=>String(a).localeCompare(String(b)));
const distinct=x=>new Set(x).size===x.length;
export function buildPmP0PilotEvidenceBlueprints({policy,differentials,intake,reviewPolicy,reviewPacket,preflight,gaps,maturity,runbook}){
 const map=new Map(Object.entries(policy.referenceToIntake));
 const hypothesisRows=differentials.packets.flatMap(packet=>packet.differentials.map(h=>{
  const requests=h.requiredEvidenceRequests.map(x=>{
   const spec=map.get(x.id);if(!spec)throw Error('unknown_reference_'+x.id);
   return {requestId:x.id,publicMeaning:spec.meaning,privateChecklistGate:spec.gate,
    owningDecisionLane:spec.lane,receiptKind:spec.kind,
    privateDocumentReceived:false,applicabilityConfirmed:false,verifiedReceipt:null};
  });
  const receiptKinds=order(new Set([
    ...requests.map(x=>x.receiptKind).filter(Boolean),'counterevidence','measurement_quality'
  ]));
  return {blueprintId:'P0-RECEIPT-'+h.hypothesisId,ruleId:packet.ruleId,
   hypothesisId:h.hypothesisId,causalLayer:h.causalInterpretation,
   qualifyingSignal:h.qualitativeDistinguishingObservation,
   competingMechanismReview:h.independentCompetingExplanationCheck,
   unresolvedOrNegativeBoundary:h.falsificationOrInconclusiveBoundary,
   competingHypothesisIds:[...h.otherOpenHypotheses],
   documentaryRequests:requests,requiredIntakeReceiptKinds:receiptKinds,
   minimumPrivateCustodyMetadata:[...policy.mandatoryPrivateCustodyMetadata],
   dispositionChoices:[...policy.candidateOutcomes],
   genuineCaseAssigned:false,realAssetMapped:false,OEMEffective:false,
   authenticatedCustody:false,realMeasurementTaken:false,
   falsifyingEvidenceReviewed:false,hypothesisConfirmed:false,rootCauseConfirmed:false,
   humanEngineeringApproved:false,SAPRemapApproved:false,operationsReleased:false,
   currentDisposition:'UNASSESSED_PUBLIC_BLUEPRINT_ONLY',decision:'NO_GO'};
 }));
 const pilotCases=reviewPacket.cases.map(c=>{
   const pc=preflight.cases.find(x=>x.candidateId===c.caseId);
   const packet=differentials.packets.find(x=>x.ruleId===c.ruleId);
   if(!pc||!packet||pc.ruleId!==c.ruleId)throw Error('preflight_case_mapping_'+c.caseId);
   const checkRows=Object.entries(c.requestedChecks).flatMap(([category,checks])=>checks.map(x=>({
     category,checkId:x.checkId,status:'UNVERIFIED',privateReceipt:null,
     reviewerToken:null
   })));
   return {caseId:c.caseId,caseNature:'synthetic_public_never_selected_actual_asset',
     ruleId:c.ruleId,relatedHypothesisIds:packet.differentials.map(x=>x.hypothesisId),
     originalPreflightCandidateId:pc.candidateId,modelTokens:[...packet.modelCandidateKeys],
     sourceDocumentaryBlocker:packet.preexistingBlocker,
     evidenceReceiptKinds:c.evidenceReceiptKinds.map(x=>({kind:x.kind,status:'NOT_RECEIVED',
       privateVaultRef:null,custodyVerified:false,licenseVerified:false})),
     checklist:checkRows,
     decisionLanes:c.decisionLanes.map(x=>({id:x.laneId,ownerRole:x.ownerRole,
       status:x.status,signatureVerified:false,privateReviewRef:null})),
     custodyStages:[...intake.stages],independentRoleOrder:[...intake.roles],
     actualCaseId:null,actualSerial:null,actualAssetTag:null,actualEvidenceCount:0,
     fieldInspectionAuthorized:false,engineeringSignoff:false,
     SAPMasterdataChangeApproved:false,operationsReleaseGranted:false,
     publicDecision:'NO_GO'};
 });
 return {schema:'fmea-mining.pm-p0-evidence-pilot-blueprints.v1',version:policy.version,
   nature:'public_synthetic_intake_design_not_implemented_private_platform',
   referenceVersions:{differentials:differentials.version,intake:intake.version,
     decisionPolicy:reviewPolicy.version,reviewPacket:reviewPacket.version,
     preflight:preflight.version,maturity:maturity.version,runbook:runbook.version},
   summary:{p0Rules:differentials.packets.length,hypotheses:hypothesisRows.length,
     syntheticPilots:pilotCases.length,realPilotsSelected:0,
     receiptKindsPerPilot:policy.evidenceKinds.length,privateReceiptSlots:pilotCases.reduce((n,x)=>n+x.evidenceReceiptKinds.length,0),
     pilotChecklistInstances:pilotCases.reduce((n,x)=>n+x.checklist.length,0),
     independentDecisionLanes:pilotCases.reduce((n,x)=>n+x.decisionLanes.length,0),
     hypothesisDocumentaryRequestAssignments:hypothesisRows.reduce((n,x)=>n+x.documentaryRequests.length,0),
     totalHypothesisReceiptKindTemplates:hypothesisRows.reduce((n,x)=>n+x.requiredIntakeReceiptKinds.length,0),
     uniqueHypothesisKinds:new Set(hypothesisRows.flatMap(x=>x.requiredIntakeReceiptKinds)).size,
     outstandingPmSapExceptions:gaps.records.length,blockedPrivateGates:runbook.phases.filter(x=>x.gate==='BLOCK').length,
     verifiedOEMSeries:0,receivedRealEvidence:0,fieldInspections:0,confirmedDamage:0,
     confirmedCauses:0,engineeringApprovals:0,SAPApprovals:0,operationsReleases:0,
     result:'NO_GO'},hypothesisRows,pilotCases};
}
export function assessPmP0PilotEvidenceBlueprints(inputs,output){
 const {policy,differentials,intake,reviewPolicy,reviewPacket,preflight,gaps,maturity,runbook}=inputs;
 const errors=[],ck=(v,id)=>{if(!v)errors.push(id)};
 let expected;try{expected=buildPmP0PilotEvidenceBlueprints(inputs)}
 catch(e){return {status:'REJECTED',errors:['build_'+e.message]}};
 ck(JSON.stringify(expected)===JSON.stringify(output),'derived_report_drift');
 ck(policy.schema==='fmea-mining.pm-p0-evidence-pilot-blueprints-policy.v1'&&policy.version==='1.3.70'&&policy.predecessor==='1.3.69','version_contract');
 ck(policy.purpose.length>60&&policy.gateOrder.length===8&&policy.gateOrder[0]==='identity_and_variant'&&policy.gateOrder.at(-1)==='operational_authorization_separate','step_order');
 ck(policy.evidenceKinds.join('|')===intake.requiredEvidenceKinds.join('|'),'intake_kinds');
 ck(Object.keys(policy.referenceToIntake).length===7&&policy.referenceToIntake['ASSET-ID']?.kind===null&&policy.referenceToIntake['SAP-BOM']?.kind===null&&policy.referenceToIntake['SAP-BOM']?.lane==='sap_masterdata_change','SAP_is_not_OEM_receipt');
 ck(policy.supplementaryMandatoryKinds.counterevidence?.length>45&&policy.supplementaryMandatoryKinds.measurement_quality?.length>45,'counterevidence_quality_required');
 ck(policy.mandatoryPrivateCustodyMetadata.length===8&&distinct(policy.mandatoryPrivateCustodyMetadata)&&policy.candidateOutcomes.length===6,'custody_metadata_and_outcomes');
 ck(Object.values(policy.guardrails).every(x=>x===true),'fail_closed_policy');
 ck(policy.baseline.p0Rules===5&&policy.baseline.differentials===15&&policy.baseline.syntheticPilotCandidates===2&&policy.baseline.preflightChecksPerPilot===34&&policy.baseline.reviewLanesPerPilot===4&&Object.entries(policy.baseline).filter(([k])=>['realPilotsSelected','totalPublicCases','actualReceiptsReceived','verifiedDocuments','actualFieldInspections','engineeringApprovals','SAPMappingsApproved','operationalReleases'].includes(k)).every(([,v])=>v===0),'baseline');
 ck(differentials.version==='1.3.69'&&differentials.summary.p0Rules===5&&differentials.summary.designedDifferentials===15&&differentials.summary.evidenceRequestClassAssignments===64&&differentials.summary.decision==='NO_GO'&&differentials.packets.length===5,'P0_source');
 ck(differentials.packets.every(p=>p.preexistingPriority==='P0'&&p.hypothesisCount===3&&p.actualAssetIdentified===false&&p.serialOemVerified===false&&p.fieldTestApproved===false&&p.engineeringSignOff===false&&p.SAPChangeApproved===false&&p.operationsReleased===false&&p.status==='NO_GO_PUBLIC_TEST_DESIGN_ONLY'&&p.differentials.every(d=>d.testPerformed===false&&d.evidenceReceived===false&&d.physicalDamageConfirmed===false&&d.rootCauseConfirmed===false&&d.OEMProcedureEffective===false&&d.diagnosisPromotionAllowed===false&&d.SAPCodePromotionAllowed===false)),'unapproved_hypotheses');
 ck(intake.version==='1.3.61'&&intake.stages.length===6&&intake.roles.length===5&&intake.events.length===5&&intake.boundaries.publicSyntheticOnly===true&&intake.boundaries.realCasesInRepository===0&&intake.boundaries.privateStorageImplemented===false&&intake.boundaries.corporateSSOIntegrated===false,'intake_only_mock');
 ck(reviewPolicy.version==='1.3.64'&&reviewPolicy.decisionLanes.length===4&&reviewPolicy.trustBoundary.publicAlwaysNoGo===true&&reviewPolicy.trustBoundary.immutableDecisionLedgerImplemented===false&&reviewPolicy.trustBoundary.privateEvidenceTransportImplemented===false,'no_verified_platform');
 ck(reviewPacket.version==='1.3.64'&&reviewPacket.summary.candidateCases===2&&reviewPacket.summary.checklistRequirementsPerCase===34&&reviewPacket.summary.verifiedRealEvidence===0&&reviewPacket.summary.publicDecision==='NO_GO','decision_case_templates');
 ck(preflight.version==='1.3.63'&&preflight.summary.pilotCandidates===2&&preflight.summary.actualAssetsSelected===0&&preflight.summary.actualPilotsApproved===0&&preflight.summary.overallDecision==='NO_GO','unapproved_preflight');
 ck(gaps.records.length===10&&gaps.records.filter(x=>x.priority==='P0').length===5&&gaps.records.every(x=>x.autoRemapAllowed===false&&x.observedFailures===0),'SAP_gaps_preserved');
 ck(maturity.summary.conceptuallyModeled===25&&maturity.summary.fieldConfirmed===0&&maturity.summary.sapMappingsApproved===0&&maturity.summary.serialOemVerified===0,'maturity_unchanged');
 ck(runbook.phases.length===8&&runbook.phases.every(x=>x.status==='not_started'&&x.gate==='BLOCK')&&runbook.goNoGo.decision==='NO_GO','infrastructure_not_approved');
 ck(output.schema==='fmea-mining.pm-p0-evidence-pilot-blueprints.v1'&&output.version==='1.3.70'&&output.nature==='public_synthetic_intake_design_not_implemented_private_platform','identity');
 const s=output.summary;
 ck(s.p0Rules===5&&s.hypotheses===15&&s.syntheticPilots===2&&s.realPilotsSelected===0&&s.receiptKindsPerPilot===5&&s.privateReceiptSlots===10&&s.pilotChecklistInstances===68&&s.independentDecisionLanes===8&&s.hypothesisDocumentaryRequestAssignments===64&&s.outstandingPmSapExceptions===10&&s.blockedPrivateGates===8&&s.result==='NO_GO','summary_reconciliation');
 ck(['verifiedOEMSeries','receivedRealEvidence','fieldInspections','confirmedDamage','confirmedCauses','engineeringApprovals','SAPApprovals','operationsReleases'].every(k=>s[k]===0),'no_field_or_approval');
 ck(output.hypothesisRows.length===15&&output.pilotCases.length===2&&distinct(output.hypothesisRows.map(x=>x.hypothesisId))&&distinct(output.pilotCases.map(x=>x.caseId)),'unique_templates');
 const allKinds=new Set(intake.requiredEvidenceKinds);
 for(const row of output.hypothesisRows){
  const p=differentials.packets.find(x=>x.ruleId===row.ruleId),h=p?.differentials.find(x=>x.hypothesisId===row.hypothesisId);
  ck(!!h&&row.causalLayer===h.causalInterpretation&&row.qualifyingSignal===h.qualitativeDistinguishingObservation&&row.competingMechanismReview===h.independentCompetingExplanationCheck&&row.unresolvedOrNegativeBoundary===h.falsificationOrInconclusiveBoundary,'differential_preserved_'+row.hypothesisId);
  ck(row.requiredIntakeReceiptKinds.every(x=>allKinds.has(x))&&row.requiredIntakeReceiptKinds.includes('counterevidence')&&row.requiredIntakeReceiptKinds.includes('measurement_quality')&&row.documentaryRequests.length===h?.requiredEvidenceRequests.length,'evidence_slots_'+row.hypothesisId);
  ck(row.documentaryRequests[0]?.requestId==='ASSET-ID'&&row.documentaryRequests.every(x=>x.privateDocumentReceived===false&&x.applicabilityConfirmed===false&&x.verifiedReceipt===null),'no_receipts_'+row.hypothesisId);
  ck(row.minimumPrivateCustodyMetadata.length===8&&row.competingHypothesisIds.length===2&&row.dispositionChoices.length===6,'human_review_options_'+row.hypothesisId);
  ck(['genuineCaseAssigned','realAssetMapped','OEMEffective','authenticatedCustody','realMeasurementTaken','falsifyingEvidenceReviewed','hypothesisConfirmed','rootCauseConfirmed','humanEngineeringApproved','SAPRemapApproved','operationsReleased'].every(k=>row[k]===false)&&row.currentDisposition==='UNASSESSED_PUBLIC_BLUEPRINT_ONLY'&&row.decision==='NO_GO','no_hypothesis_promotion_'+row.hypothesisId);
 }
 for(const c of output.pilotCases){
  const source=reviewPacket.cases.find(x=>x.caseId===c.caseId),orig=preflight.cases.find(x=>x.candidateId===c.caseId);
  ck(!!source&&!!orig&&source.ruleId===c.ruleId&&c.originalPreflightCandidateId===orig.candidateId&&source.priority==='P0'&&c.modelTokens.length===7,'pilot_provenance_'+c.caseId);
  ck(c.checklist.length===34&&distinct(c.checklist.map(x=>x.checkId))&&c.checklist.every(x=>x.status==='UNVERIFIED'&&x.privateReceipt===null&&x.reviewerToken===null),'34_unverified_checks_'+c.caseId);
  ck(c.evidenceReceiptKinds.length===5&&c.evidenceReceiptKinds.every(x=>x.status==='NOT_RECEIVED'&&x.privateVaultRef===null&&x.custodyVerified===false&&x.licenseVerified===false),'five_empty_receipts_'+c.caseId);
  ck(c.decisionLanes.length===4&&c.decisionLanes.every(x=>x.signatureVerified===false&&x.privateReviewRef===null)&&c.custodyStages.length===6&&c.independentRoleOrder.length===5,'four_decision_lanes_'+c.caseId);
  ck(c.actualCaseId===null&&c.actualSerial===null&&c.actualAssetTag===null&&c.actualEvidenceCount===0&&c.fieldInspectionAuthorized===false&&c.engineeringSignoff===false&&c.SAPMasterdataChangeApproved===false&&c.operationsReleaseGranted===false&&c.publicDecision==='NO_GO','pilot_is_synthetic_'+c.caseId);
 }
 return {status:errors.length?'REJECTED':'NO_GO_PUBLIC_PILOT_BLUEPRINT',errors,realCasesAccepted:false,privateApprovalGranted:false};
}
