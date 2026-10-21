#!/usr/bin/env node
// Auditoria reproduzivel de COBERTURA DO CATALOGO, nao de taxa de falhas reais.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const db=read('data/catalog/failure-db.v1.json');
const pmRules=read('data/knowledge/pm-prevention/seed-rules.json').records;
const pm=read('data/knowledge/pm-prevention/generated-links.json').records;
const playbooks=read('data/knowledge/diagnostic/playbooks.v1.json').records;
const diagnostic=read('data/knowledge/diagnostic/generated-links.json').records;
const annotated=read('data/ontology/playbook-annotations.v1.json').records;
const codes=read('data/knowledge/electronic/code-index.json').records;
const oil=read('data/knowledge/oil/source-cases.json').records;
const ontology=read('data/ontology/concepts.v1.json');
const bibliographicSources=read('data/research/sources.v1.json').sources;
const chains=read('data/knowledge/causal-chains.v1.json').records;
const sapAudit=read('reports/causal-sap-audit.generated.json');
const pmGaps=read('reports/pm-gap-audit.generated.json');
const pmExceptionGates=read('data/quality/pm-exception-evidence-gates.v1.json');
const d9EvidenceIntake=read('data/quality/oem-d9-evidence-intake.v1.json');
const pmExceptionFixtures=read('data/quality/pm-exception-regressions.v1.json');
const semantic=read('data/ontology/condition-action-damage.v1.json');
const semanticFixtures=read('data/quality/semantic-regression-fixtures.v1.json');
const effects=read('data/knowledge/causal-effects.v1.json');
const evidence=read('data/quality/evidence-requirements.v1.json');
const review=read('data/governance/technical-review-register.v1.json');
const evidenceFixtures=read('data/quality/evidence-gate-regressions.v1.json');
const restrictedEvidencePolicy=read('data/governance/restricted-evidence-workflow.v1.json');
const restrictedEvidenceTests=read('data/quality/restricted-evidence-regressions.v1.json');
const restrictedInfrastructure=read('data/governance/restricted-infrastructure-design.v1.json');
const infrastructureCases=read('data/quality/restricted-infrastructure-regressions.v1.json');
const stagingAcceptance=read('data/governance/staging-acceptance-plan.v1.json');
const stagingRegressions=read('data/quality/staging-acceptance-regressions.v1.json');
const stagingAdapterContract=read('data/governance/staging-integration-contract.v1.json');
const stagingAdapterRegressions=read('data/quality/staging-integration-regressions.v1.json');
const privateResultCustody=read('data/governance/private-result-custody-contract.v1.json');
const privateCustodyRegressions=read('data/quality/private-result-custody-regressions.v1.json');
const stagingExceptions=read('data/governance/staging-result-exception-workflow.v1.json');
const stagingExceptionTests=read('data/quality/staging-exception-regressions.v1.json');
const remediationCatalog=read('data/governance/recurrent-remediation-catalog.v1.json');
const remediationRegressions=read('data/quality/recurrent-remediation-regressions.v1.json');
const blockerMatrix=read('data/governance/consolidated-blockers.v1.json');
const blockerFixtures=read('data/quality/consolidated-blocker-regressions.v1.json');
const d9EvidenceRequest=read('data/governance/d9-oem-evidence-request.v1.json');
const d9RequestRegressions=read('data/quality/d9-request-regressions.v1.json');
const d9PublicOemResearch=read('data/research/d9-public-oem-literature.v1.json');
const d9PublicOemRegressions=read('data/quality/d9-public-oem-regressions.v1.json');
const d9ExternalHandoff=read('data/governance/d9-external-handoff.v1.json');
const d9HandoffTests=read('data/quality/d9-handoff-regressions.v1.json');
const differential=read('data/quality/discriminative-tests.v1.json');
const differentialFixtures=read('data/quality/discrimination-regressions.v1.json');
const complementary=read('data/quality/complementary-discrimination.v1.json');
const circularReview=read('data/quality/circular-sap-causality.v1.json');
const oemPilot=read('data/quality/oem-pilot-readiness.v1.json');
const pathways=read('data/quality/diagnostic-pathways.v1.json');
const pathwayFixtures=read('data/quality/pathway-regressions.v1.json');
const pathwayExpansion=read('data/quality/diagnostic-pathway-expansion.v1.json');
const pathwayExpansionFixtures=read('data/quality/pathway-expansion-regressions.v1.json');
const deepdives=read('data/quality/playbook-deepdives.v1.json');
const deepDiveFixtures=read('data/quality/playbook-deepdives-regressions.v1.json');
const deepdivesRemaining=read('data/quality/playbook-deepdives-remaining.v1.json');
const causalCrosswalk=read('data/quality/playbook-causal-crosswalk.v1.json');
const causalGapTriage=read('data/quality/causal-gap-triage.v1.json');
const proposedCausalChains=read('data/quality/proposed-causal-chains.v1.json');
const causalGapFixtures=read('data/quality/causal-gap-triage-regressions.v1.json');
const taxonomyAudit=read('data/quality/proposal-taxonomy-audit.v1.json');
const taxonomyFixtures=read('data/quality/proposal-taxonomy-regressions.v1.json');
const mechanismRefinements=read('data/quality/mechanism-refinements.v1.json');
const mechanismRefinementTests=read('data/quality/mechanism-refinements-regressions.v1.json');
const remainingFixtures=read('data/quality/playbook-deepdives-remaining-regressions.v1.json');
const causalLevels=read('data/ontology/causal-levels.v1.json').records;
const publicManifest=read('reports/public-manifest.v1.json');
const systemicReview=read('data/governance/systemic-root-audit.v1.json');
const publicContract=read('data/governance/public-contract.v1.json');
const publicCompatFixtures=read('data/quality/contract-compatibility-regressions.v1.json');
const publicContentReleases=read('data/governance/public-content-releases.v1.json');
const contentFixtures=read('data/quality/public-content-release-regressions.v1.json');
const byModel=[];
for(const model of db.models){
 const modelId=model.id;
 const locations=db.locations.filter(l=>l.modelo===modelId&&l.profundidade===3);
 const pmLinks=pm.filter(l=>l.modelId===modelId);
 const matchedLocations=new Set(pmLinks.map(l=>l.locationId));
 const modelPlaybooks=playbooks.filter(x=>x.target.modelIds.includes(modelId));
 const diagnosis=diagnostic.filter(x=>x.modelIds.includes(modelId));
 byModel.push({modelId,label:model.label,completePaths:locations.length,
  pathsWithPmCandidates:matchedLocations.size,pmCandidates:pmLinks.length,
  modelPlaybooks:modelPlaybooks.length,playbooksWithCandidates:diagnosis.filter(x=>x.candidateCount>0).length});
}
const foundRules=new Set(pm.map(x=>x.originRule));
const emptyRules=pmRules.filter(r=>!foundRules.has(r.id)).map(r=>({ruleId:r.id,system:r.system,subgroupCode:r.subgroupCode,
 reason:'sem_associacao_estrita; verificar escopo/cadastro/peça/dano/causa'}));
const missingModelPaths=db.models.filter(m=>!byModel.find(x=>x.modelId===m.id)?.completePaths).map(m=>m.id);
const noLinkPlaybooks=diagnostic.filter(x=>x.candidateCount===0).map(x=>x.playbookId);
const counts={
 modelCount:db.models.length,complete3LevelPaths:db.locations.filter(l=>l.profundidade===3).length,
 damageCodes:db.damages.length,causeCodes:db.causes.length,components:new Set(Object.values(db.partsByObjectType).flat().map(p=>p.code)).size,
 pmSeedRules:pmRules.length,pmRulesWithAtLeastOneCandidate:foundRules.size,pmRulesWithoutCandidate:emptyRules.length,
 pmCandidateLinks:pm.length,pathsWithPmCandidate:new Set(pm.map(x=>x.locationId)).size,
 diagnosticPlaybooks:playbooks.length,annotatedPlaybooks:annotated.length,
 playbooksDeepenedThisCycle:deepdivesRemaining.records.length,
 playbooksDeepenedTotal:deepdives.records.length+deepdivesRemaining.records.length,
 playbookCausalCandidateLinks:causalCrosswalk.counts.candidateLinks,
 playbookCausalHypothesesUnmapped:causalCrosswalk.counts.hypothesesWithoutEquivalent,
 playbookCausalApprovedMappings:causalCrosswalk.counts.confirmedMappings,
 causalGapsReviewed:causalGapTriage.records.length,
 candidateMechanicalChainsAwaitingReview:proposedCausalChains.records.length,
 nonFailureClassifications:causalGapTriage.counts.nonFailureInterpretations,
 candidateChainsPromotedToCore:proposedCausalChains.counts.addedToCore,
 candidateTaxonomyReviews:taxonomyAudit.counts.reviewedCandidates,
 candidateTaxonomyMechanismConceptGaps:taxonomyAudit.counts.mechanismOntologyGap,
 candidateTaxonomyMechanismSplits:taxonomyAudit.counts.mechanismsRequiringSplit,
 candidateTaxonomySyntheticTests:taxonomyFixtures.baselineCases.length+taxonomyFixtures.mutationCases.length,
 candidateTaxonomyCorePromotions:taxonomyAudit.counts.approvedCorePromotions,
 proposedMechanismRefinements:mechanismRefinements.records.length,
 restrictedEvidenceWorkflowStages:restrictedEvidencePolicy.stageOrder.length,
 referenceSecurityArchitectureComponents:restrictedInfrastructure.architecture.length,
 referenceRBACRoles:restrictedInfrastructure.roles.length,
 restrictedInfrastructureSyntheticTests:infrastructureCases.authorizationCases.length+infrastructureCases.auditCases.length+infrastructureCases.retentionCases.length,
 stagingAcceptanceDomains:stagingAcceptance.domains.length,
 stagingRequiredControls:stagingAcceptance.domains.reduce((n,d)=>n+d.controls.length,0),
 stagingSyntheticTests:stagingRegressions.fixtures.length+stagingRegressions.mutationCases.length,
 actualStagingExecutions:stagingAcceptance.counts.actualStagingRuns,
 stagingAdapterProbeDefinitions:stagingAdapterContract.probeDefinitions.reduce((sum,d)=>sum+d.probes.length,0),
 stagingAdapterSyntheticRegressions:stagingAdapterRegressions.fixtures.length,
 stagingAdapterLiveImplementations:Object.entries(stagingAdapterContract.implementations).filter(([k,v])=>k!=='offlineMockImplemented'&&v===true).length,
 stagingAdapterRealRuns:stagingAdapterRegressions.counts.realStagingRuns,
 privateResultCustodySyntheticTests:privateCustodyRegressions.baselineCases.length+privateCustodyRegressions.mutationCases.length,
 privateResultCustodyRealCaseRecords:privateResultCustody.boundaries.realPrivateResultRecordsInPublicRepo,
 privateResultCustodyVerifiedLiveAttestations:privateResultCustody.boundaries.actualHumanReviewsCompleted,
 stagingExceptionSyntheticTests:stagingExceptionTests.baselineCases.length+stagingExceptionTests.adversarialCases.length,
 stagingExceptionWorkflowStages:stagingExceptions.states.length,
 stagingExceptionRealCorporateReviews:stagingExceptions.realCorporateReviews,
 stagingExceptionConfirmedMechanicalCauses:stagingExceptions.confirmedMechanicalCauses,
 remediationCatalogueProfiles:remediationCatalog.profiles.length,
 remediationSyntheticRegressionCases:remediationRegressions.baselines.length+remediationRegressions.mutations.length,
 remediationRealCorrectiveActions:remediationCatalog.scope.realCorrectiveActions,
 remediationRealCorporateEscalations:remediationCatalog.scope.realCorporateEscalations,
 consolidatedUnresolvedWorkstreams:blockerMatrix.workstreams.length,
 consolidatedSourceItemCounts:blockerMatrix.workstreams.map(x=>x.sourceItemCount),
 consolidatedBlockerSyntheticTests:blockerFixtures.baselineCases.length+blockerFixtures.mutationCases.length,
 consolidatedActualExternalApprovals:blockerMatrix.overview.approvedItems,
 d9DocumentRequestsPrepared:d9EvidenceRequest.gates.length,
 d9DocumentRequestsActuallySent:d9EvidenceRequest.requestRouting.requestSentAt===null?0:1,
 d9RequestSyntheticRegressions:d9RequestRegressions.baselineCases.length+d9RequestRegressions.mutationCases.length,
 d9FieldReviewsActuallyCompleted:d9EvidenceRequest.counts.actualEquipmentInspections,
 d9PublicCaterpillarSourcesReviewed:d9PublicOemResearch.sources.length,
 d9PublicSourceRequestMappings:d9PublicOemResearch.mappings.length,
 d9PublicOemSyntheticTests:d9PublicOemRegressions.baselineCases.length+d9PublicOemRegressions.mutationCases.length,
 d9PublicOemEffectiveDataConfirmed:d9PublicOemResearch.counts.effectivityVerified,
 d9ExternalHandoffIssue:d9ExternalHandoff.github.issueNumber,
 d9ExternalHandoffOriginalGates:d9ExternalHandoff.originalGateSnapshot.length,
 d9ExternalHandoffSyntheticRegressions:d9HandoffTests.baselineCases.length+d9HandoffTests.mutationCases.length,
 d9ExternalHandoffActualCorporateDispatches:d9ExternalHandoff.routing.requestSent?1:0,
 actualCorporateStagingApprovals:stagingAcceptance.counts.actualCorporateApprovals,
 productionControlsActuallyProvisioned:Object.values(restrictedInfrastructure.deployment).filter(Boolean).length,
 restrictedEvidenceKinds:restrictedEvidencePolicy.evidenceKinds.length,
 restrictedEvidenceSyntheticRegressionCases:restrictedEvidenceTests.cases.length,
 publicRealRestrictedEvidenceCases:restrictedEvidencePolicy.scope.realCasesInPublicRepository,
 proposedHydraulicInternalLeakageMechanisms:mechanismRefinements.counts.internalLeakageCandidates,
 proposedGearDamageSubmodes:mechanismRefinements.counts.gearSubmodes,
 approvedNewMechanismIds:mechanismRefinements.counts.newApprovedMechanismIds,
 mechanismRefinementSyntheticRegressions:mechanismRefinementTests.baselineCases.length+mechanismRefinementTests.mutationCases.length,
 causalGapSyntheticRegressions:causalGapFixtures.decisionCases.length+causalGapFixtures.mutationCases.length,
 playbooksNotDeepenedInThisBatch:deepdives.otherPlaybookIds.length,
 playbookDeepDiveStages:[...deepdives.records,...deepdivesRemaining.records].reduce((n,x)=>n+x.stages.length,0),
 playbookDeepDiveReadinessRequirements:[...deepdives.records,...deepdivesRemaining.records].reduce((n,x)=>n+x.readiness.requires.length,0),
 playbookDeepDiveSyntheticRegressions:deepDiveFixtures.readinessCases.length+deepDiveFixtures.mutationCases.length+remainingFixtures.readinessCases.length+remainingFixtures.mutationCases.length+remainingFixtures.crosswalkMutations.length,
 playbooksWithCandidateLinks:diagnostic.filter(x=>x.candidateCount>0).length,
 playbooksWithoutCandidateLinks:noLinkPlaybooks.length,
 candidatePlaybookLinks:diagnostic.reduce((n,x)=>n+x.candidateCount,0),
 diagnosticCodeIndexEntries:codes.length,oilSimulatorCases:oil.length,
 causalChains:chains.length,causalChainFamilies:new Set(chains.map(x=>x.family)).size,
 suggestedCausalInvestigations:chains.reduce((n,x)=>n+x.investigations.length,0),
 peerReviewedCausalChains:chains.filter(x=>x.review.status==='revisado_por_especialista').length,
 causalChainCoverageByFamily:Object.fromEntries([...new Set(chains.map(x=>x.family))].sort().map(f=>[f,chains.filter(x=>x.family===f).length])),
 causalChainsWithSourcesAndCounterHypotheses:chains.filter(x=>x.sourceClaims.length&&x.competingHypotheses.length>=2).length,
 ontologySymptoms:ontology.symptoms.length,bibliographicSources:bibliographicSources.length,
 semanticConditions:semantic.conditions.length,semanticActions:semantic.actions.length,
 semanticDamageHypotheses:semantic.damageHypotheses.length,
 semanticRuleBundles:semantic.bundles.length,semanticTypedRelations:semantic.relations.length,
 semanticRegressionCases:semanticFixtures.cases.length,
 causalLocalEffects:effects.records.length,causalSystemEffects:effects.records.length,verifiedEffects:0,
 evidenceRequiredTests:evidence.records.length,
 evidencePriorityReviews:evidence.statistics.priorityCases,
 evidenceMetadataDictionaryFields:Object.keys(evidence.methodFieldGlossary).length,
 evidenceGateSyntheticCases:evidenceFixtures.cases.length,
 pendingIndependentReview:review.records.filter(x=>x.reviewDecision==='pending').length,
 confirmedOemEffectiveReviews:0,
 approvedEvidenceBasedDiagnoses:0,
 discriminationPriorityTests:differential.records.length,
 discriminationAlternativesStillOpen:differential.records.reduce((n,x)=>n+x.competingHypothesisAssessments.length,0),
 discriminationComplementaryChecks:differential.records.reduce((n,x)=>n+x.complementaryInvestigations.length,0),
 discriminationSyntheticRegressions:differentialFixtures.cases.length,
 discriminationConfirmedCauses:0,
 complementaryHypothesesReviewed:complementary.records.length,
 complementaryAssessmentCells:complementary.counts.complementAssessments,
 complementaryNotDiscriminating:complementary.records.flatMap(x=>x.complementAssessments).filter(x=>x.discriminativeValue==='nao_discrimina').length,
 complementaryPartial:complementary.records.flatMap(x=>x.complementAssessments).filter(x=>x.discriminativeValue==='indicio_parcial').length,
 complementaryConditional:complementary.records.flatMap(x=>x.complementAssessments).filter(x=>x.discriminativeValue==='potencialmente_discriminante_condicional').length,
 complementaryUnresolvedGaps:complementary.counts.unresolvedGaps,
 circularSapCausalReviews:circularReview.records.length,
 oemPilotMissingRequirements:oemPilot.requiredInputs.filter(x=>x.value===null).length,
 oemPilotsApproved:0,
 reviewedDiagnosticPathways:pathways.records.length+pathwayExpansion.records.length,
 expandedDiagnosticPathways:pathwayExpansion.records.length,
 untouchedOriginalPathways:pathways.records.length,
 proposedPathwaySteps:[...pathways.records,...pathwayExpansion.records].reduce((n,x)=>n+x.steps.length,0),
 distinguishedCausalLevels:pathways.records.length+pathwayExpansion.records.length,
 pathwaySyntheticRegressions:pathwayFixtures.cases.length+pathwayExpansionFixtures.readinessCases.length+pathwayExpansionFixtures.mutationCases.length,
 pathwayExpansionReadinessCases:pathwayExpansionFixtures.readinessCases.length,
 pathwayExpansionMutationCases:pathwayExpansionFixtures.mutationCases.length,
 approvedPathwayRootCauses:0,
 causalFourLevelChains:causalLevels.length,
 causalFourLevelNewlyExtended:causalLevels.filter(x=>x.editorialOrigin==='analise_mecanistica_ampliada_v1.3.12').length,
 publicPreviewRecords:publicManifest.recordCount,
 publicPreviewSourceCount:publicManifest.sourceCount,
 publicPreviewOperationalApprovals:0,
 systemicRootClaimsAudited:systemicReview.counts.systemicClaims,
 systemicRootChainsAudited:systemicReview.counts.totalAuditedChains,
 systemicRootPriorPathwaysAudited:systemicReview.counts.priorPathwayChains,
 systemicProcessDeviationsProven:systemicReview.counts.processDeviationsProven,
 publicContractVersion:publicContract.contractVersion,
 publicContentReleaseVersion:publicContentReleases.currentContentRelease,
 publicContentGoldenSnapshots:publicContentReleases.releases.length,
 publicContentSyntheticRegressions:contentFixtures.cases.length,
 publicCompatibilitySyntheticCases:publicCompatFixtures.cases.length,
 causalChainsWithContextualPm:chains.filter(x=>['monitoramento_contextual_nao_alvo_exclusivo_de_ajuste','vinculo_preventivo_contextual_sem_alvo_direto'].includes(x.preventionAssociation)).length,
 causalSapChainsAudited:sapAudit.summary.chainsAudited,
 causalSapCandidatePairs:sapAudit.summary.catalogPairsCompatible,
 causalSapPairsAbsent:sapAudit.summary.catalogPairsMissing,
 causalSapChainsWithoutPart:sapAudit.summary.chainsWithoutProposedComponent,
 causalSapLinksAcceptedByEngineering:sapAudit.summary.acceptedEngineeringLinks,
 pmGapRulesReviewed:pmGaps.summary.withoutStrictCandidates,
 pmExceptionEvidenceGates:pmExceptionGates.records.length,
 pmExceptionMissingIndependentEvidence:pmExceptionGates.records.reduce((n,x)=>n+x.minimumEvidence.length,0),
 pmExceptionRegressionCases:pmExceptionFixtures.cases.length,
 d9EvidenceIntakeRequirements:d9EvidenceIntake.requiredInputs.length,
 d9DocumentInputsVerified:d9EvidenceIntake.requiredInputs.filter(x=>x.approved).length,
 pmGapBlockers:pmGaps.summary.blockerCounts,
 pmGapApprovedRemaps:pmGaps.summary.approvedEngineeringLinks,
 semanticDamageConfirmations:semantic.confirmedComponentDamages.length,
 evidenceValidatedInRealEquipment:0,technicallyApprovedPlaybooks:0
};
const report={schema:'fmea-mining.quality-audit.v1',version:'1.3.33',
 generatedFrom:'working_tree',status:'qualidade_cadastral_nao_taxa_de_falhas',
 meanings:{
  pmCandidateLinks:'vinculos gerados por regra e taxonomia, NAO falhas observadas',
  playbooksWithCandidateLinks:'vinculos preliminares sem verificacao de configuracao',
  evidenceValidatedInRealEquipment:'nao ha registro real autorizado nesta base'
 },
 counts,byModel,backlog:{rulesWithoutMatch:emptyRules,modelsMissing3LevelPath:missingModelPaths,
  playbooksWithoutCandidateLinks:noLinkPlaybooks},
 qualityGates:{sapEffectivityBySerial:'not_verified',oemTestLimitValues:'not_imported',
  corporatePublicationClearance:'pending',empiricalDataAuthorized:'none'},
 provenance:'Gerado automaticamente em scripts/audit-quality.mjs; nenhuma verificacao manual implicita'};
const dir=path.join(root,'reports');fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'quality-audit.generated.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({counts,missingModels:missingModelPaths,zeroHitRules:emptyRules.map(r=>r.ruleId),
 noLinkPlaybooks},null,2));
