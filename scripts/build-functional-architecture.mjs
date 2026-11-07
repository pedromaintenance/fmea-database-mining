#!/usr/bin/env node
/** Build a self-contained, public human+agent view of generic functional architecture. */
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const graph=json('data/knowledge/functional-architecture.v1.json'),registry=json('data/research/sources.v1.json'),paths=graph.fundamentalRecordPaths;
const fundamentals=paths.map(p=>{const v=json(p);return {id:v.id,title:v.title,titleEn:v.titleEn,evidenceClass:v.evidenceClass,reviewStatus:v.reviewStatus,path:p}});
const wanted=new Set(graph.systems.flatMap(s=>s.components.flatMap(c=>c.sourceIds)));
const sources=registry.sources.filter(s=>wanted.has(s.id)).map(s=>({id:s.id,title:s.title,organization:s.organization,url:s.url,limitation:s.limitation||''}));
if(sources.length!==wanted.size)throw Error('Functional map has unresolved bibliographic reference');
const d={...graph,ready:true,fundamentals,sources};
const tpl=read('docs/arquitetura-funcional.html');
const marker='{"schema":"FUNCTIONAL_PLACEHOLDER","ready":false}';
if(!tpl.includes(marker))throw Error('Functional architecture template marker not found');
const html=tpl.replace(marker,JSON.stringify(d).replace(/</g,'\\u003c'));
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/functional-architecture.generated.json',JSON.stringify(d,null,2)+'\n');
fs.writeFileSync('reports/arquitetura-funcional.generated.html',html);
console.log(JSON.stringify({status:'generated',version:d.version,systems:d.systems.length,components:d.systems.reduce((n,s)=>n+s.components.length,0),connections:d.systems.reduce((n,s)=>n+s.edges.length,0),bibliographicReferences:sources.length,foundations:fundamentals.length},null,2));
