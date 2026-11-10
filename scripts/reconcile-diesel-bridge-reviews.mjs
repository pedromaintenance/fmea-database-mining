#!/usr/bin/env node
/** Private-only two-file comparison. No input or decision is pushed to Git. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {reconcileDieselBridgeReviews} from './lib/diesel-bridge-reconciliation-core.mjs';
const root=process.cwd(),privateDir=path.resolve(root,'private');
const args=process.argv.slice(2);
if(!args.length){console.log(JSON.stringify({status:'NO_PRIVATE_REVIEW_INPUTS',actualReviewFiles:0,approvedCases:0}));process.exit(0)}
const getFlag=flag=>{const index=args.indexOf(flag);if(index<0||!args[index+1])throw Error('Missing '+flag);return args[index+1]};
const guard=p=>{
 const full=path.resolve(root,p);
 if(!full.startsWith(privateDir+path.sep))throw Error('Input/output paths must be inside private/');
 let parent=path.dirname(full);
 while(parent.startsWith(privateDir)){
  if(fs.existsSync(parent)&&fs.lstatSync(parent).isSymbolicLink())throw Error('Symlink directory refused');
  if(parent===privateDir)break;parent=path.dirname(parent);
 }
 if(fs.existsSync(full)&&fs.lstatSync(full).isSymbolicLink())throw Error('Symlink file refused');
 return full;
};
try{
 if(args.length!==6)throw Error('Expected --left, --right and --out only');
 const leftPath=guard(getFlag('--left')),rightPath=guard(getFlag('--right')),outPath=guard(getFlag('--out'));
 if(leftPath===rightPath||leftPath===outPath||rightPath===outPath)throw Error('Distinct paths required');
 if(!fs.existsSync(leftPath)||!fs.existsSync(rightPath))throw Error('Missing private input');
 if(fs.existsSync(outPath))throw Error('Refusing overwrite');
 for(const p of [leftPath,rightPath])if(fs.statSync(p).size>200000)throw Error('Oversized input');
 const bridgePath=path.resolve(root,'data/knowledge/engine-thermal-crossfluid-bridge.v1.json');
 const bridge=JSON.parse(fs.readFileSync(bridgePath,'utf8'));
 const digest=crypto.createHash('sha256').update(fs.readFileSync(bridgePath)).digest('hex');
 const ids=bridge.scenarios.flatMap(s=>s.alternatives.map(a=>a.id));
 const left=JSON.parse(fs.readFileSync(leftPath,'utf8')),right=JSON.parse(fs.readFileSync(rightPath,'utf8'));
 const result=reconcileDieselBridgeReviews(left,right,ids,digest);
 if(result.status==='INVALID_INPUT_REJECTED')throw Error('Invalid private review schema, source or version');
 fs.mkdirSync(path.dirname(outPath),{recursive:true,mode:0o700});
 const fd=fs.openSync(outPath,'wx',0o600);
 try{fs.writeFileSync(fd,JSON.stringify(result,null,2)+'\n')}finally{fs.closeSync(fd)}
 console.log(JSON.stringify({status:result.status,output:'private/ [local only]',rows:18,verifiedIndependentReviewers:0,operationalApprovals:0}));
}catch(e){console.error('Private reconciliation refused:',e.message);process.exit(1)}
