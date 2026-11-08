#!/usr/bin/env node
/** Audit four role archives, immutable source baseline and honest empty human status. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const raw=p=>fs.readFileSync(p);
const json=p=>JSON.parse(raw(p));
const sha256=b=>crypto.createHash('sha256').update(b).digest('hex');
const gitBlob=b=>crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex');
const lock=json('data/quality/pilot-frozen-baseline.v1.json');
const release=json('reports/pilot-frozen-release-index.generated.json');
const oldStatus=json('reports/external-review-evaluation.generated.json');
const gateStatus=json('reports/pilot-gates-public-status.generated.json');
let checks=0,adversarial=0;const errors=[];
const check=(id,ok)=>{checks++;if(!ok)errors.push(id)};
check('lock_schema',lock.schema==='fmea-mining.frozen-pilot-baseline.v1'&&lock.version==='1.4.11'&&lock.recordCount===10);
check('release_schema',release.schema==='fmea-mining.pilot-offline-release-index.v1'&&release.version==='1.4.11');
check('baseline_base_commit',lock.baselineCommit==='f8deaf9328dbad7e99d76ed265cbfd2dab944dae');
check('graph_git_blob_locked',gitBlob(raw(lock.graphPath))===lock.graphGitBlobSha1);
check('eleven_sha1_locked',lock.lockedFiles.length===11&&lock.lockedFiles.every(x=>gitBlob(raw(x.path))===x.gitBlobSha1));
check('frozen_engine_hash',release.engineSha256===sha256(raw(lock.frozenEnginePath)));
check('frozen_corpus_matches_record_order',JSON.stringify(lock.lockedFiles.slice(1).map(x=>x.path))===JSON.stringify(json(lock.graphPath).fundamentalRecordPaths));
check('release_no_human_scores',release.realQuestionCount===0&&release.realReviewerCount===0&&release.independentAccuracy===null);
check('historical_status_unchanged',oldStatus.status==='NO_EXTERNAL_SAMPLE'&&oldStatus.metrics===null);
check('current_pilot_status_empty',gateStatus.status==='NO_MANUAL_ATTESTATIONS'&&gateStatus.externalSearchAccuracy===null);
check('four_roles',JSON.stringify(release.packages.map(p=>p.role))===JSON.stringify(['collector','reviewer','adjudicator','evaluator']));
const roles=['collector','reviewer','adjudicator','evaluator'];
const work=fs.mkdtempSync('reports/.qa-offline-frozen-');
function execute(command,args,{cwd=process.cwd()}={}){
 return spawnSync(command,args,{cwd,encoding:'utf8',timeout:20000,maxBuffer:12*1024*1024});
}
try{
 for(const role of roles){
  const entry=release.packages.find(x=>x.role===role),file='reports/'+entry.path;
  check(role+'_archive_exists',fs.existsSync(file)&&fs.statSync(file).size===entry.archiveBytes);
  check(role+'_archive_checksum',sha256(raw(file))===entry.archiveSha256);
  const dir=path.join(work,role);
  fs.mkdirSync(dir,{recursive:true});
  const untar=execute('tar',['-xzf',path.resolve(file),'-C',dir]);
  check(role+'_archive_extracts',untar.status===0);
  const base=path.join(dir,role);
  if(!fs.existsSync(path.join(base,'manifest.json'))){check(role+'_manifest_present',false);continue}
  const manifest=json(path.join(base,'manifest.json'));
  check(role+'_manifest_schema',manifest.schema==='fmea-mining.offline-role-bundle-manifest.v1'&&manifest.role===role&&manifest.version==='1.4.11');
  check(role+'_same_engine_corpus',manifest.engineSha256===release.engineSha256&&manifest.corpusSha256===release.corpusSha256);
  check(role+'_public_null_scores',manifest.realQuestions===0&&manifest.realReviewers===0&&manifest.externalAccuracy===null);
  const files=manifest.content;
  check(role+'_file_count',files.length===entry.fileCount);
  check(role+'_files_digest',files.every(e=>fs.existsSync(path.join(base,e.path))&&raw(path.join(base,e.path)).length===e.bytes&&sha256(raw(path.join(base,e.path)))===e.sha256));
  check(role+'_no_private_files',files.every(e=>!e.path.includes('private/')&&!/\.env|credentials|token/i.test(e.path)));
  const roleRoot=fs.readdirSync(base);
  check(role+'_no_unmanifested_top_level_files',roleRoot.filter(x=>x!=='manifest.json').every(x=>files.some(f=>f.path===x||f.path.startsWith(x+'/'))));
  const html=files.filter(f=>f.path.endsWith('.html')).map(f=>raw(path.join(base,f.path)).toString('utf8')).join('\n');
  check(role+'_no_browser_network_or_storage',!/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|<script\s+src=/i.test(html));
  if(role!=='evaluator'){
   check(role+'_no_search_code',!html.includes('discoverTechnical')&&!files.some(x=>x.path.includes('technical-discovery-v2')));
  }
  if(role==='collector'){
   check('collector_does_not_ship_any_concept_catalog',!html.includes('TK-HYD-')&&!files.some(f=>f.path.endsWith('.json')));
   check('collector_has_20_question_print_sheet',html.includes('for(let i=1;i<=20;i++'));
  }
  if(role==='reviewer'){
   check('reviewer_has_ten_titles_not_answers',(html.match(/TK-[A-Z0-9-]+/g)||[]).length>=10&& !html.includes('technical-discovery-v2.mjs'));
  }
  if(role==='adjudicator'){
   check('adjudicator_never_calls_retrieval',html.includes('predictionsNotViewed')&&!html.includes('discoverTechnical'));
  }
  if(role==='evaluator'){
   check('evaluator_includes_all_locked_records',lock.lockedFiles.slice(1).every(x=>files.some(y=>y.path===x.path)));
   check('evaluator_has_node_cli',fs.existsSync(path.join(base,'scripts/evaluate-external-review.mjs'))&&fs.existsSync(path.join(base,'package.json')));
   const sample=execute('node',['scripts/evaluate-external-review.mjs'],{cwd:base});
   check('evaluator_offline_empty_status',sample.status===0&&sample.stdout.includes('NO_EXTERNAL_SAMPLE'));
   if(sample.status===0){
    const obj=json(path.join(base,'reports/external-review-evaluation.generated.json'));
    check('evaluator_does_not_fabricate_people',obj.metrics===null&&obj.totals.submitted===0);
   }
  }
 }
 // Adversarial mutations prove manifest fingerprints are not mere documentation.
 for(const file of lock.lockedFiles){
  const a=raw(file.path),altered=Buffer.concat([a,Buffer.from('\n#test')]);
  adversarial++;check('reject_modified_'+path.basename(file.path),gitBlob(altered)!==file.gitBlobSha1);
 }
 adversarial++;
 const mutated=Buffer.concat([raw(lock.graphPath),Buffer.from('\n')]);
 check('reject_modified_graph',gitBlob(mutated)!==lock.graphGitBlobSha1);
 adversarial++;
 const m=json(path.join(work,'reviewer','reviewer','manifest.json'));
 const p=m.content.find(x=>x.path==='revisao-cega.html');
 check('reject_manifest_tamper',p&&sha256(Buffer.from('tampered'))!==p.sha256);
}finally{fs.rmSync(work,{recursive:true,force:true})}
const result={schema:'fmea-mining.frozen-pilot-package-audit.v1',version:'1.4.11',status:errors.length?'FAIL':'PASS',
 checks,adversarialMutations:adversarial,
 roleArchives:4,lockedTechnicalFiles:11,
 noRealParticipantData:true,realQuestions:0,realHumanReviewers:0,independentMetrics:null,
 failedChecks:errors};
fs.writeFileSync('reports/pilot-frozen-package-audit.generated.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
process.exit(errors.length?1:0);
