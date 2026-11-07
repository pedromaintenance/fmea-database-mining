#!/usr/bin/env node
/** Read-only keyword retrieval, not a chatbot or a diagnostic procedure. */
import fs from 'node:fs';
import {retrieveFundamentals} from './lib/fundamentals-retrieval.mjs';
const files=[
 'data/knowledge/fundamentals/hydraulic-cavitation.v2.json',
 'data/knowledge/fundamentals/hydraulic-aeration.v2.json',
 'data/knowledge/fundamentals/particulate-abrasive-wear.v2.json',
 'data/knowledge/fundamentals/lubricating-film.v2.json',
 'data/knowledge/fundamentals/solid-contamination.v2.json',
 'data/knowledge/fundamentals/rolling-contact-fatigue.v2.json'
];
const qIndex=process.argv.indexOf('--query');
if(process.argv.includes('--help')||qIndex<0||!process.argv[qIndex+1]){
 console.log('Usage: npm run knowledge:fundamentals:query -- --query "Por que ocorre spalling?"');
 process.exit(qIndex<0&&!process.argv.includes('--help')?1:0);
}
const records=files.map(p=>({...JSON.parse(fs.readFileSync(p,'utf8')),__path:p}));
const output=retrieveFundamentals(process.argv[qIndex+1],records);
console.log(JSON.stringify({query:process.argv[qIndex+1],...output},null,2));
