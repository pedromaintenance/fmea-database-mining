#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const records=(folder,file)=>read('data/knowledge/'+folder+'/'+file).records;
const EC=records('electronic','source-cases.json'),OC=records('oil','source-cases.json');
const E=records('electronic','diagnostic-records.json'),O=records('oil','diagnostic-records.json');
const ED=records('electronic','differential-sets.json'),OA=records('oil','archetypes.json');
const CODE=records('electronic','code-index.json'),FMI=records('electronic','fmi-index.json');
const ES=records('electronic','sources.json'),EM=records('electronic','manuals.json'),OM=records('oil','manuals.json');
const OBS=read('data/knowledge/observations-index.json').records;
const SYM=read('data/knowledge/symptoms-index.json').records;
const HYP=read('data/knowledge/hypotheses-index.json').records;
const catalog=read('data/catalog/failure-db.v1.json');
const modelIds=new Set(catalog.models.map(m=>m.id));
let errors=[];const check=(b,s)=>{if(!b)errors.push(s)};
const unique=a=>new Set(a);
const all=[...E,...O],ids=unique(all.map(c=>c.id));
check(EC.length===72&&OC.length===72&&E.length===72&&O.length===72,'72 casos por base');
check(ids.size===144,'IDs de caso unicos');
check(ED.length===24&&ED.every(x=>x.hypotheses.length===3),'24 trincas eletronicas');
check(OA.length===24&&OA.every(x=>x.scenarios.length===3),'24 trincas de oleo');
check(CODE.length===54&&FMI.length===23,'indice de codigos/FMI');
check(ES.length===27&&EM.length===22&&OM.length===17,'fontes e textos');
check(OBS.length===288&&SYM.length===144&&HYP.length===144,'indices derivados');
check(unique(OBS.map(x=>x.id)).size===288,'IDs evidencias nao unicos');
const sourceIds=unique(ES.map(x=>x.id)),manualIds=unique(OM.map(x=>x.id));
for(const c of E){
 check(c.simulatedEvidence?.length===3,'evidencias de '+c.id);
 check(c.hypothesis?.alternativeCauses?.length===2,'diagnostico diferencial de '+c.id);
 check(sourceIds.has(c.code?.sourceRef),'referencia de codigo de '+c.id);
}
for(const c of O){
 check(c.simulatedEvidence?.length===1,'evidencia de '+c.id);
 check(manualIds.has(c.learning?.manualId),'manual de '+c.id);
 check(c.fluid?.realLabReport===false,'laudo de '+c.id);
}
for(const c of all){
 check(c.status==='didatico_nao_curado','status de '+c.id);
 check(!c.machine?.modelCandidate||modelIds.has(c.machine.modelCandidate),'modelo de '+c.id);
 check((c.location||c.installation)?.sapLocationId===null,'caminho SAP nao revisado de '+c.id);
}
for(const x of OBS)check(ids.has(x.caseId)&&x.origin==='simulado','origem da evidencia '+x.id);
for(const x of SYM)check(ids.has(x.caseId),'sintoma sem caso '+x.id);
for(const x of HYP)check(ids.has(x.caseId),'hipotese sem caso '+x.id);
const summary={status:errors.length?'FALHOU':'OK',errors:errors.length,cases:all.length,codes:CODE.length,manuals:EM.length+OM.length,observations:OBS.length};
console.log(JSON.stringify(summary,null,2));for(const x of errors.slice(0,30))console.error('ERRO:',x);
process.exit(errors.length?1:0);
