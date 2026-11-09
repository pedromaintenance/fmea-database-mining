#!/usr/bin/env node
/** Public offline engineering document-request matrix, with no real asset data. */
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const matrix=json('data/quality/engine-crossfluid-evidence-matrix.v1.json');
const dossier=json(matrix.parentDossier);
const registry=json('data/research/sources.v1.json');
const wanted=new Set(matrix.sources);
const sources=registry.sources.filter(x=>wanted.has(x.id))
 .map(({id,organization,title,url,limitation,lastReviewed})=>({id,organization,title,url,limitation,lastReviewed}));
if(sources.length!==wanted.size)throw Error('Missing a source in public matrix bibliography');
const bundle={schema:'fmea-mining.engine-crossfluid-evidence-bundle.v1',version:'1.4.14',
 ready:true,nature:'local_self_attested_document_inventory_not_real_OEM_evidence',
 matrixSha256:sha(JSON.stringify(matrix)),engineDossierSha256:sha(JSON.stringify(dossier)),
 matrix,dossier,sources,realAssets:0,realOEMEffectivity:0,actualEvidenceRecords:0,
 operationalApprovals:0,independentHumanReviews:0,rootCauseConfirmations:0};
const template=read('docs/matriz-evidencias-oleo-arrefecimento.html');
const dataMarker='{"schema":"MATRIX_PLACEHOLDER","ready":false}',codeMarker='/*MATRIX_CORE_PLACEHOLDER*/';
if(!template.includes(dataMarker)||!template.includes(codeMarker))throw Error('Missing static template marker');
const core=read('scripts/lib/engine-crossfluid-evidence.mjs').replace(/\bexport\s+(?=(?:function|const)\b)/g,'');
const html=template.replace(dataMarker,JSON.stringify(bundle).replace(/</g,'\\u003c')).replace(codeMarker,core);
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if(!script)throw Error('Interactive script missing');
new vm.Script(script,{filename:'engine-crossfluid-evidence.browser.js'});
if(/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|<script\s+src=/i.test(html))throw Error('Network/storage forbidden');
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/engine-crossfluid-evidence.generated.json',JSON.stringify(bundle,null,2)+'\n');
fs.writeFileSync('reports/matriz-evidencias-oleo-arrefecimento.generated.html',html);
console.log(JSON.stringify({status:'DOCUMENTARY_EVIDENCE_MATRIX_BUILT',version:bundle.version,
 requirements:matrix.evidence.length,hypotheses:matrix.hypothesisGates.length,
 referencedPublicSources:sources.length,actualEvidenceRecords:0,operationalApprovals:0},null,2));
