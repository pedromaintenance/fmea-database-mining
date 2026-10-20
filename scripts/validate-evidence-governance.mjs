#!/usr/bin/env node
// Catálogo de requisitos de evidência e governança: nenhum dado de campo e nenhuma promoção automática.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const chains=read('data/knowledge/causal-chains.v1.json').records;
const requirements=read('data/quality/evidence-requirements.v1.json');
const review=read('data/governance/technical-review-register.v1.json');
const regression=read('data/quality/evidence-gate-regressions.v1.json');
const sources=new Set(read('data/research/sources.v1.json').sources.map(s=>s.id));
const methods=new Set(read('data/ontology/concepts.v1.json').evidenceMethods.map(m=>m.id));
const errors=[];const check=(v,s)=>{if(!v)errors.push(s)};
const requiredIds=new Set(chains.flatMap(c=>c.investigations.map(t=>'ER-'+c.id+'-'+t.id)));
const chainIds=new Set(chains.map(c=>c.id));
const ids=new Set();
const fieldIds=new Set(Object.keys(requirements.methodFieldGlossary));
check(requirements.status==='requirements_planned_not_observed','Requisitos marcados como evidencias reais');
check(requirements.statistics.chains===chains.length,'Resumo de cadeias desatualizado');
check(requirements.statistics.investigations===requiredIds.size,'Resumo de investigacoes desatualizado');
check(requirements.allowedInterpretations.join('|')==='supports|weakens|inconclusive|not_performed','Interpretacoes incorretas');
for(const [field,definition] of Object.entries(requirements.methodFieldGlossary)){
 check(definition.id===field&&definition.requiredForInterpretation===true,'Campo indefinido '+field);
}
for(const r of requirements.records){
 check(!ids.has(r.id),'Requisito duplicado '+r.id);ids.add(r.id);
 check(requiredIds.has(r.id),'Requisito orfao '+r.id);
 const c=chains.find(x=>x.id===r.chainId);
 const t=c?.investigations.find(x=>x.id===r.investigationId);
 check(!!t,'Teste nao encontrado '+r.id);if(!t)continue;
 check(r.id==='ER-'+c.id+'-'+t.id&&r.methodId===t.methodId&&methods.has(r.methodId),'Metodo divergente '+r.id);
 for(const key of ['supports','weakens','inconclusive']){
  check(typeof r.resultInterpretation[key]==='string'&&r.resultInterpretation[key]===t.interpretations[key],'Interpretacao adulterada '+r.id+'/'+key);
 }
 check(r.minimumMetadataFields.length>=4&&new Set(r.minimumMetadataFields).size===r.minimumMetadataFields.length,'Metadados insuficientes '+r.id);
 check(r.minimumMetadataFields.every(k=>fieldIds.has(k)),'Campo sem definicao '+r.id);
 check(r.minimumMetadataFields.includes('equipmentContext')&&r.minimumMetadataFields.includes('dateTime'),'Faltam contexto e temporalidade '+r.id);
 check(r.sourceIds.length>0&&r.sourceIds.every(k=>sources.has(k)),'Fonte bibliografica invalida '+r.id);
 check(r.sourceIds.some(id=>c.sourceClaims.some(s=>s.sourceId===id)),'Nenhuma fonte da cadeia presente '+r.id);
 check(r.threshold.value===null&&r.threshold.unit===null&&r.threshold.sourceId===null&&r.threshold.applicableConditions===null,'Limiar nao rastreado '+r.id);
 check(Object.values(r.applicability).every(x=>x===null),'Aplicabilidade OEM nao verificada '+r.id);
 check(r.plannedOnly===true&&r.observedResult===null&&r.confirmsComponentDamage===false,'Falha confirmada indevidamente '+r.id);
 check(r.engineeringReview==='pending'&&r.independentReview==='pending'&&r.oemEffectiveProcedureVerified===false,'Revisao antecipada '+r.id);
 check(typeof r.qualityRisk==='string'&&r.qualityRisk.length>45,'Limite de qualidade ausente '+r.id);
}
check(ids.size===requiredIds.size,'Requisitos nao cobrem todos os 48 testes');
check(requirements.statistics.priorityCases===requirements.records.filter(x=>x.priority==='P0').length,'Prioridades mal contabilizadas');
check(requirements.records.length===48,'Regressao de cobertura de 48 testes');
const stages=['inferido_com_literatura_geral','revisado_por_especialista','aplicabilidade_oem_confirmada','validado_com_evidencias'];
check(review.reviewStages.map(x=>x.state).join('|')===stages.join('|'),'Sequencia de curadoria incorreta');
check(review.promotionPolicy.automatedPromotion===false&&review.promotionPolicy.dualReviewRequired===true&&review.promotionPolicy.reviewerCannotBeSoleAuthor===true,'Aprovacao automatica ou revisor unico permitido');
check(review.promotionPolicy.oemSerialEffectivityRequiredForApplicableClaims===true&&review.promotionPolicy.evidenceOriginMustBeExplicit===true,'Faltam exigencias de OEM ou origem');
const reviews=new Set();
for(const r of review.records){
 check(chainIds.has(r.chainId),'Cadeia orfa no registro de revisao '+r.chainId);
 check(!reviews.has(r.chainId),'Revisao duplicada '+r.chainId);reviews.add(r.chainId);
 check(r.currentStage==='inferido_com_literatura_geral'&&r.nextGate==='revisado_por_especialista'&&r.reviewDecision==='pending','Promocao indevida '+r.chainId);
 check(r.authorId===null&&r.reviewerPrimary===null&&r.reviewerIndependent===null&&r.reviewDate===null&&r.revisionReason===null,'Parecer humano inventado '+r.chainId);
 check(r.oemSourceId===null&&r.manualRevision===null&&r.applicableModelId===null&&r.serialOrArrangement===null&&r.confirmedSapLocationId===null,'Homologacao de serie inventada '+r.chainId);
 check(r.publicationClearance==='not_evaluated'&&r.empiricalFailureConfirmed===false,'Autorizacao ou falha real inventada '+r.chainId);
 check(r.technicalEvidenceIds.length===0&&r.verifiedEvidenceIds.length===0&&r.approvedEffectIds.length===0,'Aprovacoes de evidencias inventadas '+r.chainId);
 check(r.blockers.length>=3,'Bloqueios editoriais nao registrados '+r.chainId);
}
check(reviews.size===chains.length,'Fila de revisao nao cobre as cadeias');
function reviewEligible(f){return typeof f.authorId==='string'&&f.authorId.length>0&&typeof f.primaryReviewer==='string'&&f.primaryReviewer.length>0&&typeof f.independentReviewer==='string'&&f.independentReviewer.length>0&&f.primaryReviewer!==f.independentReviewer&&f.primaryReviewer!==f.authorId&&f.independentReviewer!==f.authorId&&f.decision==='approved'&&typeof f.rationale==='string'&&f.rationale.length>30}
function evidenceInterpretable(f){return Array.isArray(f.metadataPresent)&&f.requiredFields.every(field=>f.metadataPresent.includes(field))&&f.baselinePresent===true&&f.oemApplicable===true}
check(regression.nature==='synthetic_only_never_authorized_field_evidence','Fixture na natureza de dado real');
const fixtureIds=new Set();
for(const f of regression.cases){
 check(!fixtureIds.has(f.id),'Fixture duplicada '+f.id);fixtureIds.add(f.id);
 const actual=f.kind==='review'?reviewEligible(f):f.kind==='evidence'?evidenceInterpretable(f):null;
 check(actual===f.expectedEligible,'Gate incorreto '+f.id);
}
check(regression.cases.length>=8,'Faltam casos de gate');
const report={status:errors.length?'FAIL':'OK',chains:chains.length,evidenceRequirements:requirements.records.length,highPriority:requirements.statistics.priorityCases,reviewQueue:reviews.size,reviewedChains:0,applicabilityConfirmed:0,observedResults:0,regressionCases:regression.cases.length,errors:errors.slice(0,30)};
console.log(JSON.stringify(report,null,2));
process.exit(errors.length?1:0);
