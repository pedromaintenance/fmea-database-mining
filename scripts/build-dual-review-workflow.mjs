#!/usr/bin/env node
/** Publish ONLY empty independent-review workflow pages and their public concept titles.
 * The collector never contains any answer index. Review and adjudication pages
 * have titles/IDs but NEVER contain the retrieval algorithm or predictions.
 */
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const graph=json('data/knowledge/functional-architecture.v1.json');
const titles=graph.fundamentalRecordPaths.map(path=>{const r=json(path);return {id:r.id,title:r.title}});
if(titles.length!==10||new Set(titles.map(r=>r.id)).size!==10)throw Error('Expected ten distinct public records');
const payload={schema:'fmea-mining.reviewer-title-list.v1',version:'1.4.8',ready:true,nature:'public_concept_titles_not_engine_or_answers',records:titles};
const marker='{"schema":"REVIEW_TITLES_PLACEHOLDER","ready":false}';
fs.mkdirSync('reports',{recursive:true});
const files=[
 ['docs/coleta-perguntas.html','reports/coleta-perguntas.generated.html',false],
 ['docs/revisao-cega.html','reports/revisao-cega.generated.html',true],
 ['docs/adjudicacao-tecnica.html','reports/adjudicacao-tecnica.generated.html',true]
];
for(const [input,output,embed] of files){
 let h=read(input);
 if(embed){if(!h.includes(marker))throw Error('Missing title marker '+input);h=h.replace(marker,JSON.stringify(payload).replace(/</g,'\\u003c'))}
 const match=h.match(/<script>([\s\S]*?)<\/script>/);if(!match)throw Error('No inline JS '+input);
 new vm.Script(match[1],{filename:input});
 if(/<script\s+src=|\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon/i.test(h))throw Error('Browser network/storage forbidden: '+input);
 if(!h.includes('textContent='))throw Error('Escaped text required: '+input);
 fs.writeFileSync(output,h);
}
const status={schema:'fmea-mining.dual-review-public-status.v1',version:'1.4.8',status:'NO_REAL_REVIEW_DATA',
 collectionBatches:0,questionCount:0,reviewPackets:0,humanAdjudications:0,
 twoHumanDistinctnessVerified:false,agreementRate:null,cohensKappa:null,independentRetrievalMetrics:null,
 note:'Only empty evaluation instruments and synthetic CI fixtures have been created. No real workers, reviewers or external question answers are claimed.'};
fs.writeFileSync('reports/dual-review-public-status.generated.json',JSON.stringify(status,null,2)+'\n');
console.log(JSON.stringify({status:'OFFLINE_REVIEW_PAGES_GENERATED',pages:files.length,conceptTitles:titles.length,
 humanQuestions:0,humanReviews:0,independentResults:null},null,2));
