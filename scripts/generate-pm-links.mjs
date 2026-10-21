#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {classifyPmPath} from './lib/pm-functional-boundaries.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const db=JSON.parse(fs.readFileSync(path.join(root,'data/catalog/failure-db.v1.json'),'utf8'));
const rules=JSON.parse(fs.readFileSync(path.join(root,'data/knowledge/pm-prevention/seed-rules.json'),'utf8')).records;
const result=[];
for(const r of rules){
 for(const l of db.locations){
  if(l.profundidade!==3||!r.models.includes(l.modelo)||classifyPmPath(r,l)!=='candidate_path')continue;
  const partList=db.partsByObjectType[l.objetoTipoSAP]||[];
  const matchingParts=partList.filter(p=>String(p.pt||'').toLowerCase().includes(r.partText.toLowerCase()));
  for(const p of matchingParts){
    if(!db.compatibleFailureModesByPart[p.code]?.damageCauses?.[r.damageId]?.includes(r.causeId))continue;
    result.push({
      id:'PMF-'+r.id+'-'+l.id+'-'+p.code,
      modelId:l.modelo,locationId:l.id,componentCode:p.code,damageId:r.damageId,causeId:r.causeId,
      symptomCandidate:r.symptom,inspectionMethod:r.inspectionMethod,
      occurrence:'nao_observada',evidenceStatus:'metodo_planejado_sem_resultado',
      associationStatus:'inferido_nao_validado',systemScope:'filtro_de_sistema_candidato',originRule:r.id,
      warning:'Hipótese para treinamento; NÃO equivale a achado ou causa raiz confirmada'
    });
  }
 }
}
result.sort((a,b)=>a.id.localeCompare(b.id));
const ids=new Set(result.map(x=>x.id));
if(ids.size!==result.length)throw Error('IDs de vínculo duplicados');
const payload={schema:'fmea-mining.pm-links.v1',version:'1.2.0',status:'hipoteses_de_inspecao_sem_evidencia',
counts:{rules:rules.length,generatedLinks:result.length},records:result};
const dest=path.join(root,'data/knowledge/pm-prevention/generated-links.json');
fs.writeFileSync(dest,JSON.stringify(payload,null,2)+'\n');
console.log(JSON.stringify(payload.counts));
if(process.argv.includes('--require-results')&&result.length===0)process.exit(1);
