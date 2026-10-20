#!/usr/bin/env node
/**
 * Reconstroi os 518.832 candidatos da v1.0 a partir do catalogo normalizado.
 * Nao cria cenarios jogaveis; nenhuma combinacao e um diagnostico confirmado.
 * Uso: node scripts/generate-models.mjs --all
 *      node scripts/generate-models.mjs --model EQ02
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const db=JSON.parse(fs.readFileSync(path.join(root,'data/catalog/failure-db.v1.json'),'utf8'));
const args=process.argv.slice(2);
const idx=args.indexOf('--model');
const requested=idx>=0?args[idx+1]:null;
const all=args.includes('--all');
if(!all&&!requested){
 console.error('Informe --all ou --model ID (ex.: EQ02).');
 process.exit(2);
}
const modelIds=new Set(db.models.map(m=>m.id));
if(requested&&!modelIds.has(requested)){
 console.error('Modelo inexistente:',requested);
 process.exit(2);
}
const locations=db.locations.filter(loc=>loc.profundidade===3&&(!requested||loc.modelo===requested));
const grouped=new Map();
for(const loc of locations){
 const rows=grouped.get(loc.modelo)||[];
 for(const component of db.partsByObjectType[loc.objetoTipoSAP]||[]){
  const patterns=db.compatibleFailureModesByPart[component.code]?.damageCauses||{};
  for(const [damageId,causes] of Object.entries(patterns))
   for(const causeId of causes)rows.push([loc.id,component.code,damageId,causeId]);
 }
 grouped.set(loc.modelo,rows);
}
const outputDir=path.join(root,'data/models');
fs.mkdirSync(outputDir,{recursive:true});
let total=0;
const counts={};
for(const [modelId,rows] of [...grouped.entries()].sort(([a],[b])=>a.localeCompare(b))){
 const payload={
   schema:'porcaria.failure-combinations.v1',
   modelId,
   combinationStatus:'hipotese_inferida_nao_confirmada',
   fields:['locationId','componentCode','damageId','causeId'],
   records:rows
 };
 fs.writeFileSync(path.join(outputDir,modelId+'.json'),JSON.stringify(payload));
 counts[modelId]=rows.length;
 total+=rows.length;
 console.log(modelId,rows.length,'combinacoes');
}
if(all){
 const expected=518832;
 if(total!==expected)throw Error('Regressao: esperado '+expected+' e obtido '+total);
 const index={
   schema:'porcaria.combinations-pack.v1',version:db.version,
   status:'hipoteses_didaticas_nao_validadas',
   fields:['locationId','componentCode','damageId','causeId'],
   models:Object.fromEntries(Object.entries(counts).map(([id,count])=>[id,{file:'models/'+id+'.json',count}])),
   total
 };
 fs.writeFileSync(path.join(root,'data','manifest.json'),JSON.stringify(index,null,2)+'\n');
}
console.log(JSON.stringify({modelos:Object.keys(counts).length,total},null,2));
