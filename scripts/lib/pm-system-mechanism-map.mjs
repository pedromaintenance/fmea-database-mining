/** Read-only, source-grounded subsystem map. Graph edges describe catalog indexing, never actual causal proof. */
const same=(x,y)=>JSON.stringify(x)===JSON.stringify(y);
const sorted=(a,b)=>a.localeCompare(b);
export function buildSystemMechanismMap(catalog,graph,system){
 if(!catalog||!graph||!Array.isArray(catalog.records)||!Array.isArray(graph.rules))return null;
 const systems=[...new Set(catalog.records.map(x=>x.system))].sort(sorted);
 if(!systems.includes(system))return null;
 const records=catalog.records.filter(x=>x.system===system).sort((a,b)=>sorted(a.ruleId,b.ruleId));
 const conceptual=new Map(graph.rules.map(x=>[x.ruleId,x]));
 const nodes=[{id:"system:"+system,kind:"system",label:system.replaceAll("_"," "),
  description:"Agrupamento público de sistema; não indica falha confirmada."}];
 const edges=[];
 const add=(from,to,kind,source)=>edges.push({from,to,kind,source,
  sourceRelationDocumented:true,physicalCausalityVerified:false,
  realMeasurementReceived:false,approvedOperationalUse:false});
 const chains=new Map(),mechanisms=new Map();
 for(const r of records){
  const rId="rule:"+r.ruleId,linked=conceptual.get(r.ruleId);
  if(!linked)throw Error("missing_provenance_row_"+r.ruleId);
  nodes.push({id:rId,kind:"rule",label:r.ruleId,component:r.component,system:r.system,
   reviewTrack:r.reviewTrack,documentaryPriority:r.documentaryPriority,
   description:r.symptom,status:"UNCONFIRMED_PUBLIC_RULE"});
  add("system:"+system,rId,"SYSTEM_CONTAINS_RULE","seed:system");
  for(const c of linked.chains){
   const cId="chain:"+c.id;
   if(!chains.has(c.id))chains.set(c.id,{id:cId,kind:"chain",label:c.id,
    description:c.title,function:c.function,mode:c.mode,
    sourceIds:[...c.sourceIds],status:"INFERRED_GENERAL_LITERATURE"});
   add(rId,cId,"RULE_REFERENCED_BY_AUTHORED_CHAIN",c.id);
   for(const mId of c.mechanismIds){
    const m=linked.mechanismFamilies.find(x=>x.id===mId);
    if(!m)throw Error("missing_mechanism_"+mId);
    if(!mechanisms.has(mId))mechanisms.set(mId,{id:"mechanism:"+mId,kind:"mechanism",label:mId,
     description:m.label,criteria:m.criteria,status:"CONCEPTUAL_ONTOLOGY_NOT_VERIFIED"});
    const dest="mechanism:"+mId;
    if(!edges.some(x=>x.from===cId&&x.to===dest))add(cId,dest,"CHAIN_TAGGED_ONTOLOGY_MECHANISM",mId);
   }
  }
 }
 nodes.push(...[...chains.values()].sort((a,b)=>sorted(a.label,b.label)),
  ...[...mechanisms.values()].sort((a,b)=>sorted(a.label,b.label)));
 edges.sort((a,b)=>sorted(a.from,b.from)||sorted(a.to,b.to)||sorted(a.kind,b.kind));
 const recordIds=new Set(records.map(x=>x.ruleId));
 const related=graph.links.filter(x=>recordIds.has(x.left)||recordIds.has(x.right))
  .map(x=>({left:x.left,right:x.right,explicitChainIds:[...x.explicitChainIds],
    sharedGenericNodeIds:[...x.sharedGenericNodeIds],boundaryIds:[...x.boundaryIds],
    withinSelectedSystem:recordIds.has(x.left)&&recordIds.has(x.right),
    relationStatus:"DOCUMENTARY_REFERENCE_NO_CAUSAL_CONFIRMATION"}))
  .sort((a,b)=>sorted(a.left,b.left)||sorted(a.right,b.right));
 return {schema:"fmea-mining.pm-system-map.v1",version:"1.3.86",system,
  status:"NO_GO_READ_ONLY_PUBLIC_DOCUMENTARY_MAP",
  counts:{systemsInCatalog:systems.length,rules:records.length,chains:chains.size,
   mechanisms:mechanisms.size,relatedPairs:related.length,
   rulesWithoutAuthoredChains:records.filter(x=>conceptual.get(x.ruleId).chains.length===0).length,
   fieldObservations:0,confirmedFailures:0,approvedSAPLinks:0,operationalReleases:0},
  nodes,edges,related,
  scope:"SINGLE_SYSTEM_SUBGRAPH_NO_UNSOURCED_EDGES",
  guardrails:{noRealAssets:true,noApprovedCauses:true,noRiskScoring:true,
   noAutoSAP:true,noOEMSerialClaims:true,noProcedureAuthorization:true,
   noOperationalRelease:true,emptyChainMeansNotDocumentedNotFailureFree:true}};
}
export function assessSystemMechanismMaps({catalog,graph},maps){
 const errors=[],check=(ok,code)=>{if(!ok)errors.push(code)};
 const systems=[...new Set(catalog.records.map(x=>x.system))].sort(sorted);
 check(catalog.version==="1.3.86"&&graph.version==="1.3.86"&&catalog.records.length===25&&
  graph.rules.length===25&&graph.links.length===6&&systems.length===13&&
  catalog.summary.decision==="NO_GO"&&catalog.summary.confirmedRootCauses===0&&
  catalog.summary.approvedSapLinks===0&&catalog.summary.operationalReleases===0&&
  graph.summary.decision==="NO_GO"&&graph.summary.confirmedCauses===0&&
  graph.summary.approvedSAPRemaps===0&&graph.summary.fieldVerifiedMechanisms===0&&
  graph.links.every(x=>x.linkStatus==="PUBLIC_AUTHORSHIP_NOT_FIELD_VALIDATED"&&
   x.rootCauseConfirmed===false&&x.OEMSerialVerified===false&&
   x.SAPApproved===false&&x.mechanicalEquivalenceDemonstrated===false),"upstream_scope");
 check(Array.isArray(maps)&&maps.length===13,"all_13_system_maps");
 for(const system of systems){
  const p=maps.find(x=>x.system===system),expected=buildSystemMechanismMap(catalog,graph,system);
  check(!!p&&same(p,expected),"map_drift_"+system);
  if(!p)continue;
  const recordIds=new Set(catalog.records.filter(x=>x.system===system).map(x=>x.ruleId));
  const nodeIds=new Set(p.nodes.map(x=>x.id));
  check(p.nodes.length===nodeIds.size&&p.nodes.filter(x=>x.kind==="system").length===1&&
   p.nodes.filter(x=>x.kind==="rule").length===recordIds.size&&
   p.nodes.filter(x=>x.kind==="chain").length===p.counts.chains&&
   p.nodes.filter(x=>x.kind==="mechanism").length===p.counts.mechanisms,"node_integrity_"+system);
  check(p.edges.every(e=>nodeIds.has(e.from)&&nodeIds.has(e.to)&&
   ["SYSTEM_CONTAINS_RULE","RULE_REFERENCED_BY_AUTHORED_CHAIN","CHAIN_TAGGED_ONTOLOGY_MECHANISM"].includes(e.kind)&&
   e.sourceRelationDocumented===true&&e.physicalCausalityVerified===false&&
   e.realMeasurementReceived===false&&e.approvedOperationalUse===false),"no_unsourced_or_approved_edges_"+system);
  check(p.nodes.filter(x=>x.kind==="rule").every(x=>recordIds.has(x.label)&&
   x.status==="UNCONFIRMED_PUBLIC_RULE")&&
   p.nodes.filter(x=>x.kind==="chain").every(x=>x.status==="INFERRED_GENERAL_LITERATURE")&&
   p.nodes.filter(x=>x.kind==="mechanism").every(x=>x.status==="CONCEPTUAL_ONTOLOGY_NOT_VERIFIED"),
   "no_claim_of_empirical_validity_"+system);
  check(Object.values(p.guardrails).every(x=>x===true)&&
   p.counts.fieldObservations===0&&p.counts.confirmedFailures===0&&
   p.counts.approvedSAPLinks===0&&p.counts.operationalReleases===0&&
   p.status==="NO_GO_READ_ONLY_PUBLIC_DOCUMENTARY_MAP","NO_GO_"+system);
 }
 check(maps.reduce((n,p)=>n+p.counts.rules,0)===25&&
  maps.reduce((n,p)=>n+p.counts.chains,0)===24&&
  maps.reduce((n,p)=>n+p.counts.rulesWithoutAuthoredChains,0)===14,
  "no_invented_chain_coverage");
 check(buildSystemMechanismMap(catalog,graph,"unknown")===null,"reject_unknown_system");
 return {status:errors.length?"REJECTED":"NO_GO_ALL_SYSTEM_MAPS_VALIDATED",errors};
}
