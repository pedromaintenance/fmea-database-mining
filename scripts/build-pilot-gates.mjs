#!/usr/bin/env node
/** Build a self-contained pilot gate dashboard and publish ONLY null human status. */
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const graph=json('data/knowledge/functional-architecture.v1.json');
const records=graph.fundamentalRecordPaths.map(p=>({...json(p),__path:p}));
const config=json('data/quality/field-pilot-readiness.v1.json');
if(config.prerequisites.length!==11)throw Error('Pilot needs exactly eleven current readiness criteria');
const bundle={schema:'fmea-mining.pilot-gates-bundle.v1',version:'1.4.10',ready:true,
 nature:'manual_gate_tracker_not_verified_pilot_authorization',
 config,engineSha256:hash(read('scripts/lib/technical-discovery-v2.mjs')),
 corpusSha256:hash(JSON.stringify(records)),
 humanQuestions:0,realReviewers:0,externalMeasurements:null};
let html=read('docs/controle-piloto.html');
const dataMarker='{"schema":"PILOT_GATE_PLACEHOLDER","ready":false}',engineMarker='/*PILOT_CORE_PLACEHOLDER*/';
if(!html.includes(dataMarker)||!html.includes(engineMarker))throw Error('Missing pilot template marker');
const core=read('scripts/lib/pilot-readiness-core.mjs').replace(/\bexport\s+(?=(?:function|const)\b)/g,'');
const allScript=core+'\n'+html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
new vm.Script(allScript,{filename:'pilot-dashboard.js'});
html=html.replace(dataMarker,JSON.stringify(bundle).replace(/</g,'\\u003c')).replace(engineMarker,core);
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/controle-piloto.generated.html',html);
fs.writeFileSync('reports/pilot-gates-bundle.generated.json',JSON.stringify(bundle,null,2)+'\n');
const status={schema:'fmea-mining.pilot-gates-public-status.v1',version:'1.4.10',
 status:'NO_MANUAL_ATTESTATIONS',checklistEntries:11,completedGates:null,
 realQuestionCount:0,realHumanReviewers:0,manualSignoffsReceived:0,
 independentlyVerifiedReadiness:false,externalSearchAccuracy:null,
 note:'Public site provides only the empty checklist. Manual checks and any real evaluation data stay in exported private files and are never collected by this website.'};
fs.writeFileSync('reports/pilot-gates-public-status.generated.json',JSON.stringify(status,null,2)+'\n');
console.log(JSON.stringify({status:'PUBLIC_EMPTY_GATE_DASHBOARD_BUILT',criteria:11,realHumanQuestions:0,
 realAttestations:0,publishedExternalAccuracy:null},null,2));
