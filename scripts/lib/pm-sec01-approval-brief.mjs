/** Public SEC-01 governance brief: requirements, not approval or private intake. */
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const exactKeys=(a,keys)=>a&&typeof a==='object'&&!Array.isArray(a)&&
 Object.keys(a).length===keys.length&&keys.every(k=>Object.hasOwn(a,k));
const fields=['sponsor','license','privacy','boundary'];
export function classifySec01Synthetic(fieldsValue,enums){
 if(!exactKeys(fieldsValue,fields)||!exactKeys(enums,fields)||!fields.every(k=>enums[k].includes(fieldsValue[k])))
  return 'REJECT_UNSUPPORTED_SYNTHETIC_INPUT';
 if(fieldsValue.boundary==='public_raw_evidence')return 'REJECT_PUBLIC_EVIDENCE_ROUTE';
 if(fieldsValue.license==='incompatible')return 'REJECT_OEM_USAGE_SCOPE';
 if(fieldsValue.sponsor==='missing')return 'REQUEST_FORMAL_SPONSORSHIP';
 if(fieldsValue.sponsor==='scope_undefined')return 'REQUEST_SCOPE_REDEFINITION';
 if(fieldsValue.license==='not_reviewed')return 'HOLD_OEM_LICENSE_REVIEW';
 if(fieldsValue.privacy==='not_reviewed')return 'HOLD_PRIVACY_ASSESSMENT';
 return 'HOLD_PRIVATE_CORPORATE_ATTESTATION';
}
export function buildSec01ApprovalBrief({policy,runbook,closure,intake,restrictedDesign,gaps,maturity}){
 const gate=runbook.phases.find(x=>x.id==='SEC-01');
 const upstream=closure.gateRegister.find(x=>x.gateId==='SEC-01');
 if(!gate||!upstream)throw Error('missing_SEC_01');
 const checks=policy.checks.map(x=>({
   id:x.id,stream:x.stream,reviewQuestion:x.reviewQuestion,
   requiredPrivateProof:x.privateProofRequired,
   evidenceActuallyReceived:false,licensingAuthenticityVerified:false,
   authorizedReviewerVerified:false,approvalSignaturePresent:false,
   state:'MISSING_PRIVATE_ATTESTATION',decision:'NO_GO'
 }));
 const streams=policy.streams.map(x=>({
   streamId:x.id,label:x.label,suggestedReviewFunction:x.suggestedReviewFunction,
   traceableRunbookArtifact:x.evidenceAnchor,
   requestChecks:checks.filter(c=>c.stream===x.id).map(c=>c.id),
   requiredCheckCount:checks.filter(c=>c.stream===x.id).length,
   currentState:'PENDING_CORPORATE_REVIEW',ownerAssignedInRealOrganization:false,
   submittedToGovernance:false,completedPrivateReviews:0,decision:'NO_GO'
 }));
 const syntheticCases=policy.scenarios.map(s=>{
   const route=classifySec01Synthetic(s.fields,policy.inputEnums);
   if(route==='REJECT_UNSUPPORTED_SYNTHETIC_INPUT')throw Error('invalid_scenario_'+s.id);
   return {
     scenarioId:s.id,syntheticConditions:{...s.fields},recommendedPrivateReviewRoute:route,
     possibleOwnerFunction:policy.routing[route],
     acceptedCorporateDocuments:0,realSignerAuthenticated:false,
     corporateDecisionNotified:false,privateSubmissionPerformed:false,
     legalAssessmentPerformed:false,OEMRightsApproved:false,
     securitySponsorshipApproved:false,privacyBasisApproved:false,
     gateClosed:false,realPilotAuthorized:false,decision:'NO_GO'
   };
 });
 return {
   schema:'fmea-mining.pm-sec01-approval-brief.v1',version:policy.version,
   nature:'public_nonbinding_governance_request_not_lawyer_review_or_corporate_signoff',
   sourceVersions:{runbook:runbook.version,closure:closure.version,
     intake:intake.version,restrictedDesign:restrictedDesign.version,maturity:maturity.version},
   summary:{
     firstGateId:gate.id,reviewStreams:streams.length,
     documentaryChecks:checks.length,pendingPrivateChecks:checks.length,
     exampleCounterfactuals:syntheticCases.length,uniqueRouteClasses:new Set(syntheticCases.map(x=>x.recommendedPrivateReviewRoute)).size,
     privateGateAttestations:0,corporateSponsorsVerified:0,OEMLicensesValidated:0,
     privacyAssessmentsValidated:0,privateSubmissionsMade:0,
     downstreamGatesBlocked:runbook.phases.length-1,
     overallGatesBlocked:runbook.phases.length,
     otherSapExceptionsBlocked:gaps.records.length,realPilotsApproved:0,approvedSAPChanges:0,
     rootCausesConfirmed:0,operationsReleased:0,publicDecision:'NO_GO'
   },
   runbook:{gateId:gate.id,name:gate.name,ownerRole:gate.owner,prerequisites:[...gate.prerequisites],
     requiredArtifacts:[...gate.requiredArtifacts],publicGateState:gate.gate,
     privateDecisionToken:null,upstreamCorporateAttestation:upstream.corporateAttestationReceived},
   scopeBoundary:{requestedDecision:policy.decisionInterpretation.signoffScope,
     grantedDecision:false,privateSecurityApproval:false,privatePrivacyApproval:false,
     licensedOEMReproductionApproval:false,legalDPIADeterminationReceived:false,
     nextDownstreamGate:'ID-02',
     downstreamPilotAuthorized:false,authorizationToUseRealData:false,
     releaseOfEquipmentAuthorized:false},
   reviewStreams:streams,documentaryChecklist:checks,
   syntheticDecisionDrills:syntheticCases,
   nextStep:'REQUEST_CORPORATE_SPONSOR_PRIVACY_AND_OEM_LICENSING_REVIEW_PRIVATELY',
   decision:'NO_GO_PUBLIC_PACKAGE_ONLY'
 };
}
export function assessSec01ApprovalBrief(input,report){
 const {policy,runbook,closure,intake,restrictedDesign,gaps,maturity}=input;
 const errors=[],ck=(truth,id)=>{if(!truth)errors.push(id)};
 let expected;try{expected=buildSec01ApprovalBrief(input)}
 catch(e){return {status:'REJECTED',errors:['build_'+e.message]}};
 ck(eq(expected,report),'derived_report_immutable');
 ck(policy.schema==='fmea-mining.pm-sec01-approval-brief-policy.v1'&&policy.version==='1.3.73'&&policy.predecessor==='1.3.72','policy_version');
 ck(policy.requiredGateId==='SEC-01'&&policy.requiredGateName==='Patrocinio, licença e DPIA'&&
    policy.requiredRunbookOwner==='seguranca_privacidade_e_governanca','runbook_gate_identity');
 ck(policy.purpose.length>70,'policy_purpose');
 ck(policy.streams.length===3&&new Set(policy.streams.map(s=>s.id)).size===3&&
    policy.streams.every(s=>s.label.length>8&&s.suggestedReviewFunction.length>20&&s.evidenceAnchor.length>22),'review_functions');
 ck(eq(policy.streams.map(x=>x.evidenceAnchor),runbook.phases.find(x=>x.id==='SEC-01')?.requiredArtifacts),'source_artifacts_not_rewritten');
 ck(policy.checks.length===9&&new Set(policy.checks.map(x=>x.id)).size===9&&
    policy.streams.every(s=>policy.checks.filter(x=>x.stream===s.id).length===3)&&
    policy.checks.every(x=>x.reviewQuestion.length>65&&x.privateProofRequired.length>35),'nine_private_requirements');
 ck(policy.scenarios.length===7&&new Set(policy.scenarios.map(x=>x.id)).size===7&&
    policy.scenarios.every(x=>x.expected===classifySec01Synthetic(x.fields,policy.inputEnums)&&
       Object.hasOwn(policy.routing,x.expected)),'seven_branch_drills');
 ck(eq(Object.keys(policy.inputEnums),fields)&&
    eq(policy.inputEnums.sponsor,['missing','scope_undefined','synthetic_defined'])&&
    eq(policy.inputEnums.license,['not_reviewed','incompatible','synthetic_compatible'])&&
    eq(policy.inputEnums.privacy,['not_reviewed','synthetic_assessed'])&&
    eq(policy.inputEnums.boundary,['private_only','public_raw_evidence']),'restricted_enums');
 ck(Object.keys(policy.routing).length===7&&policy.routing.HOLD_PRIVATE_CORPORATE_ATTESTATION==='seguranca_privacidade_e_governanca','human_routing');
 ck(policy.decisionInterpretation.publicDecision==='NO_GO'&&
    policy.decisionInterpretation.corporateSignatureStatus==='NOT_RECEIVED'&&
    policy.decisionInterpretation.signoffScope==='restricted_design_authorization_request_only_not_pilot_approval'&&
    ['downstreamGatesRemainBlocked','privateEvidenceMustNeverEnterPublicGitHub',
      'hypotheticalApprovalIsNotVerified','legalOrRegulatoryConclusionNotAutomated'].every(k=>policy.decisionInterpretation[k]===true),'no_legal_conclusion');
 ck(Object.values(policy.invariants).every(x=>x===true),'fail_closed_governance');
 ck(runbook.version==='1.3.62'&&runbook.phases.length===8&&
    runbook.phases.every(p=>p.gate==='BLOCK'&&p.status==='not_started'&&p.decisionToken===null)&&
    runbook.goNoGo.decision==='NO_GO'&&runbook.goNoGo.realPilotAllowed===false&&
    runbook.infrastructureState.securityApproved===false&&
    runbook.infrastructureState.privacyApproved===false&&runbook.infrastructureState.realCasesAccepted===0,'upstream_private_deployment_blocked');
 ck(closure.version==='1.3.72'&&closure.summary.specifiedGateDefinitions===8&&
    closure.summary.privateGatesBlocked===8&&closure.summary.privateGatesVerified===0&&
    closure.summary.unverifiedCheckInstances===68&&closure.summary.offlineScenarioEvaluations===18&&
    closure.summary.originalSapExceptionBlocks===10&&closure.summary.overallDecision==='NO_GO'&&
    closure.gateRegister.every(g=>g.decision==='NO_GO'&&g.corporateAttestationReceived===false&&g.approvedForRealPilot===false),'corporate_closure_not_attested');
 ck(intake.version==='1.3.61'&&intake.boundaries.privateStorageImplemented===false&&
    intake.boundaries.publicRepoMayAcceptRealCases===false&&
    intake.boundaries.corporateSSOIntegrated===false,'no_real_intake');
 ck(restrictedDesign.version==='1.3.24'&&restrictedDesign.privacyAndRights.licenseForOEMRequired===true&&
    restrictedDesign.privacyAndRights.dataControllerApprovalRequired===true&&
    restrictedDesign.privacyAndRights.noRawEvidenceInPublicGitHub===true,'license_privacy_boundary');
 ck(gaps.records.length===10&&gaps.records.every(x=>x.autoRemapAllowed===false&&x.observedFailures===0),'sap_exceptions_stay_blocked');
 ck(maturity.summary.candidatePreventiveLinks===115&&maturity.summary.serialOemVerified===0&&
    maturity.summary.fieldConfirmed===0&&maturity.summary.sapMappingsApproved===0,'no_maturity_promotion');
 ck(report.schema==='fmea-mining.pm-sec01-approval-brief.v1'&&report.version==='1.3.73'&&
    report.nature==='public_nonbinding_governance_request_not_lawyer_review_or_corporate_signoff','report_identity');
 const s=report.summary;
 ck(s.firstGateId==='SEC-01'&&s.reviewStreams===3&&s.documentaryChecks===9&&s.pendingPrivateChecks===9&&
    s.exampleCounterfactuals===7&&s.uniqueRouteClasses===7&&
    s.downstreamGatesBlocked===7&&s.overallGatesBlocked===8&&
    s.otherSapExceptionsBlocked===10&&s.publicDecision==='NO_GO','fixed_counts');
 ck(['privateGateAttestations','corporateSponsorsVerified','OEMLicensesValidated',
    'privacyAssessmentsValidated','privateSubmissionsMade','realPilotsApproved',
    'approvedSAPChanges','rootCausesConfirmed','operationsReleased'].every(k=>s[k]===0),'no_real_signoff');
 ck(report.runbook.gateId==='SEC-01'&&report.runbook.prerequisites.length===0&&
    report.runbook.requiredArtifacts.length===3&&
    report.runbook.publicGateState==='BLOCK'&&report.runbook.privateDecisionToken===null&&
    report.runbook.upstreamCorporateAttestation===false,'gate_provenance');
 ck(report.reviewStreams.length===3&&report.reviewStreams.every(x=>
    x.requestChecks.length===3&&x.requiredCheckCount===3&&
    x.currentState==='PENDING_CORPORATE_REVIEW'&&x.ownerAssignedInRealOrganization===false&&
    x.submittedToGovernance===false&&x.completedPrivateReviews===0&&x.decision==='NO_GO'),'review_lanes_not_executed');
 ck(report.documentaryChecklist.length===9&&report.documentaryChecklist.every(x=>
    x.evidenceActuallyReceived===false&&x.licensingAuthenticityVerified===false&&
    x.authorizedReviewerVerified===false&&x.approvalSignaturePresent===false&&
    x.state==='MISSING_PRIVATE_ATTESTATION'&&x.decision==='NO_GO'),'document_checklist_no_evidence');
 ck(report.syntheticDecisionDrills.length===7&&report.syntheticDecisionDrills.every(x=>
    ['acceptedCorporateDocuments','realSignerAuthenticated','corporateDecisionNotified',
      'privateSubmissionPerformed','legalAssessmentPerformed','OEMRightsApproved',
      'securitySponsorshipApproved','privacyBasisApproved','gateClosed','realPilotAuthorized']
     .every(k=>x[k]===0||x[k]===false)&&x.decision==='NO_GO'),'synthetic_drills_no_approvals');
 ck(report.scopeBoundary.grantedDecision===false&&report.scopeBoundary.privateSecurityApproval===false&&
    report.scopeBoundary.privatePrivacyApproval===false&&
    report.scopeBoundary.licensedOEMReproductionApproval===false&&
    report.scopeBoundary.legalDPIADeterminationReceived===false&&
    report.scopeBoundary.downstreamPilotAuthorized===false&&
    report.scopeBoundary.authorizationToUseRealData===false&&
    report.scopeBoundary.releaseOfEquipmentAuthorized===false&&
    report.scopeBoundary.nextDownstreamGate==='ID-02','scope_cannot_escalate');
 ck(report.nextStep==='REQUEST_CORPORATE_SPONSOR_PRIVACY_AND_OEM_LICENSING_REVIEW_PRIVATELY'&&
    report.decision==='NO_GO_PUBLIC_PACKAGE_ONLY','only_request_not_grant');
 return {status:errors.length?'REJECTED':'NO_GO_SEC01_REQUEST_PACKAGE',errors,realGateApproved:false};
}
