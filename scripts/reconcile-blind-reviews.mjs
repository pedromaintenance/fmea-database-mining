#!/usr/bin/env node
/** Local-only dual reviewer reconciliation. Never runs the query engine.
 * Do not commit question or review files. --out-dir must be inside private/.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {buildAdjudicatedGold,compareBlindReviews} from './lib/dual-review-core.mjs';
import {checkReviewBatch} from './lib/external-review-core.mjs';
const args=process.argv.slice(2);
const find=name=>{const at=args.indexOf(name);return at>=0?args[at+1]:null};
const rj=p=>JSON.parse(fs.readFileSync(p,'utf8'));
if(!args.length){
 console.log(JSON.stringify({schema:'fmea-mining.dual-review-status.v1',version:'1.4.8',
   status:'NO_EXTERNAL_QUESTION_BATCH',questions:0,reviewerPackets:0,adjudications:0,
   agreement:null,engineResults:null,independentEvaluation:null,
   note:'A CLI has no external contributions. Its tests are synthetic and must not be counted as humans.'},null,2));
 process.exit(0);
}
if(args.includes('--help')){
 console.log('Usage: npm run knowledge:dual:reconcile -- --collection private/questions.json --r1 private/r1.json --r2 private/r2.json [--decisions private/decisions.json] --out-dir private/reconciliation');
 process.exit(0);
}
const col=find('--collection'),p1=find('--r1'),p2=find('--r2'),dec=find('--decisions'),out=find('--out-dir');
if(!col||!p1||!p2||!out)throw Error('Provide --collection, --r1, --r2, and --out-dir');
const relative=path.relative(process.cwd(),path.resolve(out)).replace(/\\/g,'/');
if(!(relative==='private'||relative.startsWith('private/'))||relative.includes('..'))throw Error('For confidentiality, --out-dir must be within the gitignored private/ directory');
const graph=rj('data/knowledge/functional-architecture.v1.json');
const records=graph.fundamentalRecordPaths.map(p=>({...rj(p),__path:p}));
const sha=data=>crypto.createHash('sha256').update(data).digest('hex');
const hashes={engineSha256:sha(fs.readFileSync('scripts/lib/technical-discovery-v2.mjs','utf8')),corpusSha256:sha(JSON.stringify(records))};
const c=rj(col),r1=rj(p1),r2=rj(p2);
const summary=compareBlindReviews(c,r1,r2,records.map(x=>x.id));
const result=buildAdjudicatedGold(c,r1,r2,dec?rj(dec):null,records.map(x=>x.id),hashes);
fs.mkdirSync(out,{recursive:true});
const clean={schema:'fmea-mining.dual-review-reconciliation.v1',version:'1.4.8',
 status:result.status,summary:summary.summary,
 unresolvedIds:[...new Set([...summary.conflicts.map(x=>x.id),...summary.agreed.filter(x=>x.r1.status==='NEEDS_ADJUDICATION').map(x=>x.id)])],
 errors:result.errors,independenceExternallyVerified:false,
 note:'Local human adjudication only. Nothing has been sent to a server, and predictions have not been queried.'};
fs.writeFileSync(path.join(out,'reconciliation.private.json'),JSON.stringify(clean,null,2)+'\n');
if(result.gold){
 const errors=checkReviewBatch(result.gold,{...hashes,recordIds:records.map(x=>x.id)});
 if(errors.length)throw Error('Generated gold violates existing review contract: '+errors.join(','));
 fs.writeFileSync(path.join(out,'gold.private.json'),JSON.stringify(result.gold,null,2)+'\n');
}
if(clean.unresolvedIds.length){
 fs.writeFileSync(path.join(out,'adjudication-conflicts.private.json'),JSON.stringify({schema:'fmea-mining.adjudication-review-queue.v1',version:'1.4.8',
  conflicts:summary.conflicts,agreedUnresolved:summary.agreed.filter(x=>x.r1.status==='NEEDS_ADJUDICATION')},null,2)+'\n');
}
console.log(JSON.stringify({status:clean.status,questions:summary.summary?.questions??0,
 fullAgreement:summary.summary?.fullAgreement??null,kappa:summary.summary?.cohensKappaForStatus??null,
 disagreementCount:clean.unresolvedIds.length,independenceExternallyVerified:false,
 goldReady:!!result.gold,outDir:out,
 next:result.gold?'Run npm run knowledge:external:evaluate -- --input '+path.join(out,'gold.private.json')+' --out '+path.join(out,'score.private.json'):'Resolve conflicting labels in a separate, blinded adjudication file.'},null,2));
if(result.status==='INVALID_REVIEW'||result.status==='INVALID_ADJUDICATION')process.exitCode=1;
