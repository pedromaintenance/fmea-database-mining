#!/usr/bin/env node
/**
 * Offline scorecard for user-supplied, independently authored/reviewed questions.
 * With no input, publishes ONLY an honest "NO_EXTERNAL_SAMPLE" status.
 * No personal/industrial information is sent to a service.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {discoverTechnical} from './lib/technical-discovery-v2.mjs';
import {evaluateReviewBatch} from './lib/external-review-core.mjs';

const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
const graph=json('data/knowledge/functional-architecture.v1.json');
const records=graph.fundamentalRecordPaths.map(p=>({...json(p),__path:p}));
const engineSha256=digest(read('scripts/lib/technical-discovery-v2.mjs'));
const corpusSha256=digest(JSON.stringify(records));
const at=process.argv.indexOf('--input'),outAt=process.argv.indexOf('--out');
const input=at>=0?process.argv[at+1]:null;
const out=outAt>=0?process.argv[outAt+1]:'reports/external-review-evaluation.generated.json';
if((at>=0&&!input)||(outAt>=0&&!out))throw Error('--input and --out each require a file path');
if(input){
 // External human judgments and predictions belong only in private/, not
 // public reports or a git-tracked path. No special-case bypass for old scripts.
 const privateRoot=path.resolve('private');
 for(const [kind,p] of [['--input',input],['--out',out]]){
  const rel=path.relative(privateRoot,path.resolve(p));
  if(!rel||rel.startsWith('..')||path.isAbsolute(rel))
   throw Error(kind+' with real human data must stay under gitignored private/');
 }
}
let result;
if(!input){
 result={schema:'fmea-mining.external-review-report.v1',version:'1.4.7',status:'NO_EXTERNAL_SAMPLE',
  qualification:'NO_HUMAN_LABELS_COLLECTED',
  caution:'No independent reviewers, external questions, human ratings or field-safety measurements have been collected in this repository. Never interpret this placeholder as a zero-error benchmark.',
  engineSha256,corpusSha256,totals:{submitted:0,scored:0},metrics:null,cases:[],errors:[]};
}else{
 result=evaluateReviewBatch(json(input),records,discoverTechnical,{engineSha256,corpusSha256});
}
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,qualification:result.qualification||null,
 submitted:result.totals?.submitted??0,scored:result.totals?.scored??0,metrics:result.metrics,
 errors:result.errors,output:out},null,2));
if(result.status==='INVALID_INPUT'||result.errors?.length)process.exitCode=1;
