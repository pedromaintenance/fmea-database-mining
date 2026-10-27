#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {buildPmFunctionalReconciliation,assessPmFunctionalReconciliation} from './lib/pm-functional-reconciliation.mjs';
import {buildPmP0StagedTriage,assessPmP0StagedTriage} from './lib/pm-p0-staged-triage.mjs';
import {buildPmFunctionalReviewWorkpacks,assessPmFunctionalReviewWorkpacks} from './lib/pm-functional-review-workpacks.mjs';
import {buildPmP0DiscriminativeEvidence,assessPmP0DiscriminativeEvidence} from './lib/pm-p0-discriminative-evidence.mjs';
import {buildPmP0PilotEvidenceBlueprints,assessPmP0PilotEvidenceBlueprints} from './lib/pm-p0-evidence-pilot-blueprints.mjs';
import {buildSyntheticP0EvidenceOutcomes,assessSyntheticP0EvidenceOutcomes,classifySyntheticP0Scenario} from './lib/pm-p0-synthetic-evidence-outcomes.mjs';
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
const assessment=assessSyntheticP0EvidenceOutcomes(evidenceInputs,result);
const errors=[...assessment.errors],attacks=[],branchFixtures=[];
const upstream=assessPmP0PilotEvidenceBlueprints(blueprintInputs,blueprint);
if(upstream.status!=='NO_GO_PUBLIC_PILOT_BLUEPRINT')errors.push('upstream_blueprint_invalid_'+upstream.status);
function attack(name,modify){
 const input=clone(evidenceInputs),out=clone(result);
 try{modify(input,out)}catch(e){errors.push('invalid_test_mutation_'+name+'_'+e.message);return}
 let rejected=false;try{rejected=assessSyntheticP0EvidenceOutcomes(input,out).status==='REJECTED'}catch(e){rejected=true}
 attacks.push({name,rejected});
 if(!rejected)errors.push('mutation_accepted_'+name);
}
function probe(name,fields,expected){
 const observed=classifySyntheticP0Scenario(fields,evidenceInputs.policy.inputEnums);
 branchFixtures.push({name,expected,observed,passed:expected===observed});
 if(observed!==expected)errors.push('classifier_fail_'+name);
}
for(const f of evidenceInputs.policy.scenarios){
 probe('baseline_'+f.id,f.fields,f.expect);
}
const p=clone(evidenceInputs.policy.scenarios.find(x=>x.id==='apparently_favorable').fields);
const altered=(k,v)=>({...p,[k]:v});
probe('unknown_property',{...p,assetTag:'040-000'},'REJECT_UNSUPPORTED_SYNTHETIC_INPUT');
probe('missing_property',Object.fromEntries(Object.entries(p).filter(([k])=>k!=='observation')),'REJECT_UNSUPPORTED_SYNTHETIC_INPUT');
probe('bad_enum',altered('provenance','CORPORATE_VERIFIED'),'REJECT_UNSUPPORTED_SYNTHETIC_INPUT');
probe('numeric_observation',altered('observation',2),'REJECT_UNSUPPORTED_SYNTHETIC_INPUT');
probe('nil_input',null,'REJECT_UNSUPPORTED_SYNTHETIC_INPUT');
probe('array_input',[],'REJECT_UNSUPPORTED_SYNTHETIC_INPUT');
probe('invalid_overrules_favorable',altered('provenance','invalid'),'REJECT_UNTRUSTED_EVIDENCE');
probe('wrong_oem_overrules_favorable',altered('applicability','mismatch'),'REJECT_WRONG_APPLICABILITY');
probe('no_asset_even_if_favorable',altered('identity','missing'),'REQUEST_IDENTITY');
probe('counterevidence_required',altered('counterevidence','missing'),'REQUEST_COUNTEREVIDENCE');
probe('measurement_quality_required',altered('methodQuality','unreliable'),'HOLD_METROLOGY_REVIEW');
probe('ambiguous_observation',altered('observation','nondiscriminating'),'HOLD_INCONCLUSIVE');
probe('favorable_still_unapproved',p,'HOLD_PRIVATE_INDEPENDENT_REVIEW');
probe('conflict_beats_bad_metrology',{...p,methodQuality:'unreliable',counterevidence:'conflicting'},'HOLD_CONFLICTING_EVIDENCE');
probe('unknown_oem_even_if_favorable',altered('applicability','unknown'),'REQUEST_DOCUMENTATION');
probe('no_receipts',altered('receiptMode','none'),'REQUEST_DOCUMENTATION');
probe('partial_receipts',altered('receiptMode','partial'),'REQUEST_DOCUMENTATION');
probe('synthetic_source_no_provenance',altered('provenance','not_provided'),'REQUEST_DOCUMENTATION');
const first=r=>r.cases[0], last=r=>r.cases.at(-1);
attack('fabricated_engineering_signoff',(_,r)=>first(r).engineeringApproved=true);
attack('fabricated_SAP_change',(_,r)=>first(r).SAPChangeApproved=true);
attack('fabricated_ops_release',(_,r)=>first(r).operationallyReleased=true);
attack('fabricated_root_cause',(_,r)=>first(r).rootCauseConfirmed=true);
attack('fabricated_diagnostic_confirmation',(_,r)=>first(r).technicalDiagnosisConfirmed=true);
attack('faked_OEM_series',(_,r)=>first(r).realOEMEffective=true);
attack('faked_evidence_received',(_,r)=>first(r).evidenceActuallyReceived=true);
attack('faked_work_order',(_,r)=>first(r).mayOpenWorkOrder=true);
attack('faked_FMEA_promotion',(_,r)=>first(r).mayPromoteFmea=true);
attack('private_review_skipped',(_,r)=>first(r).privateIndependentDecisionOutstanding=false);
attack('public_GO',(_,r)=>first(r).publicDecision='GO');
attack('wrong_pilot',(_,r)=>first(r).pilotId='ACTUAL-EQUIPMENT');
attack('wrong_rule',(_,r)=>first(r).ruleId='other');
attack('rule_blocker_removed',(_,r)=>first(r).preexistingBlocker='cleared');
attack('scenario_unknown',(_,r)=>first(r).scenarioId='manual_approved');
attack('branch_mutated',(_,r)=>first(r).branchOutcome='AUTO_APPROVE');
attack('apparently_favorable_promoted',(_,r)=>r.cases.find(x=>x.scenarioId==='apparently_favorable').branchOutcome='APPROVE_ENGINEERING');
attack('counterevidence_skipped',(_,r)=>r.cases.find(x=>x.scenarioId==='counterevidence_absent').branchOutcome='HOLD_PRIVATE_INDEPENDENT_REVIEW');
attack('trusted_receipt_fake',(_,r)=>first(r).simulatedReceipts[0].authenticCorporateRecord=true);
attack('custody_fake',(_,r)=>first(r).simulatedReceipts[0].realCustodyValidation=true);
attack('OEM_effectivity_fake',(_,r)=>first(r).simulatedReceipts[0].actualOEMEffectivity=true);
attack('private_receipt_fake',(_,r)=>first(r).simulatedReceipts[0].verifiedPrivateRef='PRIVATE-URL');
attack('real_source_status_fake',(_,r)=>first(r).simulatedReceipts[0].simulationStatus='VERIFIED_REAL');
attack('omit_receipt',(_,r)=>first(r).simulatedReceipts.pop());
attack('remove_hypothesis',(_,r)=>first(r).relatedHypothesisIds.pop());
attack('remove_decision_lane',(_,r)=>first(r).requiredSeparateDecisionLanes.pop());
attack('swap_owner',(_,r)=>first(r).requiredHumanOwner='OPEN_AI_AUTO_APPROVER');
attack('duplicate_case',(_,r)=>r.cases.push(clone(first(r))));
attack('remove_case',(_,r)=>r.cases.pop());
attack('source_case_counterfeit',(i)=>i.blueprint.pilotCases[0].actualAssetTag='ACTUAL-EQUIPMENT');
attack('source_case_real_evidence',(i)=>i.blueprint.pilotCases[0].actualEvidenceCount=1);
attack('source_case_approved',(i)=>i.blueprint.pilotCases[0].decisionLanes[0].signatureVerified=true);
attack('source_SAP_exception_unblocked',(i)=>i.gaps.records[0].autoRemapAllowed=true);
attack('source_OEM_maturity_unblocked',(i)=>i.maturity.summary.serialOemVerified=1);
attack('source_private_gate_unblocked',(i)=>i.runbook.phases[0].gate='GO');
attack('source_live_storage_claim',(i)=>i.intake.boundaries.privateStorageImplemented=true);
attack('source_eng_autoreview_enabled',(i)=>i.decisionPolicy.trustBoundary.engineeringAutoApproval=true);
attack('fake_summary_SAP_approvals',(_,r)=>r.summary.approvedSAPChanges=1);
attack('fake_summary_eng',(_,r)=>r.summary.engineeringSignoffs=1);
attack('fake_summary_field',(_,r)=>r.summary.realFieldTests=1);
attack('fake_summary_receipts',(_,r)=>r.summary.realReceivedDocuments=1);
attack('fake_summary_open_workorder',(_,r)=>r.summary.openedWorkOrders=1);
attack('summary_pretends_GO',(_,r)=>r.summary.decision='GO');
attack('summary_branch_dropped',(_,r)=>r.summary.outcomeCounts.REQUEST_IDENTITY=1);
attack('summary_omits_case',(_,r)=>r.summary.scenarioPilotEvaluations=17);
attack('policy_allow_live',(i)=>i.policy.safetyAndGovernance.noLiveExternalAction=false);
attack('policy_allow_FMEA_promotion',(i)=>i.policy.safetyAndGovernance.noDiagnosisOrRootCausePromotion=false);
attack('policy_autosap',(i)=>i.policy.safetyAndGovernance.noSAPChange=false);
attack('policy_bypass_field_gate',(i)=>i.policy.safetyAndGovernance.noOperationalRelease=false);
attack('policy_removed_fixture',(i)=>i.policy.scenarios.pop());
attack('policy_added_unknown_fixture',(i)=>i.policy.scenarios.push({...i.policy.scenarios[0],id:'unrecognized'}));
attack('policy_downgrade_favorable',(i)=>i.policy.scenarios.find(x=>x.id==='apparently_favorable').expect='APPROVE');
attack('policy_fake_auto_role',(i)=>i.policy.humanRouting.HOLD_PRIVATE_INDEPENDENT_REVIEW='software_auto_approver');
attack('policy_ignore_unknown_fields',(i)=>i.policy.safetyAndGovernance.rejectUnexpectedFields=false);
attack('policy_enum_expanded',(i)=>i.policy.inputEnums.identity.push('REAL_VERIFIED'));
attack('policy_remove_SAP_lane',(i)=>i.policy.alwaysBlockedDecisions.splice(1,1));
attack('policy_remove_receipt_kind',(i)=>i.policy.intakeKinds.pop());
attack('policy_priority_reordered',(i)=>i.policy.priorityOfEvaluation.reverse());
attack('policy_scenario_input_changed',(i)=>i.policy.scenarios[0].fields.identity='synthetic_candidate');
const audit={status:errors.length?'FAIL':'OK',branchProbes:branchFixtures.length,
 probesPassing:branchFixtures.filter(x=>x.passed).length,
 adversarialMutations:attacks.length,rejected:attacks.filter(x=>x.rejected).length,
 branchFixtures,attacks,errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-p0-synthetic-evidence-outcomes.generated.json'),JSON.stringify({...result,audit},null,2)+'\n');
console.log(JSON.stringify({status:audit.status,summary:result.summary,
 probes:audit.branchProbes,probesPassing:audit.probesPassing,adversarialMutations:audit.adversarialMutations,
 rejected:audit.rejected,errors},null,2));
process.exit(errors.length?1:0);
