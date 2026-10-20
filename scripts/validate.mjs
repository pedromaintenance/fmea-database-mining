#!/usr/bin/env node
// Valida integridade e referências dos catálogos da versão 1.
// Node.js >= 18, sem dependências.
import fs from 'node:fs';
import path from 'node:path';
const ROOT=path.resolve(new URL('..',import.meta.url).pathname);
const file=(p)=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const fail=(message)=>{console.error('ERRO:',message);process.exitCode=1;};
const main='data/catalog/failure-db.v1.json';
if(!fs.existsSync(path.join(ROOT,main))){
  console.error('Catálogo principal ainda não importado: data/catalog/failure-db.v1.json');
  process.exit(2);
}
const db=file(main);
for(const key of ['models','locations','partsByObjectType','damages','causes','compatibleFailureModesByPart'])
  if(!db[key]) fail('campo ausente: '+key);
const ids=(arr,key='id')=>new Set(arr.map(x=>x[key]));
const locIds=ids(db.locations),damageIds=ids(db.damages),causeIds=ids(db.causes);
if(locIds.size!==db.locations.length)fail('IDs de locais duplicados');
if(damageIds.size!==db.damages.length)fail('IDs de dano duplicados');
if(causeIds.size!==db.causes.length)fail('IDs de causa duplicados');
let candidates=0,models=0;
const folder=path.join(ROOT,'data/models');
for(const filename of (fs.existsSync(folder)?fs.readdirSync(folder):[]).filter(x=>x.endsWith('.json'))){
 const obj=file('data/models/'+filename);
 const rows=Array.isArray(obj)?obj:(obj.combinations??obj.combinacoes??[]);
 if(!Array.isArray(rows)){fail('formato de combinações não reconhecido: '+filename);continue;}
 for(const row of rows){
  if(!Array.isArray(row)||row.length!==4){fail('tupla inválida em '+filename);continue;}
  const [l,c,d,a]=row;
  if(!locIds.has(l))fail('local inexistente em '+filename+': '+l);
  if(!damageIds.has(d)||!causeIds.has(a))fail('dano ou causa inexistente em '+filename);
  const loc=db.locations.find(x=>x.id===l);
  if(loc&&!db.partsByObjectType[loc.objetoTipoSAP]?.some(x=>x.code===c))fail('componente fora do tipo SAP em '+filename);
 }
 candidates+=rows.length;models++;
}
console.log(JSON.stringify({version:db.version,models:db.models?.length,locations:db.locations.length,damages:db.damages.length,causes:db.causes.length,packs:models,candidateCombinations:candidates},null,2));
if(process.exitCode)process.exit(process.exitCode);
