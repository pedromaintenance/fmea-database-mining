#!/usr/bin/env node
/**
 * Teste de fronteira semantica: condicao de fluido/desempenho, tarefa preventiva
 * e alteracao do componente sao entidades independentes.
 * Nao executa testes de campo; nenhum dano real e registrado.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const model=read('data/ontology/condition-action-damage.v1.json');
const ontology=read('data/ontology/concepts.v1.json');
const fixtures=read('data/quality/semantic-regression-fixtures.v1.json');
const rules=read('data/knowledge/pm-prevention/seed-rules.json').records;
const blocked=read('data/quality/pm-gap-review.v1.json').records;
const sources=read('data/research/sources.v1.json').sources;
const chains=read('data/knowledge/causal-chains.v1.json').records;
const errors=[];
const check=(ok,msg)=>{if(!ok)errors.push(msg)};
const unique=(a,label)=>{const ids=a.map(x=>x.id);check(new Set(ids).size===ids.length,'IDs duplicados: '+label);return new Map(a.map(x=>[x.id,x]))};
const conditions=unique(model.conditions,'condicoes');
const actions=unique(model.actions,'acoes');
const damages=unique(model.damageHypotheses,'danos');
const bundles=unique(model.bundles,'bundles');
const edges=unique(model.relations,'relacoes');
const ruleIds=new Set(rules.map(x=>x.id));
const chainIds=new Set(chains.map(x=>x.id));
const sourceIds=new Set(sources.map(x=>x.id));
const methodIds=new Set(ontology.evidenceMethods.map(x=>x.id));
const blockerMap=new Map(blocked.map(x=>[x.ruleId,x]));
check(model.safetyInvariant==='condition!=action!=damage','Invariante de separacao ausente');
check(model.evidenceNature==='no_field_observation','Dado de campo inventado');
check(model.observations.length===0&&model.workOrderExecutions.length===0&&model.confirmedComponentDamages.length===0,'Amostras ou danos reais introduzidos');
check(model.conditions.length>=18&&model.actions.length>=18&&model.damageHypotheses.length>=9&&model.bundles.length>=9,'Regressao de cardinalidade');
check(new Set([...conditions.keys(),...actions.keys(),...damages.keys(),...bundles.keys()]).size===conditions.size+actions.size+damages.size+bundles.size,'IDs de naturezas distintas colidem');
const validateRefs=(refList,eligible,context)=>check(refList.length>0&&refList.every(id=>eligible.has(id)), 'Referencia invalida em '+context);
for(const c of model.conditions){
 validateRefs(c.sourceIds,sourceIds,c.id+' fontes');
 validateRefs(c.methods,methodIds,c.id+' metodos');
 check(c.status==='condition_hypothesis_not_observed'&&c.observedValue===null&&c.observedAt===null,'Condicao tratada como observada '+c.id);
 check(c.observation.length>25&&c.limitations.length>25,'Sem criterio ou ressalva '+c.id);
}
for(const a of model.actions){
 validateRefs(a.sourceIds,sourceIds,a.id);
 check(['servicing','inspection','sampling','test'].includes(a.kind),'Tipo de tarefa invalido '+a.id);
 check(a.executionStatus==='not_performed'&&a.observedResults.length===0&&a.intervalHours===null,'Execucao ou periodicidade inventada '+a.id);
 check(a.requiresApplicableOemProcedure===true&&a.safety.length>30,'Procedimento de seguranca ausente '+a.id);
}
for(const d of model.damageHypotheses){
 validateRefs(d.sourceIds,sourceIds,d.id);
 check(d.confirmed===false&&d.reviewStatus==='not_approved','Dano prematuramente confirmado '+d.id);
 check(Object.values(d.catalogMapping).every(x=>x===null),'Dano ganhou vinculo SAP sem efetividade '+d.id);
 check(d.requiredEvidence.length>45,'Prova independente nao declarada '+d.id);
}
for(const b of model.bundles){
 check(ruleIds.has(b.ruleId),'Regra PM inexistente '+b.id);
 validateRefs(b.sourceIds,sourceIds,b.id);
 validateRefs(b.conditionIds,conditions,b.id+' condicoes');
 validateRefs(b.actionIds,actions,b.id+' acoes');
 validateRefs(b.differentialDamageIds,damages,b.id+' danos diferenciais');
 for(const id of b.chainIds)check(chainIds.has(id),'Cadeia inexistente '+b.id+'/'+id);
 check(b.automaticDamagePromotion===false&&b.confirmedDamageIds.length===0&&b.observedConditionIds.length===0&&b.performedActionIds.length===0,'Promocao de achado ou dano '+b.id);
 check(b.evidenceInterpretation==='sem_resultado_de_campo'&&b.mappingScope==='generic_only','Campo tratado como efetivo '+b.id);
 check(b.interpretation.length>75,'Sem limite interpretativo '+b.id);
 // As duas regras PM bloqueadas continuam bloqueadas no SAP: o esquema novo NAO cria um alias.
 if(blockerMap.has(b.ruleId))check(blockerMap.get(b.ruleId).status==='bloqueado_aguardando_curadoria','Regra desbloqueada sem curadoria '+b.ruleId);
}
const allNodes=new Map([...conditions,...actions,...damages,...bundles]);
const allowedEdgeTypes={rule_monitors_condition:conditions,rule_proposes_action:actions,rule_lists_differential_damage:damages};
for(const e of model.relations){
 check(bundles.has(e.from),'Origem de relacao nao e uma regra semanticamente mapeada '+e.id);
 check(allNodes.has(e.to),'Destino inexistente '+e.id);
 check(Object.prototype.hasOwnProperty.call(allowedEdgeTypes,e.type),'Tipo de aresta proibida '+e.id);
 check(allowedEdgeTypes[e.type]?.has(e.to),'Mistura de tipos de entidade '+e.id);
 check(e.observed===false&&e.reviewStatus==='interpretacao_inferida','Aresta promoveu inferencia a fato '+e.id);
}
for(const b of model.bundles){
 const outgoing=model.relations.filter(x=>x.from===b.id);
 const expected=[...b.conditionIds,...b.actionIds,...b.differentialDamageIds];
 check(outgoing.length===expected.length&&outgoing.every(x=>expected.includes(x.to)), 'Arestas de bundle divergentes '+b.id);
}
// Casos sinteticos de regressao: observar a condicao ou realizar uma tarefa nao e prova independente de dano.
check(fixtures.status==='synthetic_assertions_not_real_events','Fixtures declarados reais');
const seenFixtures=new Set();
for(const f of fixtures.cases){
 check(!seenFixtures.has(f.id),'Fixture duplicada '+f.id);seenFixtures.add(f.id);
 const b=[...bundles.values()].find(x=>x.ruleId===f.ruleId);
 check(!!b,'Fixture sem regra mapeada '+f.id);if(!b)continue;
 check(f.observedConditionIds.every(x=>b.conditionIds.includes(x)),'Condicao nao pertinente '+f.id);
 check(f.performedActionIds.every(x=>b.actionIds.includes(x)),'Acao nao pertinente '+f.id);
 check(f.independentComponentTest==='not_performed','Teste independente indevidamente alegado '+f.id);
 check(f.expectedConfirmedDamageIds.length===0,'Fixture confirma dano por observacao simples '+f.id);
 // O importador nao tem gatilho de dano: somente o curador pode promover em uma camada futura.
 const automaticConfirmed=b.automaticDamagePromotion?b.differentialDamageIds:[];
 check(automaticConfirmed.length===0,'Regra inferiu dano automaticamente '+f.id);
}
check(model.relations.length>=53&&fixtures.cases.length>=14,'Cobertura regressao insuficiente');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',conditions:conditions.size,actions:actions.size,damageHypotheses:damages.size,bundles:bundles.size,typedRelations:edges.size,syntheticRegressionCases:fixtures.cases.length,confirmedDamageLinks:0,errors:errors.slice(0,40)},null,2));
process.exit(errors.length?1:0);
