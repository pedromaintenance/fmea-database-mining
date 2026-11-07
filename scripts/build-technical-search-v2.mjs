#!/usr/bin/env node
/** Generate self-contained search UI and read-only agent JSON using exact library code. */
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const graph=json('data/knowledge/functional-architecture.v1.json'),registry=json('data/research/sources.v1.json');
const records=graph.fundamentalRecordPaths.map(p=>({...json(p),__path:p}));
if(records.length!==10||new Set(records.map(r=>r.id)).size!==10)throw Error('Expected ten distinct foundational records');
if(records.some(r=>r.operationalApproval!==false||r.evidenceClass!=='CONCEPTUAL'||r.reviewStatus!=='PENDING_REVIEW'))throw Error('Non-conceptual record included');
const wanted=new Set(records.flatMap(r=>r.provenance.sourceNotes.map(n=>n.sourceId)));
const sources=registry.sources.filter(s=>wanted.has(s.id)).map(s=>({id:s.id,title:s.title,organization:s.organization,url:s.url,limitation:s.limitation||''}));
if(sources.length!==wanted.size)throw Error('Missing original source IDs');
const bundle={schema:'fmea-mining.technical-discovery-bundle.v1',version:'1.4.6',ready:true,
 nature:'ten_conceptual_references_for_lexical_discovery_not_automated_engineering_decision',records,sources,
 warning:'Always inspect canonical documents and OEM information specific to equipment. This is lexical discovery, not an LLM, machine diagnosis or operational approval.'};
const tmpl=read('docs/consulta-tecnica.html'),dataMarker='{"schema":"QUERY_BUNDLE_PLACEHOLDER","ready":false}',engineMarker='/*ENGINE_PLACEHOLDER*/';
if(!tmpl.includes(dataMarker)||!tmpl.includes(engineMarker))throw Error('Template markers not found');
const engine=read('scripts/lib/technical-discovery-v2.mjs').replace(/\bexport\s+(?=(?:function|const)\b)/g,'');
new vm.Script(engine,{filename:'embedded-search.js'});
const html=tmpl.replace(dataMarker,JSON.stringify(bundle).replace(/</g,'\\u003c')).replace(engineMarker,engine);
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/technical-search-v2-bundle.generated.json',JSON.stringify(bundle,null,2)+'\n');
fs.writeFileSync('reports/consulta-tecnica.generated.html',html);
console.log(JSON.stringify({status:'generated',records:records.length,sourceReferences:sources.length,htmlBytes:Buffer.byteLength(html)},null,2));
