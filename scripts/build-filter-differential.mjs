#!/usr/bin/env node
/** Public, standalone, source-traceable differential dossier: outside frozen pilot. */
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const dossier=json('data/knowledge/hydraulic-filter-differential.v1.json');
const registry=json('data/research/sources.v1.json');
const ids=new Set(dossier.provenance.sourceNotes.map(x=>x.sourceId));
const sources=registry.sources.filter(s=>ids.has(s.id)).map(({id,organization,title,url,limitation,lastReviewed})=>({id,organization,title,url,limitation,lastReviewed}));
if(sources.length!==ids.size)throw Error('Dossier refers to missing primary source');
const bundle={
 schema:'fmea-mining.hydraulic-filter-differential-public.v1',version:'1.4.12',ready:true,
 nature:'illustrative_hypotheses_not_machine_diagnosis',dossier,sources,
 sourceRegistryPath:'data/research/sources.v1.json',
 frozenPilotAltered:false,realAssetTests:0,operationalApproval:false
};
const src=read('docs/filtragem-diferencial.html');
const marker='{"schema":"HYD_FILTER_PLACEHOLDER","ready":false}';
if(!src.includes(marker))throw Error('Missing HTML data marker');
const output=src.replace(marker,JSON.stringify(bundle).replace(/</g,'\\u003c'));
const m=output.match(/<script>([\s\S]*?)<\/script>/);
if(!m)throw Error('No browser engine');
new vm.Script(m[1],{filename:'filter-differential-browser.js'});
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/filter-differential.generated.json',JSON.stringify(bundle,null,2)+'\n');
fs.writeFileSync('reports/filtragem-diferencial.generated.html',output);
console.log(JSON.stringify({status:'CONCEPTUAL_DOSSIER_BUILT',version:'1.4.12',
 hypotheses:dossier.hypotheses.length,scenarios:dossier.presentations.length,
 tracedManufacturerSources:sources.length,fieldEvidenceCount:0,frozenPilotAltered:false},null,2));
