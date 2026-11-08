#!/usr/bin/env node
/** Project a canonical conceptual engine contamination dossier to a public,
 * offline HTML view and machine-readable JSON. No private data or calls. */
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const dossier=json('data/knowledge/engine-oil-coolant-differential.v1.json');
const registry=json('data/research/sources.v1.json');
const wanted=new Set(dossier.sources.map(x=>x.sourceId));
const sources=registry.sources.filter(x=>wanted.has(x.id)).map(({id,organization,title,url,limitation,role,lastReviewed})=>({id,organization,title,url,limitation,role,lastReviewed}));
if(sources.length!==wanted.size)throw Error('Missing cross-contamination reference');
const bundle={schema:'fmea-mining.engine-oil-coolant-public.v1',version:'1.4.13',ready:true,
 nature:'conceptual_unconfirmed_mechanisms_no_actual_machine_diagnosis',
 dossier,sources,realAssets:0,performedFieldTests:0,verifiedOemLimits:0,
 frozenPilotWasChanged:false};
const input=read('docs/contaminacao-oleo-arrefecimento.html');
const marker='{"schema":"ENGINE_DOSSIER_PLACEHOLDER","ready":false}';
if(!input.includes(marker))throw Error('Missing data marker');
const html=input.replace(marker,JSON.stringify(bundle).replace(/</g,'\\u003c'));
const code=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if(!code)throw Error('Browser script missing');
new vm.Script(code,{filename:'engine-contamination-browser.js'});
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/engine-oil-coolant.generated.json',JSON.stringify(bundle,null,2)+'\n');
fs.writeFileSync('reports/contaminacao-oleo-arrefecimento.generated.html',html);
console.log(JSON.stringify({status:'ENGINE_COOLANT_OIL_DOSSIER_BUILT',version:'1.4.13',
 hypotheses:dossier.hypotheses.length,scenarios:dossier.examples.length,
 citedSources:sources.length,realAssets:0,verifiedTests:0,baselineChanged:false},null,2));
