#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {buildPmFunctionalReconciliation,assessPmFunctionalReconciliation} from './lib/pm-functional-reconciliation.mjs';
import {buildPmP0StagedTriage,assessPmP0StagedTriage} from './lib/pm-p0-staged-triage.mjs';
import {buildPmFunctionalReviewWorkpacks,assessPmFunctionalReviewWorkpacks} from './lib/pm-functional-review-workpacks.mjs';
import {buildPmP0DiscriminativeEvidence,assessPmP0DiscriminativeEvidence} from './lib/pm-p0-discriminative-evidence.mjs';
import {buildPmP0PilotEvidenceBlueprints,assessPmP0PilotEvidenceBlueprints} from './lib/pm-p0-evidence-pilot-blueprints.mjs';
import {buildSyntheticP0EvidenceOutcomes,assessSyntheticP0EvidenceOutcomes} from './lib/pm-p0-synthetic-evidence-outcomes.mjs';
import {buildCorporateReadinessClosure,assessCorporateReadinessClosure} from './lib/pm-corporate-readiness-closure.mjs';
import {buildSec01ApprovalBrief,assessSec01ApprovalBrief} from './lib/pm-sec01-approval-brief.mjs';
import {buildSec01GovernanceHandoff,assessSec01GovernanceHandoff} from './lib/pm-sec01-governance-handoff.mjs';
import {buildSec01DecisionRequest,assessSec01DecisionRequest,routeSyntheticSec01Response} from './lib/pm-sec01-decision-request.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const clone=x=>JSON.parse(JSON.stringify(x));
const seeds=read('data/knowledge/pm-prevention/seed-rules.json'),gaps=read('data/quality/pm-gap-review.v1.json');
const maturity=read('data/quality/pm-maturity-matrix.v1.json'),runbook=read('data/governance/pm-private-deployment-runbook.v1.json');
const reconIn={policy:read('data/quality/pm-functional-reconciliation-policy.v1.json'),
 db:read('data/catalog/failure-db.v1.json'),rules:seeds.records,
 links:read('data/knowledge/pm-prevention/generated-links.json').records,gaps,maturity};
const reconciliation=buildPmFunctionalReconciliation(reconIn);
const stagedIn={policy:read('data/quality/pm-p0-staged-triage-policy.v1.json'),
 readiness:read('data/quality/pm-p0-investigation-readiness.v1.json'),
 seeds,gaps,maturity,runbook};
const staged=buildPmP0StagedTriage(stagedIn);
const workIn={policy:read('data/quality/pm-functional-review-workpacks-policy.v1.json'),
 reconciliation,seeds,gaps,maturity,staged};
const workpacks=buildPmFunctionalReviewWorkpacks(workIn);
const diffIn={policy:read('data/quality/pm-p0-discriminative-evidence-policy.v1.json'),
 originalPolicy:read('data/quality/pm-p0-investigation-readiness-policy.v1.json'),
 readiness:stagedIn.readiness,workpacks,gaps,maturity};
const differentials=buildPmP0DiscriminativeEvidence(diffIn);
const inputs={
 policy:read('data/governance/pm-p0-evidence-pilot-blueprints-policy.v1.json'),
 differentials,intake:read('data/governance/pm-evidence-intake-policy.v1.json'),
 reviewPolicy:read('data/governance/pm-review-decision-policy.v1.json'),
 reviewPacket:read('data/quality/pm-review-decision-packet.v1.json'),
 preflight:read('data/quality/pm-pilot-preflight.v1.json'),gaps,maturity,runbook
};
const blueprint=buildPmP0PilotEvidenceBlueprints(inputs);
const blueprintInputs=inputs;

const evidenceInputs={policy:read('data/quality/pm-p0-synthetic-evidence-outcomes-policy.v1.json'),
 blueprint,intake:blueprintInputs.intake,decisionPolicy:blueprintInputs.reviewPolicy,
 gaps,maturity,runbook};
const result=buildSyntheticP0EvidenceOutcomes(evidenceInputs);

const corporateInputs={policy:read('data/governance/pm-corporate-readiness-closure-policy.v1.json'),
 runbook,scenarios:result,blueprint,readiness:stagedIn.readiness,
 reviewPacket:blueprintInputs.reviewPacket,intake:blueprintInputs.intake,
 decisionPolicy:blueprintInputs.reviewPolicy,gaps,maturity};
const snapshot=buildCorporateReadinessClosure(corporateInputs);

const secInputs={policy:read('data/governance/pm-sec01-approval-brief-policy.v1.json'),
 runbook,closure:snapshot,intake:blueprintInputs.intake,
 restrictedDesign:read('data/governance/restricted-infrastructure-design.v1.json'),
 gaps,maturity};

const brief=buildSec01ApprovalBrief(secInputs);
const handoffInputs={policy:read('data/governance/pm-sec01-governance-handoff-policy.v1.json'),
 brief,closure:snapshot,runbook,
 intake:blueprintInputs.intake,decisionPolicy:blueprintInputs.reviewPolicy,gaps,maturity};

const handoff=buildSec01GovernanceHandoff(handoffInputs);
const reviewInputs={policy:read("data/governance/pm-sec01-decision-request-policy.v1.json"),
 handoff,brief,runbook,closure:snapshot,gaps,maturity};
const out=buildSec01DecisionRequest(reviewInputs);
const initial=assessSec01DecisionRequest(reviewInputs,out);
const errors=[...initial.errors],probes=[],adversarial=[];
const predecessors=[
 ["handoff",assessSec01GovernanceHandoff(handoffInputs,handoff).status],
 ["brief",assessSec01ApprovalBrief(secInputs,brief).status],
 ["corporate",assessCorporateReadinessClosure(corporateInputs,snapshot).status],
 ["scenarios",assessSyntheticP0EvidenceOutcomes(evidenceInputs,result).status],
 ["pilot",assessPmP0PilotEvidenceBlueprints(blueprintInputs,blueprint).status],
 ["differentials",assessPmP0DiscriminativeEvidence(diffIn,differentials).status],
 ["workpacks",assessPmFunctionalReviewWorkpacks(workIn,workpacks).status],
 ["staged",assessPmP0StagedTriage(stagedIn,staged).status],
 ["reconciliation",assessPmFunctionalReconciliation(reconIn,reconciliation).status]
];
for(const [id,status] of predecessors)if(!status.startsWith("NO_GO_"))errors.push("upstream_invalid_"+id+"_"+status);
const ids=reviewInputs.policy.decisionIds;
const base=Object.fromEntries(ids.map(id=>[id,"APPROVED_FOR_RESTRICTED_DESIGN_REVIEW_ONLY"]));
function probe(id,v,expected){
 const actual=routeSyntheticSec01Response(v,reviewInputs.policy);
 probes.push({id,expected,actual,pass:expected===actual});
 if(actual!==expected)errors.push("probe_failed_"+id);
}
for(const s of reviewInputs.policy.scenarios)
 probe(s.id,Object.fromEntries(ids.map((id,i)=>[id,s.outcomes[i]])),s.expected);
probe("all_positive_is_not_go",base,"HOLD_INDEPENDENT_CORPORATE_ATTESTATION");
probe("null_input",null,"REJECT_UNSUPPORTED_PUBLIC_INPUT");
probe("array_input",[],"REJECT_UNSUPPORTED_PUBLIC_INPUT");
probe("blank_input",{},"REJECT_UNSUPPORTED_PUBLIC_INPUT");
probe("unexpected_signer",{...base,realSigner:"SYNTHETIC"},"REJECT_UNSUPPORTED_PUBLIC_INPUT");
probe("missing_privacy",Object.fromEntries(ids.slice(0,2).map(x=>[x,base[x]])),"REJECT_UNSUPPORTED_PUBLIC_INPUT");
probe("fake_unbounded_go",{...base,[ids[0]]:"OPERATIONS_GO"},"REJECT_UNSUPPORTED_PUBLIC_INPUT");
probe("invalid_numeric",{...base,[ids[2]]:3},"REJECT_UNSUPPORTED_PUBLIC_INPUT");
probe("decline_overrides_all",{...base,[ids[1]]:"DECLINED"},"STOP_AND_RETURN_FOR_HUMAN_RESCOPING");
probe("decline_beats_correction",{...base,[ids[0]]:"RETURN_FOR_CORRECTION",[ids[1]]:"DECLINED"},"STOP_AND_RETURN_FOR_HUMAN_RESCOPING");
probe("correction_beats_more_evidence",{...base,[ids[0]]:"RETURN_FOR_CORRECTION",[ids[1]]:"MORE_EVIDENCE_REQUIRED"},"RETURN_FOR_CORRECTION");
probe("more_evidence_beats_wait",{...base,[ids[1]]:"MORE_EVIDENCE_REQUIRED",[ids[2]]:"NOT_REVIEWED"},"REQUEST_PRIVATE_EVIDENCE");
probe("no_review_beats_all_approved",{...base,[ids[0]]:"NOT_REVIEWED"},"PENDING_HUMAN_DECISIONS");
function attack(id,fn){
 const inCopy=clone(reviewInputs),report=clone(out);
 try{fn(inCopy,report)}catch(e){errors.push("fixture_"+id+"_"+e.message);return}
 let rejected=false;
 try{rejected=assessSec01DecisionRequest(inCopy,report).status==="REJECTED"}catch(e){rejected=true}
 adversarial.push({id,rejected});if(!rejected)errors.push("unsafe_promotion_"+id);
}
attack("force_public_GO",(_,o)=>o.gateDecision="GO");
attack("declare_sent",(_,o)=>o.publicWorkflow="SENT");
attack("claim_real_submission",(_,o)=>o.summary.realSubmissions=1);
attack("claim_corporate_review",(_,o)=>o.summary.realCorporateDecisions=3);
attack("invent_SAP_update",(_,o)=>o.summary.SAPUpdates=1);
attack("invent_OS",(_,o)=>o.summary.createdOrders=1);
attack("invent_ops_release",(_,o)=>o.summary.operationsReleased=1);
attack("invent_pilot_approval",(_,o)=>o.summary.approvedPilots=1);
attack("fake_gate_unblocked",(_,o)=>o.summary.privateGatesBlocked=0);
attack("hide_SAP_exception",(_,o)=>o.summary.sapExceptionsBlocked=0);
attack("false_owner_appointment",(_,o)=>o.summary.realOwnerAppointments=1);
attack("false_doc_received",(_,o)=>o.summary.realReceivedDocuments=1);
attack("false_sig_count",(_,o)=>o.summary.validCorporateSignatures=1);
attack("fake_review_decision",(_,o)=>o.decisions[0].corporateDecision="APPROVED_FOR_RESTRICTED_DESIGN_REVIEW_ONLY");
attack("fake_signatory",(_,o)=>o.decisions[0].verifiedSigner="CEO");
attack("fake_decision_ref",(_,o)=>o.decisions[0].privateRecordPointer="VAULT-URL");
attack("fake_decision_time",(_,o)=>o.decisions[0].decisionTimestamp="2026-10-27");
attack("fake_decision_submitted",(_,o)=>o.decisions[0].submitted=true);
attack("fake_review_complete",(_,o)=>o.decisions[0].status="APPROVED");
attack("remove_one_question",(_,o)=>o.decisions.pop());
attack("swap_decision_stream",(_,o)=>o.decisions[0].stream="operations_release");
attack("change_scope_question",(_,o)=>o.decisions[0].requestedQuestion="open real access");
attack("fake_receipt",(_,o)=>o.evidence[0].privateDocumentReceived=true);
attack("fake_custody",(_,o)=>o.evidence[0].custodyVerified=true);
attack("fake_sent_evidence",(_,o)=>o.evidence[0].requestSent=true);
attack("fake_private_receipt_ref",(_,o)=>o.evidence[0].privateRecordRef="private_link");
attack("remove_evidence",(_,o)=>o.evidence.pop());
attack("change_evidence_requirement",(_,o)=>o.evidence[0].requirement="none");
attack("change_outcome",(_,o)=>o.drills[0].proposedHumanRoute="APPROVED");
attack("dryrun_claims_signature",(_,o)=>o.drills[0].verifiedSigner=true);
attack("dryrun_claims_SEC01_GO",(_,o)=>o.drills[0].SEC01GateClosed=true);
attack("dryrun_claims_ID02_GO",(_,o)=>o.drills[0].ID02Enabled=true);
attack("dryrun_claims_operational_release",(_,o)=>o.drills[0].operationalRelease=true);
attack("dryrun_claims_SAP_write",(_,o)=>o.drills[0].SAPWrite=true);
attack("dryrun_claims_real_pilot",(_,o)=>o.drills[0].realPilotAuthorized=true);
attack("dryrun_launders_fake_approval",(_,o)=>o.drills[5].disposition="GO");
attack("dryrun_empty_list",(_,o)=>o.drills.length=0);
attack("memo_excludes_limit",(_,o)=>o.memo=o.memo.replace("**não autoriza**","permite"));
attack("memo_remove_no_go",(_,o)=>o.memo=o.memo.replace("**NO_GO**","GO"));
attack("memo_private_personal_data",(_,o)=>o.memo+="\n### Signatário real: Fulano");
attack("policy_auto_signoff",(i)=>i.policy.safe.noAutomaticCorporateApproval=false);
attack("policy_automatic_gate",(i)=>i.policy.safe.noAutomaticGateChange=false);
attack("policy_ignores_oem_license",(i)=>i.policy.safe.noLicensedOemMaterial=false);
attack("policy_submits_email",(i)=>i.policy.safe.noActualSubmission=false);
attack("policy_accepts_person",(i)=>i.policy.safe.noNamedApprovers=false);
attack("policy_no_privacy",(i)=>i.policy.safe.noDpiaDetermination=false);
attack("policy_change_order",(i)=>i.policy.routingPriority.reverse());
attack("policy_go_scenario",(i)=>i.policy.scenarios[5].expected="GO");
attack("policy_add_real_outcome",(i)=>i.policy.privateOutcomeTokens.push("GO"));
attack("policy_drop_decision",(i)=>i.policy.decisionIds.pop());
attack("policy_drop_evidence",(i)=>i.policy.checkIds.pop());
attack("policy_owner_replaced",(i)=>i.policy.ownerFunctions[0]="robot");
attack("policy_favorable_route_GO",(i)=>i.policy.routingRules.APPROVED_FOR_RESTRICTED_DESIGN_REVIEW_ONLY="GO");
attack("upstream_handoff_pretends_sent",(i)=>i.handoff.missingPrivateRequestQueue[0].status="SUBMITTED");
attack("upstream_handoff_faked_signature",(i)=>i.handoff.decisionRegister[0].authorizedSigner="SIGNER");
attack("upstream_SEC01_signed",(i)=>i.brief.scopeBoundary.grantedDecision=true);
attack("upstream_corporate_GO",(i)=>i.closure.summary.overallDecision="GO");
attack("upstream_runbook_GO",(i)=>i.runbook.phases[0].gate="GO");
attack("upstream_gaps_unblocked",(i)=>i.gaps.records[0].autoRemapAllowed=true);
attack("upstream_maturity_claim",(i)=>i.maturity.summary.fieldConfirmed=1);
const audit={status:errors.length?"FAIL":"OK",
 upstreamAudits:predecessors.length,syntheticProbes:probes.length,
 syntheticProbesPassed:probes.filter(x=>x.pass).length,
 mutations:adversarial.length,rejected:adversarial.filter(x=>x.rejected).length,
 probes,adversarial,errors};
fs.mkdirSync(path.join(root,"reports"),{recursive:true});
fs.writeFileSync(path.join(root,"reports/pm-sec01-decision-request.generated.json"),JSON.stringify({...out,audit},null,2)+"\n");
console.log(JSON.stringify({status:audit.status,summary:out.summary,
 probes:audit.syntheticProbes,passed:audit.syntheticProbesPassed,
 negativeMutations:audit.mutations,rejected:audit.rejected,upstreamAudits:audit.upstreamAudits,errors},null,2));
process.exit(errors.length?1:0);
