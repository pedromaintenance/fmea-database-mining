/** Explicit technical navigation; links are structural matches, never causal similarity or risk scoring. */
const exact=(x,keys)=>x!==null&&typeof x==="object"&&!Array.isArray(x)&&Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k));
const text=x=>String(x??"Não documentado").replace(/\r/g,"").replace(/\n/g," ");
export function relatedRules(catalog,ruleId,limit=5){
 if(!catalog||!Array.isArray(catalog.records)||!Number.isInteger(limit)||limit<1||limit>10)return [];
 const r=catalog.records.find(x=>x.ruleId===ruleId);
 if(!r)return [];
 return catalog.records.filter(x=>x.ruleId!==r.ruleId&&
   (x.system===r.system||x.subgroupCode===r.subgroupCode))
   .map(x=>({ruleId:x.ruleId,system:x.system,component:x.component,reviewTrack:x.reviewTrack,
     relation:x.subgroupCode===r.subgroupCode&&x.system===r.system?
       "MESMO_SISTEMA_E_SUBGRUPO":x.system===r.system?"MESMO_SISTEMA":"MESMO_SUBGRUPO"}))
   .sort((a,b)=>{
    const rank={MESMO_SISTEMA_E_SUBGRUPO:0,MESMO_SISTEMA:1,MESMO_SUBGRUPO:2};
    return rank[a.relation]-rank[b.relation]||a.ruleId.localeCompare(b.ruleId);
   }).slice(0,limit);
}
export function buildTechnicalComparison(catalog,leftId,rightId){
 if(!catalog||!Array.isArray(catalog.records)||typeof leftId!=="string"||
   typeof rightId!=="string"||leftId===rightId)return null;
 const left=catalog.records.find(x=>x.ruleId===leftId),right=catalog.records.find(x=>x.ruleId===rightId);
 if(!left||!right)return null;
 const shape=x=>({ruleId:x.ruleId,reviewTrack:x.reviewTrack,system:x.system,
   subgroupCode:x.subgroupCode,component:x.component,symptom:x.symptom,
   inspectionMethod:x.inspectionMethod,
   documentaryPriority:x.reviewTrack==="PM_SAP_DOCUMENTARY_EXCEPTION"?x.documentaryPriority:null,
   conceptualAlternativeCount:x.alternatives.length,
   conceptualAlternatives:x.alternatives.map(y=>({candidate:y.candidate,requestedEvidence:y.requestedEvidence})),
   possibleAttributionTrap:x.reviewTrack==="UNRANKED_DETECTABILITY"?x.attributionTrap:null,
   possibleMissedDetection:x.reviewTrack==="UNRANKED_DETECTABILITY"?x.missedDetection:null,
   sapExceptionBlock:x.reviewTrack==="PM_SAP_DOCUMENTARY_EXCEPTION"?x.sapException.expectedBlocker:null,
   sapFinding:x.reviewTrack==="PM_SAP_DOCUMENTARY_EXCEPTION"?x.sapException.finding:null,
   nextReview:x.reviewTrack==="PM_SAP_DOCUMENTARY_EXCEPTION"?x.sapException.nextInspection:null,
   minimumEvidence:x.reviewTrack==="PM_SAP_DOCUMENTARY_EXCEPTION"?[...x.sapException.minimumEvidence]:[],
   openQualityRequirements:x.qualityCriteria.length,
   openMaturityLayers:x.blockers.length,
   rootCauseConfirmed:false,SAPApproved:false,operationallyReleased:false});
 return {schema:"fmea-mining.pm-technical-comparison.v1",version:"1.3.84",
  purpose:"SOURCE_BASED_STRUCTURAL_CONTRAST_NOT_CAUSAL_DIAGNOSIS",
  left:shape(left),right:shape(right),
  sameSystem:left.system===right.system,sameSubgroup:left.subgroupCode===right.subgroupCode,
  differentTracks:left.reviewTrack!==right.reviewTrack,
  documentationPriorityIsNotOperationalRisk:true,
  sharedSystemDoesNotProveSharedFailureMechanism:true,
  authorization:"NO_GO_READ_ONLY"};
}
export function buildReviewMarkdown(catalog,selectedIds){
 if(!catalog||!Array.isArray(catalog.records)||!Array.isArray(selectedIds)||
   ![1,2].includes(selectedIds.length)||new Set(selectedIds).size!==selectedIds.length||
   !selectedIds.every(id=>typeof id==="string"&&catalog.records.some(x=>x.ruleId===id)))return null;
 const lines=[
 "# Ficha técnica para revisão de Engenharia e PCM",
 "",
 "**Versão do catálogo:** 1.3.84",
 "**Estado:** NÃO HOMOLOGADO · NO_GO · APENAS CONSULTA CONCEITUAL",
 "**Natureza:** extração de fontes públicas já versionadas; nenhuma observação ou aprovação real",
 "**Comparação:** "+(selectedIds.length===2?"duas regras distintas, sem inferência de equivalência causal":"uma regra"),
 "",
 "> Prioridade P0/P1 é posição da fila DOCUMENTAL PM×SAP, não criticidade operacional. Ausência de prioridade não significa baixo risco.",
 "> Esta ficha não é OS, nota SAP, procedimento de teste, laudo, autorização ou liberação de equipamento.",
 ""
 ];
 for(const id of selectedIds){
  const r=catalog.records.find(x=>x.ruleId===id);
  lines.push("## "+text(r.ruleId),"",
    "- **Sistema:** "+text(r.system),
    "- **Subgrupo:** "+text(r.subgroupCode),
    "- **Componente candidato:** "+text(r.component),
    "- **Trilha:** "+(r.reviewTrack==="UNRANKED_DETECTABILITY"?"Hipóteses conceituais sem prioridade documental":"Exceção PM×SAP bloqueada"),
    "- **Prioridade de fila documental:** "+(r.documentaryPriority??"não atribuída"),
    "- **Sintoma original:** "+text(r.symptom),
    "- **Método de inspeção original:** "+text(r.inspectionMethod),"");
  if(r.reviewTrack==="PM_SAP_DOCUMENTARY_EXCEPTION"){
   lines.push("### Enquadramento PM×SAP ainda bloqueado","",
    "- **Impedimento:** "+text(r.sapException.expectedBlocker),
    "- **Achado original:** "+text(r.sapException.finding),
    "- **Próxima análise proposta:** "+text(r.sapException.nextInspection),
    "- **Disciplina proposta:** "+text(r.sapException.reviewDiscipline),
    "- **Estado da fonte:** "+text(r.sapException.disposition),"",
    "#### Evidências mínimas propostas (não coletadas)","");
   r.sapException.minimumEvidence.forEach(v=>lines.push("- "+text(v)));
   lines.push("","**IDs de referência catalogados:** "+r.sapException.sourceIds.map(text).join(", "),"");
  }else{
   lines.push("### Hipóteses concorrentes — não confirmadas","");
   r.alternatives.forEach((v,i)=>lines.push(
    (i+1)+". "+text(v.candidate)+" — **contraprova proposta:** "+text(v.requestedEvidence)));
   lines.push("","### Limites de interpretação","",
    "- **Atribuição possivelmente incorreta:** "+text(r.attributionTrap),
    "- **Confusores:** "+text(r.confounder),
    "- **Possível não detecção:** "+text(r.missedDetection),
    "- **Manter inconclusivo quando:** "+text(r.inconclusiveBoundary),
    "- **Fronteira de segurança:** "+text(r.safetyBoundary),"",
    "### Camadas ainda abertas","");
   r.blockers.forEach(v=>lines.push("- "+text(v.label)+": "+text(v.description)));
   lines.push("","**Requisitos metrológicos ainda não verificados:** "+r.qualityCriteria.length,"");
  }
  lines.push("**Diagnóstico:** inconclusivo, nenhuma causa raiz confirmada.",
   "**SAP:** nenhum mapeamento aprovado. **Execução:** não autorizada.","");
 }
 if(selectedIds.length===2)lines.push(
  "## Orientação para comparação","",
  "Diferenças ou semelhanças de sistema, componente, método e bloqueio não demonstram o mesmo modo de falha.",
  "Não converter prioridade documental em prioridade operacional ou pontuação de risco.","");
 lines.push("## Rastreabilidade e próximos passos","",
  "Revisar em ambiente privado a configuração/efetividade OEM, evidências e contraprovas com Engenharia habilitada.",
  "Dez exceções PM×SAP e oito gates de implantação corporativa continuam bloqueados.",
  "**Situação final: NO_GO — nenhuma aprovação ou liberação.**","");
 return lines.join("\n");
}
export function assessTechnicalReviewWorkspace(catalog){
 const errors=[],assert=(c,k)=>{if(!c)errors.push(k)};
 const ids=catalog?.records?.map(x=>x.ruleId)??[];
 assert(catalog?.version==="1.3.84"&&ids.length===25&&new Set(ids).size===25,"source_catalog_25");
 const combos=ids.flatMap((a,i)=>ids.filter((_,j)=>j!==i).map(b=>[a,b]));
 assert(combos.length===600,"all_distinct_ordered_pairs");
 for(const [left,right] of combos){
  const result=buildTechnicalComparison(catalog,left,right);
  assert(result?.authorization==="NO_GO_READ_ONLY"&&
   result.left.rootCauseConfirmed===false&&result.right.rootCauseConfirmed===false&&
   result.left.SAPApproved===false&&result.right.SAPApproved===false&&
   result.left.operationallyReleased===false&&result.right.operationallyReleased===false&&
   result.documentationPriorityIsNotOperationalRisk===true&&
   result.sharedSystemDoesNotProveSharedFailureMechanism===true,
   "comparison_no_go_"+left+"_"+right);
 }
 assert(buildTechnicalComparison(catalog,ids[0],ids[0])===null,"reject_same_rule");
 assert(buildTechnicalComparison(catalog,"REAL-TAG",ids[0])===null,"reject_unknown_rule");
 assert(buildReviewMarkdown(catalog,[ids[0],ids[0]])===null,"reject_duplicate_export");
 assert(buildReviewMarkdown(catalog,["REAL-TAG"])===null,"reject_unknown_export");
 assert(buildReviewMarkdown(catalog,[])===null,"reject_empty_export");
 for(const id of ids){
  const related=relatedRules(catalog,id);
  assert(related.length<=5&&related.every(x=>x.ruleId!==id&&
   ["MESMO_SISTEMA_E_SUBGRUPO","MESMO_SISTEMA","MESMO_SUBGRUPO"].includes(x.relation)),"related_structural_only_"+id);
  const md=buildReviewMarkdown(catalog,[id]);
  assert(md.includes(id)&&md.includes("NÃO HOMOLOGADO")&&md.includes("NO_GO")&&
    md.includes("Prioridade P0/P1")&&!md.includes("APROVADO PARA EXECUÇÃO"),"review_sheet_safety_"+id);
 }
 return {status:errors.length?"REJECTED":"NO_GO_READ_ONLY_WORKSPACE",errors,orderedComparisonPairs:600,individualReviewSheets:25};
}
