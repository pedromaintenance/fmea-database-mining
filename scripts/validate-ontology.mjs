#!/usr/bin/env node
// Valida ontologia e classificacoes DIDATICAS: nao verifica efetividade OEM.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const ont=read('data/ontology/concepts.v1.json');
const ann=read('data/ontology/playbook-annotations.v1.json');
const playbooks=read('data/knowledge/diagnostic/playbooks.v1.json').records;
const refs=read('data/research/sources.v1.json').sources;
const errors=[];
const check=(condition,message)=>{if(!condition)errors.push(message)};
const domains=['functionalFailures','symptoms','mechanismFamilies','evidenceMethods','evidenceOutcomes'];
const sets={};
for(const domain of domains){
 const items=ont[domain];
 check(Array.isArray(items)&&items.length>0,'Dominio vazio: '+domain);
 sets[domain]=new Set((items||[]).map(i=>i.id));
 check(sets[domain].size===items.length,'IDs duplicados: '+domain);
 for(const i of items||[])check(!!i.id&&!!i.pt&&!!i.en&&!!i.criteria,'Conceito sem definicao: '+domain+'/'+i.id);
}
const sourceIds=new Set(refs.map(x=>x.id));
check(ont.references.every(id=>sourceIds.has(id)),'Referencia bibliografica ausente na ontologia');
const playbookIds=new Set(playbooks.map(p=>p.id));
const annotationIds=new Set();
for(const a of ann.records){
 check(playbookIds.has(a.playbookId),'Anotacao orfa: '+a.playbookId);
 check(!annotationIds.has(a.playbookId),'Anotacao duplicada: '+a.playbookId);
 annotationIds.add(a.playbookId);
 for(const [field,domain] of [['functionalFailureIds','functionalFailures'],['symptomIds','symptoms'],['evidenceMethodIds','evidenceMethods']]){
  check(Array.isArray(a[field])&&a[field].length>0,'Classificacao ausente: '+a.playbookId+'/'+field);
  for(const id of a[field]||[])check(sets[domain].has(id),'Conceito inexistente: '+a.playbookId+'/'+id);
  check(new Set(a[field]||[]).size===(a[field]||[]).length,'Conceito duplicado: '+a.playbookId+'/'+field);
 }
 check(a.nature==='hipotese_didatica_sem_resultado','Evidencia real indevida: '+a.playbookId);
 check(a.mappingReview==='requer_revisao_de_engenharia','Anotacao aprovada sem revisao: '+a.playbookId);
 check(a.confirmedSapPaths.length===0&&a.confirmedRootCauses.length===0,'Confirmacao inventada: '+a.playbookId);
 check(typeof a.ambiguity==='string'&&a.ambiguity.length>15,'Sem ressalva: '+a.playbookId);
}
check(annotationIds.size===playbooks.length,'Cobertura incompleta: '+annotationIds.size+'/'+playbooks.length);
check(new Set(ont.evidenceOrigin).size===ont.evidenceOrigin.length,'Origem de evidencia duplicada');
check(sets.evidenceOutcomes.has('not_performed'),'Estado sem teste nao definido');
const report={status:errors.length?'FAIL':'OK',playbooks:playbooks.length,annotated:annotationIds.size,
 concepts:Object.fromEntries(domains.map(k=>[k,ont[k].length])),errors:errors.length};
console.log(JSON.stringify(report,null,2));
for(const e of errors.slice(0,50))console.error(e);
process.exit(errors.length?1:0);
