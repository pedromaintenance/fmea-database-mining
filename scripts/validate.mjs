#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const db=read('data/catalog/failure-db.v1.json');
let issues=0;
const assert=(ok,msg)=>{if(!ok){console.error('ERRO:',msg);issues++;}};
const ids=(arr)=>new Set(arr.map(x=>x.id));
const locations=new Map(db.locations.map(x=>[x.id,x]));
const damages=ids(db.damages),causes=ids(db.causes);
const modelIds=ids(db.models);
assert(locations.size===db.locations.length,'locais duplicados');
assert(damages.size===db.damages.length,'danos duplicados');
assert(causes.size===db.causes.length,'causas duplicadas');
const typeParts=new Map(Object.entries(db.partsByObjectType).map(([type,items])=>[type,new Set(items.map(x=>x.code))]));
for(const l of db.locations){
 assert(modelIds.has(l.modelo),'modelo desconhecido: '+l.id);
 assert(l.id.startsWith(l.modelo+'|'),'prefixo do local incoerente: '+l.id);
}
for(const [component,rule] of Object.entries(db.compatibleFailureModesByPart)){
 for(const [damageId,causeIds] of Object.entries(rule.damageCauses||{})){
  assert(damages.has(damageId),'dano invalido '+component+'/'+damageId);
  for(const causeId of causeIds)assert(causes.has(causeId),'causa invalida '+component+'/'+causeId);
 }
}
const folder=path.join(root,'data/models');
let total=0,packs=0;
for(const filename of (fs.existsSync(folder)?fs.readdirSync(folder):[]).filter(x=>x.endsWith('.json'))){
 const obj=read('data/models/'+filename);
 const rows=obj.records||[];
 assert(Array.isArray(rows),'faltam records em '+filename);
 if(!Array.isArray(rows))continue;
 for(const row of rows){
  if(!Array.isArray(row)||row.length!==4){assert(false,'tupla malformada '+filename);continue;}
  const [locationId,componentCode,damageId,causeId]=row;
  const loc=locations.get(locationId);
  assert(!!loc,'local desconhecido '+locationId);
  if(loc){
   assert(loc.profundidade===3,'caminho sem tres niveis '+locationId);
   assert(obj.modelId===loc.modelo,'modelo do arquivo divergente '+filename);
   assert(typeParts.get(loc.objetoTipoSAP)?.has(componentCode),'tipo SAP nao admite componente '+locationId+'/'+componentCode);
  }
  assert(damages.has(damageId)&&causes.has(causeId),'dano/causa invalidos '+filename);
  assert(db.compatibleFailureModesByPart[componentCode]?.damageCauses?.[damageId]?.includes(causeId),'associacao sem regra '+filename);
 }
 packs++;total+=rows.length;
}
if(packs===17)assert(total===518832,'esperado 518832 registros, encontrado '+total);
console.log(JSON.stringify({status:issues?'FALHOU':'OK',issues,models:db.models.length,locations:db.locations.length,
 damages:db.damages.length,causes:db.causes.length,modelPacks:packs,candidates:total},null,2));
process.exit(issues?1:0);
