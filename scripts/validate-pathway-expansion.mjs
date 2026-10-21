#!/usr/bin/env node
/**
 * v1.3.17 — três roteiros adicionais sem revisão empírica.
 * Preserva os três anteriores de v1.3.11 e o preview público congelado.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const exp=read('data/quality/diagnostic-pathway-expansion.v1.json');
const fixture=read('data/quality/pathway-expansion-regressions.v1.json');
const old=read('data/quality/diagnostic-pathways.v1.json');
const chain=read('data/knowledge/causal-chains.v1.json').records;
const levels=read('data/ontology/causal-levels.v1.json').records;
const cross=read('data/quality/complementary-discrimination.v1.json').records;
const methods=new Set(read('data/ontology/concepts.v1.json').evidenceMethods.map(x=>x.id));
const sources=new Set(read('data/research/sources.v1.json').sources.map(x=>x.id));
const errors=[];
const check=(v,s)=>{if(!v)errors.push(s)};
const expected=new Map([
 ['FC-COOL-001','PATH-COOL-AIR-FAN-001'],
 ['FC-TRACK-001','PATH-TRACK-ROLLER-001'],
 ['FC-COOL-007','PATH-COOL-PUMP-THERMOSTAT-001']
]);
function inspect(p){
 const problems=[];
 const ck=(v,s)=>{if(!v)problems.push(s)};
 const ch=chain.find(x=>x.id===p.chainId), lev=levels.find(x=>x.chainId===p.chainId);
 const xref=cross.find(x=>x.id===p.originCrossRefId && x.chainId===p.chainId && x.alternativeHypothesisId===p.focusAlternativeId);
 ck(expected.get(p.chainId)===p.id,'código ou cadeia inválida');
 ck(!!ch&&!!lev&&!!xref,'Cadeia, níveis ou referência cruzada ausente');
 if(!ch||!lev||!xref)return problems;
 ck(p.focusAlternativeId=== 'ALT1'||p.focusAlternativeId==='ALT2','alternativa inválida');
 ck(p.comparison?.hypothesisB===ch.competingHypotheses.find(x=>x.id===p.focusAlternativeId)?.description,'descrição concorrente diferente do catálogo');
 ck(typeof p.comparison?.hypothesisA==='string'&&p.comparison.hypothesisA.length>=45,'hipótese A sem escopo');
 ck(typeof p.title==='string'&&p.title.length>=60,'título insuficiente');
 ck(typeof p.detection==='string'&&p.detection.length>=100,'sintoma sem ressalva');
 ck(JSON.stringify(p.causalLevels)===JSON.stringify(lev.causalLevels),'mecanismo ou origem causal reescritos');
 ck(p.steps?.length===3&&new Set(p.steps.map(x=>x.id)).size===3,'três passos únicos exigidos');
 for(const s of p.steps||[]){
  ck(methods.has(s.methodId),'método inválido '+s.id);
  for(const key of ['question','supportsA','supportsB','notDiscriminating','safeBoundary'])
   ck(typeof s[key]==='string'&&s[key].length>=55,'texto técnico inseguro '+s.id+'/'+key);
  ck(Array.isArray(s.requiredMetadata)&&s.requiredMetadata.length>=5&&s.requiredMetadata.includes('equipmentContext')&&s.requiredMetadata.includes('dateTime'),'metadados ausentes '+s.id);
 }
 ck(p.evidenceGate?.requires?.length===4&&new Set(p.evidenceGate.requires).size===4,'quatro requisitos independentes exigidos');
 ck(p.evidenceGate?.decisionWithoutEvidence==='inconclusivo','requisito automático não conclusivo');
 ck(Array.isArray(p.sourceIds)&&p.sourceIds.length>=3&&p.sourceIds.every(x=>sources.has(x)),'fontes não catalogadas');
 ck(lev.sourceIds.every(id=>p.sourceIds.includes(id)),'fontes originais ausentes');
 ck(p.applicableModelId===null&&p.applicableSapLocationId===null&&p.confirmedPartCode===null&&p.applicableSerialOrArrangement===null,'efetividade OEM/SAP fictícia');
 ck(p.executionStatus==='not_performed'&&p.resultObserved===null&&p.diagnosticConclusion===null&&p.fieldEvents===0,'ensaio real inventado');
 ck(p.reviewStatus==='proposta_editorial_nao_homologada'&&p.rootCauseConfirmed===false&&p.independentEvidenceVerified===false,'hipótese promovida a causa comprovada');
 return problems;
}
check(exp.schema==='fmea-mining.diagnostic-pathway-expansion.v1'&&exp.version==='1.3.17'&&exp.nature==='didatico_tecnico_sem_inspecao_executada','contrato de expansão inválido');
check(exp.strategy==='complemento_aditivo_preservando_os_tres_roteiros_originais','roteiros legados reclassificados');
check(Object.values(exp.policy||{}).every(x=>x===true),'política de segurança afrouxada');
check(exp.records?.length===3&&new Set(exp.records.map(x=>x.chainId)).size===3,'expansão incompleta ou duplicada');
check(old.records.length===3&&old.records.every(x=>!exp.records.some(y=>y.chainId===x.chainId||y.id===x.id)),'sobreposição com os roteiros originais');
check(exp.counts.previousPathways===3&&exp.counts.newPathways===3&&exp.counts.totalDetailedPathways===6&&exp.counts.proposedInvestigationStages===9&&exp.counts.observedEvents===0&&exp.counts.confirmedRootCauses===0,'contadores inválidos');
for(const r of exp.records){const found=inspect(r);check(found.length===0,r.id+': '+found.join(' | '))}
check(fixture.schema==='fmea-mining.pathway-expansion-regressions.v1'&&fixture.version==='1.3.17'&&fixture.nature==='synthetic_only','regressões inválidas');
check(fixture.readinessCases?.length===9&&fixture.mutationCases?.length===12,'21 cenários exigidos');
const copy=x=>JSON.parse(JSON.stringify(x)),used=new Set(),perPath={};
for(const t of fixture.readinessCases||[]){
 check(!used.has(t.id),'duplicata '+t.id);used.add(t.id);
 const p=exp.records.find(x=>x.id===t.pathwayId);
 check(!!p,'rota ausente '+t.id);if(!p)continue;
 perPath[p.id]=(perPath[p.id]||0)+1;
 check(t.source==='synthetic_only'&&t.observedData===null&&t.syntheticAvailableRequirements.every(x=>p.evidenceGate.requires.includes(x)),'simulação virou evidência '+t.id);
 const ready=p.evidenceGate.requires.every(x=>t.syntheticAvailableRequirements.includes(x));
 check(t.expectedDisposition===(ready?'apto_para_revisao_nao_confirmado':'inconclusivo'),'gate incorreto '+t.id);
}
check(Object.keys(perPath).length===3&&Object.values(perPath).every(x=>x===3),'tripla regressão de prontidão incompleta');
const mutations={
 confirmCause:p=>{p.rootCauseConfirmed=true},
 inventSerial:p=>{p.applicableSerialOrArrangement='FAKE-SERIAL'},
 inventObservedResult:p=>{p.resultObserved='FAKE-OBSERVATION'},
 approveReview:p=>{p.reviewStatus='revisado_por_especialista'},
 replaceCrossRef:p=>{p.originCrossRefId='XREF-INEXISTENTE'},
 changeRootLevel:p=>{p.causalLevels.immediatePhysicalMechanismCandidate='Texto alterado sem base original'},
 inventMethod:p=>{p.steps[0].methodId='EV-FAKE'},
 removeSafety:p=>{p.steps[0].safeBoundary=''},
 omitMetadata:p=>{p.steps[0].requiredMetadata=[]},
 omitGate:p=>{p.evidenceGate.requires.pop()},
 inventSource:p=>{p.sourceIds=['OEM-INVENTADO']},
 duplicateStep:p=>{p.steps[1].id=p.steps[0].id}
};
for(const t of fixture.mutationCases||[]){
 check(!used.has(t.id),'duplicata '+t.id);used.add(t.id);
 const p=exp.records.find(x=>x.id===t.pathwayId);
 check(!!p&&typeof mutations[t.mutation]==='function','mutação desconhecida '+t.id);
 if(!p||!mutations[t.mutation])continue;
 const fake=copy(p);mutations[t.mutation](fake);
 check(inspect(fake).length>0&&t.expectedDisposition==='reject'&&t.observedData===null&&t.source==='synthetic_only','mutação perigosa não bloqueada '+t.id);
}
const out={status:errors.length?'FAIL':'OK',detailedOriginalPathways:old.records.length,newPathways:exp.records.length,totalPathways:old.records.length+exp.records.length,proposedNewSteps:exp.records.reduce((n,x)=>n+x.steps.length,0),readinessRegressions:fixture.readinessCases.length,rejectionRegressions:fixture.mutationCases.length,fieldEvents:0,validatedOemConfigurations:0,confirmedRootCauses:0,errors:errors.slice(0,30)};
console.log(JSON.stringify(out,null,2));
process.exit(errors.length?1:0);
