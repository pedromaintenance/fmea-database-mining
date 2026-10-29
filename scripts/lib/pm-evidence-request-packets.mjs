/** Review-only evidence request drafts from the published discipline agenda. No request is sent, fulfilled or approved. */
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const norm=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR");
export function buildEvidenceRequests(agenda){
 const packets=agenda.items.flatMap(item=>agenda.stages.map(stage=>{
  const requests=stage.id==="S1"?[...item.sourceIds]:
   stage.id==="S2"?[...item.chainIds]:
   stage.id==="S3"?item.competingHypotheses.map(x=>x.proposedDiscriminator):
   stage.id==="S4"?[...item.proposedMinimumEvidence]:[];
  return {packetId:item.ruleId+"::"+stage.id,ruleId:item.ruleId,
   discipline:item.discipline,system:item.system,component:item.component,
   stageId:stage.id,stageTitle:stage.title,reviewQuestion:stage.question,
   reviewTrack:item.reviewTrack,documentaryPriority:item.documentaryPriority,
   sourceIds:[...item.sourceIds],
   chainIds:stage.id==="S2"?[...item.chainIds]:[],
   noAuthoredGenericChain:stage.id==="S2"&&item.chainGap,
   competingHypotheses:stage.id==="S3"?item.competingHypotheses.map(x=>({...x})):[],
   minimumEvidence:stage.id==="S4"?[...item.proposedMinimumEvidence]:[],
   evidenceSourceValues:requests,
   sapState:stage.id==="S4"?item.sapStatus:null,
   sapBlocker:stage.id==="S4"?item.sapBlocker:null,
   missingDocumentaryEvidence:requests.length===0,
   expectedHumanReview:"REVISAO_INDEPENDENTE_PENDENTE",
   status:"DRAFT_NOT_SENT",receivedEvidence:false,performedTest:false,
   confirmedCause:false,approvedSAP:false,authorizedWork:false,
   assignedPerson:null,sentAt:null,receivedAt:null,reviewedAt:null};
 }));
 const disciplines=[...new Set(agenda.items.map(x=>x.discipline))].sort();
 return {schema:"fmea-mining.pm-evidence-requests.v1",version:"1.3.88",
  nature:"PUBLIC_UNSENT_DOCUMENTARY_REQUEST_DRAFTS",
  provenance:{agenda:agenda.version,sourceVersions:{...agenda.sourceVersions}},
  stages:agenda.stages.map(x=>({...x})),disciplines,packets,
  summary:{rules:agenda.items.length,stages:agenda.stages.length,
   packets:packets.length,disciplines:disciplines.length,
   blockedSAPRules:agenda.summary.blockedSAPExceptions,
   noApprovedSAPWithoutException:agenda.summary.withoutApprovedSAPNoException,
   packetsWithoutSpecificSourceValues:packets.filter(x=>x.missingDocumentaryEvidence).length,
   sent:0,received:0,performed:0,confirmedCauses:0,
   SAPApprovals:0,workAuthorizations:0,corporateGatesBlocked:8,decision:"NO_GO"},
  safety:{noRealRequestsSent:true,noNewFieldEvidence:true,noRealAssignedStaff:true,
   noRealMeetings:true,noRiskScore:true,noUrgencyRanking:true,noOEMSerialClaims:true,
   noSAPWrites:true,noOperationalRelease:true}};
}
export function filterEvidenceRequests(data,{discipline="all",system="all",stage="all",track="all",query=""}={}){
 if(!data||!Array.isArray(data.packets))return [];
 const q=norm(query).trim();
 return data.packets.filter(p=>
  (discipline==="all"||p.discipline===discipline)&&
  (system==="all"||p.system===system)&&
  (stage==="all"||p.stageId===stage)&&
  (track==="all"||p.reviewTrack===track)&&
  (!q||norm([p.ruleId,p.component,p.discipline,p.stageTitle,p.sapBlocker,
   ...p.sourceIds,...p.evidenceSourceValues].join(" ")).includes(q)));
}
export function evidenceRequestMarkdown(data,rows){
 if(!data||!Array.isArray(data.packets)||!Array.isArray(rows)||
    rows.some(x=>!data.packets.some(a=>eq(a,x))))return null;
 const lines=["# Pré-solicitações documentais de evidência FMEA","",
  "**v1.3.88 · NÃO HOMOLOGADO · NO_GO · NÃO ENVIADO / NÃO EXECUTADO**","",
  "> Documento preparatório; não comprova solicitação enviada, ensaio realizado, evidência recebida, parecer, aprovação SAP ou liberação.",
  "> P0/P1 representam fila documental de curadoria, não criticidade ou urgência operacional.","",
  "## Recorte exportado",rows.length+" rascunho(s) S1–S5 sem responsável ou destinatário definido.",""];
 for(const p of rows){
  lines.push("## "+p.packetId,"","**Disciplina proposta:** "+p.discipline,
   "**Sistema/componente candidato:** "+p.system+" / "+p.component,
   "**Etapa:** "+p.stageId+" — "+p.stageTitle,
   "**Pergunta da pauta original:** "+p.reviewQuestion,
   "**Trilha:** "+p.reviewTrack,
   "**Prioridade DOCUMENTAL:** "+(p.documentaryPriority??"não atribuída"),"",
   "**IDs de fontes catalogadas, sem prova de efetividade por série:** "+p.sourceIds.join(", "),"");
  if(p.stageId==="S2")lines.push("**Cadeias genéricas documentadas:** "+(p.chainIds.join(", ")||
   "nenhuma catalogada — não significa ausência de mecanismo"),"");
  if(p.stageId==="S3"){
   if(p.competingHypotheses.length){lines.push("### Hipóteses abertas e propostas de discriminação");
    p.competingHypotheses.forEach(x=>lines.push("- "+x.candidate+" — "+x.proposedDiscriminator));}
   else lines.push("**Contraprovas individualizadas:** não registradas nesta trilha; requerem formulação técnica posterior.");
   lines.push("");
  }
  if(p.stageId==="S4"){
   lines.push("**Situação SAP:** "+p.sapState,
    "**Impedimento registrado:** "+(p.sapBlocker??"nenhuma exceção formal registrada, mapeamento não aprovado"),"");
   if(p.minimumEvidence.length){
    lines.push("### Evidências mínimas propostas — não coletadas");
    p.minimumEvidence.forEach(v=>lines.push("- [ ] "+v));
   }else lines.push("**Evidência mínima individualizada nesta etapa:** não registrada nesta trilha.");
   lines.push("");
  }
  lines.push("**Status:** rascunho não enviado; evidências não recebidas; nenhuma medição, avaliação ou aprovação registrada.",
   "**Encaminhamento:** solicitar revisão humana autorizada antes de qualquer ação.","");
 }
 lines.push("---","**Dez exceções SAP e oito gates corporativos permanecem BLOCK / NO_GO.**");
 return lines.join("\n");
}
export function assessEvidenceRequests(agenda,output){
 const errors=[],ck=(x,k)=>{if(!x)errors.push(k)};
 let baseline;try{baseline=buildEvidenceRequests(agenda)}catch(e){return {status:"REJECTED",errors:["build_"+e.message]}};
 ck(eq(output,baseline),"source_drift");
 ck(agenda.version==="1.3.87"&&agenda.items.length===25&&agenda.stages.length===5&&
  agenda.disciplines.length===4&&agenda.summary.decision==="NO_GO"&&
  agenda.summary.blockedSAPExceptions===10&&
  agenda.summary.corporateGatesBlocked===8,"agenda_provenance");
 ck(agenda.items.every(x=>x.evidenceReceived===false&&x.assignedTo===null&&
  x.meetingDate===null&&x.rootCauseConfirmed===false&&x.reviewedIndependently===false&&
  x.approvedSAP===false&&x.authorizedToExecute===false&&
  x.stages.every(s=>s.status==="NOT_STARTED_DOCUMENTARY_ONLY")),"source_honesty");
 ck(output.schema==="fmea-mining.pm-evidence-requests.v1"&&
  output.version==="1.3.88"&&output.packets.length===125&&
  new Set(output.packets.map(x=>x.packetId)).size===125&&
  output.summary.rules===25&&output.summary.stages===5&&
  output.summary.disciplines===4&&output.summary.blockedSAPRules===10&&
  output.summary.noApprovedSAPWithoutException===15&&
  output.summary.corporateGatesBlocked===8&&output.summary.decision==="NO_GO"&&
  Object.values(output.safety).every(Boolean),"output_no_go");
 ck(output.packets.every(x=>x.status==="DRAFT_NOT_SENT"&&
  x.receivedEvidence===false&&x.performedTest===false&&x.confirmedCause===false&&
  x.approvedSAP===false&&x.authorizedWork===false&&x.assignedPerson===null&&
  x.sentAt===null&&x.receivedAt===null&&x.reviewedAt===null),"no_pretend_activity");
 return {status:errors.length?"REJECTED":"NO_GO_PUBLIC_PRE_REQUESTS_ONLY",errors};
}
