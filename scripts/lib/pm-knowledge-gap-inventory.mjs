/** A knowledge-gap inventory, not an operational risk assessment, FMEA approval or SAP instruction. */
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const distinct=a=>new Set(a).size===a.length;
const order=(a,b)=>a.localeCompare(b);
export const GAP_CATEGORIES=[
 {id:"OEM_SERIES",label:"Aplicabilidade OEM por série",action:"Verificar arranjo, lista de materiais, método OEM e efetividade para o ativo identificado em ambiente autorizado."},
 {id:"FIELD_DISCRIMINATION",label:"Contraprova e evidência de campo",action:"Definir evidências favoráveis, contrárias e inconclusivas; inspeções apenas por procedimento e autorização."},
 {id:"GENERIC_CHAIN_MISSING",label:"Cadeia genérica ainda não catalogada",action:"Pesquisar função, mecanismo físico e hipóteses concorrentes, submetendo uma proposta à revisão técnica."},
 {id:"SAP_DOCUMENTARY",label:"Enquadramento/documentação SAP",action:"Separar dez exceções formalmente bloqueadas das quinze regras sem mapeamento aprovado nem exceção registrada."},
 {id:"ENGINEERING_REVIEW",label:"Revisão técnica independente",action:"Confrontar hipótese, limites, dados OEM e evidências antes de qualquer decisão corporativa."}
];
export function buildKnowledgeGapInventory({catalog,graph,maturity}){
 const rules=new Map(catalog.records.map(x=>[x.ruleId,x]));
 const nodes=new Map(graph.rules.map(x=>[x.ruleId,x]));
 const records=maturity.rules.map(m=>{
  const r=rules.get(m.ruleId),g=nodes.get(m.ruleId);
  if(!r||!g)throw Error("unmatched_maturity_rule_"+m.ruleId);
  const categories=["OEM_SERIES","FIELD_DISCRIMINATION",
   ...(g.chains.length?[]:["GENERIC_CHAIN_MISSING"]),"SAP_DOCUMENTARY","ENGINEERING_REVIEW"];
  return {ruleId:r.ruleId,system:r.system,component:r.component,reviewTrack:r.reviewTrack,
   documentaryPriority:r.documentaryPriority,
   genericAuthoredChains:g.chains.length,
   documentedGenericReferences:m.referenceCount,
   categories,
   sapStatus:m.sap.isBlocked?"EXCEPTION_BLOCKED":"NO_APPROVED_MAPPING_NO_RECORDED_EXCEPTION",
   sapBlocker:m.sap.isBlocked?m.sap.blocker:null,
   reviewDiscipline:m.sap.reviewDiscipline,
   nextDecision:m.nextDecision};
 }).sort((a,b)=>order(a.ruleId,b.ruleId));
 const systems=[...new Set(records.map(x=>x.system))].sort(order).map(system=>{
  const subset=records.filter(x=>x.system===system);
  return {system,ruleCount:subset.length,
   noAuthoredChain:subset.filter(x=>x.genericAuthoredChains===0).length,
   withGenericChain:subset.filter(x=>x.genericAuthoredChains>0).length,
   formalSAPExceptions:subset.filter(x=>x.sapStatus==="EXCEPTION_BLOCKED").length,
   noRecordedSAPException:subset.filter(x=>x.sapStatus==="NO_APPROVED_MAPPING_NO_RECORDED_EXCEPTION").length,
   noOEMSerialValidation:subset.length,noFieldDiscrimination:subset.length,
   noIndependentReview:subset.length};
 });
 return {schema:"fmea-mining.pm-knowledge-gap-inventory.v1",version:"1.3.85",
  nature:"SOURCE_DERIVED_DOCUMENTARY_GAPS_NOT_MAINTENANCE_RISK",
  provenance:{catalog:catalog.version,functionalGraph:graph.version,maturity:maturity.version},
  categories:GAP_CATEGORIES,systems,records,
  summary:{systems:systems.length,rules:records.length,
   genericChainCovered:records.filter(x=>x.genericAuthoredChains>0).length,
   withoutGenericChain:records.filter(x=>x.genericAuthoredChains===0).length,
   withoutOEMSeriesValidation:records.length,withoutFieldDiscrimination:records.length,
   withoutIndependentEngineeringReview:records.length,
   formalSAPExceptions:records.filter(x=>x.sapStatus==="EXCEPTION_BLOCKED").length,
   noApprovedMappingWithoutRecordedException:records.filter(x=>x.sapStatus!=="EXCEPTION_BLOCKED").length,
   documentaryP0:records.filter(x=>x.documentaryPriority==="P0").length,
   documentaryP1:records.filter(x=>x.documentaryPriority==="P1").length,
   unrankedDocumentation:records.filter(x=>x.documentaryPriority===null).length,
   confirmedRootCauses:0,approvedSAPMappings:0,fieldCases:0,operationalReleases:0,
   corporateGatesBlocked:8,decision:"NO_GO"},
  safety:{notOperationalRiskScore:true,notASeverityOrder:true,
   notWorkAuthorization:true,noNewOEMEffectivityClaim:true,
   noRealFieldCase:true,noRootCausePromotion:true,noSAPWrites:true,
   noAutomaticDecision:true}};
}
export function queryKnowledgeGaps(data,{system="all",category="all",track="all",query=""}={}){
 if(!data||!Array.isArray(data.records))return [];
 const norm=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR");
 const term=norm(query).trim();
 return data.records.filter(x=>
  (system==="all"||system===x.system)&&
  (category==="all"||x.categories.includes(category))&&
  (track==="all"||track===x.reviewTrack)&&
  (!term||norm([x.ruleId,x.system,x.component,x.sapBlocker,x.reviewDiscipline,x.nextDecision,
    ...x.sourceIds].join(" ")).includes(term)));
}
export function assessKnowledgeGapInventory({catalog,graph,maturity},inventory){
 const errors=[],check=(flag,id)=>{if(!flag)errors.push(id)};
 let expected;
 try{expected=buildKnowledgeGapInventory({catalog,graph,maturity})}
 catch(e){return {status:"REJECTED",errors:["build_error_"+e.message]}};
 check(eq(inventory,expected),"derived_output_drift");
 check(catalog.version==="1.3.85"&&catalog.records.length===25&&catalog.summary.decision==="NO_GO"&&
  catalog.summary.confirmedRootCauses===0&&catalog.summary.approvedSapLinks===0&&
  catalog.summary.blockedSapExceptions===10&&catalog.summary.blockedCorporateGates===8,
  "upstream_catalog_not_bounded");
 check(graph.version==="1.3.85"&&graph.rules.length===25&&graph.summary.decision==="NO_GO"&&
  graph.summary.confirmedCauses===0&&graph.summary.approvedSAPRemaps===0&&
  graph.rules.every(x=>x.fieldConfirmationCount===0&&x.validatedCausalRelations===0),
  "upstream_graph_not_bounded");
 check(maturity.version==="1.3.60"&&maturity.rules.length===25&&
  distinct(maturity.rules.map(x=>x.ruleId))&&
  maturity.summary.serialOemVerified===0&&maturity.summary.fieldConfirmed===0&&
  maturity.summary.engineeringApprovalsRecorded===0&&maturity.summary.sapMappingsApproved===0&&
  maturity.summary.sapExceptionsBlocked===10&&
  maturity.summary.documentedP0===5&&maturity.summary.documentedP1===5,
  "maturity_source_changed");
 check(maturity.rules.every(x=>x.gates.semanticModel==="modeled_unvalidated"&&
  x.gates.sourceTraceability==="catalogued_not_serial_effective"&&
  x.gates.serialBOM==="pending"&&x.gates.fieldDiscrimination==="not_recorded"&&
  x.gates.damageCause==="not_confirmed"&&x.gates.independentReview==="not_recorded"&&
  x.fieldObservations===0&&x.confirmedDamages===0&&x.performedActions===0&&
  x.approvedSapMappings===0&&x.sap.autoRemapAllowed===false&&
  x.sap.reviewedByEngineering===false&&x.sap.approvedLocationId===null&&
  x.sap.approvedComponentCode===null&&
  (x.sap.isBlocked?
   x.gates.sapMapping==="blocked_pending_curatorship"&&
    x.sap.exceptionStatus==="bloqueado_aguardando_curadoria"&&
    ["P0","P1"].includes(x.sap.priorityFromRepo):
   x.gates.sapMapping==="not_approved_no_recorded_exception"&&
    x.sap.priorityFromRepo===null)),"no_inferred_approvals");
 const s=inventory.summary;
 check(inventory.version==="1.3.85"&&inventory.records.length===25&&
  inventory.systems.length===13&&inventory.categories.length===5&&
  distinct(inventory.records.map(x=>x.ruleId))&&
  s.genericChainCovered===11&&s.withoutGenericChain===14&&
  s.withoutOEMSeriesValidation===25&&s.withoutFieldDiscrimination===25&&
  s.withoutIndependentEngineeringReview===25&&s.formalSAPExceptions===10&&
  s.noApprovedMappingWithoutRecordedException===15&&
  s.documentaryP0===5&&s.documentaryP1===5&&s.unrankedDocumentation===15&&
  s.confirmedRootCauses===0&&s.approvedSAPMappings===0&&
  s.fieldCases===0&&s.corporateGatesBlocked===8&&s.decision==="NO_GO"&&
  Object.values(inventory.safety).every(Boolean),"inventory_not_risk");
 return {status:errors.length?"REJECTED":"NO_GO_DOCUMENTARY_INVENTORY",errors};
}
