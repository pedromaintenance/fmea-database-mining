/** Public corporate-readiness snapshot: documented checks are not private attestation. */
const sorted=a=>[...a].sort((x,y)=>String(x).localeCompare(String(y)));
const uniq=a=>new Set(a).size===a.length;
export function buildCorporateReadinessClosure({policy,runbook,scenarios,blueprint,readiness,reviewPacket,intake,decisionPolicy,gaps,maturity}){
 const phases=new Map(runbook.phases.map(x=>[x.id,x]));
 if(runbook.phases.length!==8||!uniq(runbook.phases.map(x=>x.id)))throw Error('phase_integrity');
 const depth=new Map();
 function level(id,ancestors=new Set()){
   if(depth.has(id))return depth.get(id);
   const p=phases.get(id);
   if(!p)throw Error('missing_phase_'+id);
   if(ancestors.has(id))throw Error('cyclic_phase_dependencies');
   const parents=p.prerequisites.map(pre=>level(pre,new Set([...ancestors,id])));
   const rank=parents.length?Math.max(...parents)+1:0;
   depth.set(id,rank);return rank;
 }
 const gateRegister=runbook.phases.map(p=>{
   const spec=policy.gateProofCriteria.find(x=>x.gateId===p.id);
   if(!spec)throw Error('missing_proof_'+p.id);
   return {gateId:p.id,name:p.name,ownerRole:p.owner,prerequisites:[...p.prerequisites],
     dependencyWave:level(p.id),requiredCorporateArtifacts:[...p.requiredArtifacts],
     verificationQuestion:spec.verificationQuestion,privateEvidenceDescription:spec.privateEvidenceDescription,
     proofClass:spec.proofClass,
     publicTestsComplete:false, // tests are global, not a gate-specific signed acceptance
     existingPublicDesignSpecified:true,corporateAttestationReceived:false,
     signatureAuthenticated:false,privateVerificationPerformed:false,
     readiness:'BLOCKED_PENDING_PRIVATE_CORPORATE_EVIDENCE',approvedForRealPilot:false,
     inheritedGateStatus:p.gate,inheritedPhaseStatus:p.status,
     decision:'NO_GO'};
 }).sort((a,b)=>a.dependencyWave-b.dependencyWave||String(a.gateId).localeCompare(b.gateId));
 const maxWave=Math.max(...gateRegister.map(x=>x.dependencyWave));
 const waves=Array.from({length:maxWave+1},(_,wave)=>({
    wave,gateIds:gateRegister.filter(x=>x.dependencyWave===wave).map(x=>x.gateId),
    prerequisiteStatus:'UNVERIFIED_PRIVATE',advanceAuthorized:false
 }));
 const pilotCases=blueprint.pilotCases.map(c=>{
   const fromDecision=reviewPacket.cases.find(x=>x.caseId===c.caseId);
   if(!fromDecision||fromDecision.ruleId!==c.ruleId)throw Error('pilot_not_in_review_source');
   const sections=policy.pilotChecklistCategories.map(category=>{
     const all=c.checklist.filter(x=>x.category===category);
     return {category,expectedChecks:all.length,
       unresolvedCheckIds:sorted(all.map(x=>x.checkId)),
       verifiedChecks:0,reviewSignatures:0,decision:'NO_GO'};
   });
   const humanLanes=policy.separateDecisions.map(id=>{
     const d=c.decisionLanes.find(x=>x.id===id);
     if(!d)throw Error('missing_separate_lane_'+id);
     return {id,ownerRole:d.ownerRole,originalStatus:d.status,
       signedApprovalReceived:false,realChangeRecord:null,decision:'NOT_AUTHORIZED'};
   });
   const synthetic=scenarios.cases.filter(x=>x.pilotId===c.caseId);
   return {caseId:c.caseId,ruleId:c.ruleId,caseNature:'synthetic_template_not_selected_real_asset',
     scenarioEvaluations:synthetic.length,
     hypotheticalOutcomes:sorted(synthetic.map(x=>x.branchOutcome)),
     supportedHypothesisIds:[...c.relatedHypothesisIds],documentReceiptKinds:c.evidenceReceiptKinds.map(x=>x.kind),
     checklistSections:sections,humanDecisionLanes:humanLanes,
     actualAssetIdentified:false,OEMSeriesEffective:false,documentsInCorporateVault:false,
     procedureApproved:false,qualifiedObservationCollected:false,
     independentEngineeringApproved:false,SAPChangeApproved:false,
     workAuthorized:false,operationsReleased:false,
     state:'NO_GO_NO_PRIVATE_CASE_OR_EVIDENCE'};
 }).sort((a,b)=>a.caseId.localeCompare(b.caseId));
 const checks=pilotCases.reduce((n,x)=>n+x.checklistSections.reduce((m,y)=>m+y.expectedChecks,0),0);
 const identifiedScenarioOutcomes=sorted(new Set(scenarios.cases.map(x=>x.branchOutcome)));
 const missingPrivateEvidenceClasses=policy.caseRequirements.map(x=>({
   kind:x.kind,requiredPrivateEvidence:x.privateEvidenceType,
   receivedAndAuthenticated:false,currentReadiness:'MISSING_OR_UNVERIFIED',decision:'NO_GO'
 }));
 return {schema:'fmea-mining.pm-corporate-readiness-closure.v1',version:policy.version,
   nature:'public_design_coverage_vs_private_operational_readiness_not_a_homologation',
   sourceVersions:{runbook:runbook.version,scenarios:scenarios.version,
     pilotBlueprint:blueprint.version,readiness:readiness.version,
     reviewPacket:reviewPacket.version,intake:intake.version,
     decisionPolicy:decisionPolicy.version,maturity:maturity.version},
   summary:{specifiedGateDefinitions:gateRegister.length,
     privateGatesVerified:0,privateGatesBlocked:gateRegister.length,dependencyWaves:waves.length,
     documentedScenarioOutcomes:identifiedScenarioOutcomes.length,
     offlineScenarioEvaluations:scenarios.cases.length,
     p0HypothesesDescribed:blueprint.hypothesisRows.length,
     syntheticPilotTemplates:pilotCases.length,unverifiedCheckInstances:checks,
     separateDecisionLanes:pilotCases.reduce((n,x)=>n+x.humanDecisionLanes.length,0),
     missingPrivateEvidenceClasses:missingPrivateEvidenceClasses.length,
     originalSapExceptionBlocks:gaps.records.length,privateCasesAccepted:0,
     realSelectedAssets:0,verifiedOEMSerials:0,realMeasurements:0,
     engineeringSignoffs:0,approvedSAPChanges:0,workOrdersCreated:0,
     operationalReleases:0,documentedPublicDesignState:policy.documentedReadiness,
     corporateAcceptanceState:policy.corporateReadiness,
     realPilotState:policy.pilotReadiness,
     overallDecision:'NO_GO'},
   nextPrivateGovernanceStep:policy.allowedNextPrivateStep,
   gateRegister,waves,pilotCases,missingPrivateEvidenceClasses,
   scenarioOutcomes:identifiedScenarioOutcomes
 };
}
export function assessCorporateReadinessClosure(input,output){
 const {policy,runbook,scenarios,blueprint,readiness,reviewPacket,intake,decisionPolicy,gaps,maturity}=input;
 const errors=[],ck=(v,id)=>{if(!v)errors.push(id)};
 let expected;try{expected=buildCorporateReadinessClosure(input)}
 catch(e){return {status:'REJECTED',errors:['build_'+e.message]}};
 ck(JSON.stringify(expected)===JSON.stringify(output),'deterministic_snapshot');
 ck(policy.schema==='fmea-mining.pm-corporate-readiness-closure-policy.v1'&&policy.version==='1.3.72'&&policy.predecessor==='1.3.71','contract_version');
 ck(JSON.stringify(policy.requiredGateOrder)===JSON.stringify(['SEC-01','ID-02','STO-03','AUD-04','RET-05','REV-06','STG-07','PIL-08']),'gate_id_order');
 ck(policy.gateProofCriteria.length===8&&uniq(policy.gateProofCriteria.map(x=>x.gateId))&&
    policy.gateProofCriteria.every(x=>x.verificationQuestion.length>50&&x.privateEvidenceDescription.length>50&&
      x.syntheticTestsNotSufficient===true&&x.allowPublicEvidenceEmbedding===false&&
      x.privateAttestationReceived===false&&x.reviewerIdentityConfirmed===false&&
      x.gateSatisfied===false&&x.gateDecision==='BLOCK_NOT_ATTESTED'),'gate_proof_requirements');
 ck(policy.documentedReadiness==='PUBLIC_DESIGN_AND_TEST_COVERAGE_ONLY'&&
    policy.corporateReadiness==='NOT_ATTESTED_PRIVATE_INFRASTRUCTURE'&&
    policy.pilotReadiness==='NO_GO_NO_REAL_ASSET_OR_SERIAL_OEM','readiness_boundaries');
 ck(policy.allowedNextPrivateStep==='SEC-01_SPONSOR_LICENSE_PRIVACY_AUTHORIZATION','first_governance_action');
 ck(JSON.stringify(policy.pilotChecklistCategories)===JSON.stringify(['identity','oem','safe_execution','measurement_quality','diagnosis','independent_review','sap_change']),'checklist_categories');
 ck(JSON.stringify(policy.separateDecisions)===JSON.stringify(['documentary_readiness','engineering_validation','sap_masterdata_change','operational_release']),'decision_lanes');
 ck(Object.values(policy.safety).every(x=>x===true),'fail_closed_safety');
 ck(policy.baseline.priorScenarioTypes===9&&policy.baseline.priorSyntheticEvaluations===18&&
    policy.baseline.priorP0Hypotheses===15&&policy.baseline.priorPublicPilots===2&&
    policy.baseline.priorCheckInstances===68&&policy.baseline.priorPrivateGatesBlocked===8&&
    policy.baseline.priorSAPExceptionsBlocked===10&&
    policy.baseline.realAssetsSelected===0&&policy.baseline.verifiedOEMSeries===0&&
    policy.baseline.privateAttestations===0&&policy.baseline.realWorkOrders===0&&policy.baseline.goDecisions===0,'source_baseline');
 ck(runbook.version==='1.3.62'&&runbook.phases.length===8&&
    runbook.phases.every(x=>x.status==='not_started'&&x.gate==='BLOCK'&&x.decisionToken===null)&&
    runbook.goNoGo.decision==='NO_GO'&&runbook.goNoGo.realPilotAllowed===false&&
    runbook.goNoGo.operationalReleaseAllowed===false&&runbook.infrastructureState.realCasesAccepted===0,'blocked_runbook');
 ck(scenarios.version==='1.3.71'&&scenarios.summary.scenarioTemplates===9&&
    scenarios.summary.syntheticPilots===2&&scenarios.summary.scenarioPilotEvaluations===18&&
    scenarios.summary.realReceivedDocuments===0&&scenarios.summary.engineeringSignoffs===0&&
    scenarios.summary.approvedSAPChanges===0&&scenarios.summary.decision==='NO_GO','synthetic_scenarios_only');
 ck(scenarios.cases.length===18&&scenarios.cases.every(c=>c.publicDecision==='NO_GO'&&
    c.evidenceActuallyReceived===false&&c.realOEMEffective===false&&
    c.technicalDiagnosisConfirmed===false&&c.engineeringApproved===false&&c.SAPChangeApproved===false&&
    c.operationallyReleased===false),'scenario_claims_not_promoted');
 ck(blueprint.version==='1.3.70'&&blueprint.summary.syntheticPilots===2&&
    blueprint.summary.hypotheses===15&&blueprint.summary.privateReceiptSlots===10&&
    blueprint.summary.pilotChecklistInstances===68&&blueprint.summary.realPilotsSelected===0&&
    blueprint.summary.result==='NO_GO','upstream_blueprints');
 ck(blueprint.pilotCases.length===2&&blueprint.pilotCases.every(c=>
    c.actualCaseId===null&&c.actualSerial===null&&c.actualAssetTag===null&&
    c.actualEvidenceCount===0&&c.publicDecision==='NO_GO'&&
    c.evidenceReceiptKinds.length===5&&c.checklist.length===34&&
    c.checklist.every(x=>x.status==='UNVERIFIED')&&
    c.decisionLanes.every(x=>x.signatureVerified===false)),'public_pilot_templates_not_livedata');
 ck(readiness.version==='1.3.65'&&readiness.summary.actualEquipmentCountKnown===0&&
    readiness.summary.serialEffectivityVerified===0&&readiness.summary.unverifiedDocumentRequests===245&&
    readiness.summary.overallDecision==='NO_GO','model_keys_not_assets');
 ck(reviewPacket.version==='1.3.64'&&reviewPacket.summary.candidateCases===2&&
    reviewPacket.summary.unverifiedCheckInstances===68&&reviewPacket.summary.engineeringApprovals===0&&
    reviewPacket.summary.sapApprovals===0&&reviewPacket.summary.operationalReleases===0&&
    reviewPacket.summary.publicDecision==='NO_GO','review_packet_not_approved');
 ck(intake.version==='1.3.61'&&intake.boundaries.publicSyntheticOnly===true&&
    intake.boundaries.privateStorageImplemented===false&&intake.boundaries.corporateSSOIntegrated===false&&
    intake.boundaries.signedImmutableAuditTrailImplemented===false,'private_intake_not_deployed');
 ck(decisionPolicy.version==='1.3.64'&&decisionPolicy.trustBoundary.publicAlwaysNoGo===true&&
    decisionPolicy.trustBoundary.engineeringAutoApproval===false&&
    decisionPolicy.trustBoundary.sapAutoApproval===false&&
    decisionPolicy.trustBoundary.operationsAutoRelease===false,'no_decision_autopromotion');
 ck(gaps.records.length===10&&gaps.records.every(x=>x.autoRemapAllowed===false&&
    x.observedFailures===0&&x.status==='bloqueado_aguardando_curadoria'),'ten_locked_sap_gaps');
 ck(maturity.summary.candidatePreventiveLinks===115&&maturity.summary.fieldConfirmed===0&&
    maturity.summary.serialOemVerified===0&&maturity.summary.sapMappingsApproved===0,'maturity_not_advanced');
 ck(output.schema==='fmea-mining.pm-corporate-readiness-closure.v1'&&output.version==='1.3.72'&&
    output.nature==='public_design_coverage_vs_private_operational_readiness_not_a_homologation','result_identity');
 const s=output.summary;
 ck(s.specifiedGateDefinitions===8&&s.privateGatesBlocked===8&&s.privateGatesVerified===0&&
    s.offlineScenarioEvaluations===18&&s.documentedScenarioOutcomes===9&&
    s.p0HypothesesDescribed===15&&s.syntheticPilotTemplates===2&&
    s.unverifiedCheckInstances===68&&s.separateDecisionLanes===8&&
    s.missingPrivateEvidenceClasses===8&&s.originalSapExceptionBlocks===10&&
    s.overallDecision==='NO_GO','reconciled_summary');
 ck(['privateCasesAccepted','realSelectedAssets','verifiedOEMSerials','realMeasurements',
    'engineeringSignoffs','approvedSAPChanges','workOrdersCreated','operationalReleases'
 ].every(k=>s[k]===0),'no_real_signoffs');
 ck(output.gateRegister.length===8&&output.waves.length>3&&
    uniq(output.gateRegister.map(x=>x.gateId))&&
    output.gateRegister.every(x=>x.inheritedGateStatus==='BLOCK'&&
      x.inheritedPhaseStatus==='not_started'&&x.approvedForRealPilot===false&&
      x.corporateAttestationReceived===false&&x.signatureAuthenticated===false&&
      x.privateVerificationPerformed===false&&x.existingPublicDesignSpecified===true&&
      x.decision==='NO_GO'),'gates_not_waved_through');
 ck(output.waves.every(x=>x.advanceAuthorized===false&&x.prerequisiteStatus==='UNVERIFIED_PRIVATE'),'no_wave_autoapproval');
 ck(output.pilotCases.length===2&&output.pilotCases.every(x=>
    x.scenarioEvaluations===9&&x.checklistSections.length===7&&
    x.checklistSections.reduce((n,y)=>n+y.expectedChecks,0)===34&&
    x.checklistSections.every(y=>y.verifiedChecks===0&&y.reviewSignatures===0&&
      y.unresolvedCheckIds.length===y.expectedChecks)&&
    x.humanDecisionLanes.length===4&&x.humanDecisionLanes.every(y=>y.signedApprovalReceived===false)&&
    ['actualAssetIdentified','OEMSeriesEffective','documentsInCorporateVault','procedureApproved',
      'qualifiedObservationCollected','independentEngineeringApproved','SAPChangeApproved',
      'workAuthorized','operationsReleased'].every(k=>x[k]===false)&&
    x.state==='NO_GO_NO_PRIVATE_CASE_OR_EVIDENCE'),'pilot_not_real');
 ck(output.missingPrivateEvidenceClasses.every(x=>x.receivedAndAuthenticated===false&&
    x.currentReadiness==='MISSING_OR_UNVERIFIED'&&x.decision==='NO_GO'),'eight_missing_evidence');
 ck(output.nextPrivateGovernanceStep==='SEC-01_SPONSOR_LICENSE_PRIVACY_AUTHORIZATION','start_with_license_scope');
 return {status:errors.length?'REJECTED':'NO_GO_PUBLIC_READINESS_REPORT',errors,realPilotAuthorized:false};
}
