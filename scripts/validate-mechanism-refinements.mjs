#!/usr/bin/env node
// Gate v1.3.22 — refinamentos exclusivamente editoriais: vazamento interno normal vs excessivo, flancos ME-01/02/03.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const data=read('data/quality/mechanism-refinements.v1.json');
const tests=read('data/quality/mechanism-refinements-regressions.v1.json');
const ontology=read('data/ontology/concepts.v1.json');
const core=read('data/knowledge/causal-chains.v1.json');
const proposals=read('data/quality/proposed-causal-chains.v1.json');
const previous=read('data/quality/proposal-taxonomy-audit.v1.json');
const bibliography=read('data/research/sources.v1.json');
const ff=new Set(ontology.functionalFailures.map(x=>x.id));
const me=new Set(ontology.mechanismFamilies.map(x=>x.id));
const source=new Set(bibliography.sources.map(x=>x.id));
const methods=new Set(ontology.evidenceMethods.map(x=>x.id));
const expected=new Map([
 ['ME-CAND-HYD-INTERNAL-LEAKAGE-001',{kind:'candidate_mechanism_concept',parent:'CAND-HYD-PUMP-INTERNAL-001',mechanism:null,ff:'FF-02'}],
 ['SUB-GEAR-ABRASION-001',{kind:'proposed_gear_damage_submode',parent:'CAND-FD-GEAR-TOOTH-001',mechanism:'ME-01',ff:'FF-02'}],
 ['SUB-GEAR-ADHESION-001',{kind:'proposed_gear_damage_submode',parent:'CAND-FD-GEAR-TOOTH-001',mechanism:'ME-02',ff:'FF-02'}],
 ['SUB-GEAR-FATIGUE-001',{kind:'proposed_gear_damage_submode',parent:'CAND-FD-GEAR-TOOTH-001',mechanism:'ME-03',ff:'FF-02'}]
]);
const issues=[],ck=(ok,msg)=>{if(!ok)issues.push(msg)};
const copy=x=>JSON.parse(JSON.stringify(x));
function checkRecord(x){
 const err=[],ok=(v,s)=>{if(!v)err.push(s)};
 const e=expected.get(x.id);
 if(!e)return ['ID não autorizado '+x.id];
 ok(x.kind===e.kind&&x.parentProposalId===e.parent&&x.parentMechanismId===e.mechanism,'tipo, parent ou ME divergente');
 ok(x.functionalFailureId===e.ff&&ff.has(x.functionalFailureId),'FF incompatível');
 ok(x.family===(e.kind==='candidate_mechanism_concept'?'bombas_hidraulicas':'comando_final'),'sistema incorreto');
 ok(proposals.records.some(p=>p.id===x.parentProposalId),'proposta parent ausente');
 ok(x.causalPosition===(e.kind==='candidate_mechanism_concept'?'candidate_physical_mechanism_not_root_cause':'candidate_damage_mechanism_not_observed'),'fenômeno promovido a causa');
 for(const key of ['label','physicalDefinition','mechanicalFunction','safeBoundary','sourceUseLimit'])
  ok(typeof x[key]==='string'&&x[key].length>=70,'texto físico/segurança insuficiente '+key);
 ok(x.sourceIds?.length>=3&&x.sourceIds.every(z=>source.has(z)),'fonte inválida');
 ok(x.methodIds?.length===2&&x.methodIds.every(z=>methods.has(z)),'método inexistente');
 ok(x.observedParameterValues===null&&x.approvedThreshold===null&&x.applicableSerialOrArrangement===null,'limite, dado ou série OEM fabricado');
 ok(x.observedPhysicalDamage===null&&x.actualFieldOccurrences===0&&x.independentReviewStatus==='not_reviewed','dano real/revisão inventados');
 ok(x.approvedNewOntologyId===null&&x.approvedCoreChainId===null&&x.confirmedRootCause===false&&x.editorialState==='proposal_only','proposta artificialmente aprovada');
 if(e.kind==='candidate_mechanism_concept'){
  ok(x.id.startsWith('ME-CAND-')&&!me.has(x.id),'novo ME aprovado indevidamente');
  ok(x.normalVersusAbnormal?.startsWith('Algum vazamento interno é previsto')&&x.normalVersusAbnormal.length>=125,'vazamento interno normal indevidamente classificado como falha');
  ok(x.notEquivalent?.length===4&&['ME-15','ME-01','ME-02','ME-14'].every((id,i)=>x.notEquivalent[i]?.ontologyId===id),'analogia ME de origem não discriminada');
  ok(x.notEquivalent?.every(z=>z.reason?.length>=90),'ausência de fronteira com ME');
  ok(x.alternativeHypotheses?.length===3&&x.alternativeHypotheses.every(z=>z.length>=90),'alternativas hidráulicas insuficientes');
  ok(x.discriminatingEvidence?.length===4&&x.discriminatingEvidence.every((z,i)=>z.id==='G'+(i+1)&&z.evidence?.length>=95&&z.interpretation?.length>=75),'gate de evidência hidráulica perdido');
  ok(x.sourceUseLimit?.includes('nenhuma publicação disponível confirma curva')&&x.sourceIds.includes('PARKER-MOBILE-VANE-INTERNAL-LEAKAGE'),'curva genérica transplantada para CAT 395');
  ok(x.safeBoundary?.includes('dreno de carcaça'),'segurança de dreno omitida');
 }else{
  ok(me.has(x.parentMechanismId)&&x.id.startsWith('SUB-GEAR-'),'ME original inválido');
  ok(x.morphologyHypothesis?.length>=95&&x.distinguishingFrom?.length===3&&x.distinguishingFrom.every(z=>z.length>=85),'morfologia não discriminada');
  ok(x.competingCauses?.length===2&&x.competingCauses.every(z=>z.length>=85),'hipótese concorrente de engrenagem ausente');
  ok(x.evidenceNeeded?.length===3&&x.evidenceNeeded.every(z=>z.length>=95),'evidências insuficientes');
  ok(x.sourceIds.includes('ISO-10825-1-2022')&&x.sourceUseLimit?.includes('não')||x.sourceUseLimit?.includes('sem')||x.sourceUseLimit?.includes('não discute'),'fonte ISO sem limite interpretativo');
  if(x.id==='SUB-GEAR-FATIGUE-001')ok(x.parentMechanismId==='ME-03'&&x.sourceUseLimit.includes('não discute causas'),'ISO indevidamente tratada como atribuição causal');
 }
 return err;
}
function checkBatch(rows){
 const er=[];
 if(rows.length!==4||new Set(rows.map(r=>r.id)).size!==4)er.push('quatro refinamentos únicos exigidos');
 for(const k of expected.keys())if(!rows.some(x=>x.id===k))er.push('ausente '+k);
 for(const x of rows)er.push(...checkRecord(x).map(z=>x.id+': '+z));
 const gear=rows.filter(x=>x.kind==='proposed_gear_damage_submode');
 if(gear.length!==3||new Set(gear.map(x=>x.parentMechanismId)).size!==3)er.push('desdobramento exclusivo ME-01/02/03 ausente');
 return er;
}
ck(data.schema==='fmea-mining.mechanism-refinements.v1'&&data.version==='1.3.22'&&data.nature==='candidate_only_no_oem_effectivity','identidade da versão inválida');
ck(data.context?.parentTaxonomyAudit==='data/quality/proposal-taxonomy-audit.v1.json'&&data.context.ontology==='data/ontology/concepts.v1.json'&&data.context.publicPreview==='1.3.12','rastreabilidade de fonte ausente');
ck(data.policy&&Object.values(data.policy).every(x=>x===true),'política relaxada');
ck(JSON.stringify(data.counts)===JSON.stringify({refinements:4,internalLeakageCandidates:1,gearSubmodes:3,newApprovedMechanismIds:0,newApprovedCoreChains:0,fieldObservations:0,OEMApprovals:0}),'indicadores artificiais');
ck(core.records.length===24&&core.counts.chains===24&&ontology.mechanismFamilies.length===15&&previous.records.length===3,'núcleo ou ontologia base foram modificados');
issues.push(...checkBatch(data.records));
ck(tests.schema==='fmea-mining.mechanism-refinements-regressions.v1'&&tests.version==='1.3.22'&&tests.nature==='synthetic_only'&&tests.baselineCases?.length===4&&tests.mutationCases?.length===20,'24 cenários sintéticos exigidos');
const seen=new Set();
for(const b of tests.baselineCases||[]){
 ck(!seen.has(b.id),'teste repetido');seen.add(b.id);
 const x=data.records.find(x=>x.id===b.refinementId);
 ck(x&&x.parentProposalId===b.expectedParent&&x.kind===b.expectedKind,'baseline divergente '+b.id);
}
const mutations={
 promoteOntology:x=>{x.approvedNewOntologyId='ME-16'},
 promoteChain:x=>{x.approvedCoreChainId='FC-FAKE'},
 fabricateSerial:x=>{x.applicableSerialOrArrangement='FAKE'},
 fabricateLimit:x=>{x.approvedThreshold=123},
 fabricateEvidence:x=>{x.observedPhysicalDamage='FAKE'},
 confirmCause:x=>{x.confirmedRootCause=true},
 assignWrongParent:x=>{x.parentProposalId='CAND-FAKE'},
 approveReviewer:x=>{x.independentReviewStatus='approved'},
 dropSafeBoundary:x=>{x.safeBoundary=''},
 inventSource:x=>{x.sourceIds=['FAKE-SOURCE']},
 changeFunction:x=>{x.functionalFailureId='FF-08'},
 confuseMechanism:x=>{x.notEquivalent=[]},
 confuseGearMechanisms:x=>{x.parentMechanismId='ME-01'},
 dropEvidence:x=>{if(x.discriminatingEvidence)x.discriminatingEvidence.pop();else x.evidenceNeeded.pop()},
 removeAlternative:x=>{if(x.alternativeHypotheses)x.alternativeHypotheses.pop();else x.competingCauses.pop()},
 reuseWaterPump:x=>{x.family='arrefecimento'},
 approveNormalLeakageAsFault:x=>{x.normalVersusAbnormal='Toda passagem interna de óleo configura defeito confirmado.'},
 misquoteISO:x=>{x.sourceUseLimit='ISO atribui a causa da fadiga, sem exigir qualquer inspeção.'},
 deleteRefinement:(x,rows)=>{rows.splice(rows.findIndex(r=>r.id===x.id),1)},
 duplicateRefinement:(x,rows)=>{rows.push(copy(x))}
};
for(const t of tests.mutationCases||[]){
 ck(!seen.has(t.id),'teste de mutação duplicado');seen.add(t.id);
 const rows=copy(data.records),x=rows.find(y=>y.id===t.refinementId),fn=mutations[t.mutation];
 if(!x||!fn){issues.push('mutação desconhecida '+t.id);continue}
 fn(x,rows);
 ck(t.expected==='reject'&&checkBatch(rows).length>0,'mutação não rejeitada '+t.id);
}
const out={status:issues.length?'FAIL':'OK',refinements:data.records.length,hydraulicConceptCandidates:1,gearDamageSubmodes:3,existingOntologyMechanisms:ontology.mechanismFamilies.length,existingCoreChains:core.records.length,baselineTests:tests.baselineCases?.length,mutationTests:tests.mutationCases?.length,approvedMechanisms:0,confirmedRootCauses:0,fieldEvidence:0,errors:issues.slice(0,40)};
console.log(JSON.stringify(out,null,2));process.exit(issues.length?1:0);
