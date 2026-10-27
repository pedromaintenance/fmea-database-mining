/** Offline synthetic branch evaluator. Never accepts private evidence or signs off a case. */
const stable=(a,b)=>String(a).localeCompare(String(b));
const has=(v)=>v!==null&&v!==undefined;
const OWN_FIELDS=Object.freeze(['identity','provenance','applicability','receiptMode','methodQuality','counterevidence','observation']);
const OUTCOMES=Object.freeze({
 invalid:"REJECT_UNTRUSTED_EVIDENCE",
 mismatch:"REJECT_WRONG_APPLICABILITY",
 identity:"REQUEST_IDENTITY",
 documents:"REQUEST_DOCUMENTATION",
 counter:"REQUEST_COUNTEREVIDENCE",
 conflicting:"HOLD_CONFLICTING_EVIDENCE",
 metrology:"HOLD_METROLOGY_REVIEW",
 unknown:"HOLD_INCONCLUSIVE",
 favorable:"HOLD_PRIVATE_INDEPENDENT_REVIEW"
});
const EXPECTED=Object.freeze({
 identity_missing:OUTCOMES.identity,
 missing_documents:OUTCOMES.documents,
 invalid_provenance:OUTCOMES.invalid,
 oem_mismatch:OUTCOMES.mismatch,
 counterevidence_absent:OUTCOMES.counter,
 conflicting_results:OUTCOMES.conflicting,
 poor_measurement_quality:OUTCOMES.metrology,
 apparently_favorable:OUTCOMES.favorable,
 nondiscriminating:OUTCOMES.unknown
});
export function classifySyntheticP0Scenario(fields,enums){
 if(!fields||typeof fields!=='object'||Array.isArray(fields)||!enums)
   return 'REJECT_UNSUPPORTED_SYNTHETIC_INPUT';
 if(Object.keys(fields).length!==OWN_FIELDS.length||
    !OWN_FIELDS.every(k=>Object.hasOwn(fields,k)&&
      Array.isArray(enums[k])&&enums[k].includes(fields[k])))
   return 'REJECT_UNSUPPORTED_SYNTHETIC_INPUT';
 if(fields.provenance==='invalid')return OUTCOMES.invalid;
 if(fields.applicability==='mismatch')return OUTCOMES.mismatch;
 if(fields.identity==='missing')return OUTCOMES.identity;
 if(fields.receiptMode!=='all'||fields.provenance==='not_provided'||fields.applicability!=='synthetic_match')return OUTCOMES.documents;
 if(fields.counterevidence==='missing')return OUTCOMES.counter;
 if(fields.counterevidence==='conflicting'||fields.observation==='conflicting')return OUTCOMES.conflicting;
 if(fields.methodQuality!=='synthetic_adequate')return OUTCOMES.metrology;
 if(fields.observation!=='apparently_supportive')return OUTCOMES.unknown;
 return OUTCOMES.favorable;
}
export function buildSyntheticP0EvidenceOutcomes({policy,blueprint,intake,decisionPolicy,gaps,maturity,runbook}){
 const sortedPilot=[...blueprint.pilotCases].sort((a,b)=>stable(a.caseId,b.caseId));
 if(sortedPilot.length!==2||policy.scenarios.length!==9)throw Error('unexpected_pilot_or_scenario_count');
 const cases=sortedPilot.flatMap(pilot=>policy.scenarios.map(fixture=>{
   const verdict=classifySyntheticP0Scenario(fixture.fields,policy.inputEnums);
   if(verdict==='REJECT_UNSUPPORTED_SYNTHETIC_INPUT')throw Error('invalid_fixture_'+fixture.id);
   const status=kind=>fixture.fields.receiptMode==='all'?'SYNTHETIC_FIXTURE_ONLY':
     fixture.fields.receiptMode==='none'?'NOT_SUPPLIED':
     ['oem_effectivity','oem_procedure'].includes(kind)?'SYNTHETIC_FIXTURE_ONLY':'NOT_SUPPLIED';
   return {
    scenarioId:fixture.id,scenarioTitle:fixture.title,scenarioKind:'synthetic_counterfactual_not_field_case',
    pilotId:pilot.caseId,ruleId:pilot.ruleId,preexistingBlocker:pilot.sourceDocumentaryBlocker,
    hypotheticalConditions:{...fixture.fields},
    simulatedReceipts:pilot.evidenceReceiptKinds.map(x=>({
      kind:x.kind,simulationStatus:status(x.kind),
      authenticCorporateRecord:false,verifiedPrivateRef:null,
      realCustodyValidation:false,actualOEMEffectivity:false
    })),
    relatedHypothesisIds:[...pilot.relatedHypothesisIds],
    branchOutcome:verdict,requiredHumanOwner:policy.humanRouting[verdict],
    reviewLane:policy.humanRouting[verdict]==='technical_document_controller'?
      'documentary_readiness':'engineering_validation',
    privateIndependentDecisionOutstanding:true,
    evidenceActuallyReceived:false,realOEMEffective:false,
    technicalDiagnosisConfirmed:false,rootCauseConfirmed:false,
    engineeringApproved:false,SAPChangeApproved:false,operationallyReleased:false,
    mayOpenWorkOrder:false,mayPromoteFmea:false,
    requiredSeparateDecisionLanes:[...policy.alwaysBlockedDecisions],
    publicDecision:'NO_GO'
   };
 }));
 const verdictCounts={};
 for(const name of Object.values(EXPECTED))verdictCounts[name]=cases.filter(x=>x.branchOutcome===name).length;
 return {schema:'fmea-mining.pm-p0-synthetic-evidence-outcomes.v1',
   version:policy.version,nature:'offline_counterfactual_branch_validation_no_livedata_or_approval',
   upstream:{blueprint:blueprint.version,intake:intake.version,reviewDecision:decisionPolicy.version,
     maturity:maturity.version},
   summary:{scenarioTemplates:policy.scenarios.length,syntheticPilots:sortedPilot.length,
     scenarioPilotEvaluations:cases.length,branchOutcomes:Object.keys(verdictCounts).length,
     outcomeCounts:verdictCounts,
     theoreticalReceiptExamples:cases.reduce((n,x)=>n+x.simulatedReceipts.filter(z=>z.simulationStatus==='SYNTHETIC_FIXTURE_ONLY').length,0),
     realReceivedDocuments:0,validatedOEMSeries:0,realFieldTests:0,actualInspections:0,
     confirmedComponentDamages:0,rootCausesConfirmed:0,engineeringSignoffs:0,
     approvedSAPChanges:0,operationalReleases:0,openedWorkOrders:0,
     sapExceptionsStillBlocked:gaps.records.length,privateGatesStillBlocked:runbook.phases.filter(x=>x.gate==='BLOCK').length,
     decision:'NO_GO'},
   cases
 };
}
export function assessSyntheticP0EvidenceOutcomes(inputs,report){
 const {policy,blueprint,intake,decisionPolicy,gaps,maturity,runbook}=inputs;
 const errors=[],ck=(truth,what)=>{if(!truth)errors.push(what)};
 let expected;try{expected=buildSyntheticP0EvidenceOutcomes(inputs)}
 catch(e){return {status:'REJECTED',errors:['build_'+e.message]}};
 ck(JSON.stringify(expected)===JSON.stringify(report),'report_drift');
 ck(policy.schema==='fmea-mining.pm-p0-synthetic-evidence-outcomes-policy.v1'&&policy.version==='1.3.71'&&policy.predecessor==='1.3.70','policy_version');
 ck(policy.syntheticCasePrefix==='TEST-PILOT-'&&policy.purpose.length>60,'policy_scope');
 ck(JSON.stringify([...policy.existingPilotRules].sort(stable))===JSON.stringify(['cooling-radiator-blockage','fuel-filter-contamination']),'approved_synthetic_fixture_rules');
 ck(JSON.stringify(policy.intakeKinds)===JSON.stringify(intake.requiredEvidenceKinds),'five_intake_kinds');
 const keys=Object.keys(policy.inputEnums).sort(stable);
 ck(JSON.stringify(keys)===JSON.stringify([...OWN_FIELDS].sort(stable))&&
    policy.inputEnums.identity.join('|')==='missing|synthetic_candidate'&&
    policy.inputEnums.provenance.join('|')==='not_provided|synthetic_consistent|invalid'&&
    policy.inputEnums.applicability.join('|')==='unknown|synthetic_match|mismatch'&&
    policy.inputEnums.receiptMode.join('|')==='none|partial|all'&&
    policy.inputEnums.methodQuality.join('|')==='not_assessed|synthetic_adequate|unreliable'&&
    policy.inputEnums.counterevidence.join('|')==='missing|synthetic_considered|conflicting'&&
    policy.inputEnums.observation.join('|')==='not_recorded|apparently_supportive|conflicting|nondiscriminating','enum_allowlist');
 ck(policy.scenarios.length===9&&new Set(policy.scenarios.map(x=>x.id)).size===9&&policy.scenarios.every(x=>
    Object.hasOwn(EXPECTED,x.id)&&x.expect===EXPECTED[x.id]&&x.title.length>10&&
    classifySyntheticP0Scenario(x.fields,policy.inputEnums)===x.expect),'fixture_branch_contract');
 ck(JSON.stringify(policy.priorityOfEvaluation)===JSON.stringify(['UNTRUSTED','OEM_MISMATCH','IDENTITY_GAP','DOCUMENT_GAP','COUNTEREVIDENCE_GAP','CONFLICT','METROLOGY','NO_DISCRIMINATING_OBSERVATION','APPARENT_SUPPORT']),'priority_contract');
 ck(Object.keys(policy.humanRouting).length===9&&Object.keys(EXPECTED).every(k=>[
   'technical_document_controller','independent_maintenance_engineer'
 ].includes(policy.humanRouting[EXPECTED[k]])),'human_owner_only');
 ck(JSON.stringify(policy.alwaysBlockedDecisions)===JSON.stringify(['engineering_validation','sap_masterdata_change','operational_release']),'independent_lanes');
 ck(Object.values(policy.safetyAndGovernance).every(x=>x===true),'no_go_guards');
 ck(blueprint.version==='1.3.70'&&blueprint.summary.syntheticPilots===2&&
    blueprint.summary.p0Rules===5&&blueprint.summary.hypotheses===15&&
    blueprint.summary.pilotChecklistInstances===68&&blueprint.summary.privateReceiptSlots===10&&
    blueprint.summary.blockedPrivateGates===8&&blueprint.summary.result==='NO_GO'&&
    blueprint.pilotCases.length===2&&blueprint.pilotCases.every(p=>
      p.caseId.startsWith('TEST-PILOT-')&&p.actualCaseId===null&&p.actualSerial===null&&
      p.actualAssetTag===null&&p.actualEvidenceCount===0&&p.publicDecision==='NO_GO'&&
      p.checklist.length===34&&p.checklist.every(x=>x.status==='UNVERIFIED')&&
      p.evidenceReceiptKinds.length===5&&p.evidenceReceiptKinds.every(x=>x.status==='NOT_RECEIVED')&&
      p.decisionLanes.length===4&&p.decisionLanes.every(x=>x.signatureVerified===false)),'prior_blueprint_is_synthetic');
 ck(intake.version==='1.3.61'&&intake.boundaries.publicSyntheticOnly===true&&
    intake.boundaries.privateStorageImplemented===false&&intake.boundaries.corporateSSOIntegrated===false&&
    intake.boundaries.signedImmutableAuditTrailImplemented===false,'no_live_private_platform');
 ck(decisionPolicy.version==='1.3.64'&&decisionPolicy.decisionLanes.length===4&&
    decisionPolicy.trustBoundary.publicAlwaysNoGo===true&&
    decisionPolicy.trustBoundary.documentaryAutoApproval===false&&
    decisionPolicy.trustBoundary.engineeringAutoApproval===false&&
    decisionPolicy.trustBoundary.sapAutoApproval===false&&
    decisionPolicy.trustBoundary.operationsAutoRelease===false,'separate_decision_controls');
 ck(gaps.records.length===10&&gaps.records.filter(x=>x.priority==='P0').length===5&&
    gaps.records.every(x=>x.autoRemapAllowed===false&&x.observedFailures===0),'ten_original_exceptions');
 ck(maturity.summary.candidatePreventiveLinks===115&&maturity.summary.serialOemVerified===0&&
    maturity.summary.fieldConfirmed===0&&maturity.summary.sapMappingsApproved===0,'maturity_unchanged');
 ck(runbook.phases.length===8&&runbook.phases.every(x=>x.gate==='BLOCK'&&x.status==='not_started')&&
    runbook.goNoGo.decision==='NO_GO','eight_private_gates');
 ck(report.schema==='fmea-mining.pm-p0-synthetic-evidence-outcomes.v1'&&
    report.version==='1.3.71'&&report.nature==='offline_counterfactual_branch_validation_no_livedata_or_approval','report_identity');
 const s=report.summary;
 ck(s.scenarioTemplates===9&&s.syntheticPilots===2&&s.scenarioPilotEvaluations===18&&
    s.branchOutcomes===9&&s.sapExceptionsStillBlocked===10&&s.privateGatesStillBlocked===8&&s.decision==='NO_GO','expected_counts');
 ck(Object.values(s.outcomeCounts).length===9&&Object.values(s.outcomeCounts).every(x=>x===2),'branch_coverage');
 ck(['realReceivedDocuments','validatedOEMSeries','realFieldTests','actualInspections','confirmedComponentDamages',
   'rootCausesConfirmed','engineeringSignoffs','approvedSAPChanges','operationalReleases','openedWorkOrders'
 ].every(k=>s[k]===0),'no_claim_real_result');
 ck(report.cases.length===18&&new Set(report.cases.map(x=>x.pilotId+'|'+x.scenarioId)).size===18,'cases_unique');
 for(const row of report.cases){
  const pilot=blueprint.pilotCases.find(x=>x.caseId===row.pilotId),fixture=policy.scenarios.find(x=>x.id===row.scenarioId);
  ck(!!pilot&&!!fixture&&row.ruleId===pilot.ruleId&&row.preexistingBlocker===pilot.sourceDocumentaryBlocker&&
     row.branchOutcome===fixture.expect&&row.requiredHumanOwner===policy.humanRouting[row.branchOutcome],'provenance_'+row.pilotId+'_'+row.scenarioId);
  ck(row.scenarioKind==='synthetic_counterfactual_not_field_case'&&
     row.simulatedReceipts.length===5&&row.simulatedReceipts.every(x=>
       ['NOT_SUPPLIED','SYNTHETIC_FIXTURE_ONLY'].includes(x.simulationStatus)&&
       x.authenticCorporateRecord===false&&x.verifiedPrivateRef===null&&
       x.realCustodyValidation===false&&x.actualOEMEffectivity===false),'no_authenticated_receipts_'+row.pilotId+'_'+row.scenarioId);
  ck(row.privateIndependentDecisionOutstanding===true&&
     ['evidenceActuallyReceived','realOEMEffective','technicalDiagnosisConfirmed','rootCauseConfirmed',
      'engineeringApproved','SAPChangeApproved','operationallyReleased','mayOpenWorkOrder','mayPromoteFmea'
     ].every(k=>row[k]===false)&&row.publicDecision==='NO_GO'&&
     JSON.stringify(row.requiredSeparateDecisionLanes)===JSON.stringify(policy.alwaysBlockedDecisions),'no_approval_'+row.pilotId+'_'+row.scenarioId);
 }
 return {status:errors.length?'REJECTED':'NO_GO_SYNTHETIC_BRANCHES',errors,realApprovalAllowed:false};
}
