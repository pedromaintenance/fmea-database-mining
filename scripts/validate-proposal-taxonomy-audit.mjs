#!/usr/bin/env node
// Gate v1.3.21: coerência taxonômica de candidatas, sem revisão OEM/operacional.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const proposal=read('data/quality/proposed-causal-chains.v1.json');
const audit=read('data/quality/proposal-taxonomy-audit.v1.json');
const fixtures=read('data/quality/proposal-taxonomy-regressions.v1.json');
const ontology=read('data/ontology/concepts.v1.json');
const core=read('data/knowledge/causal-chains.v1.json');
const rootEffects=read('data/knowledge/causal-effects.v1.json');
const problem=[],ck=(v,m)=>{if(!v)problem.push(m)};
const copy=x=>JSON.parse(JSON.stringify(x));
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const expected={
 'CAND-HYD-PUMP-SEAL-001':{
   ff:'FF-06',mechanisms:['ME-15'],overlaps:['FC-HOSE-003','FC-COOL-008'],
   status:'hold_for_oem_boundary_and_independent_review',ontologyGap:false},
 'CAND-HYD-PUMP-INTERNAL-001':{
   ff:'FF-02',mechanisms:['ME-15','ME-01','ME-02'],overlaps:['FC-COOL-007'],
   status:'hold_for_mechanism_definition_and_oem_review',ontologyGap:true},
 'CAND-FD-GEAR-TOOTH-001':{
   ff:'FF-02',mechanisms:['ME-03','ME-01','ME-02'],overlaps:['FC-FD-001','FC-FD-003','FC-FD-004'],
   status:'hold_for_split_gear_mechanisms_and_oem',ontologyGap:false}
};
const functions=new Map(ontology.functionalFailures.map(x=>[x.id,x]));
const mechanisms=new Set(ontology.mechanismFamilies.map(x=>x.id));
const chains=new Set(core.records.map(x=>x.id));
function inspectRow(x){
 const errors=[],check=(v,m)=>{if(!v)errors.push(m)};
 const p=proposal.records.find(y=>y.id===x.proposalId);
 const e=expected[x.proposalId];if(!e||!p)return ['proposta ausente ou ID indevido'];
 check(x.originPlaybookId===p.relatedPlaybookId&&x.originHypothesisId===p.relatedHypothesisId&&x.sourceProposalVersion===proposal.version,'rastreio PB/H alterado');
 check(x.originalMechanismText===p.physicalMechanismCandidate&&x.originalFunctionText===p.operatingFunction,'texto de origem alterado');
 const f=x.functionAudit;
 check(f?.existingFunctionalFailureId===e.ff&&functions.has(f?.existingFunctionalFailureId),'função incompatível');
 check(f?.criterionFromOntology===functions.get(e.ff)?.criteria,'critério ontológico adulterado');
 check(f?.classification==='proposed_not_verified'&&f?.rationale?.length>=95,'homologação ou justificativa ausente');
 check(eq(x.mechanismAudit?.map(y=>y.mechanismId),e.mechanisms),'ME omitido/inventado');
 for(const y of x.mechanismAudit||[]){
  check(mechanisms.has(y.mechanismId)&&y.limit?.length>=75,'limite de ME insuficiente');
  check(typeof y.fit==='string'&&y.fit.length>=10,'enquadramento de mecanismo vazio');
 }
 check(eq(x.coreOverlaps?.map(y=>y.coreId),e.overlaps),'duplicidades alteradas');
 for(const y of x.coreOverlaps||[])check(chains.has(y.coreId)&&y.relation?.length>=15&&y.distinction?.length>=90,'sobreposição sem fronteira');
 check(e.ontologyGap?
  x.ontologyGap?.status==='needs_ontology_definition'&&x.ontologyGap?.conceptId===null&&x.ontologyGap?.rationale?.length>=100:
  x.ontologyGap===null,'conceito novo presumido/homologia alterada');
 if(x.proposalId==='CAND-HYD-PUMP-INTERNAL-001')check(x.mechanismAudit[0]?.fit==='not_equivalent_without_seal','ME-15 usado como fuga interna sem vedação');
 if(x.proposalId==='CAND-FD-GEAR-TOOTH-001')check(x.mechanismAudit.every(y=>y.fit.startsWith('separate_')),'mecanismos de engrenagem agregados indevidamente');
 check(x.disposition===e.status&&x.auditFinding?.length>=110,'status ou conclusão relaxados');
 check(x.alternativeExplanation?.length>=100,'hipótese alternativa excluída');
 check(x.requiredBeforePromotion?.length===3&&x.requiredBeforePromotion.every(y=>y.length>=100),'gate de promoção incompleto');
 const fx=x.possibleEffects;
 check(fx?.status==='possible_unobserved'&&fx?.severity===null&&fx?.probability===null&&fx.local?.length>=85&&fx.system?.length>=85,'efeito/severidade tratados como evento real');
 check(x.approvedCoreId===null&&x.approvedSapLocation===null&&x.applicableSerial===null&&x.observedEffect===null,'dado OEM/SAP/observação inventado');
 check(x.reviewerTechnical===null&&x.reviewerIndependent===null&&x.reviewDecision===null&&x.confirmedRootCause===false,'parecer ou causa real inventada');
 return errors;
}
function inspectBatch(rows){
 const errors=[];
 if(rows.length!==3||new Set(rows.map(x=>x.proposalId)).size!==3)errors.push('três candidatas únicas são obrigatórias');
 for(const id of Object.keys(expected))if(!rows.some(x=>x.proposalId===id))errors.push('faltou proposta '+id);
 for(const x of rows)errors.push(...inspectRow(x).map(s=>x.proposalId+' '+s));
 return errors;
}
ck(audit.schema==='fmea-mining.proposal-taxonomy-audit.v1'&&audit.version==='1.3.21'&&audit.nature==='editorial_ontology_coherence_only','documento de auditoria inválido');
ck(audit.references?.sourceProposals==='data/quality/proposed-causal-chains.v1.json'&&audit.references.core==='data/knowledge/causal-chains.v1.json'&&audit.references.ontology==='data/ontology/concepts.v1.json','proveniência inválida');
ck(eq(audit.counts,{reviewedCandidates:3,functionClassifications:3,mechanismOntologyGap:1,mechanismsRequiringSplit:1,approvedCorePromotions:0,observedEvents:0,existingCoreChains:24}),'contadores indevidos');
ck(core.records.length===24&&core.counts.chains===24&&rootEffects.records.length===24,'núcleo FMEA/efeitos alterado');
ck(proposal.records.length===3&&proposal.records.every(x=>x.promotedToCore===false&&x.confirmedRootCause===false),'candidata promovida na origem');
ck(!core.records.some(x=>x.id.startsWith('CAND-')),'candidata presente no núcleo');
problem.push(...inspectBatch(audit.records));
ck(fixtures.schema==='fmea-mining.proposal-taxonomy-regressions.v1'&&fixtures.version==='1.3.21'&&fixtures.nature==='synthetic_only'&&fixtures.baselineCases?.length===3&&fixtures.mutationCases?.length===18,'regressões 3+18 incompletas');
const allIds=new Set();
for(const x of fixtures.baselineCases||[]){
 ck(!allIds.has(x.id),'teste repetido '+x.id);allIds.add(x.id);
 const p=audit.records.find(y=>y.proposalId===x.proposalId);
 ck(p&&p.disposition===x.expectedDisposition&&p.functionAudit.existingFunctionalFailureId===x.expectedFF,'baseline adulterada '+x.id);
}
const mutations={
 approveCore:x=>{x.approvedCoreId='FC-FAKE'},
 confirmRoot:x=>{x.confirmedRootCause=true},
 inventSerial:x=>{x.applicableSerial='FAKE'},
 assignSap:x=>{x.approvedSapLocation='FAKE'},
 fakeReviewer:x=>{x.reviewerIndependent='FAKE'},
 fakeObservation:x=>{x.observedEffect={fake:true}},
 changeFF:x=>{x.functionAudit.existingFunctionalFailureId='FF-08'},
 inventME:x=>{x.mechanismAudit[0].mechanismId='ME-FAKE'},
 eraseAlternative:x=>{x.alternativeExplanation=''},
 erasePromotionGate:x=>{x.requiredBeforePromotion.pop()},
 inventOverlap:x=>{x.coreOverlaps[0].coreId='FC-FAKE'},
 fakeSeverity:x=>{x.possibleEffects.severity=1},
 eraseOntologyGap:x=>{x.ontologyGap=null},
 eraseGearSplit:x=>{x.mechanismAudit[0].fit='combined'},
 wrongOrigin:x=>{x.originHypothesisId='H0'},
 eraseMechanismBoundaries:x=>{x.mechanismAudit[0].limit=''},
 duplicateCandidate:(x,rows)=>{rows.push(copy(x))},
 fakeObservedEffect:x=>{x.possibleEffects.status='measured'}
};
for(const t of fixtures.mutationCases||[]){
 ck(!allIds.has(t.id),'teste repetido '+t.id);allIds.add(t.id);
 const rows=copy(audit.records),x=rows.find(y=>y.proposalId===t.proposalId),fn=mutations[t.kind];
 if(!x||!fn){problem.push('mutação inválida '+t.id);continue}
 fn(x,rows);
 ck(t.expected==='reject'&&inspectBatch(rows).length>0,'mutação não bloqueada '+t.id);
}
const result={status:problem.length?'FAIL':'OK',coreChains:24,proposalsAudited:audit.records.length,functionAssignments:3,mechanismConceptReview:1,mechanismSplitRequired:1,overlapCandidates:audit.records.reduce((n,x)=>n+x.coreOverlaps.length,0),mutationsRejected:fixtures.mutationCases?.length,corePromotions:0,observedFailures:0,errors:problem.slice(0,35)};
console.log(JSON.stringify(result,null,2));process.exit(problem.length?1:0);
