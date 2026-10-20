#!/usr/bin/env node
/**
 * Diagnostica gargalos sequenciais na junção PM → SAP.
 * Os códigos e modelos são apenas estrutura cadastral. NÃO confirma peça instalada.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {matchesRoot,ROOT_SCOPES} from './pm-system-scope.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const db=read('data/catalog/failure-db.v1.json');
const rules=read('data/knowledge/pm-prevention/seed-rules.json').records;
const generated=read('data/knowledge/pm-prevention/generated-links.json').records;
const review=read('data/quality/pm-gap-review.v1.json');
const sources=new Set(read('data/research/sources.v1.json').sources.map(s=>s.id));
const errors=[];const assert=(ok,msg)=>{if(!ok)errors.push(msg)};
const indexed=new Map(review.records.map(x=>[x.ruleId,x]));
assert(indexed.size===review.records.length,'Duplicatas na revisao de lacunas');
assert(review.policy.technicalApprovals===0,'Revisao indica aprovacoes inexistentes');
assert(review.policy.automaticPartCreationForbidden===true&&review.policy.automaticSubgroupAliasesForbidden===true,'Aproximacao arbitraria permitida');
const categories=['subgroup_not_in_scope','component_not_registered','damage_cause_not_permitted'];
const rows=[],hits=new Map(),totals={};
const strictLocationCount=(rule,list)=>list.filter(l=>matchesRoot(rule,l));
for(const rule of rules){
 assert(!!ROOT_SCOPES[rule.system],'Sistema da regra sem escopo valido: '+rule.id);
 const base=db.locations.filter(l=>l.profundidade===3&&rule.models.includes(l.modelo));
 const rooted=base.filter(l=>ROOT_SCOPES[rule.system]?.includes(l.sistema?.codigo));
 const group= strictLocationCount(rule,rooted);
 const subgroup=group.filter(l=>l.subgrupo?.codigo===rule.subgroupCode);
 const matches=loc=>(db.partsByObjectType[loc.objetoTipoSAP]||[]).filter(p=>p.pt.toLocaleLowerCase('pt-BR').includes(rule.partText.toLocaleLowerCase('pt-BR')));
 const part=subgroup.filter(l=>matches(l).length>0);
 const compatible=part.filter(l=>matches(l).some(p=>(db.compatibleFailureModesByPart[p.code]?.damageCauses?.[rule.damageId]||[]).includes(rule.causeId)));
 const expectedLinks=compatible.reduce((n,l)=>n+matches(l).filter(p=>(db.compatibleFailureModesByPart[p.code]?.damageCauses?.[rule.damageId]||[]).includes(rule.causeId)).length,0);
 const actual=generated.filter(x=>x.originRule===rule.id).length;
 assert(expectedLinks===actual,'Divergencia gerador e auditor: '+rule.id+' '+expectedLinks+' != '+actual);
 let blocker=null;
 if(compatible.length===0){
  blocker=subgroup.length===0?'subgroup_not_in_scope':part.length===0?'component_not_registered':'damage_cause_not_permitted';
  totals[blocker]=(totals[blocker]||0)+1;
 }
 const manual=indexed.get(rule.id);
 if(blocker){
  assert(!!manual,'Regra sem vinculacao e sem revisao: '+rule.id);
  if(manual){
   assert(manual.expectedBlocker===blocker,'Classificacao desatualizada: '+rule.id+' era '+manual.expectedBlocker+' agora '+blocker);
   assert(manual.status==='bloqueado_aguardando_curadoria'&&manual.autoRemapAllowed===false,'Publicacao sem curadoria: '+rule.id);
   assert(manual.approvedModelIds.length===0&&manual.confirmedSapLocationIds.length===0&&manual.verifiedPartCodes.length===0&&manual.observedFailures===0,'Efetividade inventada: '+rule.id);
   assert(typeof manual.finding==='string'&&manual.finding.length>60,'Justificativa insuficiente: '+rule.id);
   assert(typeof manual.nextInspection==='string'&&manual.nextInspection.length>60,'Plano de investigacao insuficiente: '+rule.id);
   assert(manual.sourceIds.every(id=>sources.has(id)),'Fonte desconhecida: '+rule.id);
  }
 } else assert(!manual,'Regra agora elegivel mas ainda marcada bloqueada; revisar: '+rule.id);
 hits.set(rule.id,actual);
 rows.push({
  ruleId:rule.id,system:rule.system,subgroupCode:rule.subgroupCode,
  counts:{modelPaths:base.length,rootPaths:rooted.length,groupEligible:group.length,subgroupEligible:subgroup.length,partEligible:part.length,damageCauseEligible:compatible.length,generatedCandidateLinks:actual},
  firstBlocker:blocker,engineeringReviewed:false,acceptedLocations:0,
  note: "Contagens estruturais sem confirmação de série, estado de falha ou causa"
 });
}
assert(rows.length===25,'Quantidade de regras mudou; revisar auditoria');
assert([...hits.values()].reduce((n,x)=>n+x,0)===generated.length,'Total de links PM divergente');
assert(review.records.length===10,'Numero de excecoes sem revisao: '+review.records.length);
assert(Object.values(totals).reduce((n,x)=>n+x,0)===review.records.length,'Quantidade de zero-hit fora do esperado');
for(const c of categories)assert((totals[c]||0)>0,'Classe de bloqueio desapareceu: '+c);
const summary={rules:rules.length,withStrictCandidates:rows.filter(x=>!x.firstBlocker).length,withoutStrictCandidates:review.records.length,blockerCounts:totals,
generatedStrictCandidateLinks:generated.length,approvedEngineeringLinks:0,
failedSerialEffectivityChecks:0,empiricalFailureEvents:0};
const payload={schema:'fmea-mining.pm-gap-audit.v1',version:'1.3.5',qualityMeaning:'Cobertura hierarquica e lacunas taxonomicas; zero causas ou modos homologados',summary,records:rows};
const out=path.join(root,'reports/pm-gap-audit.generated.json');
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(payload,null,2)+'\n');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',summary,errors:errors.slice(0,30)},null,2));
process.exit(errors.length?1:0);
