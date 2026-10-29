/** Pauta documental, sem classificação de risco, aprovação OEM, SAP ou autorização de campo. */
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const sort=(a,b)=>a.localeCompare(b,"pt-BR");
export const STAGES=[
 {id:"S1",title:"Configuração OEM",question:"Que configuração, série/arranjo e método técnico efetivo exigem verificação autorizada?"},
 {id:"S2",title:"Função e mecanismos",question:"Que função, cadeia conceitual e mecanismos concorrentes precisam de revisão técnica?"},
 {id:"S3",title:"Contraprovas e segurança",question:"Que evidência favorável, contrária e inconclusiva precisa ser especificada antes de qualquer intervenção?"},
 {id:"S4",title:"Enquadramento SAP",question:"Que subgrupo, componente, objeto e par dano–causa precisam de curadoria autorizada?"},
 {id:"S5",title:"Revisão independente",question:"Qual parecer técnico e aprovação formal faltam registrar no fluxo corporativo próprio?"}
];
export function buildDisciplineAgenda({catalog,graph,inventory}){
 const rules=new Map(catalog.records.map(x=>[x.ruleId,x]));
 const graphRules=new Map(graph.rules.map(x=>[x.ruleId,x]));
 const items=inventory.records.map(g=>{
  const r=rules.get(g.ruleId),node=graphRules.get(g.ruleId);
  if(!r||!node)throw Error("source_record_missing_"+g.ruleId);
  return {ruleId:g.ruleId,discipline:g.reviewDiscipline,system:g.system,
   component:g.component,reviewTrack:g.reviewTrack,documentaryPriority:g.documentaryPriority,
   sourceIds:[...g.sourceIds],chainIds:node.chains.map(x=>x.id),
   chainGap:node.chains.length===0,
   gapCategories:[...g.categories],
   sapStatus:g.sapStatus,sapBlocker:g.sapBlocker,
   nextDecisionFromSource:g.nextDecision,
   proposedMinimumEvidence:r.sapException?[...r.sapException.minimumEvidence]:[],
   competingHypotheses:r.reviewTrack==="UNRANKED_DETECTABILITY"?
    r.alternatives.map(x=>({candidate:x.candidate,proposedDiscriminator:x.requestedEvidence})):[],
   stages:STAGES.map(x=>({id:x.id,title:x.title,question:x.question,status:"NOT_STARTED_DOCUMENTARY_ONLY"})),
   evidenceReceived:false,assignedTo:null,meetingDate:null,rootCauseConfirmed:false,
   reviewedIndependently:false,approvedSAP:false,authorizedToExecute:false};
 }).sort((a,b)=>sort(a.ruleId,b.ruleId));
 const disciplines=[...new Set(items.map(x=>x.discipline))].sort(sort).map(discipline=>{
  const rows=items.filter(x=>x.discipline===discipline);
  return {discipline,ruleIds:rows.map(x=>x.ruleId),total:rows.length,
   exceptionCount:rows.filter(x=>x.sapStatus==="EXCEPTION_BLOCKED").length,
   noRecordedExceptionCount:rows.filter(x=>x.sapStatus!=="EXCEPTION_BLOCKED").length,
   noAuthoredChainCount:rows.filter(x=>x.chainGap).length,
   proposedAgendaStages:STAGES.map(x=>x.id),
   realMeetingHeld:false,formalApprovals:0};
 });
 return {schema:"fmea-mining.pm-discipline-review-agenda.v1",version:"1.3.87",
  nature:"PUBLIC_DOCUMENTARY_MEETING_PREPARATION_NOT_RISK_PRIORITY",
  sourceVersions:{catalog:catalog.version,graph:graph.version,inventory:inventory.version},
  stages:STAGES,disciplines,items,
  summary:{records:items.length,disciplines:disciplines.length,
   blockedSAPExceptions:items.filter(x=>x.sapStatus==="EXCEPTION_BLOCKED").length,
   withoutApprovedSAPNoException:items.filter(x=>x.sapStatus!=="EXCEPTION_BLOCKED").length,
   missingGenericChain:items.filter(x=>x.chainGap).length,
   recordedFieldEvidence:0,confirmedCauses:0,approvedRemaps:0,authorizedInterventions:0,
   corporateGatesBlocked:8,decision:"NO_GO"},
  safety:{noRiskScore:true,noUrgencyRanking:true,noAutomaticTaskAssignment:true,
   noActualMeetingClaims:true,noFieldTestingAuthorization:true,noOEMSerialEffectivity:true,
   noSAPWrites:true,noApprovedCauses:true,noWorkOrders:true}};
}
export function filterDisciplineAgenda(data,{discipline="all",system="all",stage="all",query=""}={}){
 if(!data||!Array.isArray(data.items))return [];
 const norm=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR");
 const q=norm(query).trim();
 return data.items.filter(x=>(discipline==="all"||x.discipline===discipline)&&
  (system==="all"||x.system===system)&&
  (stage==="all"||x.stages.some(s=>s.id===stage))&&
  (!q||norm([x.ruleId,x.component,x.system,x.discipline,x.sapBlocker,...x.sourceIds].join(" ")).includes(q)));
}
export function agendaMarkdown(data,items,filters){
 if(!data||!Array.isArray(items)||!Array.isArray(data.items)||
    items.some(x=>!data.items.some(s=>eq(s,x))))return null;
 const f=filters||{};
 const lines=["# Pauta de revisão documental FMEA — Engenharia e PCM","",
  "**Versão:** 1.3.87 · **NÃO HOMOLOGADO · NO_GO · SEM REUNIÃO OU INSPEÇÃO REAL**",
  "**Origem:** catálogo e matriz pública de maturidade; etapa de preparação, não de execução.",
  "> P0/P1 representam prioridade documental da fila de curadoria, não gravidade ou criticidade operacional.",
  "> Ausência de cadeia catalogada não comprova inexistência de falha.","",
  "## Recorte selecionado","",
  "- Disciplina proposta: "+(f.discipline||"all"),
  "- Sistema: "+(f.system||"all"),
  "- Etapa: "+(f.stage||"all"),
  "- Pesquisa: "+(f.query||""),
  "- Registros: "+items.length,""];
 for(const x of items){
  lines.push("## "+x.ruleId,"",
   "- Disciplina proposta (não é atribuição de pessoal): "+x.discipline,
   "- Sistema e componente candidato: "+x.system+" · "+x.component,
   "- Prioridade de fila DOCUMENTAL: "+(x.documentaryPriority??"não atribuída"),
   "- Cadastro SAP: "+x.sapStatus+(x.sapBlocker?" · "+x.sapBlocker:""),
   "- Cadeias genéricas não confirmadas: "+(x.chainIds.join(", ")||"não catalogadas"),
   "- IDs de fonte: "+x.sourceIds.join(", "),"",
   "### Questões para pauta — nenhuma etapa iniciada","");
  for(const s of x.stages.filter(s=>f.stage==="all"||!f.stage||s.id===f.stage))
   lines.push("- [ ] "+s.id+" — "+s.title+": "+s.question+" **Não iniciada**.");
  if(x.proposedMinimumEvidence.length){
   lines.push("","### Evidências MÍNIMAS propostas, NÃO recebidas","");
   x.proposedMinimumEvidence.forEach(e=>lines.push("- [ ] "+e));
  }
  if(x.competingHypotheses.length){
   lines.push("","### Hipóteses concorrentes não confirmadas","");
   x.competingHypotheses.forEach(y=>lines.push("- "+y.candidate+" — discriminação proposta: "+y.proposedDiscriminator));
  }
  lines.push("","**Parecer:** não registrado. **Aprovação SAP:** não registrada. **Execução:** não autorizada.","");
 }
 lines.push("## Fronteira e encaminhamento","",
  "- As quatro disciplinas são propostas documentais, não agendas ou responsabilidades já aceitas.",
  "- Dez exceções SAP e oito gates corporativos permanecem BLOCK / NO_GO.",
  "- Não gerar OS, mudar SAP, inspecionar equipamento ou declarar causa com este documento.","");
 return lines.join("\n");
}
export function assessDisciplineAgenda(inputs,actual){
 const errors=[],check=(v,key)=>{if(!v)errors.push(key)};
 let expected;try{expected=buildDisciplineAgenda(inputs)}catch(e){return {status:"REJECTED",errors:["source_"+e.message]}};
 check(eq(actual,expected),"derived_agenda_drift");
 check(inputs.catalog.version==="1.3.86"&&inputs.inventory.version==="1.3.86"&&
  inputs.graph.version==="1.3.86"&&inputs.catalog.summary.decision==="NO_GO"&&
  inputs.catalog.summary.confirmedRootCauses===0&&inputs.inventory.summary.decision==="NO_GO"&&
  inputs.graph.summary.decision==="NO_GO","unapproved_input_source");
 check(actual.version==="1.3.87"&&actual.summary.records===25&&
  actual.summary.disciplines===4&&actual.summary.blockedSAPExceptions===10&&
  actual.summary.withoutApprovedSAPNoException===15&&
  actual.summary.missingGenericChain===14&&
  actual.summary.corporateGatesBlocked===8&&actual.summary.decision==="NO_GO"&&
  Object.values(actual.safety).every(Boolean),"inventory_no_go");
 check(eq(actual.disciplines.map(x=>x.total).sort((a,b)=>a-b),[2,3,5,15]),"correct_discipline_distribution");
 check(actual.items.every(x=>x.stages.length===5&&x.stages.every(s=>s.status==="NOT_STARTED_DOCUMENTARY_ONLY")&&
  !x.evidenceReceived&&!x.assignedTo&&!x.meetingDate&&!x.rootCauseConfirmed&&
  !x.reviewedIndependently&&!x.approvedSAP&&!x.authorizedToExecute),"no_fabricated_work");
 return {status:errors.length?"REJECTED":"NO_GO_DOCUMENTARY_REVIEW_AGENDA",errors};
}
