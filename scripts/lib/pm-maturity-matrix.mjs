/** Derived read-only maturity matrix. No FMEA or SAP approval is performed here. */
export function buildMaturityMatrix({ontology,rules,gaps,exceptions,sources,policy}) {
 const rows=[],sourceSet=new Set(sources.sources.map(x=>x.id));
 const bundles=new Map(ontology.bundles.map(x=>[x.ruleId,x]));
 const gapMap=new Map(gaps.records.map(x=>[x.ruleId,x]));
 const gateMap=new Map(exceptions.records.map(x=>[x.ruleId,x]));
 for(const seed of [...rules.records].sort((a,b)=>a.id.localeCompare(b.id,"en"))){
  const b=bundles.get(seed.id);if(!b)throw Error("Missing bundle "+seed.id);
  if(!b.sourceIds?.length||b.sourceIds.some(id=>!sourceSet.has(id)))throw Error("Source integrity "+seed.id);
  const gap=gapMap.get(seed.id)||null,ex=gateMap.get(seed.id)||null;
  if(Boolean(gap)!==Boolean(ex))throw Error("Gap evidence mismatch "+seed.id);
  const blocked=Boolean(gap);
  const scope={
    ruleId:seed.id,system:seed.system,subgroupCode:seed.subgroupCode,partText:seed.partText,modelCandidates:[...seed.models],
    bundleId:b.id,sourceIds:[...b.sourceIds],referenceCount:b.sourceIds.length,
    candidateConditions:b.conditionIds.length,candidateActions:b.actionIds.length,candidateDamages:b.differentialDamageIds.length
  };
  rows.push({...scope,
   maturity:"conceptual_pending_OEM_field_SAP_review",
   gates:{semanticModel:"modeled_unvalidated",sourceTraceability:"catalogued_not_serial_effective",
      serialBOM:"pending",fieldDiscrimination:"not_recorded",
      damageCause:"not_confirmed",
      sapMapping:blocked?"blocked_pending_curatorship":"not_approved_no_recorded_exception",
      independentReview:"not_recorded"},
   sap:{isBlocked:blocked,blocker:gap?.expectedBlocker??null,
      priorityFromRepo:gap?.priority??null,exceptionStatus:gap?.status??null,
      autoRemapAllowed:false,reviewedByEngineering:false,
      minimumEvidence:ex?[...ex.minimumEvidence]:[],
      requiredSubgroup:ex?.requiredSubgroup??null,
      requestedDamageId:seed.damageId,requestedCauseId:seed.causeId,
      approvedLocationId:null,approvedComponentCode:null,
      reviewDiscipline:blocked?policy.blockerOwners[gap.expectedBlocker]:policy.defaultReviewDiscipline},
   nextDecision:blocked?"resolve_registered_SAP_exception_with_OEM_and_evidence":"verify_serial_BOM_and_gather_discriminative_evidence",
   fieldObservations:0,performedActions:0,confirmedDamages:0,approvedSapMappings:0
  });
 }
 const reviewQueue=rows.filter(x=>x.sap.isBlocked).sort((a,b)=>a.sap.priorityFromRepo.localeCompare(b.sap.priorityFromRepo)||a.ruleId.localeCompare(b.ruleId)).map(x=>({ruleId:x.ruleId,priority:x.sap.priorityFromRepo,blocker:x.sap.blocker,reviewDiscipline:x.sap.reviewDiscipline,minimumEvidence:[...x.sap.minimumEvidence]}));
 const unranked=rows.filter(x=>!x.sap.isBlocked).map(x=>x.ruleId);
 const summary={seedRules:rules.records.length,conceptuallyModeled:rows.length,conceptualCoveragePercent:100,serialOemVerified:0,fieldConfirmed:0,engineeringApprovalsRecorded:0,sapMappingsApproved:0,sapExceptionsBlocked:reviewQueue.length,documentedP0:reviewQueue.filter(x=>x.priority==="P0").length,documentedP1:reviewQueue.filter(x=>x.priority==="P1").length,withoutDocumentedPriority:unranked.length,publicOrGenericReferenceLinkages:rows.reduce((n,x)=>n+x.referenceCount,0),candidatePreventiveLinks:policy.acceptanceCriteria.expectedCandidateLinks};
 return {schema:"fmea-mining.pm-maturity-matrix.v1",version:policy.version,ontologyVersion:ontology.version,asOfDate:policy.reviewDate,nature:"repository_evidence_status_not_asset_homologation",method:"deterministic_read_only_join_of_PM_seeds_bundles_sources_SAP_gaps_and_exception_gates",summary,reviewQueue,unrankedRules:unranked,rules:rows};
}
