#!/usr/bin/env node
/** Check local human self-attestations without pretending to verify the claims.
 * --input and --out must stay in the local gitignored private/ tree.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {emptyPilotAttestation,assessPilotAttestation} from './lib/pilot-readiness-core.mjs';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const graph=json('data/knowledge/functional-architecture.v1.json');
const records=graph.fundamentalRecordPaths.map(p=>({...json(p),__path:p}));
const bundle={
 config:json('data/quality/field-pilot-readiness.v1.json'),
 engineSha256:sha(read('scripts/lib/technical-discovery-v2.mjs')),
 corpusSha256:sha(JSON.stringify(records))
};
const args=process.argv.slice(2),value=flag=>{const n=args.indexOf(flag);return n===-1?null:args[n+1]};
const input=value('--input'),out=value('--out');
if(args.includes('--help')){
 console.log('Usage: npm run knowledge:pilot:gates -- [--input private/control.json --out private/control-report.json]');
 process.exit(0);
}
const root=path.resolve('private');
if(input){
 if(!out)throw Error('A human attestation requires --out under private/');
 for(const [name,p] of [['input',input],['output',out]]){
  const relative=path.relative(root,path.resolve(p));
  if(!relative||relative.startsWith('..')||path.isAbsolute(relative))
   throw Error(name+' must remain under gitignored private/');
  let current=root;
  for(const part of ['.',...relative.split(path.sep)]){
   if(part!=='.')current=path.join(current,part);
   try{if(fs.lstatSync(current).isSymbolicLink())throw Error(name+' contains a symlink');}
   catch(err){if(err.code!=='ENOENT')throw err;}
  }
 }
}
const result=assessPilotAttestation(input?json(input):emptyPilotAttestation(bundle),bundle);
const output={...result,observationType:input?'user_supplied_manual_checklist_not_independently_verified':'empty_public_protocol_example',
 sourceDataIncluded:false};
if(input){
 fs.mkdirSync(path.dirname(out),{recursive:true});
 if(fs.existsSync(out))throw Error('Output already exists: choose a new local private filename');
 fs.writeFileSync(out,JSON.stringify(output,null,2)+'\n');
}
console.log(JSON.stringify({status:output.status,completed:output.completed,remaining:output.pendingIds,
 contradictions:output.contradictions,invalid:output.errors,
 humanEvidenceVerified:false,output:input?out:null},null,2));
if(output.errors.length||output.contradictions.length)process.exitCode=1;
