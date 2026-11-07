#!/usr/bin/env node
/** Deterministic public knowledge projection: no external calls, no private inputs. */
import fs from 'node:fs';
import path from 'node:path';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const paths=[
 'data/knowledge/fundamentals/hydraulic-cavitation.v2.json',
 'data/knowledge/fundamentals/hydraulic-aeration.v2.json',
 'data/knowledge/fundamentals/particulate-abrasive-wear.v2.json',
 'data/knowledge/fundamentals/lubricating-film.v2.json',
 'data/knowledge/fundamentals/solid-contamination.v2.json',
 'data/knowledge/fundamentals/rolling-contact-fatigue.v2.json',
 'data/knowledge/fundamentals/hydraulic-pilot-control.v2.json',
 'data/knowledge/fundamentals/hydraulic-load-holding.v2.json',
 'data/knowledge/fundamentals/hydraulic-actuator-drift.v2.json',
 'data/knowledge/fundamentals/hydraulic-instrumentation.v2.json'
];
const records=paths.map(p=>({...json(p),__path:p}));
const registry=json('data/research/sources.v1.json');
const wanted=new Set(records.flatMap(r=>r.provenance.sourceNotes.map(s=>s.sourceId)));
const sourceList=registry.sources.filter(s=>wanted.has(s.id)).map(({id,title,organization,url,limitation,lastReviewed})=>({id,title,organization,url,limitation,lastReviewed}));
if(sourceList.length!==wanted.size)throw Error('Unknown source ID for foundations page');
const bundle={schema:'fmea-mining.fundamentals-discovery.v1',version:'1.4.6',nature:'conceptual_articles_pending_review_not_field_evidence',ready:true,records,sources:sourceList,
 restrictions:{noOemSerialVerification:true,realAssetCases:0,actualTests:0,operationalRelease:false,sapMappingApproved:false}};
const tmpl=read('docs/fundamentos-hidraulica-tribologia.html');
const marker='{"schema":"FOUNDATIONS_PLACEHOLDER","ready":false}';
if(!tmpl.includes(marker))throw Error('Fundamentals HTML template placeholder missing');
const html=tmpl.replace(marker,JSON.stringify(bundle).replace(/</g,'\\u003c'));
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/fundamentals.generated.json',JSON.stringify(bundle,null,2)+'\n');
fs.writeFileSync('reports/fundamentos-hidraulica-tribologia.generated.html',html);
console.log(JSON.stringify({schema:bundle.schema,version:bundle.version,articles:records.length,referencedSources:sourceList.length,outputs:['reports/fundamentals.generated.json','reports/fundamentos-hidraulica-tribologia.generated.html']},null,2));
