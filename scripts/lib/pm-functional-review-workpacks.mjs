/** Deterministic workpack classification from pre-existing public PM reconciliation. */
const cmp=(a,b)=>String(a).localeCompare(String(b));
const sort=a=>[...a].sort(cmp);
const pri=p=>p==='P0'?0:p==='P1'?1:2;
const requireUnique=(arr,key)=>new Set(arr.map(x=>x[key])).size===arr.length;
export function buildPmFunctionalReviewWorkpacks({policy,reconciliation,seeds,gaps,maturity,staged}){
 const bySeed=new Map(seeds.records.map(x=>[x.id,x]));
 const byReconciled=new Map(reconciliation.rows.map(x=>[x.ruleId,x]));
 const byGap=new Map(gaps.records.map(x=>[x.ruleId,x]));
 if(!requireUnique(seeds.records,'id')||!requireUnique(reconciliation.rows,'ruleId')||!requireUnique(gaps.records,'ruleId'))
   throw Error('duplicate_input_ids');
 if(seeds.records.length!==reconciliation.rows.length||reconciliation.rows.some(x=>!bySeed.has(x.ruleId)))
   throw Error('missing_seed_or_reconciliation');
 if(gaps.records.some(x=>!bySeed.has(x.ruleId)||!byReconciled.has(x.ruleId)||!policy.blockerRecipes[x.expectedBlocker]))
   throw Error('unknown_exception_or_blocker');
 const exceptions=gaps.records.map(g=>{
   const r=byReconciled.get(g.ruleId),seed=bySeed.get(g.ruleId),recipe=policy.blockerRecipes[g.expectedBlocker];
   if(r.preexistingSapBlocker!==g.expectedBlocker||r.preexistingGapPriority!==g.priority||r.system!==seed.system)
     throw Error('gap_mismatch_'+g.ruleId);
   return {
     exceptionId:'EXC-'+g.ruleId,ruleId:g.ruleId,system:seed.system,
     priorityFromExistingGap:g.priority,blocker:g.expectedBlocker,
     subgroupCandidate:seed.subgroupCode,modelCandidateKeys:sort(seed.models),
     cataloguedRejectedPathInstances:r.counts.subgroupRejectedBySystemOrGroup,
     cataloguedFullFunctionalPaths:r.counts.fullFunctionalPaths,
     actualGeneratedCandidateLinks:r.counts.actualGeneratedLinks,
     sourceRegistryIds:[...g.sourceIds],
     originalNextInspection:g.nextInspection,
     responsibleReviewDiscipline:recipe.discipline,
     minimumEvidenceClasses:[...recipe.evidenceClasses],
     reviewQuestion:recipe.decisionQuestion,forbiddenAssumption:recipe.prohibitedShortcut,
     firstPrivateGate:policy.gates[0],
     evidenceActuallyReceived:false,applicabilityBySerialVerified:false,
     damageOrCauseConfirmed:false,engineeringApproved:false,sapMasterdataApproved:false,
     submittedToSAP:false,operationalRelease:false,decision:'NO_GO_DOCUMENTARY_REVIEW_ONLY'
   };
 }).sort((a,b)=>pri(a.priorityFromExistingGap)-pri(b.priorityFromExistingGap)||cmp(a.system,b.system)||cmp(a.ruleId,b.ruleId));
 const activeCandidateRules=reconciliation.rows.filter(x=>x.className==='STRUCTURAL_CANDIDATES_OEM_UNVERIFIED')
   .map(r=>r.ruleId).sort(cmp);
 const systems=sort(new Set(seeds.records.map(x=>x.system)));
 const familyWorkpacks=systems.map(system=>{
   const rows=reconciliation.rows.filter(x=>x.system===system);
   const here=exceptions.filter(x=>x.system===system);
   const tier=here.some(x=>x.priorityFromExistingGap==='P0')?'P0':
     here.some(x=>x.priorityFromExistingGap==='P1')?'P1':'UNRANKED';
   const refused=rows.reduce((n,x)=>n+x.counts.subgroupRejectedBySystemOrGroup,0);
   const links=rows.reduce((n,x)=>n+x.counts.actualGeneratedLinks,0);
   return {
     workpackId:'FAMILY-'+system,system,existingDocumentaryTier:tier,
     rankByRejectionCount:false,ruleIds:sort(rows.map(x=>x.ruleId)),
     preexistingExceptionIds:sort(here.map(x=>x.exceptionId)),
     structurallyLinkedRules:sort(rows.filter(x=>x.counts.actualGeneratedLinks>0).map(x=>x.ruleId)),
     rejectedPathInstancesByRule:rows.map(x=>({ruleId:x.ruleId,count:x.counts.subgroupRejectedBySystemOrGroup})).sort((a,b)=>cmp(a.ruleId,b.ruleId)),
     totals:{rules:rows.length,exceptionRules:here.length,p0:here.filter(x=>x.priorityFromExistingGap==='P0').length,
       p1:here.filter(x=>x.priorityFromExistingGap==='P1').length,unrankedRules:rows.length-here.length,
       structurallyLinkedRules:rows.filter(x=>x.counts.actualGeneratedLinks>0).length,
       rejectedFunctionalParentPathInstances:refused,structuralCandidateLinkInstances:links},
     nextAction:'PRIVATE_OEM_SAP_HUMAN_REVIEW_ONLY',actualEquipmentValidated:0,workOrdersCreated:0,
     executionAuthorized:false,sapChangesApproved:false,decision:'NO_GO'
   };
 }).sort((a,b)=>pri(a.existingDocumentaryTier)-pri(b.existingDocumentaryTier)||cmp(a.system,b.system));
 const collisionWatchlist=reconciliation.sharedSubgroups.map(c=>({
   subgroupCode:c.subgroupCode,systems:[...c.ruleSystems],
   affectedRules:sort(seeds.records.filter(x=>x.subgroupCode===c.subgroupCode).map(x=>x.id)),
   classification:'SAME_SUBGROUP_STRING_DIFFERENT_PARENT_MUST_CONFIRM_FULL_PATH',
   physicallySameCircuitConfirmed:false,automaticRemapAllowed:false
 })).sort((a,b)=>cmp(a.subgroupCode,b.subgroupCode));
 return {
   schema:'fmea-mining.pm-functional-review-workpacks.v1',
   version:policy.version,
   nature:'public_documentary_triage_not_safety_risk_score_or_approved_work_plan',
   sourceVersions:{reconciliation:reconciliation.version,maturity:maturity.version,staged:staged.version},
   summary:{
     families:familyWorkpacks.length,seedRules:seeds.records.length,
     exceptions:exceptions.length,p0Exceptions:exceptions.filter(x=>x.priorityFromExistingGap==='P0').length,
     p1Exceptions:exceptions.filter(x=>x.priorityFromExistingGap==='P1').length,
     unrankedNonexceptionRules:seeds.records.length-exceptions.length,
     familiesWithP0:familyWorkpacks.filter(x=>x.existingDocumentaryTier==='P0').length,
     familiesWithP1Only:familyWorkpacks.filter(x=>x.existingDocumentaryTier==='P1').length,
     familiesUnranked:familyWorkpacks.filter(x=>x.existingDocumentaryTier==='UNRANKED').length,
     rejectedPathInstances:familyWorkpacks.reduce((n,x)=>n+x.totals.rejectedFunctionalParentPathInstances,0),
     candidateLinkInstances:familyWorkpacks.reduce((n,x)=>n+x.totals.structuralCandidateLinkInstances,0),
     activeCandidateRules:activeCandidateRules.length,sharedSubgroupStrings:collisionWatchlist.length,
     realAssetsMapped:0,OEMSeriesApproved:0,workOrdersCreated:0,engineeringApprovals:0,
     sapChangesApproved:0,operationalReleases:0,publicDecision:'NO_GO'
   },
   familyWorkpacks,exceptions,activeCandidateRules,collisionWatchlist
 };
}
export function assessPmFunctionalReviewWorkpacks(inputs,report){
 const {policy,reconciliation,seeds,gaps,maturity,staged}=inputs;
 const errors=[],ck=(b,id)=>{if(!b)errors.push(id)};
 let expected;try{expected=buildPmFunctionalReviewWorkpacks(inputs)}
 catch(e){return {status:'REJECTED',errors:['build_'+e.message]}};
 ck(JSON.stringify(expected)===JSON.stringify(report),'deterministic_snapshot');
 ck(policy.schema==='fmea-mining.pm-functional-review-workpacks-policy.v1'&&policy.version==='1.3.68'&&policy.predecessor==='1.3.67','policy_id');
 ck(JSON.stringify(policy.documentaryTierOrder)===JSON.stringify(['P0','P1','UNRANKED']),'tier_order');
 ck(Object.keys(policy.blockerRecipes).sort().join('|')==='component_not_registered|damage_cause_not_permitted|subgroup_not_in_scope','blocker_taxonomy');
 ck(Object.values(policy.blockerRecipes).every(x=>x.discipline.length>10&&x.evidenceClasses.length===3&&x.decisionQuestion.length>40&&x.prohibitedShortcut.length>30),'recipe_complete');
 ck(policy.gates.length===6&&policy.gates[0]==='private_model_serial_variant_identity'&&policy.gates[4]==='SAP_masterdata_change_control','gate_sequence');
 ck(Object.values(policy.invariants).every(x=>x===true),'fail_closed_invariants');
 ck(reconciliation.version==='1.3.67'&&reconciliation.summary.seedRules===25&&reconciliation.summary.generatedCandidateLinks===115&&reconciliation.summary.preexistingBlockedExceptions===10&&reconciliation.summary.subgroupPathsRejectedByDifferentFunctionalParent===84&&reconciliation.summary.overallState==='NO_GO','upstream_reconciliation');
 ck(reconciliation.rows.length===25&&reconciliation.sharedSubgroups.length===1,'upstream_rows');
 ck(seeds.records.length===25&&gaps.records.length===10&&gaps.records.every(g=>g.autoRemapAllowed===false&&g.observedFailures===0&&g.status==='bloqueado_aguardando_curadoria'&&g.sourceIds.length>0),'source_gap_blocks');
 ck(maturity.summary.conceptuallyModeled===25&&maturity.summary.sapExceptionsBlocked===10&&maturity.summary.candidatePreventiveLinks===115&&maturity.summary.serialOemVerified===0&&maturity.summary.fieldConfirmed===0&&maturity.summary.sapMappingsApproved===0,'maturity_preserved');
 ck(staged.version==='1.3.66'&&staged.summary.actualAssetsVerified===0&&staged.summary.privateRequestsSent===0&&staged.summary.result==='NO_GO','private_context_not_fabricated');
 ck(report.schema==='fmea-mining.pm-functional-review-workpacks.v1'&&report.version==='1.3.68'&&report.nature==='public_documentary_triage_not_safety_risk_score_or_approved_work_plan','output_identity');
 const s=report.summary;
 ck(s.families===13&&s.seedRules===25&&s.exceptions===10&&s.p0Exceptions===5&&s.p1Exceptions===5&&s.unrankedNonexceptionRules===15&&s.rejectedPathInstances===84&&s.candidateLinkInstances===115&&s.activeCandidateRules===15&&s.sharedSubgroupStrings===1,'summary_reconciled');
 ck(s.familiesWithP0+s.familiesWithP1Only+s.familiesUnranked===13,'family_tier_partition');
 ck(s.realAssetsMapped===0&&s.OEMSeriesApproved===0&&s.workOrdersCreated===0&&s.engineeringApprovals===0&&s.sapChangesApproved===0&&s.operationalReleases===0&&s.publicDecision==='NO_GO','no_false_field_or_sap');
 ck(report.familyWorkpacks.length===13&&report.exceptions.length===10&&report.activeCandidateRules.length===15&&report.collisionWatchlist.length===1,'expected_collections');
 ck(new Set(report.familyWorkpacks.flatMap(x=>x.ruleIds)).size===25&&report.familyWorkpacks.flatMap(x=>x.ruleIds).length===25,'unique_family_partition');
 ck(new Set(report.exceptions.map(x=>x.ruleId)).size===10,'unique_exceptions');
 for(const p of report.familyWorkpacks){
   ck(p.rankByRejectionCount===false&&p.nextAction==='PRIVATE_OEM_SAP_HUMAN_REVIEW_ONLY'&&p.actualEquipmentValidated===0&&p.workOrdersCreated===0&&p.executionAuthorized===false&&p.sapChangesApproved===false&&p.decision==='NO_GO','family_no_go_'+p.system);
   ck(p.totals.rules===p.ruleIds.length&&p.totals.exceptionRules===p.preexistingExceptionIds.length&&p.totals.p0+p.totals.p1===p.totals.exceptionRules&&p.totals.unrankedRules===p.totals.rules-p.totals.exceptionRules,'family_sum_'+p.system);
 }
 for(const e of report.exceptions){
   ck(e.sourceRegistryIds.length>0&&e.modelCandidateKeys.length>0&&e.originalNextInspection.length>35&&e.reviewQuestion.length>40&&e.minimumEvidenceClasses.length===3&&e.firstPrivateGate===policy.gates[0],'exception_evidence_'+e.ruleId);
   ck(e.evidenceActuallyReceived===false&&e.applicabilityBySerialVerified===false&&e.damageOrCauseConfirmed===false&&e.engineeringApproved===false&&e.sapMasterdataApproved===false&&e.submittedToSAP===false&&e.operationalRelease===false&&e.decision==='NO_GO_DOCUMENTARY_REVIEW_ONLY','exception_untouched_'+e.ruleId);
   ck(e.actualGeneratedCandidateLinks===0,'exception_generated_links_'+e.ruleId);
 }
 ck(report.collisionWatchlist[0].subgroupCode==='HSVV'&&report.collisionWatchlist[0].systems.length===2&&report.collisionWatchlist[0].physicallySameCircuitConfirmed===false&&report.collisionWatchlist[0].automaticRemapAllowed===false,'HSVV_risk');
 ck(JSON.stringify(report.activeCandidateRules)===JSON.stringify(reconciliation.rows.filter(x=>x.className==='STRUCTURAL_CANDIDATES_OEM_UNVERIFIED').map(x=>x.ruleId).sort(cmp)),'active_not_approved');
 ck(report.exceptions.every((e,i,arr)=>i===0||pri(arr[i-1].priorityFromExistingGap)<=pri(e.priorityFromExistingGap)),'documentary_sort');
 return {status:errors.length?'REJECTED':'NO_GO_DOCUMENTARY_WORKPACKS',errors,privateApprovalReceived:false,sapChangesAllowed:false,realOperationalActionsAuthorized:false};
}
