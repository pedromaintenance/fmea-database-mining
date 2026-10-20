#!/usr/bin/env node
// Relaciona roteiros a caminhos e modos candidatos sem confirmar uma causa.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const playbooks=read('data/knowledge/diagnostic/playbooks.v1.json').records;
const links=read('data/knowledge/pm-prevention/generated-links.json').records;
const result=playbooks.map(p=>{
 const allowed=new Set(p.target.pmRuleIds),models=new Set(p.target.modelIds);
 const choices=links.filter(l=>allowed.has(l.originRule)&&models.has(l.modelId)).map(l=>({
  pmRuleId:l.originRule,modelId:l.modelId,locationId:l.locationId,
  componentCode:l.componentCode,damageId:l.damageId,causeId:l.causeId,
  reviewStatus:'candidato_nao_revisado'
 })).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
 return {playbookId:p.id,modelIds:p.target.modelIds,
  linkStatus:choices.length?'candidatos_para_curadoria':'sem_correspondencia_validavel',
  candidateCount:choices.length,choices,selected:null,
  evidenceStatus:'nao_observada',causeConfirmed:false};
});
const resultData={schema:'fmea-mining.playbook-links.v1',version:'1.2.1',
 status:'apenas_hipoteses',counts:{playbooks:result.length,
 withCandidates:result.filter(p=>p.candidateCount>0).length,
 withoutCandidates:result.filter(p=>p.candidateCount===0).length,
 candidates:result.reduce((n,p)=>n+p.candidateCount,0)},records:result};
fs.writeFileSync(path.join(root,'data/knowledge/diagnostic/generated-links.json'),JSON.stringify(resultData,null,2)+'\n');
console.log(JSON.stringify(resultData.counts));
