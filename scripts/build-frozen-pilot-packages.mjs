#!/usr/bin/env node
/** Four frozen, role-separated, offline pilot bundles. No participant data. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import {spawnSync} from 'node:child_process';
const read=p=>fs.readFileSync(p);
const json=p=>JSON.parse(read(p).toString('utf8'));
const sha256=b=>crypto.createHash('sha256').update(b).digest('hex');
const gitBlob=b=>crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex');
const lock=json('data/quality/pilot-frozen-baseline.v1.json');
if(lock.schema!=='fmea-mining.frozen-pilot-baseline.v1'||lock.version!=='1.4.11'||lock.recordCount!==10||lock.lockedFiles.length!==11)throw Error('Invalid pilot source lock');
const graphBuffer=read(lock.graphPath);
if(gitBlob(graphBuffer)!==lock.graphGitBlobSha1)throw Error('FROZEN PILOT GRAPH CHANGED');
const graph=JSON.parse(graphBuffer);
if(graph.fundamentalRecordPaths.length!==10)throw Error('Frozen graph must contain ten records');
if(JSON.stringify([lock.frozenEnginePath,...graph.fundamentalRecordPaths])!==JSON.stringify(lock.lockedFiles.map(r=>r.path)))throw Error('Frozen roster differs from graph');
const lockedHashes=lock.lockedFiles.map(r=>{
 const b=read(r.path);
 if(!/^[a-f0-9]{40}$/.test(r.gitBlobSha1)||gitBlob(b)!==r.gitBlobSha1)throw Error('FROZEN SOURCE LOCK VIOLATED: '+r.path);
 return {path:r.path,gitBlobSha1:r.gitBlobSha1,sha256:sha256(b),bytes:b.length};
});
const engineSha256=lockedHashes[0].sha256;
const records=graph.fundamentalRecordPaths.map(p=>({...json(p),__path:p}));
const corpusSha256=sha256(Buffer.from(JSON.stringify(records),'utf8'));
const roles={
 collector:{description:'Somente perguntas; sem conceitos, busca ou previsoes.',assets:[['reports/coleta-perguntas.generated.html','coleta-perguntas.html'],['docs/piloto-oficina.html','piloto-oficina.html']]},
 reviewer:{description:'R1 e R2: somente titulos e IDs dos artigos, sem busca ou previsoes.',assets:[['reports/revisao-cega.generated.html','revisao-cega.html']]},
 adjudicator:{description:'Comparacao cega dos pareceres; sem busca ou previsoes.',assets:[['reports/adjudicacao-tecnica.generated.html','adjudicacao-tecnica.html']]},
 evaluator:{description:'Somente apos congelar o gabarito: busca lexical, corpus e CLIs de avaliacao.',assets:[
  ['reports/consulta-tecnica.generated.html','consulta-tecnica.html'],
  ['reports/laboratorio-avaliacao.generated.html','laboratorio-avaliacao.html'],
  ['scripts/evaluate-external-review.mjs','scripts/evaluate-external-review.mjs'],
  ['scripts/reconcile-blind-reviews.mjs','scripts/reconcile-blind-reviews.mjs'],
  ['scripts/check-pilot-gates.mjs','scripts/check-pilot-gates.mjs'],
  ['scripts/lib/technical-discovery-v2.mjs','scripts/lib/technical-discovery-v2.mjs'],
  ['scripts/lib/external-review-core.mjs','scripts/lib/external-review-core.mjs'],
  ['scripts/lib/dual-review-core.mjs','scripts/lib/dual-review-core.mjs'],
  ['scripts/lib/pilot-readiness-core.mjs','scripts/lib/pilot-readiness-core.mjs'],
  [lock.graphPath,lock.graphPath],
  ['data/quality/field-pilot-readiness.v1.json','data/quality/field-pilot-readiness.v1.json'],
  ['data/quality/pilot-frozen-baseline.v1.json','data/quality/pilot-frozen-baseline.v1.json'],
  ...graph.fundamentalRecordPaths.map(p=>[p,p])
 ]}};
const outDir='reports/pilot-offline';
fs.rmSync(outDir,{recursive:true,force:true});
fs.mkdirSync(outDir,{recursive:true});
for(const [role,spec] of Object.entries(roles)){
 const dir=path.join(outDir,role);fs.mkdirSync(dir,{recursive:true});
 const content=[];
 const add=(filename,b)=>{
  const target=path.join(dir,filename);fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,b);content.push({path:filename,bytes:b.length,sha256:sha256(b)});
 };
 for(const [source,dest] of spec.assets){
  if(source.includes('private/')||dest.includes('private/'))throw Error('Private input in public package');
  add(dest,read(source));
 }
 if(role==='evaluator'){
  const pkg={name:'fmea-frozen-pilot-offline-evaluator',version:'1.4.11',type:'module',private:true,
   scripts:{reconcile:'node scripts/reconcile-blind-reviews.mjs',evaluate:'node scripts/evaluate-external-review.mjs',gates:'node scripts/check-pilot-gates.mjs'}};
  add('package.json',Buffer.from(JSON.stringify(pkg,null,2)+'\n'));
  add('.gitignore',Buffer.from('private/\n'));
 }
 const start=role==='collector'?'coleta-perguntas.html':role==='reviewer'?'revisao-cega.html':role==='adjudicator'?'adjudicacao-tecnica.html':'consulta-tecnica.html';
 const readme=[
 'FMEA Database Mining - PILOTO 1.4.11','PAPEL: '+role.toUpperCase(),spec.description,
 'Abra '+start+' offline no navegador. Nenhum participante ou julgamento real incluido.',
 'Nunca inclua nomes, IDs de equipamentos, OS, SAP ou dados operacionais restritos.',
 'Veja manifest.json e checksums dos arquivos antes de utilizar o pacote.',
 'MOTOR SHA-256: '+engineSha256,'CORPUS SHA-256: '+corpusSha256,
 role==='evaluator'
  ?'Apos adjudicar, use npm run reconcile -- --collection private/perguntas.json --r1 private/r1.json --r2 private/r2.json --decisions private/decisoes.json --out-dir private/consolidado; depois npm run evaluate -- --input private/consolidado/gold.private.json --out private/consolidado/score.private.json.'
  :'Nao consulte as previsoes ou o pacote avaliador antes de congelar os julgamentos.',
 'Este software nao oferece autorizacao de manutencao, teste OEM ou liberacao de maquina.',''
 ].join('\n');
 add('README.txt',Buffer.from(readme));
 const links=spec.assets.filter(x=>x[1].endsWith('.html')).map(x=>'<li><a href="./'+x[1]+'">'+x[1]+'</a></li>').join('');
 const index='<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Piloto 1.4.11 - '+role+'</title><style>body{font:16px/1.6 system-ui;max-width:760px;margin:4rem auto;padding:0 1rem;background:#10242e;color:#f2f5f7}a{color:#bce4f4}h1{color:#d9b375}</style></head><body><h1>Pacote offline: '+role+'</h1><p>'+spec.description+'</p><p>Conjunto congelado: <code>'+engineSha256.slice(0,16)+'...</code></p><ul>'+links+'</ul><p>Leia <a href="./README.txt">README.txt</a> antes de utilizar.</p></body></html>';
 add('index.html',Buffer.from(index));
 const manifest={schema:'fmea-mining.offline-role-bundle-manifest.v1',version:'1.4.11',role,nature:'public_empty_offline_software_not_participant_data',
  lockPath:'data/quality/pilot-frozen-baseline.v1.json',graphGitBlobSha1:lock.graphGitBlobSha1,engineSha256,corpusSha256,
  realQuestions:0,realReviewers:0,externalAccuracy:null,
  content:content.sort((a,b)=>a.path.localeCompare(b.path,'en'))};
 fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 // Reproducible GNU tar with normalized ordering, timestamps and ownership.
 const tar=spawnSync('tar',['--sort=name','--mtime=@0','--owner=0','--group=0','--numeric-owner','--format=ustar','-cf','-','-C',outDir,role],{encoding:null,maxBuffer:20*1024*1024});
 if(tar.status!==0)throw Error('Cannot assemble frozen archive for '+role+': '+String(tar.stderr));
 fs.writeFileSync('reports/pilot-'+role+'-1.4.11.tar.gz',zlib.gzipSync(tar.stdout,{mtime:0,level:9}));
}
const summary={schema:'fmea-mining.pilot-offline-release-index.v1',version:'1.4.11',
 nature:'frozen_technical_source_and_four_empty_role_packages',
 baseCommit:lock.baselineCommit,engineSha256,corpusSha256,
 graphGitBlobSha1:lock.graphGitBlobSha1,lockedFiles:lockedHashes,
 packages:Object.keys(roles).map(role=>({role,path:'pilot-'+role+'-1.4.11.tar.gz',
  fileCount:json(path.join(outDir,role,'manifest.json')).content.length,
  archiveSha256:sha256(read('reports/pilot-'+role+'-1.4.11.tar.gz')),
  archiveBytes:read('reports/pilot-'+role+'-1.4.11.tar.gz').length,
  containsRetrievalEngine:role==='evaluator',containsRealHumanEvidence:false})),
 realQuestionCount:0,realReviewerCount:0,independentAccuracy:null,
 note:'Lock checks the current engine and ten articles against a known Git commit. No actual review data or independent validation is present.'};
fs.writeFileSync('reports/pilot-frozen-release-index.generated.json',JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({status:'FROZEN_PUBLIC_PACKAGES_BUILT',packages:summary.packages,lockedFiles:lockedHashes.length,
 engineSha256,corpusSha256,realQuestions:0},null,2));
