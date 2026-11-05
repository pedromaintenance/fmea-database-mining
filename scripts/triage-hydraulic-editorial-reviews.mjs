#!/usr/bin/env node
import fs from 'node:fs';
import {triageHydraulicReviewBatch} from './lib/hydraulic-editorial-triage.mjs';
const args=process.argv.slice(2);
if(args.length<1||args.includes('--help')){
 console.error('Uso: node scripts/triage-hydraulic-editorial-reviews.mjs feedback-1.json [feedback-2.json ...] > triage.json');
 process.exit(args.includes('--help')?0:2);
}
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
try{
 const b=read('data/quality/hydraulic-diagnostic-reasoning-benchmark.v1.json');
 const p=read('data/quality/hydraulic-expert-review-protocol.v1.json');
 const sheets=args.map(read);
 const result=triageHydraulicReviewBatch(b,p,sheets);
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
}catch(e){
 console.error('REJECTED: invalid anonymous editorial submission or source ('+String(e.message).slice(0,220)+')');
 process.exit(1);
}
