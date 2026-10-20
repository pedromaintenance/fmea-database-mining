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
 causalChainsWithContextualPm:chains.filter(x=>['monitoramento_contextual_nao_alvo_exclusivo_de_ajuste','vinculo_preventivo_contextual_sem_alvo_direto'].includes(x.preventionAssociation)).length,
 causalSapChainsAudited:sapAudit.summary.chainsAudited,
 causalSapCandidatePairs:sapAudit.summary.catalogPairsCompatible,
 causalSapPairsAbsent:sapAudit.summary.catalogPairsMissing,
 causalSapChainsWithoutPart:sapAudit.summary.chainsWithoutProposedComponent,
 causalSapLinksAcceptedByEngineering:sapAudit.summary.acceptedEngineeringLinks,
 evidenceValidatedInRealEquipment:0,technicallyApprovedPlaybooks:0
};
const report={schema:'fmea-mining.quality-audit.v1',version:'1.3.4',
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
