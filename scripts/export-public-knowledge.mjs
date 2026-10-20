#!/usr/bin/env node
/**
 * Gera preview PUBLICO de conhecimento FMEA somente por allowlist.
 * Nao exporta dados de campo, notas/OS, arquivos corporativos ou material OEM integral.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const chains=read('data/knowledge/causal-chains.v1.json').records;
const effects=read('data/knowledge/causal-effects.v1.json').records;
const levels=read('data/ontology/causal-levels.v1.json').records;
const sources=read('data/research/sources.v1.json').sources;
const policy=read('data/governance/public-export-policy.v1.json');
const effectIndex=new Map(effects.map(x=>[x.chainId,x]));
const levelIndex=new Map(levels.map(x=>[x.chainId,x]));
const sourceIndex=new Map(sources.map(x=>[x.id,x]));
const sorted=[...chains].sort((a,b)=>a.id.localeCompare(b.id,'en'));
if(sorted.length!==24||levelIndex.size!==24||effectIndex.size!==24)throw Error('Cobertura publica de 24 cadeias inconsistente');
const records=sorted.map(c=>{
 const e=effectIndex.get(c.id),l=levelIndex.get(c.id);
 if(!e||!l)throw Error('Ausencia de efeito/niveis: '+c.id);
 if(c.review.status!=='inferido_com_literatura_geral'||c.confirmedRootCause!==false||c.empiricalOccurrences!==0)throw Error('Cadeia alterou status sem revisao: '+c.id);
 if(l.confirmedRootCause!==false||l.review.status!=='inferido_com_literatura_geral'||l.observation.hasObservedEvent!==false)throw Error('Registro de nivel nao elegivel: '+c.id);
 const x={
  id:c.id,title:c.title,family:c.family,
  operatingFunction:c.operatingFunction,functionalFailureId:c.functionalFailureId,
  failureMode:c.failureMode,mechanismIds:[...c.mechanismIds],
  sourceIds:[...new Set([...c.sourceClaims.map(s=>s.sourceId),...l.sourceIds])].sort(),
  causalLevels:{
   observedPhenomenon:l.causalLevels.observedPhenomenon,
   immediatePhysicalMechanismCandidate:l.causalLevels.immediatePhysicalMechanismCandidate,
   contributingConditionCandidates:[...l.causalLevels.contributingConditionCandidates],
   rootCauseCandidates:[...l.causalLevels.rootCauseCandidates],
   rootCauseNotEstablishedBecause:l.causalLevels.rootCauseNotEstablishedBecause
  },
  localEffect:{description:e.localEffect.description,status:'possible_unobserved'},
  systemEffect:{description:e.systemEffect.description,status:'possible_unobserved'},
  competingHypotheses:c.competingHypotheses.map(h=>({id:h.id,description:h.description,discriminator:h.discriminator})),
  investigations:c.investigations.map(t=>({id:t.id,methodId:t.methodId,purpose:t.purpose,status:'not_performed'})),
  applicability:{modelId:null,locationId:null,serialOrArrangement:null},
  reviewStatus:'inferido_com_literatura_geral',
  nature:'hypothesis_not_event',
  confirmedRootCause:false,empiricalOccurrences:0
 };
 if(JSON.stringify(Object.keys(x).sort())!==JSON.stringify([...policy.allowedChainFields].sort()))throw Error('Fields outside public allowlist: '+c.id);
 return x;
});
const usedIds=new Set(records.flatMap(x=>x.sourceIds));
const publicSources=[...usedIds].sort().map(id=>{
 const s=sourceIndex.get(id);
 if(!s||!/^https:\/\//.test(s.url))throw Error('Fonte de referencia publica ausente: '+id);
 const x={id:s.id,title:s.title,organization:s.organization??null,url:s.url,role:s.role??null,limitation:s.limitation??null};
 if(JSON.stringify(Object.keys(x).sort())!==JSON.stringify([...policy.allowedSourceFields].sort()))throw Error('Campo extra em fonte '+id);
 return x;
});
const pub={
 schema:'fmea-mining.public-knowledge-preview.v1',version:'1.3.12',
 contentStatus:'conceptual_inferred_unvalidated',approvedForOperationalUse:false,
 recordNature:'hypotheses_only',sourceScope:'general_principles_not_serial_effective',
 warnings:[
 'Nao utilizar como procedimento de execucao, liberacao operacional, aprovacao de OS ou causa raiz confirmada.',
 'Modelo, serie, componentes, danos e causas SAP nao foram homologados.',
 'Testes e consequencias sao apenas propostos; requerem documentacao OEM e revisao tecnica independente.'
 ],
 counts:{causalChains:records.length,sources:publicSources.length,confirmedRootCauses:0,empiricalOccurrences:0},
 records,sources:publicSources
};
const json=JSON.stringify(pub,null,2)+'\n';
const checksum=crypto.createHash('sha256').update(json,'utf8').digest('hex');
const manifest={
 schema:'fmea-mining.public-knowledge-manifest.v1',version:'1.3.12',
 artifact:'reports/public-knowledge.v1.json',sha256:checksum,
 recordCount:records.length,sourceCount:publicSources.length,
 exportPolicy:'data/governance/public-export-policy.v1.json',
 generation:'deterministic_no_current_date',approvedForOperationalUse:false
};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/public-knowledge.v1.json'),json);
fs.writeFileSync(path.join(root,'reports/public-manifest.v1.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({status:'OK',...manifest},null,2));
