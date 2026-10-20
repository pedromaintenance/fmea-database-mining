#!/usr/bin/env node
/* Valida a allowlist, SHA256 e natureza hipotética do artefato público. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const raw=fs.readFileSync(path.join(root,'reports/public-knowledge.v1.json'),'utf8');
const pub=JSON.parse(raw);
const m=read('reports/public-manifest.v1.json');
const policy=read('data/governance/public-export-policy.v1.json');
const layers=read('data/ontology/causal-levels.v1.json').records;
const chains=read('data/knowledge/causal-chains.v1.json').records;
const effects=read('data/knowledge/causal-effects.v1.json').records;
const sourceIds=new Set(read('data/research/sources.v1.json').sources.map(x=>x.id));
const err=[];const check=(v,msg)=>{if(!v)err.push(msg)};
const keys=obj=>Object.keys(obj).sort().join('|');
check(pub.schema==='fmea-mining.public-knowledge-preview.v1'&&pub.version==='1.3.12','Versão do preview incorreta');
check(pub.contentStatus==='conceptual_inferred_unvalidated'&&pub.approvedForOperationalUse===false,'Exportação passou a ser operacional');
check(pub.recordNature==='hypotheses_only'&&pub.sourceScope==='general_principles_not_serial_effective','Natureza de registros incorreta');
check(pub.warnings.length>=3,'Advertências de limitação insuficientes');
check(pub.counts.causalChains===24&&pub.counts.confirmedRootCauses===0&&pub.counts.empiricalOccurrences===0,'Contadores de origem incorretos');
check(pub.records.length===24&&pub.records.length===layers.length&&pub.records.length===chains.length,'Cobertura causal incompleta');
const chainIds=new Set(chains.map(x=>x.id)),levelIds=new Set(layers.map(x=>x.chainId)),effectIds=new Set(effects.map(x=>x.chainId));
const seen=new Set();
for(const x of pub.records){
 check(keys(x)===policy.allowedChainFields.slice().sort().join('|'),'Campo público não aprovado '+x.id);
 check(chainIds.has(x.id)&&levelIds.has(x.id)&&effectIds.has(x.id),'ID não corresponde às camadas '+x.id);
 check(!seen.has(x.id),'Cadeia duplicada '+x.id);seen.add(x.id);
 check(x.reviewStatus==='inferido_com_literatura_geral'&&x.nature==='hypothesis_not_event'&&x.confirmedRootCause===false&&x.empiricalOccurrences===0,'Falha confirmada indevidamente '+x.id);
 check(x.localEffect.status==='possible_unobserved'&&x.systemEffect.status==='possible_unobserved','Efeito publicado como observado '+x.id);
 check(x.applicability.modelId===null&&x.applicability.locationId===null&&x.applicability.serialOrArrangement===null,'Aplicabilidade não verificada '+x.id);
 check(x.competingHypotheses.length>=2&&x.investigations.length>=2&&x.investigations.every(t=>t.status==='not_performed'),'Investigação com resultado inventado '+x.id);
 check(x.sourceIds.length>0&&x.sourceIds.every(y=>sourceIds.has(y)),'Proveniência inexistente '+x.id);
 check(typeof x.causalLevels.rootCauseNotEstablishedBecause==='string'&&x.causalLevels.rootCauseCandidates.length>=2,'Causa sem limite expresso '+x.id);
}
check(pub.sources.length===pub.counts.sources&&pub.sources.length===m.sourceCount,'Contagem de fontes divergente');
const refs=new Set(pub.records.flatMap(x=>x.sourceIds)),sourceSeen=new Set();
for(const s of pub.sources){
 check(keys(s)===policy.allowedSourceFields.slice().sort().join('|'),'Campos não permitidos em fonte '+s.id);
 check(refs.has(s.id)&&sourceIds.has(s.id),'Fonte excedente/desconhecida '+s.id);
 check(!sourceSeen.has(s.id),'Fonte duplicada '+s.id);sourceSeen.add(s.id);
 check(typeof s.url==='string'&&s.url.startsWith('https://'),'Fonte sem URL HTTPS '+s.id);
}
check(sourceSeen.size===refs.size,'Faltam fontes referenciadas');
const digest=crypto.createHash('sha256').update(raw,'utf8').digest('hex');
check(m.sha256===digest&&m.artifact==='reports/public-knowledge.v1.json','Checksum de exportação inválido');
check(m.version==='1.3.12'&&m.recordCount===pub.records.length&&m.approvedForOperationalUse===false,'Manifest incorreto');
check(policy.reviewRules.zeroConfirmedRootCauses===true&&policy.reviewRules.approvedForOperationalUse===false,'Política pública insegura');
check(JSON.stringify(pub.records.map(x=>x.id))===JSON.stringify([...pub.records.map(x=>x.id)].sort((a,b)=>a.localeCompare(b,'en'))),'Exportação não determinística por ordenação');
const result={status:err.length?'FAIL':'OK',records:pub.records.length,sourceReferences:pub.sources.length,sha256:digest,realEvents:0,approvedOperationalUses:0,errors:err.slice(0,25)};
console.log(JSON.stringify(result,null,2));process.exit(err.length?1:0);
