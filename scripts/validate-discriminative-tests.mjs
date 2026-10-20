#!/usr/bin/env node
/**
 * v1.3.9 - teste de discriminacao de hipoteses concorrentes.
 * Resultados desta matriz sao qualificacoes de metodo, NAO observacoes de maquina.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const chains=read('data/knowledge/causal-chains.v1.json').records;
const req=read('data/quality/evidence-requirements.v1.json');
const mat=read('data/quality/discriminative-tests.v1.json');
const fixtures=read('data/quality/discrimination-regressions.v1.json');
const sources=new Set(read('data/research/sources.v1.json').sources.map(x=>x.id));
const methods=new Set(read('data/ontology/concepts.v1.json').evidenceMethods.map(x=>x.id));
const reqMap=new Map(req.records.map(r=>[r.id,r]));
const errors=[];
const check=(ok,msg)=>{if(!ok)errors.push(msg);};
const expected=new Set(req.records.filter(x=>x.priority==='P0').map(x=>x.id));
const ids=new Set(),covered=new Set();
const allowed=new Set(Object.keys(mat.classificationGlossary));
check(mat.policy.autoDiagnosisForbidden===true&&mat.policy.withoutIndependentEvidenceMayBeConfirmed===false,'Diagnostico automatico habilitado');
check(mat.policy.noNumericalLikelihoodWithoutEmpiricalValidation===true&&mat.policy.alternativesMustRemainOpenByDefault===true,'Inferencia probabilistica sem dados permitida');
for(const row of mat.records){
 check(!ids.has(row.id),'ID duplicado '+row.id);ids.add(row.id);
 const er=reqMap.get(row.evidenceRequirementId);
 check(!!er,'Requisito de evidencia inexistente '+row.id);if(!er)continue;
 check(er.priority==='P0'&&row.reviewPriority==='P0','Teste fora da lista P0 '+row.id);
 check(row.chainId===er.chainId&&row.investigationId===er.investigationId&&row.methodId===er.methodId,'Ligacao divergente '+row.id);
 check(row.id==='DISC-'+row.chainId+'-'+row.investigationId,'ID nao deterministico '+row.id);
 const chain=chains.find(c=>c.id===row.chainId);
 const inv=chain?.investigations.find(t=>t.id===row.investigationId);
 check(!!inv,'Investigacao inexistente '+row.id);if(!inv)continue;
 check(row.targetMode===chain.failureMode,'Modo-alvo alterado '+row.id);
 check(allowed.has(row.discriminativeCapability),'Classe discriminante fora da ontologia '+row.id);
 check(row.competingHypothesisAssessments.length===chain.competingHypotheses.length,'Alternativas incompletas '+row.id);
 const seenAlt=new Set();
 for(const a of row.competingHypothesisAssessments){
  const original=chain.competingHypotheses.find(z=>z.id===a.hypothesisId);
  check(!!original&&a.description===original.description,'Alternativa estranha ao caso '+row.id+'/'+a.hypothesisId);
  check(!seenAlt.has(a.hypothesisId),'Hipotese duplicada '+row.id);seenAlt.add(a.hypothesisId);
  check(a.remainsPlausibleAfterSingleTest===true,'Hipotese excluida sem prova '+row.id);
  check(a.why.length>60,'Justificativa insuficiente '+row.id+'/'+a.hypothesisId);
 }
 const follow=new Set();
 check(row.complementaryInvestigations.length>=2,'Faltam testes complementares '+row.id);
 for(const next of row.complementaryInvestigations){
  check(methods.has(next.methodId),'Metodo complementar nao cadastrado '+row.id+'/'+next.methodId);
  check(next.methodId!==row.methodId,'Complementar nao e independente do metodo inicial '+row.id);
  check(!follow.has(next.methodId),'Complementares repetidos '+row.id);follow.add(next.methodId);
  check(next.status==='proposto_nao_executado'&&next.purpose.length>45,'Teste complementar sem metodo ou com falsa execucao '+row.id);
 }
 check(row.sourceIds.length>=2&&row.sourceIds.every(s=>sources.has(s)),'Fontes inexistentes '+row.id);
 check(row.sourceIds.some(x=>chain.sourceClaims.some(s=>s.sourceId===x)),'Sem referencia ja ligada a cadeia '+row.id);
 for(const name of ['detectedCondition','canDiscriminate','cannotDiscriminate','validationPrerequisites']){
  check(typeof row[name]==='string'&&row[name].length>80,'Definicao insuficiente '+row.id+'/'+name);
 }
 check(row.confoundingFactors.length>=3&&row.confoundingFactors.every(x=>x.length>30),'Fatores de confusao incompletos '+row.id);
 for(const name of ['interpretationWhenSupports','interpretationWhenWeakens','interpretationWhenInconclusive']){
  check(typeof row[name]==='string'&&row[name].length>90,'Interpretacao de resultado insuficiente '+row.id+'/'+name);
 }
 check(row.reviewStatus==='analise_metodologica_nao_homologada'&&row.scope==='diagnostico_qualitativo_geral_sem_dados_de_campo','Status validado antes da revisao '+row.id);
 check(row.resultObserved===null&&row.inspectedActualEquipment===false&&row.oemProcedureEffectiveForFleet===false,'Resultado ou efetividade fabricados '+row.id);
 check(row.automaticallyConfirmRootCause===false&&row.automaticallyRejectAlternatives===false,'Conclusao causal automatica '+row.id);
 check(Object.values(row.numericalDiscriminationMetrics).every(x=>x===null),'Precisao estatistica nao comprovada '+row.id);
 covered.add(er.id);
}
check(covered.size===expected.size&&[...expected].every(x=>covered.has(x)),'Cobertura incompleta dos seis P0');
check(mat.records.length===6&&mat.counts.priorityTests===6&&mat.counts.distinctChains===6,'Regressao de seis casos P0');
check(fixtures.nature==='synthetic_only_not_measured','Fixtures de discriminacao assumidas como fatos');
const fids=new Set();
function disposition(f){
 if(f.hypotheticalOutcome==='inconclusive'||!f.contextComparable||!f.baselineDocumented)return 'inconclusive';
 if(f.hypotheticalOutcome==='supports')return 'condition_supported_only';
 if(f.hypotheticalOutcome==='weakens')return 'weakens_not_eliminates';
 return 'inconclusive';
}
for(const f of fixtures.cases){
 check(!fids.has(f.id),'Fixture duplicada '+f.id);fids.add(f.id);
 check(ids.has(f.testId),'Fixture sem teste P0 '+f.id);
 check(f.observedInRealMachine===false,'Fixture tratada como evento real '+f.id);
 check(disposition(f)===f.expectedDisposition,'Classificacao de fixture incorreta '+f.id);
}
check(fixtures.cases.length>=12,'Faltam 12 cenarios de regressao');
const stats={status:errors.length?'FAIL':'OK',priorityTests:mat.records.length,
 competingHypothesesKeptOpen:mat.records.reduce((n,x)=>n+x.competingHypothesisAssessments.length,0),
 complementaryChecks:mat.records.reduce((n,x)=>n+x.complementaryInvestigations.length,0),
 syntheticRegressions:fixtures.cases.length,rootCausesConfirmed:0,
 validationErrors:errors.slice(0,40)};
console.log(JSON.stringify(stats,null,2));process.exit(errors.length?1:0);
