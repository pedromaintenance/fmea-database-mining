#!/usr/bin/env node
// Auditoria metodológica: processo não é considerado causa raiz por plausibilidade física.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const audit=read('data/governance/systemic-root-audit.v1.json');
const levels=read('data/ontology/causal-levels.v1.json').records;
const originals=read('data/quality/diagnostic-pathways.v1.json').records;
const sources=new Set(read('data/research/sources.v1.json').sources.map(x=>x.id));
const errors=[];const ck=(x,s)=>{if(!x)errors.push(s)};
const map=new Map(levels.map(x=>[x.chainId,x]));
const expected=new Set(levels.map(x=>x.chainId));
const expanded=new Set(levels.filter(x=>x.editorialOrigin==='analise_mecanistica_ampliada_v1.3.12').map(x=>x.chainId));
const legacy=new Set(originals.map(x=>x.chainId));
const found=new Set();
ck(audit.schema==='fmea-mining.systemic-root-audit.v1'&&audit.version==='1.3.14','Versao da auditoria incorreta');
ck(audit.policy.mechanicalPlausibilityIsNotProcessProof&&audit.policy.automaticBlameForbidden&&audit.policy.noActualProcessRecords&&audit.policy.noRootCauseApproval&&audit.policy.independentReviewRequired,'Gates editoriais comprometidos');
ck(audit.records.length===24&&audit.counts.expandedChains===21&&audit.counts.priorPathwayChains===3&&audit.counts.totalAuditedChains===24&&audit.counts.systemicClaims===48,'Cobertura de 24 cadeias / 48 afirmacoes alterada');
for(const row of audit.records){
 ck(!found.has(row.chainId),'Cadeia duplicada '+row.chainId);found.add(row.chainId);
 const original=map.get(row.chainId);
 ck(!!original&&expected.has(row.chainId),'Cadeia fora do escopo '+row.chainId);
 if(!original)continue;
 ck(row.originVersion===(legacy.has(row.chainId)?'1.3.11':'1.3.12'),'Origem editorial incorreta '+row.chainId);
 ck(row.family===original.family&&row.documentedPhysicalMechanism===original.causalLevels.immediatePhysicalMechanismCandidate,'Mecanismo diferente '+row.chainId);
 ck(row.missingCausalBridge===original.causalLevels.rootCauseNotEstablishedBecause&&row.missingCausalBridge.length>=60,'Falta lacuna causal '+row.chainId);
 ck(row.rootCandidateReviews.length===2,'Revisão de duas candidatas não completa '+row.chainId);
 for(let i=0;i<row.rootCandidateReviews.length;i++){
  const claim=row.rootCandidateReviews[i];
  ck(claim.id===`SYS-${row.chainId}-R${i+1}`&&claim.originalClaim===original.causalLevels.rootCauseCandidates[i],'Rastreio de origem diverge '+claim.id);
  ck(typeof claim.hypothesisCategory==='string'&&claim.hypothesisCategory.length>8,'Categoria sem classificação '+claim.id);
  ck(claim.minimumIndependentEvidence.length>=2&&new Set(claim.minimumIndependentEvidence).size===claim.minimumIndependentEvidence.length,'Prova independente insuficiente '+claim.id);
  ck(claim.minimumIndependentEvidence.every(s=>typeof s==='string'&&s.length>=45),'Tipo de documento não explicitado '+claim.id);
  ck(typeof claim.nonOrganizationalAlternative==='string'&&claim.nonOrganizationalAlternative.length>=55,'Não há contraprova material '+claim.id);
  ck(claim.presentProofOfProcessDeviation===false&&claim.processRecordsExamined===false&&claim.attributedFaultToPeopleOrTeam===false,'Desvio real ou culpa presumidos '+claim.id);
  ck(claim.causalConclusion==='nao_demonstrada'&&claim.actionsUntilVerified.length>55,'Causa aprovada sem dados '+claim.id);
 }
 ck(row.sourcesGeneral.length>0&&row.sourcesGeneral.every(id=>sources.has(id)),'Fonte desconhecida '+row.chainId);
 ck(row.systemicCauseUnverified===true&&row.mechanicalHypothesisRetained===true,'Hipótese física confundida com processo '+row.chainId);
 ck(row.status==='revisao_critica_editorial_nao_homologacao'&&row.applicabilityStatus==='nao_verificada_por_serie','Homologacao fictícia '+row.chainId);
 ck(row.reviewerPrimary===null&&row.reviewerIndependent===null&&row.reviewDecision===null&&row.systemicRootCauseConfirmed===false,'Parecer/causa atribuído '+row.chainId);
}
ck(found.size===expected.size&&[...expected].every(x=>found.has(x)),'Alguma cadeia não revisada');
ck(originals.length===3&&originals.every(x=>found.has(x.chainId))&&expanded.size===21&&legacy.size===3&&[...expanded].every(x=>!legacy.has(x)),'Cobertura por origem incompleta');
ck(originals.every(x=>audit.records.find(r=>r.chainId===x.chainId)?.documentedPhysicalMechanism===x.causalLevels.immediatePhysicalMechanismCandidate),'Roteiros originais alterados');
ck(audit.counts.processDeviationsProven===0&&audit.counts.systemicRootCausesConfirmed===0,'Causas reais reportadas indevidamente');
const result={status:errors.length?'FAIL':'OK',auditedChains:found.size,priorPathwayChains:legacy.size,expandedChains:expanded.size,claims:audit.records.reduce((s,r)=>s+r.rootCandidateReviews.length,0),
 processDeviationsProven:0,rootCausesConfirmed:0,preservedPriorPathways:originals.length,errors:errors.slice(0,30)};
console.log(JSON.stringify(result,null,2));process.exit(errors.length?1:0);
