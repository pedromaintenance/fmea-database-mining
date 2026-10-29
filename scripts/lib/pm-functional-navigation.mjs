/** Evidence-scoped navigability. An authored chain is not an observed failure or approved causal relation. */
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const unique=a=>new Set(a).size===a.length;
const pair=(a,b)=>[a,b].sort().join("::");
const flatIds=o=>o.map(x=>x.id);
export function buildFunctionalNavigation({catalog,chains,ontology,semantic}){
 const rules=catalog.records,allowed=new Set(rules.map(x=>x.ruleId));
 const concepts=new Map(ontology.mechanismFamilies.map(m=>[m.id,m]));
 const linked=new Map(rules.map(x=>[x.ruleId,{ruleId:x.ruleId,chains:[],sharedNodes:[],mechanismFamilies:[]}]));
 const links=new Map();
 function linkFor(a,b){
  const key=pair(a,b);
  if(!links.has(key))links.set(key,{left:[a,b].sort()[0],right:[a,b].sort()[1],
   explicitChainIds:[],sharedGenericNodeIds:[],boundaryIds:[],linkStatus:"PUBLIC_AUTHORSHIP_NOT_FIELD_VALIDATED",
   mechanicalEquivalenceDemonstrated:false,rootCauseConfirmed:false,OEMSerialVerified:false,SAPApproved:false,
   nextHumanReview:"Checar função, arquitetura OEM, mecanismo concorrente e evidência discriminante por ativo efetivo"});
  return links.get(key);
 }
 for(const c of chains.records){
  for(const id of c.preventionRuleIds){
   if(!allowed.has(id))continue;
   const row=linked.get(id);
   row.chains.push({id:c.id,title:c.title,function:c.operatingFunction,mode:c.failureMode,
    family:c.family,sourceIds:c.sourceClaims.map(x=>x.sourceId),
    mechanismIds:[...c.mechanismIds],status:"INFERRED_GENERAL_LITERATURE_NOT_CASE_CONFIRMED"});
   for(const mid of c.mechanismIds){
    const ref=concepts.get(mid);if(!ref)throw Error("missing_ontology_mechanism_"+mid);
    if(!row.mechanismFamilies.some(x=>x.id===mid))row.mechanismFamilies.push({
     id:mid,label:ref.pt,criteria:ref.criteria,status:"CONCEPTUAL_FAMILY_NOT_OBSERVED"});
   }
  }
  const valid=[...new Set(c.preventionRuleIds)].filter(id=>allowed.has(id));
  for(let i=0;i<valid.length;i++)for(let j=i+1;j<valid.length;j++){
   linkFor(valid[i],valid[j]).explicitChainIds.push(c.id);
  }
 }
 for(const s of semantic.sharedNodes){
  const valid=[...new Set(s.ruleIds)].filter(id=>allowed.has(id));
  for(const id of valid)linked.get(id).sharedNodes.push({id:s.id,kind:s.kind,
   sharingMeaning:s.sharingMeaning,requiredDiscrimination:s.requiredDiscrimination,
   status:"GENERIC_SEMANTIC_OVERLAP_NOT_COMPONENT_OR_DAMAGE_CONFIRMATION"});
  for(let i=0;i<valid.length;i++)for(let j=i+1;j<valid.length;j++)
   linkFor(valid[i],valid[j]).sharedGenericNodeIds.push(s.id);
 }
 for(const guard of semantic.domainSeparation){
  const item=links.get(pair(guard.left,guard.right));
  if(item)item.boundaryIds.push(
   guard.forbidCrossComponentRefs?"DO_NOT_EQUATE_DIFFERENT_COMPONENTS":
   guard.noSharedPhysicalDamages?"NO_SHARED_PHYSICAL_DAMAGE_INFERENCE":
   guard.genericOnly?"GENERIC_OVERLAP_ONLY":"DOMAIN_SEPARATION_REQUIRED");
 }
 for(const v of linked.values()){
  v.chains.sort((a,b)=>a.id.localeCompare(b.id));
  v.sharedNodes.sort((a,b)=>a.id.localeCompare(b.id));
  v.mechanismFamilies.sort((a,b)=>a.id.localeCompare(b.id));
  v.fieldConfirmationCount=0;v.validatedCausalRelations=0;
 }
 const graphLinks=[...links.values()].sort((a,b)=>a.left.localeCompare(b.left)||a.right.localeCompare(b.right));
 return {schema:"fmea-mining.pm-functional-navigation.v1",version:"1.3.86",
  nature:"PUBLIC_AUTHORED_RELATIONS_AND_GENERIC_SHARED_CONTEXT_NOT_FIELD_EVIDENCE",
  provenance:{explorer:catalog.version,chains:chains.version,ontology:ontology.version,semantic:semantic.version},
  summary:{rules:rules.length,authoredGenericChains:chains.records.length,
   sourceSharedNodes:semantic.sharedNodes.length,provenanceLinks:graphLinks.length,
   explicitChainPairs:graphLinks.filter(x=>x.explicitChainIds.length>0).length,
   genericNodePairs:graphLinks.filter(x=>x.sharedGenericNodeIds.length>0).length,
   domainGuardedLinks:graphLinks.filter(x=>x.boundaryIds.length>0).length,
   verifiedCases:0,fieldVerifiedMechanisms:0,confirmedCauses:0,approvedSAPRemaps:0,
   corporateGatesBlocked:8,SAPExceptionsBlocked:10,decision:"NO_GO"},
  guardrails:{noCausalConfidenceScore:true,noComponentEquivalenceFromOverlap:true,
   noFieldObservations:true,noOEMSeriesAssumptions:true,noAutomatedSAP:true,
   noRiskRanking:true,noAutoWorkOrders:true,noOperationalRelease:true},
  rules:[...linked.values()].sort((a,b)=>a.ruleId.localeCompare(b.ruleId)),
  links:graphLinks};
}
export function relatedFunctionalLinks(graph,ruleId){
 if(!graph||!Array.isArray(graph.links)||!graph.rules.some(x=>x.ruleId===ruleId))return [];
 return graph.links.filter(x=>x.left===ruleId||x.right===ruleId).map(x=>({
  otherRuleId:x.left===ruleId?x.right:x.left,
  explicitChainIds:[...x.explicitChainIds],sharedGenericNodeIds:[...x.sharedGenericNodeIds],
  boundaryIds:[...x.boundaryIds],relationType:x.explicitChainIds.length?
   "CROSS_REFERENCED_IN_AUTHORED_GENERIC_CHAIN":"GENERIC_SEMANTIC_OVERLAP_ONLY",
  meaning:"PROPOSED_CATALOG_RELATION_NOT_CAUSAL_CONFIRMED"}));
}
export function assessFunctionalNavigation(input,graph){
 const {catalog,chains,ontology,semantic}=input;
 const errors=[],ck=(x,id)=>{if(!x)errors.push(id)};
 let expected;try{expected=buildFunctionalNavigation(input)}
 catch(e){return {status:"REJECTED",errors:["build_"+e.message]}};
 ck(eq(graph,expected),"derived_graph_drift");
 ck(catalog.version==="1.3.86"&&catalog.records.length===25&&catalog.summary.blockedSapExceptions===10&&
  catalog.summary.blockedCorporateGates===8&&catalog.summary.verifiedFieldCases===0&&
  catalog.summary.confirmedRootCauses===0&&catalog.summary.approvedSapLinks===0&&catalog.summary.decision==="NO_GO",
  "explorer_unapproved_catalog");
 ck(chains.version==="1.3.3"&&chains.records.length===24&&unique(flatIds(chains.records))&&
  chains.records.every(x=>x.review?.status==="inferido_com_literatura_geral"&&
   x.review.reviewer===null&&x.empiricalOccurrences===0&&x.confirmedRootCause===false&&
   Object.values(x.sapMapping).every(z=>z===null)&&x.preventionRuleIds.length>0&&
   unique(x.preventionRuleIds)&&x.sourceClaims.length>0&&x.sourceClaims.every(z=>z.scope==="principio_geral")),
  "authored_chains_unvalidated");
 ck(ontology.version==="1.3.3"&&ontology.mechanismFamilies.length===15&&
  unique(flatIds(ontology.mechanismFamilies))&&
  eq(ontology.mechanismFamilies.map(x=>[x.id,x.pt]),[
   ["ME-01","Desgaste abrasivo"],["ME-02","Desgaste adesivo"],
   ["ME-03","Fadiga de contato"],["ME-04","Fadiga estrutural"],
   ["ME-05","Corrosão"],["ME-06","Degradação térmica"],
   ["ME-07","Degradação de elastômero"],["ME-08","Erosão/cavitação"],
   ["ME-09","Afrouxamento/perda de pré-carga"],["ME-10","Ruptura de isolamento elétrico"],
   ["ME-11","Resistência de contato anormal"],["ME-12","Restrição de escoamento"],
   ["ME-13","Lubrificação inadequada"],["ME-14","Desajuste/calibração inadequada"],
   ["ME-15","Falha de vedação"]]),"ontology_is_conceptual");
 ck(semantic.version==="1.3.59"&&semantic.sharedNodes.length===11&&
  unique(flatIds(semantic.sharedNodes))&&semantic.domainSeparation.length===4&&
  semantic.sharedNodes.every(n=>n.ruleIds.length>=2&&unique(n.ruleIds)&&
   n.sharingMeaning.length>40&&n.requiredDiscrimination.length>30)&&
  Object.values(semantic.policy).every(x=>x===true),"semantic_shared_nodes_do_not_confirm_damage");
 const expectedPairs=[
  "cooling-fan-bearing::cooling-fan-belt",
  "final-drive-bearing::final-drive-gear",
  "fuel-filter-contamination::fuel-tank-water",
  "hydraulic-hose-abrasion::hydraulic-hose-leak",
  "hydraulic-hose-leak::hydraulic-pump-seal",
  "track-idler-wear::track-roller-wear"
 ];
 ck(graph.version==="1.3.86"&&graph.schema==="fmea-mining.pm-functional-navigation.v1"&&
  eq(graph.links.map(x=>pair(x.left,x.right)),expectedPairs)&&graph.rules.length===25&&
  graph.links.every(x=>x.linkStatus==="PUBLIC_AUTHORSHIP_NOT_FIELD_VALIDATED"&&
   x.mechanicalEquivalenceDemonstrated===false&&x.rootCauseConfirmed===false&&
   x.OEMSerialVerified===false&&x.SAPApproved===false)&&
  graph.rules.every(x=>x.fieldConfirmationCount===0&&x.validatedCausalRelations===0)&&
  Object.values(graph.guardrails).every(x=>x===true),"links_are_not_diagnoses");
 const s=graph.summary;
 ck(s.rules===25&&s.authoredGenericChains===24&&s.sourceSharedNodes===11&&
  s.provenanceLinks===6&&s.explicitChainPairs===4&&s.genericNodePairs===3&&
  s.domainGuardedLinks===4&&s.verifiedCases===0&&s.fieldVerifiedMechanisms===0&&
  s.confirmedCauses===0&&s.approvedSAPRemaps===0&&s.corporateGatesBlocked===8&&
  s.SAPExceptionsBlocked===10&&s.decision==="NO_GO","summary_not_claiming_empirical_support");
 ck(graph.links.some(x=>pair(x.left,x.right)==="track-idler-wear::track-roller-wear"&&
  x.boundaryIds.includes("DO_NOT_EQUATE_DIFFERENT_COMPONENTS"))&&
  graph.links.some(x=>pair(x.left,x.right)==="final-drive-bearing::final-drive-gear"&&
  x.boundaryIds.includes("NO_SHARED_PHYSICAL_DAMAGE_INFERENCE"))&&
  graph.links.some(x=>pair(x.left,x.right)==="fuel-filter-contamination::fuel-tank-water"&&
  x.explicitChainIds.length===0&&x.sharedGenericNodeIds.length>0),"critical_domain_separation");
 return {status:errors.length?"REJECTED":"NO_GO_PUBLIC_REFERENCE_GRAPH",errors};
}
