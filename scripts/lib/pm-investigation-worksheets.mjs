/** Documentation-only investigation preparation. NEVER an instruction to execute a test. */
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const txt=x=>String(x??"Não documentado").replace(/\r?\n/g," ").replace(/\|/g,"/");
const clean=x=>Array.isArray(x)?x.map(txt):[];
export function buildInvestigationWorksheet({catalog,graph,inventory},ruleId){
 const rule=catalog?.records?.find(r=>r.ruleId===ruleId);
 const node=graph?.rules?.find(r=>r.ruleId===ruleId);
 const gap=inventory?.records?.find(r=>r.ruleId===ruleId);
 if(!rule||!node||!gap)return null;
 const exception=rule.reviewTrack==="PM_SAP_DOCUMENTARY_EXCEPTION";
 const sourceChainIds=node.chains.map(c=>c.id);
 const cases=exception?[]:rule.alternatives.map((a,i)=>({
  id:"ALT-"+(i+1),hypothesis:a.candidate,proposedDiscriminator:a.requestedEvidence,
  state:"NOT_TESTED_NOT_CONFIRMED"}));
 const gates=[
  {id:"S1",name:"Identificação e configuração OEM",sourceField:"maturity.serialBOM + sourceTraceability",
   demand:"Validar configuração/arranjo, série e procedimento OEM em ambiente privado autorizado.",
   completed:false,proofReceived:false},
  {id:"S2",name:"Formulação de mecanismos e hipóteses",sourceField:"causal-chains + observability + exceptions",
   demand:node.chains.length?
    "Revisar cadeias genéricas "+sourceChainIds.join(", ")+" e separar os mecanismos concorrentes; nenhuma cadeia é ocorrência real.":
    "Pesquisar e submeter proposta de cadeia funcional ainda ausente do catálogo; ausência documental não significa ausência de falha.",
   completed:false,proofReceived:false},
  {id:"S3",name:"Critérios discriminantes e segurança",sourceField:"seed + detectability OR SAP reviewQueue",
   demand:exception?
    "Revisar as evidências mínimas propostas na exceção PM×SAP; não assumir que tenham sido coletadas.":
    "Revisar contraprovas propostas para as duas hipóteses, confusores e condições inconclusivas; sem executar inspeções por esta ficha.",
   completed:false,proofReceived:false},
  {id:"S4",name:"Revisão semântica/SAP",sourceField:"pm-maturity-matrix.sap",
   demand:exception?
    "Curadoria da exceção bloqueada "+rule.sapException.expectedBlocker+
    "; conferir subgrupo, componente e par dano–causa; sem remapeamento automático.":
    "Não existe vínculo SAP aprovado nem exceção formal registrada; conferir arquitetura e nomenclatura sem pressupor aprovação.",
   completed:false,proofReceived:false},
  {id:"S5",name:"Revisão independente e decisão",sourceField:"maturity.independentReview",
   demand:"Solicitar análise técnica independente e registrar decisão em fluxo corporativo autorizado, fora deste repositório.",
   completed:false,proofReceived:false}
 ];
 return {schema:"fmea-mining.pm-investigation-worksheet.v1",version:"1.3.86",
  nature:"UNEXECUTED_DOCUMENTARY_REVIEW_NOT_FIELD_WORK_ORDER",
  ruleId,system:rule.system,component:rule.component,symptom:rule.symptom,
  inspectionMethodFromSeed:rule.inspectionMethod,
  track:rule.reviewTrack,documentaryPriority:rule.documentaryPriority,
  documentaryPriorityNotRisk:true,sourceChainIds,
  chainGap:node.chains.length===0,sourceReferences:node.chains.flatMap(c=>c.sourceIds),
  competingHypotheses:cases,
  detectionTrap:exception?null:rule.attributionTrap,
  confounders:exception?null:rule.confounder,
  inconclusiveBoundary:exception?null:rule.inconclusiveBoundary,
  safetyBoundary:exception?null:rule.safetyBoundary,
  exception:exception?{
   blocker:rule.sapException.expectedBlocker,finding:rule.sapException.finding,
   nextReview:rule.sapException.nextInspection,
   minimumEvidence:clean(rule.sapException.minimumEvidence),
   sourceIds:clean(rule.sapException.sourceIds),status:rule.sapException.disposition,
   autoRemapAllowed:false}:null,
  proposedReviewDiscipline:gap.reviewDiscipline,
  documentationGaps:[...gap.categories],
  stages:gates,fieldWorkPerformed:false,independentApprovalRecorded:false,
  confirmedRootCause:false,SAPMappingApproved:false,operationReleased:false,
  decision:"NO_GO_REQUIRES_AUTHORIZED_HUMAN_REVIEW"};
}
export function worksheetMarkdown(w){
 if(!w||w.schema!=="fmea-mining.pm-investigation-worksheet.v1"||
   w.decision!=="NO_GO_REQUIRES_AUTHORIZED_HUMAN_REVIEW")return null;
 const lines=["# Preparação de investigação técnica — "+txt(w.ruleId),"",
  "**FMEA v1.3.86 · NÃO HOMOLOGADO · NO_GO · NENHUM TESTE EXECUTADO**",
  "**Finalidade:** preparação de revisão documental para Engenharia e PCM; não é laudo, notificação, ordem, checklist executável ou liberação.",
  "**Regra:** "+txt(w.ruleId)+" · **Sistema:** "+txt(w.system)+" · **Componente candidato:** "+txt(w.component),
  "**Trilha:** "+(w.exception?"Exceção PM×SAP bloqueada":"Hipóteses conceituais sem prioridade documental"),
  "**Prioridade de fila documental:** "+(w.documentaryPriority??"não atribuída")+" — NÃO é criticidade operacional.",
  "**Sintoma catalogado:** "+txt(w.symptom),
  "**Método catalogado (não executado):** "+txt(w.inspectionMethodFromSeed),"",
  "## Verificações documentais para planejamento — TODAS PENDENTES",""];
 for(const s of w.stages){
  lines.push("- [ ] **"+s.id+" — "+txt(s.name)+"**: "+txt(s.demand)+
   " _Fonte: "+txt(s.sourceField)+"; evidência não recebida; etapa não realizada._");
 }
 lines.push("","## Mecanismos e discriminação","");
 if(w.chainGap)lines.push("- Nenhuma cadeia funcional genérica vinculada. É lacuna documental, NÃO demonstra ausência de falha.");
 else lines.push("- Cadeias genéricas catalogadas (não confirmadas): "+w.sourceChainIds.join(", "));
 if(w.exception){
  lines.push("","### Exceção SAP formalmente bloqueada",
   "- **Impedimento:** "+txt(w.exception.blocker),
   "- **Achado de curadoria:** "+txt(w.exception.finding),
   "- **Próxima análise proposta:** "+txt(w.exception.nextReview),
   "- **Estado:** "+txt(w.exception.status),
   "- **IDs de fonte:** "+w.exception.sourceIds.join(", "),"",
   "**Evidências mínimas PROPOSTAS (não coletadas):**","");
  for(const item of w.exception.minimumEvidence)lines.push("- [ ] "+txt(item));
 }else{
  lines.push("**Hipóteses concorrentes ainda não confirmadas:**","");
  for(const c of w.competingHypotheses)
   lines.push("- **"+c.id+"** "+txt(c.hypothesis)+" — contraprova proposta: "+txt(c.proposedDiscriminator));
  lines.push("","- **Atribuição potencialmente indevida:** "+txt(w.detectionTrap),
   "- **Confusores:** "+txt(w.confounders),
   "- **Quando manter inconclusivo:** "+txt(w.inconclusiveBoundary),
   "- **Fronteira de segurança:** "+txt(w.safetyBoundary));
 }
 lines.push("","## Pendências e responsabilidades","",
  "- **Disciplina proposta:** "+txt(w.proposedReviewDiscipline),
  "- **Categorias ainda abertas:** "+w.documentationGaps.map(txt).join(", "),
  "- **Assinatura da revisão:** não registrada",
  "- **Evidência real de campo:** não fornecida",
  "- **Efetividade OEM por série:** não verificada",
  "- **Aprovação SAP:** inexistente",
  "- **Liberação operacional:** proibida nesta ferramenta","",
  "**Dez exceções SAP e oito gates corporativos permanecem BLOCK / NO_GO.**","");
 return lines.join("\n");
}
export function assessInvestigationWorksheets(inputs,worksheets){
 const errors=[],ck=(v,id)=>{if(!v)errors.push(id)};
 const ids=inputs.catalog.records.map(x=>x.ruleId).sort();
 ck(Array.isArray(worksheets)&&worksheets.length===25,"25_worksheets");
 ck(inputs.catalog.version==="1.3.86"&&inputs.graph.version==="1.3.86"&&
  inputs.inventory.version==="1.3.86"&&inputs.catalog.summary.decision==="NO_GO"&&
  inputs.inventory.summary.decision==="NO_GO"&&
  inputs.catalog.summary.blockedCorporateGates===8&&
  inputs.catalog.summary.blockedSapExceptions===10,"upstream_no_go");
 ck(ids.every(id=>{
  const w=worksheets?.find(x=>x.ruleId===id);
  return w&&same(w,buildInvestigationWorksheet(inputs,id))&&w.stages.length===5&&
   w.stages.every(s=>!s.completed&&!s.proofReceived)&&
   !w.fieldWorkPerformed&&!w.confirmedRootCause&&!w.SAPMappingApproved&&
   !w.operationReleased&&!w.independentApprovalRecorded&&w.documentaryPriorityNotRisk&&
   w.decision==="NO_GO_REQUIRES_AUTHORIZED_HUMAN_REVIEW"&&
   worksheetMarkdown(w)?.includes("NÃO HOMOLOGADO");
 }),"source_faithful_and_not_executed");
 ck(ids.filter(id=>worksheets?.find(x=>x.ruleId===id)?.exception).length===10&&
  ids.filter(id=>worksheets?.find(x=>x.ruleId===id)?.chainGap).length===14&&
  ids.filter(id=>worksheets?.find(x=>x.ruleId===id)?.competingHypotheses.length===2).length===15,
  "source_track_and_chain_coverage");
 ck(buildInvestigationWorksheet(inputs,"NONEXISTENT_ASSET")===null,"unknown_rule_rejected");
 return {status:errors.length?"REJECTED":"NO_GO_REVIEW_PACKETS",errors};
}
