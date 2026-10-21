#!/usr/bin/env node
// FMEA v1.3.20 — triagem de lacunas PB/FC; não altera 24 cadeias confirmadas editorialmente nem export público.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const proposals=read('data/quality/proposed-causal-chains.v1.json');
const triage=read('data/quality/causal-gap-triage.v1.json');
const fixtures=read('data/quality/causal-gap-triage-regressions.v1.json');
const old=read('data/quality/playbook-causal-crosswalk.v1.json');
const core=read('data/knowledge/causal-chains.v1.json');
const sources=new Set(read('data/research/sources.v1.json').sources.map(s=>s.id));
const methods=new Set(read('data/ontology/concepts.v1.json').evidenceMethods.map(s=>s.id));
const errors=[],ck=(ok,msg)=>{if(!ok)errors.push(msg)};
const clone=x=>JSON.parse(JSON.stringify(x));
const EXPECTED={
 'XW-PB-EXC-PUMP-01-H1':['propor_cadeia_mecanica_condicional','CAND-HYD-PUMP-SEAL-001','missing_physical_failure_mode'],
 'XW-PB-EXC-PUMP-01-H3':['propor_cadeia_mecanica_condicional','CAND-HYD-PUMP-INTERNAL-001','symptom_requiring_mechanism_split'],
 'XW-PB-EXC-HOSE-01-H3':['nao_gerar_cadeia',null,'source_localization_not_failure_mode'],
 'XW-PB-TRUCK-FINAL-01-H2':['propor_cadeia_mecanica_condicional','CAND-FD-GEAR-TOOTH-001','missing_physical_failure_mode'],
 'XW-PB-TRUCK-FINAL-01-H3':['nao_gerar_cadeia',null,'fluid_condition_not_mechanical_failure']
};
const proposalIds=['CAND-HYD-PUMP-SEAL-001','CAND-HYD-PUMP-INTERNAL-001','CAND-FD-GEAR-TOOTH-001'];
function inspectProposal(x){
 const problems=[],c=(ok,msg)=>{if(!ok)problems.push(msg)};
 c(proposalIds.includes(x.id)&&x.classification==='mechanical_failure_mode_candidate'&&x.editorialDisposition==='proposta_de_nova_cadeia_nao_integrada','identidade ou status inválido');
 const matched=Object.entries(EXPECTED).find(([,values])=>values[1]===x.id);
 c(!!matched,'proposta não referenciada');
 if(matched)c(x.relatedPlaybookId===matched[0].split('-').slice(1,-1).join('-')&&x.relatedHypothesisId===matched[0].split('-').at(-1),'vínculo com hipótese diferente');
 c(x.family==='bombas_hidraulicas'||x.family==='comando_final','família inválida');
 for(const key of ['title','operatingFunction','functionalFailureCandidate','physicalMechanismCandidate','possibleDamage','nonOrganizationalAlternative'])
  c(typeof x[key]==='string'&&x[key].length>=65,'fundamentação insuficiente '+key);
 c(Array.isArray(x.alternativeHypotheses)&&x.alternativeHypotheses.length===2&&x.alternativeHypotheses.every(z=>z.length>=55),'explicações alternativas ausentes');
 c(Array.isArray(x.minimumIndependentEvidence)&&x.minimumIndependentEvidence.length===3&&x.minimumIndependentEvidence.every(z=>z.length>=75),'evidência faltante');
 c(Array.isArray(x.sources)&&x.sources.length>=3&&x.sources.every(s=>sources.has(s)),'bibliografia não indexada');
 c(Array.isArray(x.diagnosticTests)&&x.diagnosticTests.length===2,'testes incompletos');
 for(const t of x.diagnosticTests||[]){
  c(methods.has(t.methodId)&&t.question?.length>=80,'teste de método inválido');
  c(t.positiveOnlyIf?.length>=75&&t.counterEvidence?.length>=70&&t.safeBoundary?.length>=85,'contraprova ou segurança insuficiente');
 }
 c(x.promotedToCore===false&&x.applicableSerialOrArrangement===null&&x.approvedModelId===null&&x.approvedSapLocation===null&&x.partNumber===null&&x.measuredThreshold===null,'evidência OEM/SAP inventada');
 c(x.fieldObservation===null&&x.observedOccurrences===0&&x.confirmedRootCause===false,'evento ou causa fictícia');
 c(x.review?.status==='not_reviewed'&&x.review.technicalReviewer===null&&x.review.independentReviewer===null&&x.review.decision===null,'parecer aprovado sem revisão');
 return problems;
}
function inspectTriage(rows){
 const issues=[],c=(ok,msg)=>{if(!ok)issues.push(msg)};
 c(rows.length===5&&new Set(rows.map(x=>x.gapId)).size===5,'cinco slots únicos exigidos');
 for(const [id,expect] of Object.entries(EXPECTED)){
  const x=rows.find(z=>z.gapId===id),original=old.records.find(z=>z.id===id);
  if(!x){issues.push('lacuna omitida '+id);continue}
  c(original?.candidates?.length===0&&original.confirmedMapping===false,'crosswalk original não é lacuna '+id);
  c(x.decision===expect[0]&&x.proposalId===expect[1]&&x.classification===expect[2],'classificação/promessa incorreta '+id);
  c(x.reason?.length>=90&&x.requiredDiscriminator?.length>=80&&x.competingExplanation?.length>=60,'triagem sem discriminação '+id);
  c(x.baselineCandidateCount===0&&x.independentEvidenceReviewed===false&&x.sapLinkApproved===false&&x.oemEffectivityVerified===false&&x.fieldEvents===0&&x.approvedRootCause===false,'triagem artificialmente aprovada '+id);
 }
 return issues;
}
ck(proposals.schema==='fmea-mining.proposed-causal-chains.v1'&&proposals.version==='1.3.20','coleção de propostas inválida');
ck(proposals.policy?.neverAutoPromote===true&&proposals.policy.publicExportUntouched===true&&proposals.policy.requireOemEffectivity===true&&proposals.policy.requireIndependentReview===true&&proposals.policy.neverTreatConditionAsDamage===true,'política de segurança relaxada');
ck(proposals.records?.length===3&&new Set(proposals.records.map(x=>x.id)).size===3,'três propostas únicas exigidas');
ck(proposals.counts?.existingCoreChains===24&&proposals.counts.proposedChains===3&&proposals.counts.addedToCore===0&&proposals.counts.observedEvents===0&&proposals.counts.confirmedRootCauses===0,'contadores de promoção alterados');
ck(core.records.length===24&&core.counts.chains===24&&!core.records.some(x=>proposalIds.includes(x.id)),'núcleo alterado sem autorização');
for(const p of proposals.records){const issues=inspectProposal(p);ck(issues.length===0,p.id+': '+issues.join('|'))}
ck(triage.schema==='fmea-mining.causal-gap-triage.v1'&&triage.version==='1.3.20'&&triage.sourceCrosswalk==='data/quality/playbook-causal-crosswalk.v1.json','triagem sem rastreabilidade');
ck(triage.classification==='editorial_decisions_not_observed_failure_events','natureza de ocorrência alterada');
ck(triage.counts?.examinedGaps===5&&triage.counts.mechanicalCandidatesProposed===3&&triage.counts.nonFailureInterpretations===2&&triage.counts.coreChainsAdded===0&&triage.counts.crosswalkMappingsApproved===0,'métricas da triagem incorretas');
const triageProblems=inspectTriage(triage.records);ck(triageProblems.length===0,triageProblems.join('|'));
ck(fixtures.schema==='fmea-mining.causal-gap-triage-regressions.v1'&&fixtures.version==='1.3.20'&&fixtures.nature==='synthetic_only'&&fixtures.decisionCases?.length===5&&fixtures.mutationCases?.length===16,'21 regressões exigidas');
const allFixtureIds=new Set();
for(const t of fixtures.decisionCases||[]){
 ck(!allFixtureIds.has(t.id),'fixture duplicado '+t.id);allFixtureIds.add(t.id);
 const x=triage.records.find(x=>x.gapId===t.gapId);
 ck(!!x&&x.decision===t.expectedDecision&&x.proposalId===t.expectedProposal,'decisão esperada incongruente '+t.id);
}
const proposalsMutations={
 promoteToCore:p=>{p.promotedToCore=true},assignSerial:p=>{p.applicableSerialOrArrangement='FAKE'},
 confirmRootCause:p=>{p.confirmedRootCause=true},assignSapLocation:p=>{p.approvedSapLocation='FAKE'},
 removeIndependentEvidence:p=>{p.minimumIndependentEvidence.pop()},removeCounterEvidence:p=>{p.diagnosticTests[0].counterEvidence=''},
 inventSource:p=>{p.sources.push('FAKE-SOURCE')},fakeObservation:p=>{p.fieldObservation={fake:true}},
 approveReview:p=>{p.review.status='approved'}
};
const triageMutations={
 conditionAsFailure:rows=>{rows.find(x=>x.gapId==='XW-PB-TRUCK-FINAL-01-H3').decision='propor_cadeia_mecanica_condicional'},
 alterCrosswalkGap:rows=>{rows[0].gapId='XW-MISSING'},
 fakeApprovedLink:rows=>{rows[0].sapLinkApproved=true},
 misassignProposal:rows=>{rows[0].proposalId='CAND-FD-GEAR-TOOTH-001'},
 removeDecision:rows=>{rows[0].decision=null},
 inventEvidence:rows=>{rows[0].independentEvidenceReviewed=true},
 duplicateGap:rows=>{rows.push(clone(rows[0]))}
};
for(const m of fixtures.mutationCases||[]){
 ck(!allFixtureIds.has(m.id),'mutação duplicada '+m.id);allFixtureIds.add(m.id);
 if(m.scope==='proposal'){
  const f=proposalsMutations[m.mutation];if(!f){errors.push('mutação desconhecida '+m.id);continue}
  const x=clone(proposals.records[0]);f(x);ck(inspectProposal(x).length>0,'mutação candidata não bloqueada '+m.id);
 }else if(m.scope==='triage'){
  const f=triageMutations[m.mutation];if(!f){errors.push('mutação desconhecida '+m.id);continue}
  const rows=clone(triage.records);f(rows);ck(inspectTriage(rows).length>0,'mutação triagem não bloqueada '+m.id);
 }else errors.push('escopo sintético desconhecido '+m.id);
}
const result={status:errors.length?'FAIL':'OK',legacyCoreChains:core.records.length,gapsReviewed:5,proposedPhysicalMechanisms:3,nonFailureClassifications:2,corePromotions:0,confirmedSapLinks:0,actualEvents:0,decisionFixtures:5,mutationRegressions:16,errors:errors.slice(0,30)};
console.log(JSON.stringify(result,null,2));
process.exit(errors.length?1:0);
