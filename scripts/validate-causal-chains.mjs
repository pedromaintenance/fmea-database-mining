#!/usr/bin/env node
// Verifica referencial, natureza inferida e testes das cadeias causais.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const db=read('data/knowledge/causal-chains.v1.json');
const ont=read('data/ontology/concepts.v1.json');
const sources=read('data/research/sources.v1.json').sources;
const pm=read('data/knowledge/pm-prevention/seed-rules.json').records;
const ids=(v)=>new Set(v.map(x=>x.id));
const refs={sources:ids(sources),functions:ids(ont.functionalFailures),symptoms:ids(ont.symptoms),
 mechanisms:ids(ont.mechanismFamilies),methods:ids(ont.evidenceMethods),pm:ids(pm)};
const errors=[];const ok=(b,m)=>{if(!b)errors.push(m)};
const chainIds=new Set(),families=new Set();
const allowedSystems={mangueiras_hidraulicas:['hidraulico'],comando_final:['comando_final'],arrefecimento:['arrefecimento'],material_rodante:['rodante']};
const familyCounts=new Map();
for(const c of db.records){
 ok(!chainIds.has(c.id),'ID de cadeia duplicado '+c.id);chainIds.add(c.id);families.add(c.family);familyCounts.set(c.family,(familyCounts.get(c.family)||0)+1);
 ok(!!allowedSystems[c.family],'familia nao catalogada '+c.id);
 ok(refs.functions.has(c.functionalFailureId),'falha funcional invalida '+c.id);
 ok(c.mechanismIds.length>=1&&c.mechanismIds.every(x=>refs.mechanisms.has(x)),'mecanismo invalido '+c.id);
 ok(c.symptomIds.length>=2&&c.symptomIds.every(x=>refs.symptoms.has(x)),'sintomas invalidos '+c.id);
 ok(c.evidenceMethodIds.length>=2&&c.evidenceMethodIds.every(x=>refs.methods.has(x)),'metodos invalidos '+c.id);
 ok(c.preventionRuleIds.length>=1&&c.preventionRuleIds.every(x=>refs.pm.has(x)),'PM invalida '+c.id);
 const ruleSystems=new Set(pm.filter(x=>c.preventionRuleIds.includes(x.id)).map(x=>x.system));
 ok((allowedSystems[c.family]||[]).some(s=>ruleSystems.has(s)),'regras PM nao condizem com familia '+c.id);
 ok(c.preventionRuleIds.every(id=>{const r=pm.find(x=>x.id===id);return r&&(allowedSystems[c.family]||[]).includes(r.system)}),'PM de outro sistema '+c.id);
 if(c.preventionAssociation)ok(['alvo_de_inspecao_candidato','monitoramento_contextual_nao_alvo_exclusivo_de_ajuste','vinculo_preventivo_contextual_sem_alvo_direto'].includes(c.preventionAssociation),'tipo de ligacao preventiva nao reconhecido '+c.id);
 ok(c.competingHypotheses.length>=2,'menos de duas alternativas '+c.id);
 ok(c.sourceClaims.length>=1&&c.sourceClaims.every(x=>refs.sources.has(x.sourceId)&&x.claim.length>25&&x.scope==='principio_geral'),'fonte sem escopo geral '+c.id);
 ok(c.investigations.length>=2,'menos de dois metodos '+c.id);
 const methods=new Set(c.investigations.map(x=>x.methodId));
 ok(methods.size>=2,'testes repetidos '+c.id);
 for(const t of c.investigations){
  ok(refs.methods.has(t.methodId)&&c.evidenceMethodIds.includes(t.methodId),'teste nao indexado '+c.id+'/'+t.id);
  ok(t.status==='apenas_proposto'&&t.resultObserved===null,'resultado real indevido '+c.id+'/'+t.id);
  ok(['supports','weakens','inconclusive'].every(k=>typeof t.interpretations[k]==='string'&&t.interpretations[k].length>25),'interpretacao incompleta '+c.id+'/'+t.id);
 }
 ok(c.review.status==='inferido_com_literatura_geral'&&c.review.reviewer===null,'curadoria antecipada '+c.id);
 ok(c.sapMapping&&Object.values(c.sapMapping).every(x=>x===null),'efetividade SAP nao verificada '+c.id);
 ok(c.empiricalOccurrences===0&&c.confirmedRootCause===false&&c.factualNature==='hipotese_de_mecanismo','inferido tratado como fato '+c.id);
 ok(typeof c.limitations==='string'&&c.limitations.length>50,'sem limitacoes '+c.id);
}
ok(db.counts.chains===db.records.length,'contagem no manifesto');
ok(db.counts.families===families.size,'contagem de familias');
for(const family of Object.keys(allowedSystems))ok((familyCounts.get(family)||0)>=4,'regressao de cobertura da familia '+family);
ok(chainIds.size>=24&&families.size>=4,'regressao de cobertura acumulada');
for(const id of ['FC-COOL-005','FC-COOL-006','FC-COOL-007','FC-COOL-008']){
 const record=db.records.find(x=>x.id===id);
 ok(record?.preventionAssociation==='vinculo_preventivo_contextual_sem_alvo_direto','ligacao de PM do radiador foi apresentada como especifica: '+id);
}
for(const prefix of ['FC-TRACK-00','FC-COOL-00']){
 const records=db.records.filter(x=>x.id.startsWith(prefix));
 ok(records.length===8,'regressao de subfamilia '+prefix);
}
const report={status:errors.length?'FALHOU':'OK',chains:db.records.length,families:[...families],
 suggestedTests:db.records.reduce((n,c)=>n+c.investigations.length,0),familyCounts:Object.fromEntries(familyCounts),reviewedChains:db.records.filter(x=>x.review.status==='revisado_por_especialista').length,
 verifiedOemConfigurationLinks:0,errors:errors.length};
console.log(JSON.stringify(report,null,2));for(const e of errors)console.error('ERRO: '+e);
process.exit(errors.length?1:0);
