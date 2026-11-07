#!/usr/bin/env node
/** Reproducible offline evaluation lab: no external data or user submissions bundled. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const graph=json('data/knowledge/functional-architecture.v1.json');
const records=graph.fundamentalRecordPaths.map(p=>({...json(p),__path:p}));
const engineCode=read('scripts/lib/technical-discovery-v2.mjs');
const reviewCode=read('scripts/lib/external-review-core.mjs');
const fingerprint={engineSha256:sha(engineCode),corpusSha256:sha(JSON.stringify(records))};
if(records.length!==10||new Set(records.map(r=>r.id)).size!==10)throw Error('Lab requires exactly ten canonical records');
const payload={
 schema:'fmea-mining.external-review-lab-bundle.v1',version:'1.4.7',ready:true,
 nature:'offline_review_protocol_without_human_question_data',
 ...fingerprint,records:records.map(r=>({id:r.id,title:r.title,__path:r.__path,provenance:r.provenance,
  evidenceClass:r.evidenceClass,reviewStatus:r.reviewStatus,operationalApproval:r.operationalApproval,
  domain:r.domain}))
};
const marker='{"schema":"EXTERNAL_LAB_PLACEHOLDER","ready":false}';
let html=read('docs/laboratorio-avaliacao.html');
for(const m of [marker,'/*SEARCH_CODE_PLACEHOLDER*/','/*REVIEW_CORE_PLACEHOLDER*/'])if(!html.includes(m))throw Error('Missing lab marker: '+m);
const strip=source=>source.replace(/\bexport\s+(?=(?:function|const)\b)/g,'');
const engine=strip(engineCode),core=strip(reviewCode);
new vm.Script(engine+'\n'+core,{filename:'review-engine.js'});
html=html.replace(marker,JSON.stringify(payload).replace(/</g,'\\u003c'));
html=html.replace('/*SEARCH_CODE_PLACEHOLDER*/',engine).replace('/*REVIEW_CORE_PLACEHOLDER*/',core);
const js=html.match(/<script>([\s\S]*?)<\/script>/);
if(!js)throw Error('Lab executable script missing');
new vm.Script(js[1],{filename:'review-lab.js'});
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/laboratorio-avaliacao.generated.html',html);
fs.writeFileSync('reports/external-review-lab-bundle.generated.json',JSON.stringify(payload,null,2)+'\n');
console.log(JSON.stringify({status:'BUILT_NO_HUMAN_REVIEWS',version:'1.4.7',records:records.length,
 sourceFingerprint:fingerprint.engineSha256,corpusFingerprint:fingerprint.corpusSha256,
 generated:['reports/laboratorio-avaliacao.generated.html','reports/external-review-lab-bundle.generated.json']},null,2));
