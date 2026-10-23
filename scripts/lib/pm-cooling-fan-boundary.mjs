/** Semantic guard: a cooling fan may be hydraulically driven, without a belt or replaceable bearing. */
export const FAN_SUPPORT={rule:"cooling-fan-bearing",bundle:"BUNDLE-10",conditions:["COND-COOL-FAN-ABNORMAL-NOISE","COND-COOL-FAN-SUPPORT-PLAY"],actions:["ACT-COOL-FAN-DRIVE-IDENTIFY","ACT-COOL-FAN-SUPPORT-INSPECT"],damage:"DMG-COOL-FAN-SUPPORT-CANDIDATE"};
export const FAN_BELT={rule:"cooling-fan-belt",bundle:"BUNDLE-11",conditions:["COND-COOL-FAN-BELT-VISUAL","COND-COOL-FAN-BELT-SLIP"],actions:["ACT-COOL-FAN-BELT-CONDITION","ACT-COOL-FAN-BELT-TENSION"],damage:"DMG-COOL-FAN-BELT-CANDIDATE"};
const equal=(a,b)=>Array.isArray(a)&&a.length===b.length&&a.every((v,i)=>v===b[i]);
const isCandidate=(d)=>d?.kind==='candidate_component_damage'&&d?.confirmed===false&&d?.reviewStatus==='not_approved'&&
  Object.keys(d?.catalogMapping||{}).length===5&&Object.values(d.catalogMapping).every(x=>x===null);
const trueStatement=(x)=>typeof x==='string'&&x.length>60;
export function checkFanOntology(model,fixtures,seed,rules){
 const errors=[],ck=(v,name)=>{if(!v)errors.push(name)};
 ck(model?.version==='1.3.16'&&model?.schema==='fmea-mining.condition-action-damage.v1','ontology_baseline');
 ck(model?.conditions?.length===65&&model?.actions?.length===48&&model?.damageHypotheses?.length===29&&model?.bundles?.length===18&&model?.relations?.length===153,'ontology_cardinality');
 ck(model?.observations?.length===0&&model?.workOrderExecutions?.length===0&&model?.confirmedComponentDamages?.length===0,'falsified_field_evidence');
 const conditions=new Map(model.conditions.map(x=>[x.id,x]));
 const actions=new Map(model.actions.map(x=>[x.id,x]));
 const damages=new Map(model.damageHypotheses.map(x=>[x.id,x]));
 const bundles=new Map(model.bundles.map(x=>[x.id,x]));
 const links=new Map(model.relations.map(x=>[x.id,x]));
 const sourceIds=new Set(rules.map(x=>x.id));
 ck(sourceIds.has('CAT-COOLING-FAN-REVERSE')&&sourceIds.has('CAT-ENGINE-BELT-PM')&&sourceIds.has('CAT-FAN-BELT-FUNCTION')&&sourceIds.has('SKF-ISO15243-BEARING'),'missing_cited_sources');
 const base=damages.get("DMG-COOL-INTERNAL-BLOCKAGE");
 ck(isCandidate(base)&&base?.label==='Possível obstrução interna do trocador de calor sob investigação','radiator_false_certainty');
 const forbidden=/\b(confirmad[oa]s?|efetiv[oa]s?)\b/i;
 ck(!model.damageHypotheses.some(x=>forbidden.test(x.label)),'damages_label_claims_certainty');
 const models=seed.filter(x=>["cooling-fan-bearing","cooling-fan-belt"].includes(x.id));
 ck(models.length===2&&models.every(x=>x.system==='arrefecimento'&&x.subgroupCode==='FANN'&&x.status==='hipotese_de_protecao_preventiva'&&x.review==='pendente'),'seed_changed_or_missing');
 for(const def of [FAN_SUPPORT,FAN_BELT]){
  const b=bundles.get(def.bundle);
  ck(b?.ruleId===def.rule&&equal(b?.conditionIds,def.conditions)&&equal(b?.actionIds,def.actions)&&equal(b?.differentialDamageIds,[def.damage]),'semantic_bundle_mismatch_'+def.rule);
  ck(b?.automaticDamagePromotion===false&&b?.mappingScope==='generic_only'&&b?.status==='review_candidate'&&b?.observedConditionIds?.length===0&&b?.performedActionIds?.length===0&&b?.confirmedDamageIds?.length===0&&b?.evidenceInterpretation==='sem_resultado_de_campo','bundle_promoted_'+def.rule);
  ck(trueStatement(b?.interpretation)&&b?.chainIds?.length===0,'premature_causal_chain_'+def.rule);
  const related=model.relations.filter(x=>x.from===def.bundle);
  ck(related.length===5,'wrong_relation_count_'+def.rule);
  const expected=[...def.conditions,...def.actions,def.damage];
  ck(related.length===expected.length&&expected.every(id=>related.some(x=>x.to===id)),'mismatched_relations_'+def.rule);
  for(const e of related){
   const type=def.conditions.includes(e.to)?'rule_monitors_condition':def.actions.includes(e.to)?'rule_proposes_action':'rule_lists_differential_damage';
   ck(e.type===type&&e.observed===false&&e.reviewStatus==='interpretacao_inferida','relation_fabrication_'+e.id);
  }
  for(const id of def.conditions){
   const x=conditions.get(id);
   ck(x?.system==='arrefecimento'&&x?.status==='condition_hypothesis_not_observed'&&x?.observedValue===null&&x?.observedAt===null,'condition_fabricated_'+id);
   ck(trueStatement(x?.limitations)&&trueStatement(x?.observation)&&x?.sourceIds?.every(s=>sourceIds.has(s)),'condition_unsourced_'+id);
  }
  for(const id of def.actions){
   const x=actions.get(id);
   ck(x?.executionStatus==='not_performed'&&x?.observedResults?.length===0&&x?.intervalHours===null&&x?.requiresApplicableOemProcedure===true,'action_executed_'+id);
   ck(x?.safety?.length>70&&x?.sourceIds?.every(s=>sourceIds.has(s)),'action_unsafe_'+id);
  }
  const damage=damages.get(def.damage);
  ck(isCandidate(damage)&&damage?.sourceIds.every(s=>sourceIds.has(s))&&trueStatement(damage.requiredEvidence),'damage_mapped_'+def.damage);
 }
 const fan=bundles.get('BUNDLE-10'),belt=bundles.get('BUNDLE-11');
 ck(fan?.actionIds.includes('ACT-COOL-FAN-DRIVE-IDENTIFY'),'drive_identification_missing');
 ck(belt?.interpretation.includes('pode não ter correia')&&
   conditions.get('COND-COOL-FAN-BELT-VISUAL')?.limitations?.includes('acionados hidraulicamente'),
   'belt_effectivity_pretended');
 ck(belt?.differentialDamageIds.every(id=>!fan?.differentialDamageIds.includes(id)),'component_damage_conflated');
 ck(links.size===model.relations.length,'duplicate_relations');
 ck(fixtures?.status==='synthetic_assertions_not_real_events'&&fixtures?.cases?.length===32,'fixture_count');
 for(const [id,rule,cond,act] of [
  ['SEM-17','cooling-fan-bearing','COND-COOL-FAN-ABNORMAL-NOISE','ACT-COOL-FAN-DRIVE-IDENTIFY'],
  ['SEM-18','cooling-fan-belt','COND-COOL-FAN-BELT-SLIP','ACT-COOL-FAN-BELT-CONDITION']
 ]){
  const f=fixtures.cases.find(x=>x.id===id);
  ck(f?.ruleId===rule&&equal(f?.observedConditionIds,[cond])&&equal(f?.performedActionIds,[act])&&
   f?.independentComponentTest==='not_performed'&&f?.expectedConfirmedDamageIds?.length===0,
   'fixture_falsified_'+id);
 }
 return errors;
}
