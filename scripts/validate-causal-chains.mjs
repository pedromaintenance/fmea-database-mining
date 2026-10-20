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
for(const c of db.records){
 ok(!chainIds.has(c.id),'ID de cadeia duplicado '+c.id);chainIds.add(c.id);families.add(c.family);
 ok(refs.functions.has(c.functionalFailureId),'falha funcional invalida '+c.id);
 ok(c.mechanismIds.length>=1&&c.mechanismIds.every(x=>refs.mechanisms.has(x)),'mecanismo invalido '+c.id);
 ok(c.symptomIds.length>=2&&c.symptomIds.every(x=>refs.symptoms.has(x)),'sintomas invalidos '+c.id);
 ok(c.evidenceMethodIds.length>=2&&c.evidenceMethodIds.every(x=>refs.methods.has(x)),'metodos invalidos '+c.id);
 ok(c.preventionRuleIds.length>=1&&c.preventionRuleIds.every(x=>refs.pm.has(x)),'PM invalida '+c.id);
 const ruleSystems=new Set(pm.filter(x=>c.preventionRuleIds.includes(x.id)).map(x=>x.system));
 ok(c.family==='mangueiras_hidraulicas'?ruleSystems.has('hidraulico'):ruleSystems.has('comando_final'),'regras PM nao condizem com familia '+c.id);
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
ok(chainIds.size===8&&families.size===2,'regressao de ciclo curto');
const report={status:errors.length?'FALHOU':'OK',chains:db.records.length,families:[...families],
 suggestedTests:db.records.reduce((n,c)=>n+c.investigations.length,0),reviewedChains:0,
 verifiedOemConfigurationLinks:0,errors:errors.length};
console.log(JSON.stringify(report,null,2));for(const e of errors)console.error('ERRO: '+e);
process.exit(errors.length?1:0);
