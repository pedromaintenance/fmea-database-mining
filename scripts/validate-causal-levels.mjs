#!/usr/bin/env node
/* Protege a distinção entre fenômeno, mecanismo físico, contribuinte e causa raiz apenas candidata. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const x=read('data/ontology/causal-levels.v1.json');
const chains=read('data/knowledge/causal-chains.v1.json').records;
const effects=read('data/knowledge/causal-effects.v1.json').records;
const existing=read('data/quality/diagnostic-pathways.v1.json').records;
const req=read('data/quality/evidence-requirements.v1.json').records;
const sources=new Set(read('data/research/sources.v1.json').sources.map(s=>s.id));
const err=[],check=(v,msg)=>{if(!v)err.push(msg);};
const chainIndex=new Map(chains.map(z=>[z.id,z])),effectIds=new Set(effects.map(z=>z.chainId));
const oldMap=new Map(existing.map(z=>[z.chainId,z]));
const reqIds=new Set(req.map(z=>z.id));
check(x.schema==='fmea-mining.causal-levels.v1'&&x.version==='1.3.12','Versão/esquema incorretos');
check(x.policy.rootCausesRequireIndependentEvidence===true&&x.policy.preventOrganizationalBlameWithoutInvestigation===true,'Política de causa raiz não aplicada');
const seen=new Set();let extended=0,old=0;
for(const row of x.records){
 check(!seen.has(row.chainId),'Cadeia duplicada '+row.chainId);seen.add(row.chainId);
 const c=chainIndex.get(row.chainId);check(!!c,'Cadeia inexistente '+row.chainId);if(!c)continue;
 check(row.family===c.family&&row.operatingFunction===c.operatingFunction&&row.functionalFailureId===c.functionalFailureId,'Função divergente '+row.chainId);
 check(effectIds.has(row.localEffectReference.chainId),'Efeito não referenciado '+row.chainId);
 check(row.localEffectReference.status==='possible_unobserved','Efeito foi tratado como observado '+row.chainId);
 const lev=row.causalLevels;
 for(const key of ['observedPhenomenon','immediatePhysicalMechanismCandidate','rootCauseNotEstablishedBecause'])
 check(typeof lev[key]==='string'&&lev[key].length>=55,'Nível causal insuficiente '+row.chainId+'/'+key);
 check(Array.isArray(lev.contributingConditionCandidates)&&lev.contributingConditionCandidates.length>=3,'Faltam contribuintes '+row.chainId);
 check(Array.isArray(lev.rootCauseCandidates)&&lev.rootCauseCandidates.length>=2,'Faltam causas candidatas '+row.chainId);
 for(const s of [...lev.contributingConditionCandidates,...lev.rootCauseCandidates])check(typeof s==='string'&&s.length>=15,'Condição candidata insuficiente '+row.chainId);
 check(row.evidenceRequirementIds.length===c.investigations.length&&row.evidenceRequirementIds.every(z=>reqIds.has(z)),'Evidências órfãs '+row.chainId);
 check(row.sourceIds.length>0&&row.sourceIds.every(z=>sources.has(z)&&c.sourceClaims.some(a=>a.sourceId===z)),'Fontes fora da cadeia '+row.chainId);
 check(Object.values(row.applicability).every(z=>z===null),'Efetividade por série inventada '+row.chainId);
 check(row.observation.hasObservedEvent===false&&row.observation.observedValue===null&&row.observation.observedAt===null,'Ocorrência real inventada '+row.chainId);
 check(row.review.status==='inferido_com_literatura_geral'&&row.review.reviewer===null&&row.review.independentReviewer===null&&row.review.decision===null,'Revisão inventada '+row.chainId);
 check(row.confirmedRootCause===false&&row.measuredSeverity===null&&row.claimStatus==='hipotese_tecnica_nao_homologada','Causalidade comprovada indevidamente '+row.chainId);
 const p=oldMap.get(row.chainId);
 if(p){old++;check(row.editorialOrigin==='preservado_do_roteiro_v1.3.11','Perda da origem da cadeia '+row.chainId);check(JSON.stringify(lev)===JSON.stringify(p.causalLevels),'Roteiro aprovado foi alterado '+row.chainId);}
 else{extended++;check(row.editorialOrigin==='analise_mecanistica_ampliada_v1.3.12','Origem de curadoria nova ausente '+row.chainId);}
}
check(x.records.length===chains.length&&seen.size===chains.length,'Falta cobertura de 24 cadeias');
check(old===3&&extended===21,'Cobertura 3+21 incorreta');
const summary={status:err.length?'FAIL':'OK',total:x.records.length,expanded:extended,preserved:old,observedFailures:0,approvedRootCauses:0,errors:err.slice(0,30)};
console.log(JSON.stringify(summary,null,2));process.exit(err.length?1:0);
