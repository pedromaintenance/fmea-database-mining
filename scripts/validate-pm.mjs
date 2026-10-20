#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const data=read('data/catalog/failure-db.v1.json');
const {records}=read('data/knowledge/pm-prevention/generated-links.json');
const paths=new Map(data.locations.map(x=>[x.id,x]));
const errors=[];
for(const row of records){
 const loc=paths.get(row.locationId);
 if(!loc||loc.modelo!==row.modelId||loc.profundidade!==3)errors.push('path '+row.id);
 if(!data.partsByObjectType[loc?.objetoTipoSAP]?.some(p=>p.code===row.componentCode))errors.push('part '+row.id);
 if(!data.compatibleFailureModesByPart[row.componentCode]?.damageCauses?.[row.damageId]?.includes(row.causeId))errors.push('damage cause '+row.id);
 if(row.occurrence!=='nao_observada'||row.evidenceStatus!=='metodo_planejado_sem_resultado'||row.associationStatus!=='inferido_nao_validado')errors.push('false evidence '+row.id);
}
if(records.length===0)errors.push('no relations generated');
console.log(JSON.stringify({links:records.length,errors:errors.length,valid:errors.length===0}));
for(const e of errors.slice(0,30))console.error(e);
process.exit(errors.length?1:0);
