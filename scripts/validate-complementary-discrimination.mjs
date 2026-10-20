#!/usr/bin/env node
/* FMEA v1.3.10 - auditoria de complementos por hipótese. Sem execução de campo. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const matrix=read('data/quality/complementary-discrimination.v1.json');
const base=read('data/quality/discriminative-tests.v1.json').records;
const chains=read('data/knowledge/causal-chains.v1.json').records;
const circular=read('data/quality/circular-sap-causality.v1.json');
const sapAudit=read('data/quality/causal-sap-assessment.v1.json').records;
const pilot=read('data/quality/oem-pilot-readiness.v1.json');
const ontology=read('data/ontology/concepts.v1.json');
const sourceIds=new Set(read('data/research/sources.v1.json').sources.map(s=>s.id));
const methods=new Set(ontology.evidenceMethods.map(x=>x.id));
const errors=[],check=(ok,msg)=>{if(!ok)errors.push(msg)};
const allowed=new Set(matrix.values);
check(matrix.policy.allHypothesesRemainOpen===true&&matrix.policy.autoExclusionAllowed===false&&matrix.policy.numericalConfidenceAllowed===false,'Política permite eliminar alternativas sem dados');
check(matrix.policy.technicalReviewRequired===true&&matrix.policy.manualEffectivityRequired===true,'Faltam gates de revisão');
check(matrix.records.length===12&&matrix.counts.alternativeHypotheses===12&&matrix.counts.baseTests===6,'Regressão de cobertura dos seis P0');
const expected=new Set(base.flatMap(b=>b.competingHypothesisAssessments.map(a=>b.chainId+'/'+a.hypothesisId)));
const found=new Set(),pairs=[];
for(const row of matrix.records){
 const id=row.chainId+'/'+row.alternativeHypothesisId;
 check(!found.has(id),'Avaliação duplicada '+id);found.add(id);
 check(expected.has(id),'Hipótese fora da matriz P0 '+id);
 const b=base.find(x=>x.id===row.testId);
 const c=chains.find(x=>x.id===row.chainId);
 const a=b?.competingHypothesisAssessments.find(x=>x.hypothesisId===row.alternativeHypothesisId);
 check(!!b&&b.chainId===row.chainId&&!!a&&!!c,'Relação inválida '+id);
 if(!b||!c||!a)continue;
 check(row.alternativeDescription===a.description,'Descrição da hipótese alterada '+id);
 check(row.complementAssessments.length===b.complementaryInvestigations.length,'Cobertura complementar incompleta '+id);
 const seenMethods=new Set();
 for(const r of row.complementAssessments){
  check(methods.has(r.complementaryMethodId),'Método inexistente '+id+'/'+r.complementaryMethodId);
  check(b.complementaryInvestigations.some(x=>x.methodId===r.complementaryMethodId),'Método não pertence ao P0 '+id+'/'+r.complementaryMethodId);
  check(!seenMethods.has(r.complementaryMethodId),'Método duplicado '+id);seenMethods.add(r.complementaryMethodId);
  check(allowed.has(r.discriminativeValue),'Classificação arbitrária '+id);
  for(const k of ['potentialSupport','potentialWeakening','remainingAmbiguity'])
   check(typeof r[k]==='string'&&r[k].length>55,'Racional insuficiente '+id+'/'+k);
  check(r.performed===false&&r.oemEffective===false&&r.isolationProof===false,'Teste ficticiamente executado '+id);
  pairs.push(r);
 }
 check(methods.has(row.remainingGap.methodId),'Método de lacuna não cadastrado '+id);
 check(row.remainingGap.neededInvestigation.length>60&&row.remainingGap.unresolvedReason.length>10&&row.remainingGap.status==='pendente','Lacuna sem procedimento ou declarada resolvida '+id);
 check(row.closureRule.length>55,'Sem condição de fechamento '+id);
 check(row.reviews.mechanical==='pending'&&row.reviews.oem==='pending'&&row.reviews.evidence==='not_collected','Revisão não ocorrida '+id);
 check(row.claimStatus==='proposta_de_discriminacao_sem_resultado_empirico'&&row.confirmedRootCause===false,'Falha confirmada indevidamente '+id);
}
check(found.size===expected.size&&[...expected].every(x=>found.has(x)),'Alguma alternativa P0 sem auditoria');
check(pairs.length===matrix.counts.complementAssessments&&pairs.length===24,'Regressão das 24 avaliações');
check(matrix.counts.unresolvedGaps===matrix.records.filter(x=>x.remainingGap.status==='pendente').length,'Lacunas não contabilizadas');
check(pairs.some(x=>x.discriminativeValue==='nao_discrimina'),'O modelo não identifica métodos sem discriminação');
check(pairs.some(x=>x.discriminativeValue==='potencialmente_discriminante_condicional'),'O modelo não distingue verificações condicionais');
check(circular.policy.writeBackToSAP===false&&circular.policy.automaticCausalApproval===false&&circular.policy.explainMechanismSeparately===true,'Política SAP indevida');
check(circular.disputedCatalogPair.objectType==='TRAK'&&circular.disputedCatalogPair.partCode==='0320'&&circular.disputedCatalogPair.damageId==='01.15'&&circular.disputedCatalogPair.causeId==='C1.17','Par SAP circular alterado');
const sapCases=sapAudit.filter(x=>x.issueCode==='circularidade_dano_causa');
check(sapCases.length===2&&circular.records.length===2,'Cobertura circular de códigos inconsistente');
for(const row of circular.records){
 check(sapCases.some(x=>x.chainId===row.chainId),'Cadeia SAP circular desconhecida '+row.chainId);
 check(row.status==='inferido_nao_homologado'&&row.confirmedSAPCause===null&&row.revisionDecision==='pending'&&row.reviewer===null,'Causa SAP homologada sem evidência '+row.chainId);
 check(row.sourceIds.length>=2&&row.sourceIds.every(x=>sourceIds.has(x)),'Fonte não cadastrada '+row.chainId);
 check(row.independentEvidenceNeeded.length>=3,'Falta contraprova '+row.chainId);
}
check(pilot.status==='bloqueado_sem_efetividade_documental'&&pilot.constraints.catalogLocationsApproved===0&&pilot.constraints.proceduresValidated===0,'Piloto aprovado sem OEM');
check(pilot.relatedChainIds.length===8&&pilot.relatedChainIds.every(x=>chains.some(c=>c.id===x)),'Família do piloto incompleta');
for(const item of pilot.requiredInputs)check(item.value===null&&item.status!=='approved','Entrada OEM fictícia '+item.id);
check(pilot.publiclyReviewedSources.every(x=>sourceIds.has(x)),'Fonte do piloto ausente');
const summary={status:errors.length?'FAIL':'OK',priorityTests:base.length,alternativesAudited:matrix.records.length,
 complementaryAssessments:pairs.length,notDiscriminating:pairs.filter(x=>x.discriminativeValue==='nao_discrimina').length,
 partial:pairs.filter(x=>x.discriminativeValue==='indicio_parcial').length,
 conditional:pairs.filter(x=>x.discriminativeValue==='potencialmente_discriminante_condicional').length,
 unresolvedDiagnosticGaps:matrix.records.filter(x=>x.remainingGap.status==='pendente').length,
 circularSapPairsAudited:circular.records.length,
 oemPilotReady:false,approvedRootCauses:0,errors:errors.slice(0,40)};
console.log(JSON.stringify(summary,null,2));process.exit(errors.length?1:0);
