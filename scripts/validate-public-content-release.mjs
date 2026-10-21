#!/usr/bin/env node
// Confere histórico golden e output determinístico; pacote, contrato e conteúdo versionam separadamente.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256,BASELINE_SHA256,evaluateTransition,parseVersion} from './lib/public-content-release.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const errors=[],check=(v,m)=>{if(!v)errors.push(m)};
const registry=read('data/governance/public-content-releases.v1.json');
const policy=read('data/governance/public-content-release-policy.v1.json');
const contract=read('data/governance/public-contract.v1.json');
const payload=fs.readFileSync(path.join(root,'reports/public-knowledge.v1.json'));
const manifest=read('reports/public-manifest.v1.json');
const packageJson=read('package.json');
check(registry.schema==='fmea-mining.public-content-releases.v1'&&registry.registryVersion==='1.0.0','Registry incompatível');
check(policy.schema==='fmea-mining.public-content-release-policy.v1'&&policy.version==='1.0.0','Política de conteúdo inválida');
check(policy.gate.frozenBaselineSha256===BASELINE_SHA256&&policy.gate.allSnapshotsRetained&&policy.gate.requireExactVersionBump&&policy.gate.requireGoldenSnapshotForCurrent&&policy.gate.requireExplicitEditorialReviewForFuture&&policy.gate.allowOperationalPromotion===false,'Gate de publicação relaxado');
check(Array.isArray(registry.releases)&&registry.releases.length>0,'Histórico de release vazio');
check(!!parseVersion(packageJson.version)&&!!parseVersion(contract.contractVersion),'Versão pacote ou contrato inválida');
const seen=new Set();let previous=null;
for(const row of registry.releases||[]){
 check(parseVersion(row.contentVersion)!==null&&!seen.has(row.contentVersion),'Versão duplicada/inválida '+row.contentVersion);
 seen.add(row.contentVersion);
 check(row.snapshotPath==='data/governance/snapshots/public-knowledge.content-'+row.contentVersion+'.json','Nome de snapshot inesperado '+row.contentVersion);
 check(row.review?.approvedForOperationalUse===false,'Aprovação operacional indevida '+row.contentVersion);
 const file=path.resolve(root,row.snapshotPath);
 check(file.startsWith(path.join(root,'data','governance','snapshots')+path.sep),'Caminho fora da pasta de snapshots');
 let raw=null,obj=null;
 try{raw=fs.readFileSync(file);obj=JSON.parse(raw.toString('utf8'));}
 catch{errors.push('Snapshot indisponível ou inválido '+row.snapshotPath);continue;}
 check(sha256(raw)===row.sha256,'Hash de snapshot divergente '+row.contentVersion);
 check(obj.records?.length===row.recordCount&&obj.sources?.length===row.sourceCount,'Contagens históricas divergentes '+row.contentVersion);
 check(obj.approvedForOperationalUse===false&&obj.counts?.confirmedRootCauses===0&&obj.counts?.empiricalOccurrences===0,'Snapshot real/operacional proibido '+row.contentVersion);
 check(row.contractVersion===contract.contractVersion,'Alteração contratual requer etapa de migração separada '+row.contentVersion);
 if(previous){
  check(row.review?.status==='editorial_aprovado'&&typeof row.review?.editorialReviewer==='string'&&row.review.editorialReviewer.length>=3&&typeof row.changeLog==='string'&&row.changeLog.length>=40,'Revisão humana/documentação ausente '+row.contentVersion);
  const decision=evaluateTransition(previous.obj,obj,previous.row.contentVersion,row.contentVersion);
  check(decision.kind==='patch'||decision.kind==='minor','Revisão de conteúdo bloqueada: '+row.contentVersion+' '+decision.reason);
 }else{
  check(row.contentVersion==='1.0.0'&&row.contractVersion==='1.0.0'&&row.historicalPreviewVersion==='1.3.12'&&row.sha256===BASELINE_SHA256,'Raiz histórica alterada');
 }
 previous={row,obj,raw};
}
const current=registry.releases?.at(-1);
check(!!current&&registry.currentContentRelease===current.contentVersion,'Release vigente diverge do histórico');
if(current){
 check(current.sha256===sha256(payload)&&manifest.sha256===current.sha256,'Conteúdo gerado não coincide com release vigente');
 check(previous?.raw?.equals(payload),'Golden vigente difere byte a byte do preview');
 check(manifest.recordCount===current.recordCount&&manifest.sourceCount===current.sourceCount&&manifest.version===current.historicalPreviewVersion,'Manifesto sem correspondência com release');
 check(contract.compatibilityReference.sha256===registry.releases[0].sha256,'Baseline do contrato não corresponde ao conteúdo');
}
const out={status:errors.length?'FAIL':'OK',packageVersion:packageJson.version,contractVersion:contract.contractVersion,contentVersion:registry.currentContentRelease,goldenSnapshots:registry.releases.length,previewRecords:current?.recordCount,previewSources:current?.sourceCount,currentSha256:sha256(payload),errors:errors.slice(0,30)};
console.log(JSON.stringify(out,null,2));process.exit(errors.length?1:0);
