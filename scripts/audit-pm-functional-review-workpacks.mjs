#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {buildPmFunctionalReconciliation,assessPmFunctionalReconciliation} from './lib/pm-functional-reconciliation.mjs';
import {buildPmP0StagedTriage,assessPmP0StagedTriage} from './lib/pm-p0-staged-triage.mjs';
import {buildPmFunctionalReviewWorkpacks,assessPmFunctionalReviewWorkpacks} from './lib/pm-functional-review-workpacks.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const seeds=read('data/knowledge/pm-prevention/seed-rules.json');
const gaps=read('data/quality/pm-gap-review.v1.json');
const maturity=read('data/quality/pm-maturity-matrix.v1.json');
const reconInputs={policy:read('data/quality/pm-functional-reconciliation-policy.v1.json'),
 db:read('data/catalog/failure-db.v1.json'),rules:seeds.records,
 links:read('data/knowledge/pm-prevention/generated-links.json').records,gaps,maturity};
const recon=buildPmFunctionalReconciliation(reconInputs);
const stagedInputs={policy:read('data/quality/pm-p0-staged-triage-policy.v1.json'),
 readiness:read('data/quality/pm-p0-investigation-readiness.v1.json'),
 seeds,gaps,maturity,runbook:read('data/governance/pm-private-deployment-runbook.v1.json')};
const staged=buildPmP0StagedTriage(stagedInputs);
const inputs={policy:read('data/quality/pm-functional-review-workpacks-policy.v1.json'),
 reconciliation:recon,seeds,gaps,maturity,staged};
const result=buildPmFunctionalReviewWorkpacks(inputs);
const tested=assessPmFunctionalReviewWorkpacks(inputs,result);
const errors=[...tested.errors],mutations=[],clone=v=>JSON.parse(JSON.stringify(v));
if(assessPmFunctionalReconciliation(reconInputs,recon).status!=='NO_GO_STRUCTURAL_RECONCILIATION')errors.push('upstream_reconciliation_invalid');
if(assessPmP0StagedTriage(stagedInputs,staged).status!=='NO_GO_PUBLIC_STAGED_TRIAGE')errors.push('upstream_staged_invalid');
function attack(id,change){
 const source={
   ...inputs,policy:clone(inputs.policy),reconciliation:clone(inputs.reconciliation),
   seeds:clone(inputs.seeds),gaps:clone(inputs.gaps),
   maturity:clone(inputs.maturity),staged:clone(inputs.staged)
 };
 const changed=clone(result);
 try{change(source,changed)}catch(e){errors.push('test_fixture_failed_'+id+'_'+e.message);return}
 let rejected=false;
 try{rejected=assessPmFunctionalReviewWorkpacks(source,changed).status==='REJECTED'}
 catch(_){rejected=true}
 mutations.push({id,rejected});
 if(!rejected)errors.push('unsafe_mutation_accepted_'+id);
}
const ex=r=>r.exceptions[0],pack=r=>r.familyWorkpacks[0],col=r=>r.collisionWatchlist[0];
attack('public_sap_go',(_,r)=>r.summary.sapChangesApproved=1);
attack('public_eng_go',(_,r)=>r.summary.engineeringApprovals=1);
attack('public_operational_go',(_,r)=>r.summary.operationalReleases=1);
attack('public_work_orders',(_,r)=>r.summary.workOrdersCreated=1);
attack('public_real_assets',(_,r)=>r.summary.realAssetsMapped=1);
attack('public_OEM_effective',(_,r)=>r.summary.OEMSeriesApproved=1);
attack('public_GO_decision',(_,r)=>r.summary.publicDecision='GO');
attack('summary_loses_rejected_paths',(_,r)=>r.summary.rejectedPathInstances=0);
attack('summary_loses_links',(_,r)=>r.summary.candidateLinkInstances=0);
attack('summary_relabels_P0',(_,r)=>r.summary.p0Exceptions=0);
attack('summary_omits_P1',(_,r)=>r.summary.p1Exceptions=0);
attack('summary_invents_families',(_,r)=>r.summary.families=14);
attack('summary_moves_existing_links',(_,r)=>r.summary.activeCandidateRules=14);
attack('summary_incorrect_family_partition',(_,r)=>r.summary.familiesWithP0=12);
attack('family_operational_go',(_,r)=>pack(r).decision='GO');
attack('family_authorized_execution',(_,r)=>pack(r).executionAuthorized=true);
attack('family_SAP_mapping_go',(_,r)=>pack(r).sapChangesApproved=true);
attack('family_claim_real_asset',(_,r)=>pack(r).actualEquipmentValidated=1);
attack('family_claim_OS',(_,r)=>pack(r).workOrdersCreated=1);
attack('family_ranks_by_false_safety',(_,r)=>pack(r).rankByRejectionCount=true);
attack('family_wrong_rejection_count',(_,r)=>pack(r).totals.rejectedFunctionalParentPathInstances++);
attack('family_wrong_candidate_count',(_,r)=>pack(r).totals.structuralCandidateLinkInstances++);
attack('family_loses_rule',(_,r)=>pack(r).ruleIds.pop());
attack('family_forgets_existing_exception',(_,r)=>r.familyWorkpacks.find(x=>x.preexistingExceptionIds.length).preexistingExceptionIds.pop());
attack('family_changes_tier',(_,r)=>r.familyWorkpacks.find(x=>x.existingDocumentaryTier==='P0').existingDocumentaryTier='UNRANKED');
attack('family_fake_next_action',(_,r)=>pack(r).nextAction='EXECUTE_WORK_ORDER');
attack('family_duplicate',(_,r)=>r.familyWorkpacks.push(clone(pack(r)));
attack('family_remove',(_,r)=>r.familyWorkpacks.pop());
attack('exception_identity_drift',(_,r)=>ex(r).ruleId='UNKNOWN');
attack('exception_wrong_system',(_,r)=>ex(r).system='freios');
attack('exception_priority_cherry_pick',(_,r)=>ex(r).priorityFromExistingGap='P1');
attack('exception_wrong_blocker',(_,r)=>ex(r).blocker='NONE');
attack('exception_no_sources',(_,r)=>ex(r).sourceRegistryIds=[]);
attack('exception_zero_models',(_,r)=>ex(r).modelCandidateKeys=[]);
attack('exception_missing_recipe',(_,r)=>ex(r).minimumEvidenceClasses.pop());
attack('exception_abbreviated_review_question',(_,r)=>ex(r).reviewQuestion='Approved');
attack('exception_original_request_lost',(_,r)=>ex(r).originalNextInspection='NA');
attack('exception_OEM_installed',(_,r)=>ex(r).applicabilityBySerialVerified=true);
attack('exception_fake_evidence',(_,r)=>ex(r).evidenceActuallyReceived=true);
attack('exception_fake_damage',(_,r)=>ex(r).damageOrCauseConfirmed=true);
attack('exception_eng_sign',(_,r)=>ex(r).engineeringApproved=true);
attack('exception_SAP_approve',(_,r)=>ex(r).sapMasterdataApproved=true);
attack('exception_SAP_sent',(_,r)=>ex(r).submittedToSAP=true);
attack('exception_operations_release',(_,r)=>ex(r).operationalRelease=true);
attack('exception_unlock_decision',(_,r)=>ex(r).decision='GO');
attack('exception_insert',(_,r)=>r.exceptions.push(clone(ex(r)));
attack('exception_remove',(_,r)=>r.exceptions.pop());
attack('collision_same_circuit_inferred',(_,r)=>col(r).physicallySameCircuitConfirmed=true);
attack('collision_SAP_auto_remap',(_,r)=>col(r).automaticRemapAllowed=true);
attack('collision_wrong_subgroup',(_,r)=>col(r).subgroupCode='COMR');
attack('collision_remove_system',(_,r)=>col(r).systems.pop());
attack('collision_remove_watchlist',(_,r)=>r.collisionWatchlist.pop());
attack('active_candidate_promoted',(_,r)=>r.activeCandidateRules.push('fuel-filter-contamination'));
attack('policy_automatic_SAP_allowed',(i)=>i.policy.invariants.noAutoSAPChange=false);
attack('policy_count_paths_as_machines',(i)=>i.policy.invariants.countPathsNotMachines=false);
attack('policy_scores_risk_by_counts',(i)=>i.policy.invariants.noRiskScoreFromRejections=false);
attack('policy_changes_tiers',(i)=>i.policy.documentaryTierOrder=['P1','P0','UNRANKED']);
attack('policy_removes_blocker_recipe',(i)=>delete i.policy.blockerRecipes.subgroup_not_in_scope);
attack('policy_skips_private_identity',(i)=>i.policy.gates.shift());
attack('source_existing_gap_unblocked',(i)=>i.gaps.records[0].autoRemapAllowed=true);
attack('source_priority_tampered',(i)=>i.gaps.records[0].priority='P3');
attack('source_omits_gap',(i)=>i.gaps.records.pop());
attack('source_recon_omits_rejection',(i)=>i.reconciliation.summary.subgroupPathsRejectedByDifferentFunctionalParent=0);
attack('source_maturity_false_field',(i)=>i.maturity.summary.fieldConfirmed=1);
attack('source_maturity_SAP_approved',(i)=>i.maturity.summary.sapMappingsApproved=1);
attack('source_staged_real_asset',(i)=>i.staged.summary.realAssetsVerified=1);
const audit={status:errors.length?'FAIL':'OK',assessment:tested.status,mutationCount:mutations.length,mutationsRejected:mutations.filter(x=>x.rejected).length,mutations,errors};
const report={...result,audit};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/pm-functional-review-workpacks.generated.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:audit.status,summary:result.summary,
 queuePreview:result.exceptions.map(x=>({id:x.ruleId,priority:x.priorityFromExistingGap,system:x.system,blocker:x.blocker})),
 familyPreview:result.familyWorkpacks.map(x=>({system:x.system,tier:x.existingDocumentaryTier,exceptions:x.totals.exceptionRules,rejectedPaths:x.totals.rejectedFunctionalParentPathInstances})),
 adversarialTests:audit.mutationCount,rejected:audit.mutationsRejected,errors},null,2));
process.exit(errors.length?1:0);
