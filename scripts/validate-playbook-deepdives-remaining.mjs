#!/usr/bin/env node
// v1.3.19 — gate para os seis PBs finais e correspondência PB-FC candidata, sem ensaios.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const catalog=read('data/knowledge/diagnostic/playbooks.v1.json');
const old=read('data/quality/playbook-deepdives.v1.json');
const data=read('data/quality/playbook-deepdives-remaining.v1.json');
const cross=read('data/quality/playbook-causal-crosswalk.v1.json');
const fixtures=read('data/quality/playbook-deepdives-remaining-regressions.v1.json');
const chains=new Set(read('data/knowledge/causal-chains.v1.json').records.map(r=>r.id));
const methods=new Set(read('data/ontology/concepts.v1.json').evidenceMethods.map(r=>r.id));
const sources=new Set(read('data/research/sources.v1.json').sources.map(r=>r.id));
const d9=read('data/quality/oem-d9-evidence-intake.v1.json');
const errors=[],ck=(v,m)=>{if(!v)errors.push(m)},eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),copy=x=>JSON.parse(JSON.stringify(x));
const ids=['PB-EXC-PUMP-01','PB-EXC-HOSE-01','PB-SHOVEL-COOL-01','PB-TRUCK-FINAL-01','PB-DOZER-TRACK-01','PB-LOADER-RADIATOR-01'];
const expected={
 'PB-EXC-PUMP-01':[[],['FC-HOSE-003'],[]],
 'PB-EXC-HOSE-01':[['FC-HOSE-003'],['FC-HOSE-001'],[]],
 'PB-SHOVEL-COOL-01':[['FC-COOL-001'],['FC-COOL-002'],['FC-COOL-003']],
 'PB-TRUCK-FINAL-01':[['FC-FD-004'],[],[]],
 'PB-DOZER-TRACK-01':[['FC-TRACK-001','FC-TRACK-002'],['FC-TRACK-003'],['FC-TRACK-004','FC-TRACK-005','FC-TRACK-006']],
 'PB-LOADER-RADIATOR-01':[['FC-COOL-001'],['FC-COOL-002'],['FC-COOL-003','FC-COOL-005','FC-COOL-007']]
};
function inspect(d){
 const problems=[],ok=(v,m)=>{if(!v)problems.push(m)};
 const pb=catalog.records.find(x=>x.id===d.playbookId);
 if(!pb)return ['playbook inexistente'];
 ok(ids.includes(d.playbookId)&&d.id?.startsWith('DEEP-'),'ID inválido');
 ok(d.title===pb.title&&eq(d.modelIds,pb.target.modelIds),'equipamento alterado');
 ok(d.sourcePlaybookVersion===catalog.version&&d.originScenarioStatus==='cenario_autoral_sintetico'&&d.originScenarioStatus===pb.reportedSymptom.source,'origem não sintética');
 ok(d.objective?.length>=90&&d.system?.length>=8,'objetivo pobre');
 ok(eq(d.hypotheses,pb.hypotheses.map(h=>({id:h.id,label:h.label,expectedSigns:h.expectedSigns,counterSigns:h.counterSigns}))),'H1 H2 H3 alterados');
 ok(eq(d.sourceTestIds,pb.tests.map(t=>t.id)),'T1 T2 alterados');
 ok(d.stages?.length===3&&new Set(d.stages.map(s=>s.id)).size===3,'etapas insuficientes');
 for(const [i,s] of (d.stages||[]).entries()){
  ok(s.id==='S'+(i+1)&&methods.has(s.methodId),'método/etapa');
  ok(s.sourceTestId===(i<2?pb.tests[i].id:null),'teste origem inválido');
  ok(s.question?.length>=95&&s.nonDiscrimination?.length>=85&&s.safeBoundary?.length>=95,'lacuna ou segurança ausente');
  ok(eq(Object.keys(s.signals||{}).sort(),['H1','H2','H3']),'sinais H1 H2 H3 ausentes');
  for(const h of ['H1','H2','H3'])ok(s.signals?.[h]?.length>=70,'sinal curto '+h);
  ok(s.requiredMetadata?.length>=5&&s.requiredMetadata.includes('equipmentContext')&&s.requiredMetadata.includes('dateTime'),'metadados insuficientes');
  ok(s.performed===false&&s.resultObserved===null&&s.oemEffective===false&&s.independentEvidenceVerified===false,'campo executado fictício');
 }
 ok(d.readiness?.requires?.length===4&&new Set(d.readiness.requires).size===4&&d.readiness.requires.every(t=>t.length>=65),'gate incompleto');
 ok(d.readiness?.whenMissing==='inconclusivo'&&d.readiness?.whenComplete==='apto_para_revisao_nao_confirmado','gate confirma causa');
 ok(d.sourceIds?.length>=3&&d.sourceIds.every(id=>sources.has(id)),'fontes não catalogadas');
 ok(d.sourceNature==='literatura_geral_sem_efetividade_de_serie','OEM não validado');
 ok(d.linkedCausalChainId===null&&d.serialOrArrangement===null&&d.sapLocationId===null&&d.confirmedComponentCode===null,'SAP / série fictícia');
 ok(d.caseReview?.status==='pendente_sem_evidencia'&&d.caseReview?.engineering===null&&d.caseReview?.independent===null&&d.caseReview?.oem===null,'parecer fictício');
 ok(d.executionStatus==='not_performed'&&d.observedEvents===0&&d.confirmedRootCause===false&&d.approvedForOperationalUse===false,'falha real fabricada');
 return problems;
}
function inspectCross(rows){
 const errors=[],ok=(v,m)=>{if(!v)errors.push(m)};
 ok(rows.length===18&&new Set(rows.map(x=>x.id)).size===18,'18 IDs esperados');
 for(const id of ids)for(const h of ['H1','H2','H3']){
  const a=rows.find(x=>x.id==='XW-'+id+'-'+h),pb=catalog.records.find(x=>x.id===id),d=data.records.find(x=>x.playbookId===id),want=expected[id][Number(h[1])-1];
  if(!a){errors.push('slot ausente '+id+h);continue}
  ok(a.playbookId===id&&a.hypothesisId===h&&a.hypothesisLabel===pb.hypotheses[Number(h[1])-1].label&&a.deepDiveId===d.id,'referência PB incorreta');
  ok(eq((a.candidates||[]).map(c=>c.chainId),want),'cadeias indevidas '+id+h);
  for(const c of a.candidates||[]){
   ok(chains.has(c.chainId)&&c.relationship==='candidate_mechanism_overlap_only','homologia falsa '+id+h);
   ok(c.mechanicalBasis?.length>=70&&c.applicabilityLimitation?.length>=50,'fundamentação/limite omitido '+id+h);
  }
  ok(a.assessment===(want.length?'candidatos_conceituais_nao_aprovados':'sem_cadeia_equivalente_demonstrada'),'aprovação cruzada alterada');
  ok(want.length?a.unmappedRationale===null:a.unmappedRationale?.length>=95,'lacuna sem justificativa');
  ok(a.confirmedMapping===false&&a.approvedSerialOrArrangement===null&&a.approvedSapLocation===null&&a.independentReviewStatus==='pendente'&&a.observedCase===null,'crosswalk homologado ficticiamente');
 }
 return errors;
}
ck(data.schema==='fmea-mining.playbook-deepdives-remaining.v1'&&data.version==='1.3.19'&&data.editorialNature==='roteiros_propostos_para_playbooks_sinteticos_sem_eventos_reais','lote não sintético');
ck(data.records?.length===6&&new Set(data.records.map(x=>x.playbookId)).size===6,'não são seis PBs distintos');
ck(eq(data.records.map(x=>x.playbookId).sort(),ids.slice().sort()),'identidade de PB incorreta');
ck(old.records.length===6&&new Set([...old.records,...data.records].map(x=>x.playbookId)).size===12,'cobertura documental menor que 12');
ck(eq(data.counts,{previousDeepdives:6,newDeepdives:6,totalDeepdives:12,newInvestigationStages:18,newReadinessRequirements:24,observedEvents:0,confirmedRootCauses:0}),'contagens incorretas');
for(const d of data.records){const fail=inspect(d);ck(!fail.length,d.id+': '+fail.join('|'))}
ck(cross.schema==='fmea-mining.playbook-causal-crosswalk.v1'&&cross.version==='1.3.19'&&cross.nature==='editorial_candidate_mapping_not_sap_or_oem_approved','natureza do crosswalk');
ck(cross.sourceDeepDive==='data/quality/playbook-deepdives-remaining.v1.json','referência de lote incorreta');
const crossErrors=inspectCross(cross.records);ck(!crossErrors.length,crossErrors.join(' | '));
ck(eq(cross.counts,{playbookHypothesesReviewed:18,hypothesesWithCandidates:13,hypothesesWithoutEquivalent:5,candidateLinks:18,confirmedMappings:0}),'contadores crosswalk incorretos');
ck(d9.requiredInputs.length===7&&d9.requiredInputs.every(x=>x.approved===false),'D9 indevidamente aprovado');
ck(fixtures.schema==='fmea-mining.playbook-deepdives-remaining-regressions.v1'&&fixtures.version==='1.3.19'&&fixtures.nature==='synthetic_only','fixtures inválidos');
ck(fixtures.readinessCases?.length===18&&fixtures.mutationCases?.length===16&&fixtures.crosswalkMutations?.length===12,'46 regressões exigidas');
const seen=new Set(),per=new Map();
for(const f of fixtures.readinessCases||[]){
 ck(!seen.has(f.id),'regressão duplicada');seen.add(f.id);
 const d=data.records.find(x=>x.id===f.deepDiveId);if(!d){errors.push('PB de regressão ausente');continue}
 per.set(d.id,(per.get(d.id)||0)+1);
 ck(f.observedData===null&&f.availableRequirements.every(x=>d.readiness.requires.includes(x)),'evidência inventada');
 ck(f.expected===(d.readiness.requires.every(x=>f.availableRequirements.includes(x))?'apto_para_revisao_nao_confirmado':'inconclusivo'),'prontidão incorreta');
}
ck(per.size===6&&[...per.values()].every(n=>n===3),'prontidão incompleta por PB');
const mutate={
 inventSerial:d=>{d.serialOrArrangement='FAKE'},inventComponent:d=>{d.confirmedComponentCode='FAKE'},approveOperational:d=>{d.approvedForOperationalUse=true},
 confirmCause:d=>{d.confirmedRootCause=true},inventObserved:d=>{d.stages[0].resultObserved='FAKE'},inventOemReview:d=>{d.caseReview.oem='fake'},
 eraseAlternative:d=>{d.hypotheses.pop()},alterHypothesis:d=>{d.hypotheses[0].label='FAKE'},inventMethod:d=>{d.stages[0].methodId='EV-FAKE'},
 dropSafety:d=>{d.stages[0].safeBoundary=''},dropMetadata:d=>{d.stages[0].requiredMetadata=[]},deleteStage:d=>{d.stages.pop()},
 deleteRequirement:d=>{d.readiness.requires.pop()},wrongSourceTest:d=>{d.stages[0].sourceTestId='T2'},
 inventSource:d=>{d.sourceIds=['FAKE-SOURCE']},duplicateStageId:d=>{d.stages[2].id='S1'}
};
for(const f of fixtures.mutationCases||[]){
 ck(!seen.has(f.id),'regressão repetida');seen.add(f.id);
 const d=data.records.find(x=>x.id===f.deepDiveId);if(!d||!mutate[f.mutation]){errors.push('mutação desconhecida '+f.id);continue}
 const copyData=copy(d);mutate[f.mutation](copyData);
 ck(f.expected==='reject'&&f.observedData===null&&inspect(copyData).length>0,'mutação perigosa aceita '+f.id);
}
const crossMutate={
 approveMapping:x=>{x.confirmedMapping=true},inventSerial:x=>{x.approvedSerialOrArrangement='FAKE'},
 inventSapLocation:x=>{x.approvedSapLocation='FAKE'},fakeObservation:x=>{x.observedCase={fake:true}},
 inventChainId:x=>{x.candidates[0].chainId='FC-FAKE'},inventHypothesis:x=>{x.hypothesisId='H0'},
 removeReason:x=>{x.candidates[0].mechanicalBasis=''},removeLimit:x=>{x.candidates[0].applicabilityLimitation=''},
 changeLabel:x=>{x.hypothesisLabel='FAKE'},wrongDeepDive:x=>{x.deepDiveId='FAKE'},
 removeUnmappedReason:x=>{x.unmappedRationale=''},duplicateXref:(x,rows)=>{rows.push(copy(x))}
};
for(const f of fixtures.crosswalkMutations||[]){
 ck(!seen.has(f.id),'regressão crosswalk repetida');seen.add(f.id);
 const rows=copy(cross.records),x=rows.find(t=>t.id===f.crosswalkId);
 if(!x||!crossMutate[f.mutation]){errors.push('mutação crosswalk inválida '+f.id);continue}
 crossMutate[f.mutation](x,rows);
 ck(f.expected==='reject'&&f.observedData===null&&inspectCross(rows).length>0,'mutação crosswalk aceita '+f.id);
}
const result={status:errors.length?'FAIL':'OK',playbookDeepdivesTotal:12,newDeepdives:6,newSteps:18,newReadinessRequirements:24,reviewedHypotheses:18,candidateLinks:18,unmappedHypotheses:5,syntheticReadiness:18,syntheticDeepDiveMutations:16,syntheticCrosswalkMutations:12,fieldEvents:0,approvedOem:0,confirmedCauses:0,errors:errors.slice(0,40)};
console.log(JSON.stringify(result,null,2));process.exit(errors.length?1:0);
