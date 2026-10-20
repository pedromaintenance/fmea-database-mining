#!/usr/bin/env node
/**
 * v1.3.11 - Coerencia de roteiros de diagnostico e niveis causais.
 * Verifica prontidao documental, NUNCA uma falha real nem efetividade OEM.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const pathways=read('data/quality/diagnostic-pathways.v1.json');
const fixtures=read('data/quality/pathway-regressions.v1.json');
const chains=read('data/knowledge/causal-chains.v1.json').records;
const cross=read('data/quality/complementary-discrimination.v1.json').records;
const methods=new Set(read('data/ontology/concepts.v1.json').evidenceMethods.map(x=>x.id));
const sources=new Set(read('data/research/sources.v1.json').sources.map(x=>x.id));
const errors=[];
const check=(ok,msg)=>{if(!ok)errors.push(msg)};
const expected=['FC-HOSE-001','FC-FD-001','FC-TRACK-005'];
check(pathways.nature==='didatico_tecnico_sem_inspecao_executada','Roteiros marcados como inspeções reais');
check(pathways.policy.rootCauseCannotBeConfirmedByCode===true&&pathways.policy.oemProcedureRequiredBeforeExecution===true&&pathways.policy.pathsRequireIndependentEvidence===true,'Confirmação causal automática autorizada');
check(pathways.records.length===3,'Cobertura dos três roteiros prioritários alterada');
const ids=new Set();
for(const p of pathways.records){
 check(!ids.has(p.id),'Roteiro duplicado '+p.id);ids.add(p.id);
 check(expected.includes(p.chainId),'Cadeia fora dos três P0 '+p.id);
 const ch=chains.find(x=>x.id===p.chainId);
 const target=cross.find(x=>x.id===p.originCrossRefId&&x.alternativeHypothesisId===p.focusAlternativeId);
 check(!!ch&&!!target,'Cadeia/cross-ref incorreto '+p.id);
 if(!ch||!target)continue;
 check(target.chainId===p.chainId,'Cruzamento aponta para cadeia diferente '+p.id);
 check(p.steps.length===3&&new Set(p.steps.map(s=>s.id)).size===3,'Roteiro sem três etapas independentes '+p.id);
 for(const s of p.steps){
   check(methods.has(s.methodId),'Método inexistente '+p.id+'/'+s.id);
   for(const key of ['question','supportsA','supportsB','notDiscriminating','safeBoundary']){
    check(typeof s[key]==='string'&&s[key].length>=55,'Campo técnico insuficiente '+p.id+'/'+s.id+'/'+key);
   }
   check(s.requiredMetadata.length>=3&&s.requiredMetadata.includes('equipmentContext')&&s.requiredMetadata.includes('dateTime'),'Metadados incompletos '+p.id+'/'+s.id);
 }
 const lev=p.causalLevels;
 for(const key of ['observedPhenomenon','immediatePhysicalMechanismCandidate','rootCauseNotEstablishedBecause'])
  check(typeof lev[key]==='string'&&lev[key].length>=65,'Nível causal sem distinção/justificativa '+p.id+'/'+key);
 check(lev.contributingConditionCandidates.length>=3&&lev.rootCauseCandidates.length>=2,'Fatores contribuintes/raiz sem alternativas '+p.id);
 check(p.evidenceGate.requires.length===4&&new Set(p.evidenceGate.requires).size===4,'Requisitos gate inconsistentes '+p.id);
 check(p.evidenceGate.decisionWithoutEvidence==='inconclusivo','Conclusão permitida sem evidência '+p.id);
 check(p.sourceIds.length>=3&&p.sourceIds.every(x=>sources.has(x)),'Proveniência inválida '+p.id);
 check(p.applicableModelId===null&&p.applicableSapLocationId===null&&p.confirmedPartCode===null&&p.applicableSerialOrArrangement===null,'Aplicabilidade inventada '+p.id);
 check(p.executionStatus==='not_performed'&&p.resultObserved===null&&p.diagnosticConclusion===null&&p.fieldEvents===0,'Resultado de campo fabricado '+p.id);
 check(p.rootCauseConfirmed===false&&p.independentEvidenceVerified===false&&p.reviewStatus==='proposta_editorial_nao_homologada','Roteiro promovido antes da revisão '+p.id);
}
check(new Set(pathways.records.map(x=>x.chainId)).size===3,'Há repetição de cadeia prioritária');
check(fixtures.nature==='sintetico_sem_resultados_reais'&&fixtures.cases.length===9,'Regressões não sintéticas/incompletas');
const seen=new Set();
const perPath={};
for(const f of fixtures.cases){
 check(!seen.has(f.id),'Fixture duplicada '+f.id);seen.add(f.id);
 const p=pathways.records.find(x=>x.id===f.pathwayId);
 check(!!p,'Fixture sem roteiro '+f.id);if(!p)continue;
 perPath[p.id]=(perPath[p.id]||0)+1;
 check(f.source==='synthetic_checklist_only'&&f.observedData===null&&f.confirmedFailure===false,'Fixture passou por evento real '+f.id);
 check(f.syntheticAvailableRequirements.every(x=>p.evidenceGate.requires.includes(x)),'Gate inventado '+f.id);
 const eligible=p.evidenceGate.requires.every(x=>f.syntheticAvailableRequirements.includes(x));
 const outcome=eligible?'apto_para_revisao_nao_confirmado':'inconclusivo';
 check(outcome===f.expectedDisposition,'Classificação do gate incorreta '+f.id);
}
check(Object.values(perPath).length===3&&Object.values(perPath).every(n=>n===3),'Falta tripla regressão por roteiro');
const summary={status:errors.length?'FAIL':'OK',pathways:pathways.records.length,investigationStages:pathways.records.reduce((n,x)=>n+x.steps.length,0),causalLevelGroups:pathways.records.length,syntheticRegressions:fixtures.cases.length,realObservedEvents:0,approvedRootCauses:0,errors:errors.slice(0,30)};
console.log(JSON.stringify(summary,null,2));process.exit(errors.length?1:0);
