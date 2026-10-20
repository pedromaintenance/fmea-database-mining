#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const db=read('data/catalog/failure-db.v1.json');
const rules=read('data/knowledge/pm-prevention/seed-rules.json').records;
const playbooks=read('data/knowledge/diagnostic/playbooks.v1.json').records;
const links=read('data/knowledge/diagnostic/generated-links.json');
const oil=read('data/knowledge/oil/archetypes.json').records;
const models=new Set(db.models.map(m=>m.id));
const locations=new Map(db.locations.map(l=>[l.id,l]));
const rulesById=new Map(rules.map(r=>[r.id,r]));
const oilIds=new Set(oil.map(x=>x.id));
const errors=[];
const test=(c,m)=>{if(!c)errors.push(m)};
const seen=new Set();
for(const p of playbooks){
 test(!seen.has(p.id),'Roteiro duplicado '+p.id);seen.add(p.id);
 test(p.target.modelIds.every(x=>models.has(x)),'Modelo '+p.id);
 test(p.target.pmRuleIds.length>0&&p.target.pmRuleIds.every(x=>rulesById.has(x)),'Regras '+p.id);
 test(p.target.oilArchetypeCandidates.every(x=>oilIds.has(x)),'Arquetipo de oleo '+p.id);
 test(p.hypotheses.length>=3&&p.tests.length>=2,'Numero de alternativas/testes '+p.id);
 const hids=new Set(p.hypotheses.map(h=>h.id));
 test(hids.size===p.hypotheses.length,'Hipoteses repetidas '+p.id);
 for(const t of p.tests){
  test(t.differentiates.length>=2&&t.differentiates.every(x=>hids.has(x)),'Teste sem discriminacao '+p.id);
  test(['supports','weakens','inconclusive'].every(k=>t.possibleOutcomes[k]?.length>8),'Faltam desfechos '+p.id);
  test(t.status==='proposta_de_verificacao_sem_execucao','Teste tratado como realizado '+p.id);
 }
 test(p.evidenceStatus==='sem_resultado_observado'&&p.review.status==='pendente','Evidencia/revisao ficticia '+p.id);
 test(Object.values(p.mapping).filter(x=>x!==null).length===1,'Local ou dano indevidamente preenchido '+p.id);
}
test(links.records.length===playbooks.length,'Quantidade de roteiros');
for(const record of links.records){
 const p=playbooks.find(x=>x.id===record.playbookId);
 test(!!p,'Roteiro do vinculo nao existe');if(!p)continue;
 test(record.selected===null&&record.causeConfirmed===false&&record.evidenceStatus==='nao_observada','Causa confirmada indevidamente '+p.id);
 test(record.candidateCount===record.choices.length,'Contagem de vinculos '+p.id);
 for(const choice of record.choices){
  const loc=locations.get(choice.locationId),rule=rulesById.get(choice.pmRuleId);
  test(!!loc&&!!rule,'Local/regra inexistente '+p.id);if(!loc||!rule)continue;
  test(p.target.modelIds.includes(loc.modelo)&&p.target.pmRuleIds.includes(choice.pmRuleId),'Modelo/regra diferente '+p.id);
  test(loc.profundidade===3&&loc.subgrupo?.codigo===rule.subgroupCode,'Subgrupo divergente '+p.id);
  test(db.partsByObjectType[loc.objetoTipoSAP]?.some(x=>x.code===choice.componentCode),'Componente invalido '+p.id);
  test(db.compatibleFailureModesByPart[choice.componentCode]?.damageCauses?.[choice.damageId]?.includes(choice.causeId),'Dano/causa incompativeis '+p.id);
 }
}
test(links.counts.candidates===links.records.reduce((n,r)=>n+r.choices.length,0),'Totais divergentes');
console.log(JSON.stringify({status:errors.length?'FALHOU':'OK',playbooks:playbooks.length,links:links.counts.candidates,withoutCandidates:links.counts.withoutCandidates,errors:errors.length},null,2));
for(const e of errors.slice(0,30))console.error(e);
process.exit(errors.length?1:0);
