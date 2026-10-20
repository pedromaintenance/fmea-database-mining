#!/usr/bin/env node
// Auditoria de compatibilidade catalogal e causal; SEM homologacao de FMEA nem de efetividade OEM.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {matchesRoot} from './pm-system-scope.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const catalog=read('data/catalog/failure-db.v1.json');
const chains=read('data/knowledge/causal-chains.v1.json').records;
const pm=read('data/knowledge/pm-prevention/seed-rules.json').records;
const assessment=read('data/quality/causal-sap-assessment.v1.json');
const sources=new Set(read('data/research/sources.v1.json').sources.map(s=>s.id));
const chainIds=new Set(chains.map(c=>c.id));
const seen=new Set(),errors=[];
const assert=(condition,why)=>{if(!condition)errors.push(why)};
for(const s of assessment.references)assert(sources.has(s),'Bibliografia ausente: '+s);
const byIssue={},result=[];
const validIssues=new Set(['sem_local_hidraulico','candidato_nao_homologado','par_dano_causa_ausente','arquitetura_a_confirmar','efeito_secundario_nao_mecanismo','identidade_componente_ambigua','sem_componente_alvo','circularidade_dano_causa']);
const familyExpected={mangueiras_hidraulicas:'hidraulico',comando_final:'comando_final',arrefecimento:'arrefecimento',material_rodante:'rodante'};
for(const a of assessment.records){
 assert(chainIds.has(a.chainId),'Cadeia inexistente: '+a.chainId);
 assert(!seen.has(a.chainId),'Auditoria duplicada: '+a.chainId);seen.add(a.chainId);
 assert(validIssues.has(a.issueCode),'Categoria de auditoria desconhecida: '+a.chainId);
 assert(a.explanation.length>60,'Justificativa insuficiente: '+a.chainId);
 assert(a.confirmedLocationId===null&&a.effectiveSerial===null&&a.confirmedCause===false,'Homologacao indevida: '+a.chainId);
 assert(a.status==='analise_taxonomica_nao_homologada','Status indevido: '+a.chainId);
 const chain=chains.find(c=>c.id===a.chainId);
 if(!chain)continue;
 assert(chain.review.status==='inferido_com_literatura_geral','Cadeia anteriormente homologada: '+a.chainId);
 const applicable=pm.filter(p=>chain.preventionRuleIds.includes(p.id)&&p.system===familyExpected[chain.family]);
 assert(applicable.length>0,'Nao existe PM do sistema da cadeia: '+a.chainId);
 const tuple=a.proposedCatalogTuple;
 let componentPresent=false,damageCauseCompatible=false,strictPaths=0;
 const matchedModels=new Set();
 if(tuple){
  componentPresent=(catalog.partsByObjectType[tuple.objectType]||[]).some(p=>p.code===tuple.componentCode);
  damageCauseCompatible=(catalog.compatibleFailureModesByPart[tuple.componentCode]?.damageCauses?.[tuple.damageId]||[]).includes(tuple.causeId);
  assert(catalog.damages.some(x=>x.id===tuple.damageId),'Dano ausente: '+a.chainId);
  assert(catalog.causes.some(x=>x.id===tuple.causeId),'Causa ausente: '+a.chainId);
  for(const l of catalog.locations){
   if(l.profundidade!==3||l.objetoTipoSAP!==tuple.objectType)continue;
   if(applicable.some(p=>p.models.includes(l.modelo)&&p.subgroupCode===l.subgrupo?.codigo&&matchesRoot(p,l))){
    strictPaths++;matchedModels.add(l.modelo);
   }
  }
  assert(componentPresent,'Codigo de componente nao esta no tipo de objeto: '+a.chainId);
  if(a.issueCode==='par_dano_causa_ausente')assert(!damageCauseCompatible,'Par de dano/causa passou a existir: revisar '+a.chainId);
  else assert(damageCauseCompatible,'Par de dano/causa nao permitido: '+a.chainId);
  if(a.issueCode==='sem_local_hidraulico')assert(strictPaths===0,'Novo local agora existe: reavaliar '+a.chainId);
 }else{
  assert(a.issueCode==='sem_componente_alvo','Tuple nula fora de lacuna explicita: '+a.chainId);
 }
 byIssue[a.issueCode]=(byIssue[a.issueCode]||0)+1;
 result.push({chainId:a.chainId,family:chain.family,issueCode:a.issueCode,
  partCodeRegisteredForObjectType:componentPresent,
  catalogDamageCausePairCompatible:damageCauseCompatible,
  structurallyMatchingSapPaths:strictPaths,
  structurallyMatchingModels:[...matchedModels].sort(),
  assessmentStatus:'inferido_nao_validado',
  engineeringAcceptance:false,
  // A verificacao da tupla e do local nao comprova a plausibilidade fisica da cadeia.
  note:'Contagem de caminhos cadastrais, sem verificacao de serie, mecanismo ou causa; ver assessment manual'});
}
assert(assessment.records.length===chains.length&&seen.size===chains.length,'Faltam cadeias na auditoria');
assert(assessment.qualityPolicy.approvedLinks===0&&assessment.qualityPolicy.serialEffectivityConfirmed===0,'Politica de homologacao inconsistente');
const summary={
 chainsAudited:result.length,issueCounts:byIssue,
 catalogPairsCompatible:result.filter(x=>x.catalogDamageCausePairCompatible).length,
 catalogPairsMissing:result.filter(x=>x.partCodeRegisteredForObjectType&&!x.catalogDamageCausePairCompatible).length,
 chainsWithoutProposedComponent:result.filter(x=>!x.partCodeRegisteredForObjectType).length,
 chainsWithStrictStructuralPaths:result.filter(x=>x.structurallyMatchingSapPaths>0).length,
 structuralPathsSummed:result.reduce((n,x)=>n+x.structurallyMatchingSapPaths,0),
 acceptedEngineeringLinks:0,confirmedEmpiricalFailureEvents:0};
const report={schema:'fmea-mining.causal-sap-audit.v1',version:'1.3.4',meaning:'Diagnostico de lacunas na taxonomia, nao validacao da falha ou causa',
summary,records:result};
const output=path.join(root,'reports/causal-sap-audit.generated.json');
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FALHOU':'OK',summary,errors:errors.slice(0,40)},null,2));
process.exit(errors.length?1:0);
