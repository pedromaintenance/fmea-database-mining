#!/usr/bin/env node
// Mutantes sintéticos testam classificação e rejeição, sem alterar snapshots reais.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {evaluateTransition,sha256,BASELINE_SHA256} from './lib/public-content-release.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'data/governance/snapshots/public-knowledge.content-1.0.0.json'));
const original=JSON.parse(source.toString('utf8'));
const rows=JSON.parse(fs.readFileSync(path.join(root,'data/quality/public-content-release-regressions.v1.json')));
const copy=x=>JSON.parse(JSON.stringify(x));
function apply(next,mutation){
 switch(mutation){
 case 'none':break;
 case 'title':next.records[0].title+=' — correção editorial';break;
 case 'sourceTitle':next.sources[0].title+=' — edição';break;
 case 'addChain':{
  const r=copy(next.records[0]);r.id='FC-AAA-999';
  next.records.push(r);next.records.sort((a,b)=>a.id.localeCompare(b.id,'en'));next.counts.causalChains=next.records.length;break;
 }
 case 'removeChain':next.records.pop();next.counts.causalChains=next.records.length;break;
 case 'promoteRoot':next.records[0].confirmedRootCause=true;break;
 case 'changeMechanism':next.records[0].causalLevels.immediatePhysicalMechanismCandidate='Mecanismo reescrito sem revisão';break;
 case 'sourceUrl':next.sources[0].url='https://example.invalid/redirect';break;
 case 'previewSchema':next.schema='fmea-mining.public-knowledge-preview.v2';break;
 case 'reorder':next.records.reverse();break;
 case 'addSource':{
  const s=copy(next.sources[0]);s.id='A-NEW-REF';s.url='https://example.org/public-future-paper';
  next.sources.push(s);next.sources.sort((a,b)=>a.id.localeCompare(b.id,'en'));next.counts.sources=next.sources.length;break;
 }
 case 'changeWarning':next.warnings[0]='Livre para operar';break;
 default:throw Error('Mutação desconhecida '+mutation);
 }
 return next;
}
const errors=[],seen=new Set();
if(rows.schema!=='fmea-mining.public-content-regressions.v1'||rows.nature!=='synthetic_only'||rows.cases.length<15)errors.push('Fixtures insuficientes');
for(const t of rows.cases){
 if(seen.has(t.id))errors.push('ID repetido '+t.id);seen.add(t.id);
 const output=evaluateTransition(original,apply(copy(original),t.mutation),t.fromVersion,t.toVersion);
 if(output.kind!==t.expected)errors.push(t.id+' esperado='+t.expected+' recebido='+output.kind+' '+output.reason);
}
if(sha256(source)!==BASELINE_SHA256)errors.push('Golden adulterado');
if(sha256(Buffer.concat([source,Buffer.from('x')]))===BASELINE_SHA256)errors.push('Detecção de byte alterado inoperante');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',syntheticCases:rows.cases.length,baselineSha256:sha256(source),errors},null,2));
process.exit(errors.length?1:0);
