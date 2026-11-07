#!/usr/bin/env node
import fs from 'node:fs';
import {discoverTechnical} from './lib/technical-discovery-v2.mjs';
const args=process.argv,at=args.indexOf('--query');
if(at===-1||!args[at+1]){console.log('Usage: npm run knowledge:search:v2 -- --query "O cilindro está descendo sem comando?"');process.exit(1)}
const graph=JSON.parse(fs.readFileSync('data/knowledge/functional-architecture.v1.json','utf8'));
const records=graph.fundamentalRecordPaths.map(p=>({...JSON.parse(fs.readFileSync(p,'utf8')),__path:p}));
console.log(JSON.stringify({question:args[at+1],...discoverTechnical(args[at+1],records)},null,2));
