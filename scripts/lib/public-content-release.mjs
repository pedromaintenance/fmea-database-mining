// Regras conservadoras para releases de CONTEÚDO; nenhuma promoção causal automática.
import crypto from 'node:crypto';
export const sha256 = raw => crypto.createHash('sha256').update(raw).digest('hex');
export const BASELINE_SHA256 = 'b780a1c95e6f2ab5b3fb1f9acd20a63a1a5abd0e3f3ed111f61052b2e8c59c65';
const equal = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const copy = value => JSON.parse(JSON.stringify(value));
const sorted = (xs,locale) => xs.map(x=>x.id).join('|') === [...xs].map(x=>x.id).sort((a,b)=>locale?a.localeCompare(b,'en'):a.localeCompare(b,'en')).join('|');
const keys = x => Object.keys(x).sort().join('|');
export function parseVersion(s) {
 const m=/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(s||'');
 return m?m.slice(1).map(Number):null;
}
export function nextVersion(from,bump) {
 const v=parseVersion(from);if(!v)return null;
 return bump==='patch'?[v[0],v[1],v[2]+1].join('.'):
        bump==='minor'?[v[0],v[1]+1,0].join('.'):
        bump==='major'?[v[0]+1,0,0].join('.'):null;
}
export function safeHypothesis(r,shape,sourceIds) {
 return keys(r)===keys(shape) && r.nature==='hypothesis_not_event' &&
  r.reviewStatus==='inferido_com_literatura_geral' && r.confirmedRootCause===false &&
  r.empiricalOccurrences===0 && r.applicability.modelId===null &&
  r.applicability.locationId===null && r.applicability.serialOrArrangement===null &&
  r.localEffect?.status==='possible_unobserved' &&
  r.systemEffect?.status==='possible_unobserved' &&
  Array.isArray(r.sourceIds) && r.sourceIds.length>0 &&
  r.sourceIds.every(x=>sourceIds.has(x)) &&
  Array.isArray(r.competingHypotheses) && r.competingHypotheses.length>=2 &&
  Array.isArray(r.investigations) && r.investigations.length>=2 &&
  r.investigations.every(x=>x.status==='not_performed');
}
export function compareContent(before,after) {
 const reject = reason=>({kind:'reject',reason});
 if(!before||!after||keys(before)!==keys(after))return reject('estrutura pública alterada');
 if(before.schema!==after.schema || before.version!==after.version)return reject('schema ou versão legacy mudou');
 for(const field of ['contentStatus','approvedForOperationalUse','recordNature','sourceScope','warnings'])
  if(!equal(before[field],after[field]))return reject('semântica ou aviso modificado: '+field);
 if(!Array.isArray(before.records)||!Array.isArray(after.records)||!Array.isArray(before.sources)||!Array.isArray(after.sources))
  return reject('listas inválidas');
 if(!sorted(after.records,true)||!sorted(after.sources,false))return reject('ordem/IDs não determinísticos');
 if(keys(before.counts)!==keys(after.counts)||
    after.counts.causalChains!==after.records.length||after.counts.sources!==after.sources.length||
    after.counts.confirmedRootCauses!==0||after.counts.empiricalOccurrences!==0)
  return reject('contadores não correspondem à natureza de hipóteses');
 const oldById=new Map(before.records.map(x=>[x.id,x]));
 const oldSources=new Map(before.sources.map(x=>[x.id,x]));
 const nowById=new Map(after.records.map(x=>[x.id,x]));
 const newSources=new Map(after.sources.map(x=>[x.id,x]));
 if(oldById.size!==before.records.length||oldSources.size!==before.sources.length ||
    nowById.size!==after.records.length||newSources.size!==after.sources.length)return reject('IDs duplicados');
 for(const id of oldById.keys())if(!nowById.has(id))return reject('ID estável removido: '+id);
 for(const id of oldSources.keys())if(!newSources.has(id))return reject('fonte estável removida: '+id);
 let changed=false;let addition=false;
 for(const [id,prev] of oldById) {
  const next=nowById.get(id);
  if(!safeHypothesis(next,prev,newSources))return reject('estado ou estrutura insegura: '+id);
  if(!equal(prev,next)){
   const normalized=copy(next);
   normalized.title=prev.title;
   normalized.localEffect.description=prev.localEffect.description;
   normalized.systemEffect.description=prev.systemEffect.description;
   if(!equal(prev,normalized))return reject('alteração mecanística/causal ou campo não editorial: '+id);
   changed=true;
  }
 }
 const originalShape=before.records[0];
 for(const [id,newRecord] of nowById)if(!oldById.has(id)){
  if(!originalShape||!safeHypothesis(newRecord,originalShape,newSources))return reject('novo registro inseguro: '+id);
  addition=true;
 }
 for(const [id,prev] of oldSources){
  const next=newSources.get(id);
  if(!equal(prev,next)){
   const normalized=copy(next);
   normalized.title=prev.title;
   normalized.limitation=prev.limitation;
   if(!equal(prev,normalized))return reject('fonte alterada além de título/limitação: '+id);
   changed=true;
  }
 }
 const sourceShape=before.sources[0];
 for(const [id,s] of newSources)if(!oldSources.has(id)){
  if(!sourceShape||keys(s)!==keys(sourceShape)||typeof s.url!=='string'||!s.url.startsWith('https://'))
   return reject('nova fonte inválida: '+id);
  addition=true;
 }
 return {kind:addition?'minor':changed?'patch':'unchanged',reason:addition?'inclusão aditiva de IDs':changed?'correção editorial permitida':'bytes sem mudança semântica'};
}
export function evaluateTransition(before,after,from,to) {
 if(!parseVersion(from)||!parseVersion(to))return {kind:'reject',reason:'versão SemVer inválida'};
 const v=compareContent(before,after);
 if(v.kind==='reject')return v;
 if(v.kind==='unchanged')return from===to?v:{kind:'reject',reason:'incremento vazio sem alteração de conteúdo'};
 if(to!==nextVersion(from,v.kind))return {kind:'reject',reason:'bump incorreto, esperado '+nextVersion(from,v.kind)};
 return v;
}
