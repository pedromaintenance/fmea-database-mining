#!/usr/bin/env node
/* Verifica efeitos locais e sistêmicos como riscos potenciais, não observações. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const effects=read('data/knowledge/causal-effects.v1.json');
const chains=read('data/knowledge/causal-chains.v1.json').records;
const sources=new Set(read('data/research/sources.v1.json').sources.map(x=>x.id));
const indexed=new Map(chains.map(c=>[c.id,c]));
const errors=[];const check=(v,message)=>{if(!v)errors.push(message)};
const ids=new Set();
check(effects.status==='local_and_system_effect_hypotheses_only','Natureza das hipóteses alterada');
check(effects.policy.noEmpiricalEvents&&effects.policy.noSeverityWithoutEvidence&&effects.policy.noAutomaticCausalValidation,'Politica de segurança ausente');
for(const r of effects.records){
 check(!ids.has(r.chainId),'Duplicata '+r.chainId);ids.add(r.chainId);
 const chain=indexed.get(r.chainId);
 check(!!chain,'Cadeia desconhecida '+r.chainId);if(!chain)continue;
 check(r.family===chain.family&&r.functionalFailureId===chain.functionalFailureId,'Contexto funcional divergente '+r.chainId);
 for(const [scope,flag] of [['localEffect','componentVerified'],['systemEffect','operationalImpactVerified']]){
  const effect=r[scope];
  check(typeof effect?.description==='string'&&effect.description.length>45,'Efeito não documentado '+scope+'/'+r.chainId);
  check(effect?.status==='possible_unobserved'&&effect?.[flag]===false,'Efeito confirmado indevidamente '+scope+'/'+r.chainId);
 }
 check(r.sourceIds.length>0&&r.sourceIds.every(x=>sources.has(x)),'Fonte órfã '+r.chainId);
 check(r.sourceIds.every(x=>chain.sourceClaims.some(s=>s.sourceId===x)),'Fonte alheia à cadeia '+r.chainId);
 check(typeof r.propagationCondition==='string'&&r.propagationCondition.length>70,'Propagação sem condição '+r.chainId);
 check(typeof r.diagnosticCaveat==='string'&&r.diagnosticCaveat.length>35,'Contraprova insuficiente '+r.chainId);
 check(r.causalityStatus==='engineering_inference_unreviewed'&&r.reviewer===null,'Revisão inventada '+r.chainId);
 check(r.severityRank===null&&r.probability===null&&r.actualEventCount===0,'Risco quantitativo inventado '+r.chainId);
 check(r.applicableModelId===null&&r.applicableLocationId===null&&r.oemSerialEffectivity===null,'Efetividade OEM indevida '+r.chainId);
}
check(effects.records.length===chains.length&&ids.size===chains.length,'Cobertura incompleta de efeitos');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',chains:chains.length,effects:effects.records.length,localEffects:effects.records.length,systemEffects:effects.records.length,verifiedEffects:0,errors:errors.slice(0,25)},null,2));
process.exit(errors.length?1:0);
