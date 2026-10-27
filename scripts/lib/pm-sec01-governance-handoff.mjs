/** Offline proposed governance handoff. A role proposal is never corporate authority. */
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const distinct=a=>new Set(a).size===a.length;
const SORT=a=>[...a].sort((x,y)=>String(x).localeCompare(String(y)));
const ALLOWED=["corporate_governance","corporate_project_sponsor","oem_license_custodian",
  "corporate_legal","privacy_data_controller","security_architecture",
  "maintenance_engineering","corporate_records"];
const outcomeOptions=["APPROVED_FOR_RESTRICTED_DESIGN_REVIEW_ONLY","RETURN_FOR_CORRECTION","DECLINED","MORE_EVIDENCE_REQUIRED"];
const streams=["sponsor_and_scope","oem_license","privacy_and_data"];
export function buildSec01GovernanceHandoff({policy,brief,closure,runbook,intake,decisionPolicy,gaps,maturity}){
 const bChecks=new Map(brief.documentaryChecklist.map(x=>[x.id,x]));
 const bStreams=new Map(brief.reviewStreams.map(x=>[x.streamId,x]));
 const roles=policy.roles.map(r=>({roleId:r.id,functionLabel:r.label,
   proposedOnly:true,corporateRoleHolderIdentified:false,
   appointmentDocumentVerified:false,authorizedSigner:false}));
 const raciRows=policy.raci.map(r=>{
   const source=bChecks.get(r.checkId);
   if(!source)throw Error("orphan_raci_check_"+r.checkId);
   return {checkId:r.checkId,stream:source.stream,
     evidenceQuestion:source.reviewQuestion,privateProofRequired:source.requiredPrivateProof,
     A:r.A,R:[...r.R],C:[...r.C],I:[...r.I],
     accountabilityIsProposal:true,corporateRoleAssignmentConfirmed:false,
     documentationReceived:false,realApprovalRecorded:false,
     state:"PROPOSED_NO_CORPORATE_ASSIGNMENT"};
 });
 const decisionRegister=policy.decisions.map(d=>{
   if(!bStreams.has(d.stream)||!bChecks.has(d.anchorCheckId))throw Error("unknown_decision_anchor_"+d.decisionId);
   const unresolved=raciRows.filter(r=>r.stream===d.stream).map(r=>r.checkId);
   return {decisionId:d.decisionId,stream:d.stream,
     requestedHumanDecision:d.requestedHumanDecision,
     proposedAccountableRole:d.proposedAccountableRole,
     anchorCheckId:d.anchorCheckId,unresolvedCheckIds:unresolved,
     reasonsToReturn:d.holdConditions,availablePrivateOutcomes:[...d.outcomeOptions],
     actualDecision:null,authorizedSigner:null,privateDecisionRef:null,decisionTimestamp:null,
     documentaryReviewComplete:false,legalOrPrivacyFindingEstablished:false,
     state:"PENDING_PRIVATE_GOVERNANCE_RECORD",decision:"NO_GO"};
 });
 const acceptanceMatrix=policy.acceptanceConditions.map(x=>({
   conditionId:x.id,stream:x.stream,
   governedCheckIds:[...x.checkIds],
   privateEvidenceToRequest:x.privateAcceptanceEvidence,
   validatedPrivateEvidence:false,independentCorporateAssessorAssigned:false,
   trustedDecisionAuthenticated:false,publicCheckResult:"NOT_EVALUATED_IN_CORPORATE_ENV",
   decision:"NO_GO"
 }));
 const agenda=policy.agenda.map(x=>({...x,realMeetingScheduled:false,
   corporateAttendeesInvited:false,minutesRecorded:false,
   realDecisionTaken:false}));
 const missingPrivateRequestQueue=raciRows.map(x=>({
   requestId:x.checkId,stream:x.stream,proposedAccountableRole:x.A,
   requiredEvidenceDescription:x.privateProofRequired,
   corporateReference:null,documentationSupplied:false,
   legallyReviewed:false,decisionRecorded:false,status:"UNREQUESTED_PRIVATELY"
 }));
 return {
   schema:"fmea-mining.pm-sec01-governance-handoff.v1",version:policy.version,
   nature:"public_proposed_raci_and_blank_decisions_no_corporate_workflow_execution",
   sourceVersions:{brief:brief.version,closure:closure.version,runbook:runbook.version,
     intake:intake.version,decisionPolicy:decisionPolicy.version,maturity:maturity.version},
   summary:{proposedRoleFunctions:roles.length,raciActivities:raciRows.length,
     proposedAccountables:raciRows.length,decisionTopics:decisionRegister.length,
     acceptanceConditions:acceptanceMatrix.length,
     meetingAgendaItems:agenda.length,missingPrivateRequests:missingPrivateRequestQueue.length,
     realRoleAssignments:0,realDecisionsTaken:0,corporateMeetingsHeld:0,
     signedAcceptanceConditions:0,realDocumentsReceived:0,
     gatesBlocked:runbook.phases.length,originalSapExceptionsBlocked:gaps.records.length,
     engineeringApprovals:0,SAPChanges:0,workOrders:0,operationalReleases:0,decision:"NO_GO"},
   scope:policy.scope,raciRoles:roles,raciRows,decisionRegister,
   acceptanceMatrix,agenda,missingPrivateRequestQueue,
   protectedBoundaries:{realSignatoryIdentity:null,corporateMeetingDate:null,
     actualCorporateDecision:null,sponsorshipConfirmed:false,OEMLicenseVerified:false,
     privacyAndDPIAApproved:false,SEC01GateApproved:false,subsequentGateID02Approved:false,
     actualPilotAuthorized:false,corporateStorageProvisioned:false,liveSAPIntegrated:false,
     engineeringReviewCompleted:false,operationsReleaseGranted:false,
     corporateWorkflowExecuted:false,publicDecision:"NO_GO"},
   nextPrivateAction:"CONFIRM_ACCOUNTABLE_ROLES_AND_SCHEDULE_SEC01_CORPORATE_REVIEW_PRIVATELY",
   state:"NO_GO_REQUEST_NOT_SENT"
 };
}
export function assessSec01GovernanceHandoff(input,report){
 const {policy,brief,closure,runbook,intake,decisionPolicy,gaps,maturity}=input;
 const errors=[],ck=(x,k)=>{if(!x)errors.push(k)};
 let expected;try{expected=buildSec01GovernanceHandoff(input)}
 catch(e){return {status:"REJECTED",errors:["build_"+e.message]}};
 ck(equal(expected,report),"derivation_drift");
 ck(policy.schema==="fmea-mining.pm-sec01-governance-handoff-policy.v1"&&policy.version==="1.3.74"&&
    policy.predecessor==="1.3.73"&&policy.scope==="request_private_restricted_design_review_only","policy_scope");
 ck(policy.purpose.length>100&&Object.keys(policy.raciSemantics).join("|")==="A|R|C|I","raci_legend");
 ck(policy.roles.length===8&&distinct(policy.roles.map(x=>x.id))&&
    equal(policy.roles.map(x=>x.id),ALLOWED)&&
    policy.roles.every(x=>x.label.length>10&&x.realPersonAssigned===false&&x.corporateRoleVerified===false),"role_allowlist");
 ck(brief.version==="1.3.73"&&brief.summary.documentaryChecks===9&&
    brief.summary.reviewStreams===3&&brief.summary.privateGateAttestations===0&&
    brief.summary.privateSubmissionsMade===0&&brief.summary.overallGatesBlocked===8&&
    brief.decision==="NO_GO_PUBLIC_PACKAGE_ONLY"&&
    brief.scopeBoundary.grantedDecision===false&&
    brief.reviewStreams.every(x=>x.ownerAssignedInRealOrganization===false)&&
    brief.documentaryChecklist.every(x=>x.approvalSignaturePresent===false&&x.evidenceActuallyReceived===false),
    "brief_remains_proposal");
 ck(policy.raci.length===9&&distinct(policy.raci.map(x=>x.checkId))&&
    equal(SORT(policy.raci.map(x=>x.checkId)),SORT(brief.documentaryChecklist.map(x=>x.id)))&&
    policy.raci.every(r=>{
      const found=brief.documentaryChecklist.find(x=>x.id===r.checkId);
      const all=[r.A,...r.R,...r.C,...r.I];
      return found&&ALLOWED.includes(r.A)&&r.R.length>=1&&r.C.length>=1&&r.I.length>=1&&
        distinct(all)&&all.every(x=>ALLOWED.includes(x))&&r.proposedOnly===true&&
        r.corporateAssignmentRecorded===false;
    }),"no_fake_raci");
 ck(policy.decisions.length===3&&distinct(policy.decisions.map(x=>x.decisionId))&&
    equal(policy.decisions.map(x=>x.stream),streams)&&
    policy.decisions.every(d=>policy.raci.find(r=>r.checkId===d.anchorCheckId)?.A===d.proposedAccountableRole&&
      brief.documentaryChecklist.find(x=>x.id===d.anchorCheckId)?.stream===d.stream&&
      d.requestedHumanDecision.length>50&&d.holdConditions.length>70&&
      equal(d.outcomeOptions,outcomeOptions)&&d.actualDecision===null&&
      d.actualSignatory===null&&d.authorizedRoleVerified===false&&
      d.corporateDecisionRecord===null&&d.reviewedOn===null),"unapproved_decisions");
 ck(policy.acceptanceConditions.length===3&&
    equal(policy.acceptanceConditions.map(x=>x.stream),streams)&&
    policy.acceptanceConditions.every(x=>{
     const expectedChecks=brief.documentaryChecklist.filter(c=>c.stream===x.stream).map(c=>c.id);
     return x.checkIds.length===3&&equal(x.checkIds,expectedChecks)&&
       x.privateAcceptanceEvidence.length>36&&x.satisfied===false&&x.corporateVerification===null;
    }),"acceptance_criteria");
 ck(policy.agenda.length===4&&policy.agenda.every((x,i)=>x.sequence===i+1&&x.objective.length>55)&&
    equal(policy.agenda.slice(0,3).map(x=>x.decisionId),policy.decisions.map(x=>x.decisionId))&&
    policy.agenda[3].decisionId===null,"unheld_meeting_agenda");
 ck(policy.gateDecisionPreconditions.length===6&&distinct(policy.gateDecisionPreconditions)&&
    policy.persistentDisposition==="NO_GO_UNTIL_PRIVATE_CORPORATE_REVIEW"&&
    Object.values(policy.safeHandoffRules).every(x=>x===true),"mandatory_signoff_preconditions");
 ck(closure.version==="1.3.72"&&closure.summary.privateGatesBlocked===8&&
    closure.summary.privateGatesVerified===0&&closure.summary.originalSapExceptionBlocks===10&&
    closure.summary.overallDecision==="NO_GO","prior_closure_no_go");
 ck(runbook.version==="1.3.62"&&runbook.phases.length===8&&runbook.phases.every(x=>
    x.gate==="BLOCK"&&x.status==="not_started"&&x.decisionToken===null)&&
    runbook.goNoGo.realPilotAllowed===false&&runbook.goNoGo.decision==="NO_GO"&&
    runbook.infrastructureState.realCasesAccepted===0,"all_eight_gates_blocked");
 ck(intake.version==="1.3.61"&&intake.boundaries.privateStorageImplemented===false&&
    intake.boundaries.corporateSSOIntegrated===false&&intake.boundaries.publicRepoMayAcceptRealCases===false,
    "no_corporate_ingest");
 ck(decisionPolicy.version==="1.3.64"&&decisionPolicy.trustBoundary.publicAlwaysNoGo===true&&
    decisionPolicy.trustBoundary.engineeringAutoApproval===false&&decisionPolicy.trustBoundary.sapAutoApproval===false&&
    decisionPolicy.trustBoundary.operationsAutoRelease===false,"separate_governance");
 ck(gaps.records.length===10&&gaps.records.every(x=>x.autoRemapAllowed===false&&x.observedFailures===0),
    "ten_sap_blocks");
 ck(maturity.summary.candidatePreventiveLinks===115&&maturity.summary.serialOemVerified===0&&
    maturity.summary.fieldConfirmed===0&&maturity.summary.sapMappingsApproved===0,"no_maturity_fabrication");
 ck(report.schema==="fmea-mining.pm-sec01-governance-handoff.v1"&&
    report.nature==="public_proposed_raci_and_blank_decisions_no_corporate_workflow_execution"&&
    report.version==="1.3.74","report_identity");
 const s=report.summary;
 ck(s.proposedRoleFunctions===8&&s.raciActivities===9&&s.proposedAccountables===9&&
    s.decisionTopics===3&&s.acceptanceConditions===3&&s.meetingAgendaItems===4&&
    s.missingPrivateRequests===9&&s.gatesBlocked===8&&s.originalSapExceptionsBlocked===10&&
    s.decision==="NO_GO","report_totals");
 ck(["realRoleAssignments","realDecisionsTaken","corporateMeetingsHeld","signedAcceptanceConditions",
    "realDocumentsReceived","engineeringApprovals","SAPChanges","workOrders","operationalReleases"
   ].every(x=>s[x]===0),"zero_corporate_reality");
 ck(report.raciRoles.length===8&&report.raciRoles.every(x=>
    x.proposedOnly===true&&x.corporateRoleHolderIdentified===false&&
    x.appointmentDocumentVerified===false&&x.authorizedSigner===false),"blank_role_assignments");
 ck(report.raciRows.length===9&&report.raciRows.every(x=>x.accountabilityIsProposal===true&&
    x.corporateRoleAssignmentConfirmed===false&&x.documentationReceived===false&&
    x.realApprovalRecorded===false&&x.state==="PROPOSED_NO_CORPORATE_ASSIGNMENT"),"no_preassigned_accountability");
 ck(report.decisionRegister.length===3&&report.decisionRegister.every(x=>
    x.unresolvedCheckIds.length===3&&x.availablePrivateOutcomes.length===4&&
    x.actualDecision===null&&x.authorizedSigner===null&&x.privateDecisionRef===null&&
    x.decisionTimestamp===null&&x.documentaryReviewComplete===false&&
    x.legalOrPrivacyFindingEstablished===false&&x.state==="PENDING_PRIVATE_GOVERNANCE_RECORD"&&x.decision==="NO_GO"),
    "blank_decision_records");
 ck(report.acceptanceMatrix.length===3&&report.acceptanceMatrix.every(x=>
    x.governedCheckIds.length===3&&x.validatedPrivateEvidence===false&&
    x.independentCorporateAssessorAssigned===false&&x.trustedDecisionAuthenticated===false&&
    x.publicCheckResult==="NOT_EVALUATED_IN_CORPORATE_ENV"&&x.decision==="NO_GO"),"acceptance_not_assessed");
 ck(report.agenda.length===4&&report.agenda.every(x=>x.realMeetingScheduled===false&&
    x.corporateAttendeesInvited===false&&x.minutesRecorded===false&&x.realDecisionTaken===false),
    "meeting_not_fabricated");
 ck(report.missingPrivateRequestQueue.length===9&&report.missingPrivateRequestQueue.every(x=>
    x.corporateReference===null&&x.documentationSupplied===false&&x.legallyReviewed===false&&
    x.decisionRecorded===false&&x.status==="UNREQUESTED_PRIVATELY"),"no_private_requests_sent");
 ck(report.protectedBoundaries.realSignatoryIdentity===null&&
    report.protectedBoundaries.corporateMeetingDate===null&&
    report.protectedBoundaries.actualCorporateDecision===null&&
    Object.entries(report.protectedBoundaries).filter(([k])=>!["realSignatoryIdentity","corporateMeetingDate","actualCorporateDecision","publicDecision"].includes(k))
      .every(([,v])=>v===false)&&report.protectedBoundaries.publicDecision==="NO_GO","no_gate_promotion");
 ck(report.nextPrivateAction==="CONFIRM_ACCOUNTABLE_ROLES_AND_SCHEDULE_SEC01_CORPORATE_REVIEW_PRIVATELY"&&
    report.state==="NO_GO_REQUEST_NOT_SENT","no_auto_submission");
 return {status:errors.length?"REJECTED":"NO_GO_PUBLIC_RACI_HANDOFF",errors,corporateApprovalGranted:false};
}
