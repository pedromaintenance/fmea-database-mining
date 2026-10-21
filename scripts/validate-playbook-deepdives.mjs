#!/usr/bin/env node
/**
 * FMEA v1.3.18 — validação de seis roteiros vinculados aos playbooks originais.
 * Avalia estrutura, rastreabilidade e gates sintéticos: NÃO homologa falhas.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const catalog=read('data/knowledge/diagnostic/playbooks.v1.json');
const data=read('data/quality/playbook-deepdives.v1.json');
const fixtures=read('data/quality/playbook-deepdives-regressions.v1.json');
const methods=new Set(read('data/ontology/concepts.v1.json').evidenceMethods.map(x=>x.id));
const sources=new Set(read('data/research/sources.v1.json').sources.map(x=>x.id));
const originalPaths=read('data/quality/diagnostic-pathways.v1.json').records;
const secondPaths=read('data/quality/diagnostic-pathway-expansion.v1.json').records;
const EXPECTED=['PB-LOADER-CYL-01','PB-DRILL-DR410-FEED-01','PB-DRILL-DI650-COMP-01','PB-GRADER-TIRE-01','PB-TRUCK-FUEL-01','PB-SHOVEL-MOTOR-OIL-01'];
const errors=[],ck=(v,msg)=>{if(!v)errors.push(msg)};
const stringify=x=>JSON.stringify(x);
const copy=x=>JSON.parse(stringify(x));
function inspect(d){
 const fail=[],check=(ok,msg)=>{if(!ok)fail.push(msg)};
 const pb=catalog.records.find(p=>p.id===d.playbookId);
 check(!!pb,'playbook não encontrado '+d.playbookId);
 if(!pb)return fail;
 check(d.id?.startsWith('DEEP-'),'ID profundo inválido');
 check(stringify(d.modelIds)===stringify(pb.target.modelIds),'modelo de playbook alterado');
 check(d.title===pb.title&&d.originScenarioStatus==='cenario_autoral_sintetico','origem de cenário não preservada');
 check(d.sourcePlaybookVersion===catalog.version,'versão de cenário original não rastreada');
 check(d.objective?.length>=70&&d.system?.length>=8,'objetivo inadequado');
 check(stringify(d.hypotheses)===stringify(pb.hypotheses.map(h=>({id:h.id,label:h.label,expectedSigns:h.expectedSigns,counterSigns:h.counterSigns}))),'H1/H2/H3 de origem adulteradas');
 check(stringify(d.sourceTestIds)===stringify(pb.tests.map(t=>t.id)),'rastreabilidade T1/T2 adulterada');
 check(d.hypotheses?.length===3,'não há três hipóteses');
 check(d.stages?.length===3&&new Set(d.stages.map(s=>s.id)).size===3,'três etapas únicas exigidas');
 for(const [i,s] of (d.stages||[]).entries()){
  check(s.id==='S'+(i+1),'ordem de etapas alterada');
  check(methods.has(s.methodId),'método EV não catalogado '+s.id);
  check(s.sourceTestId===(i===2?null:pb.tests[i].id),'vínculo do teste de origem incorreto '+s.id);
  check(typeof s.question==='string'&&s.question.length>=85,'pergunta insuficiente '+s.id);
  check(typeof s.nonDiscrimination==='string'&&s.nonDiscrimination.length>=80,'lacuna discriminante ausente '+s.id);
  check(typeof s.safeBoundary==='string'&&s.safeBoundary.length>=90,'barreira de segurança insuficiente '+s.id);
  check(stringify(Object.keys(s.signals||{}).sort())===stringify(['H1','H2','H3']),'interpretações por hipótese ausentes '+s.id);
  for(const id of ['H1','H2','H3'])
   check(typeof s.signals?.[id]==='string'&&s.signals[id].length>=65,'sinal condicional inadequado '+s.id+'/'+id);
  check(Array.isArray(s.requiredMetadata)&&s.requiredMetadata.length>=5&&s.requiredMetadata.includes('equipmentContext')&&s.requiredMetadata.includes('dateTime'),'metadados de contexto ausentes '+s.id);
  check(s.performed===false&&s.resultObserved===null&&s.oemEffective===false&&s.independentEvidenceVerified===false,'evento ou homologação fictícia '+s.id);
 }
 check(d.readiness?.requires?.length===4&&new Set(d.readiness.requires).size===4&&d.readiness.requires.every(x=>x.length>=65),'gate documental incompleto');
 check(d.readiness?.whenMissing==='inconclusivo'&&d.readiness?.whenComplete==='apto_para_revisao_nao_confirmado','gate de checklist promove causa');
 check(d.sourceIds?.length>=3&&d.sourceIds.every(x=>sources.has(x)),'fontes não registradas');
 check(d.sourceNature==='literatura_geral_sem_efetividade_de_serie','escopo bibliográfico artificial');
 check(d.linkedCausalChainId===null&&d.serialOrArrangement===null&&d.sapLocationId===null&&d.confirmedComponentCode===null,'aplicabilidade SAP/OEM inventada');
 check(d.caseReview?.status==='pendente_sem_evidencia'&&d.caseReview.engineering===null&&d.caseReview.independent===null&&d.caseReview.oem===null,'revisão de campo fictícia');
 check(d.executionStatus==='not_performed'&&d.observedEvents===0&&d.confirmedRootCause===false&&d.approvedForOperationalUse===false,'status operacional indevido');
 return fail;
}
ck(data.schema==='fmea-mining.playbook-deepdives.v1'&&data.version==='1.3.18'&&data.editorialNature==='roteiros_propostos_para_playbooks_sinteticos_sem_eventos_reais','metadado do lote incorreto');
ck(data.records?.length===6&&new Set(data.records.map(r=>r.playbookId)).size===6,'seis playbooks únicos exigidos');
ck(stringify([...data.records.map(r=>r.playbookId)].sort())===stringify([...EXPECTED].sort()),'playbooks de escopo divergente');
const notCovered=catalog.records.filter(p=>!EXPECTED.includes(p.id)).map(x=>x.id);
ck(stringify(data.otherPlaybookIds)===stringify(notCovered),'inventário de playbooks fora deste lote incorreto');
ck(data.counts?.playbooksInSource===catalog.records.length&&data.counts?.newDeepdives===6&&data.counts?.otherPlaybooksWithoutThisDeepDive===6&&data.counts?.proposedStages===18&&data.counts?.readinessRequirements===24&&data.counts?.eventsObserved===0&&data.counts?.causesConfirmed===0,'contadores do lote incorretos');
ck(originalPaths.length===3&&secondPaths.length===3,'lotes antigos indisponíveis');
for(const d of data.records){const issues=inspect(d);ck(issues.length===0,d.id+': '+issues.join('; '))}
ck(fixtures.schema==='fmea-mining.playbook-deepdives-regressions.v1'&&fixtures.version==='1.3.18'&&fixtures.nature==='synthetic_only','fixtures incompatíveis');
ck(fixtures.readinessCases?.length===18&&fixtures.mutationCases?.length===16,'34 regressões sintéticas exigidas');
const per=new Map(),names=new Set();
for(const f of fixtures.readinessCases||[]){
 ck(!names.has(f.id),'fixture duplicado '+f.id);names.add(f.id);
 const d=data.records.find(x=>x.id===f.deepDiveId);
 ck(!!d,'roteiro não encontrado '+f.id);if(!d)continue;
 per.set(d.id,(per.get(d.id)||0)+1);
 ck(f.observedData===null&&f.availableRequirements.every(x=>d.readiness.requires.includes(x)),'resultado de campo fictício '+f.id);
 const ready=d.readiness.requires.every(x=>f.availableRequirements.includes(x));
 ck(f.expected===(ready?'apto_para_revisao_nao_confirmado':'inconclusivo'),'gate semântico incorreto '+f.id);
}
ck(per.size===6&&[...per.values()].every(n=>n===3),'três testes documentais por playbook ausentes');
const mutations={
 inventSerial:d=>{d.serialOrArrangement='FAKE'},
 inventComponent:d=>{d.confirmedComponentCode='FAKE'},
 approveOperational:d=>{d.approvedForOperationalUse=true},
 confirmCause:d=>{d.confirmedRootCause=true},
 inventObserved:d=>{d.stages[0].resultObserved='FAKE'},
 inventOemReview:d=>{d.caseReview.oem='approved'},
 eraseAlternative:d=>{d.hypotheses.pop()},
 alterHypothesis:d=>{d.hypotheses[1].label='causa fabricada'},
 inventMethod:d=>{d.stages[0].methodId='EV-FAKE'},
 dropSafety:d=>{d.stages[1].safeBoundary=''},
 dropMetadata:d=>{d.stages[2].requiredMetadata=[]},
 deleteStage:d=>{d.stages.pop()},
 deleteRequirement:d=>{d.readiness.requires.pop()},
 wrongSourceTest:d=>{d.stages[0].sourceTestId='T2'},
 inventSource:d=>{d.sourceIds=['INVENTED-ISBN']},
 duplicateId:d=>{d.stages[2].id=d.stages[0].id}
};
for(const f of fixtures.mutationCases||[]){
 ck(!names.has(f.id),'fixture duplicado '+f.id);names.add(f.id);
 const d=data.records.find(x=>x.id===f.deepDiveId);
 ck(!!d&&typeof mutations[f.mutation]==='function','mutação desconhecida '+f.id);if(!d||!mutations[f.mutation])continue;
 const mutation=copy(d);mutations[f.mutation](mutation);
 ck(f.observedData===null&&f.expected==='reject'&&inspect(mutation).length>0,'alteração perigosa não bloqueada '+f.id);
}
const result={status:errors.length?'FAIL':'OK',playbooksInCatalog:catalog.records.length,scenariosDeepenedThisCycle:data.records.length,existingOtherPlaybooksNotThisCycle:data.otherPlaybookIds.length,proposedStages:18,evidenceRequirements:24,readinessRegressions:18,unsafeMutationRegressions:16,observedCases:0,oemApprovals:0,confirmedCauses:0,errors:errors.slice(0,30)};
console.log(JSON.stringify(result,null,2));process.exit(errors.length?1:0);
