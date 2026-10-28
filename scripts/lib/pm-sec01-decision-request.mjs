/** Offline SEC-01 decision request: categorical dry-runs, never real corporate authorization. */
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function routeSyntheticSec01Response(values,policy){
 if(!values||typeof values!=="object"||Array.isArray(values)||
 Object.keys(values).length!==policy.decisionIds.length||
 !policy.decisionIds.every(id=>Object.hasOwn(values,id)&&policy.privateOutcomeTokens.includes(values[id])))
 return "REJECT_UNSUPPORTED_PUBLIC_INPUT";
 for(const token of policy.routingPriority){
  if(token==="APPROVED_FOR_RESTRICTED_DESIGN_REVIEW_ONLY"||
   policy.decisionIds.some(id=>values[id]===token))return policy.routingRules[token];
 }
 return "REJECT_UNSUPPORTED_PUBLIC_INPUT";
}
export function buildSec01DecisionRequest({policy,handoff,brief,runbook,closure,gaps,maturity}){
 const decisions=policy.decisionIds.map((id,i)=>{
  const d=handoff.decisionRegister.find(x=>x.decisionId===id);
  if(!d)throw Error("missing_decision_"+id);
  return {id,reviewFunction:policy.ownerFunctions[i],stream:d.stream,
   requestedQuestion:d.requestedHumanDecision,checkIds:[...d.unresolvedCheckIds],
   returnConditions:d.reasonsToReturn,corporateDecision:null,verifiedSigner:null,
   privateRecordPointer:null,decisionTimestamp:null,submitted:false,
   status:"PENDING_HUMAN_CORPORATE_DECISION"};
 });
 const evidence=policy.checkIds.map(id=>{
  const r=handoff.missingPrivateRequestQueue.find(x=>x.requestId===id);
  if(!r)throw Error("missing_check_"+id);
  return {checkId:id,stream:r.stream,requirement:r.requiredEvidenceDescription,
   proposedFunction:r.proposedAccountableRole,requestSent:false,
   privateDocumentReceived:false,custodyVerified:false,
   privateRecordRef:null,status:"NOT_REQUESTED"};
 });
 const drills=policy.scenarios.map(s=>{
  const values=Object.fromEntries(policy.decisionIds.map((id,i)=>[id,s.outcomes[i]]));
  return {scenarioId:s.id,syntheticDecisions:values,
   proposedHumanRoute:routeSyntheticSec01Response(values,policy),
   verifiedSigner:false,privateApproval:false,SEC01GateClosed:false,
   ID02Enabled:false,realPilotAuthorized:false,SAPWrite:false,
   operationalRelease:false,disposition:"NO_GO_SYNTHETIC_ONLY"};
 });
 const memo=[
 "# SEC-01 — Solicitação de análise corporativa (modelo não enviado)",
 "",
 "**Destinatários propostos:** Governança, Jurídico/licenciamento OEM e Privacidade; funções e titulares reais a confirmar internamente.",
 "",
 "## Contexto e pedido",
 "Solicita-se avaliar a viabilidade de um **desenho de ambiente corporativo restrito** para custódia e revisão de evidências técnicas FMEA/manutenção. O material disponível é público e sintético; não existem aprovações ou licenças corporativas atestadas.",
 "",
 "## Escopo e exclusões",
 "Esta solicitação **não autoriza** coleta de dados reais, publicação de manuais OEM, execução em campo, abertura de OS, alteração de dados mestres SAP, liberação operacional ou desbloqueio de gates. O pedido limita-se à avaliação de desenho.",
 "",
 "## Decisões a solicitar",
 ...decisions.map((d,i)=>String(i+1)+". **"+d.id+" — "+d.reviewFunction+"**: "+d.requestedQuestion+". Itens para comprovação privada: "+d.checkIds.join(", ")+"."),
 "",
 "## Evidências e acesso",
 "As nove exigências documentais devem ser examinadas exclusivamente por funções competentes em ambiente corporativo autorizado. Não inserir documentos OEM, tags, séries, hashes, credenciais, assinaturas ou dados reais no GitHub público.",
 "",
 "## Condições de retorno",
 "Solicitar uma resposta humana individual por deliberação: análise restrita de desenho favorável, devolução para correção, recusa ou pedido de evidências. Exigir em sistema corporativo: autoridade do signatário, fundamento, limites de licença e DPIA, registro protegido e rastreabilidade da decisão.",
 "",
 "Uma resposta favorável à avaliação do desenho **não aprova SEC-01**, não abre ID-02 e não autoriza piloto. Até decisão independente privada e controle de mudança formal, manter **NO_GO**.",
 "",
 "**Status:** modelo pronto para copiar; não enviado, não assinado, não aprovado.",""
 ].join("\n");
 return {schema:"fmea-mining.pm-sec01-decision-request.v1",version:policy.version,
  nature:"public_reusable_submission_template_never_submitted_or_approved",
  sources:{handoff:handoff.version,brief:brief.version,closure:closure.version,
   runbook:runbook.version,maturity:maturity.version},
  summary:{decisionQuestions:decisions.length,privateEvidenceRequirements:evidence.length,
   dryRunResponseCases:drills.length,preparedPublicTemplate:1,
   realSubmissions:0,realOwnerAppointments:0,realReceivedDocuments:0,
   realCorporateDecisions:0,validCorporateSignatures:0,
   privateGatesBlocked:runbook.phases.length,sapExceptionsBlocked:gaps.records.length,
   approvedPilots:0,createdOrders:0,SAPUpdates:0,operationsReleased:0,decision:"NO_GO"},
  decisions,evidence,drills,memo,publicWorkflow:"PREPARED_NOT_SUBMITTED",
  privateNextAction:"COPY_TO_APPROVED_CORPORATE_CHANNEL_FOR_THREE_HUMAN_REVIEWS",
  gateDecision:"NO_GO_SEC01_NOT_AUTHORIZED"};
}
export function assessSec01DecisionRequest(input,output){
 const {policy,handoff,brief,runbook,closure,gaps,maturity}=input,errors=[],ck=(v,id)=>{if(!v)errors.push(id)};
 let expected;try{expected=buildSec01DecisionRequest(input)}catch(e){return {status:"REJECTED",errors:["build_"+e.message]}};
 ck(eq(expected,output),"report_derived_mismatch");
 ck(policy.schema==="fmea-mining.pm-sec01-decision-request-policy.v1"&&policy.version==="1.3.75"&&policy.predecessor==="1.3.74"&&policy.purpose.length>80&&policy.requestedScope==="restricted_architecture_review_only_not_real_data_or_pilot","scope_contract");
 ck(eq(policy.decisionIds,["SEC01-DEC-SPONSOR","SEC01-DEC-OEM","SEC01-DEC-PRIVACY"])&&
 eq(policy.checkIds,["SEC01-A01","SEC01-A02","SEC01-A03","SEC01-L01","SEC01-L02","SEC01-L03","SEC01-P01","SEC01-P02","SEC01-P03"])&&
 eq(policy.ownerFunctions,["corporate_governance","corporate_legal","privacy_data_controller"]),"IDs_and_owners");
 ck(eq(policy.privateOutcomeTokens,["NOT_REVIEWED","APPROVED_FOR_RESTRICTED_DESIGN_REVIEW_ONLY","RETURN_FOR_CORRECTION","DECLINED","MORE_EVIDENCE_REQUIRED"])&&
 eq(policy.routingPriority,["DECLINED","RETURN_FOR_CORRECTION","MORE_EVIDENCE_REQUIRED","NOT_REVIEWED","APPROVED_FOR_RESTRICTED_DESIGN_REVIEW_ONLY"])&&
 Object.keys(policy.routingRules).length===5&&
 policy.routingRules.APPROVED_FOR_RESTRICTED_DESIGN_REVIEW_ONLY==="HOLD_INDEPENDENT_CORPORATE_ATTESTATION"&&
 policy.routingRules.DECLINED==="STOP_AND_RETURN_FOR_HUMAN_RESCOPING","routing_priority");
 ck(policy.scenarios.length===6&&new Set(policy.scenarios.map(x=>x.id)).size===6&&
 policy.scenarios.every(s=>s.outcomes.length===3&&s.expected===routeSyntheticSec01Response(Object.fromEntries(policy.decisionIds.map((id,i)=>[id,s.outcomes[i]])),policy)),"six_dryrun_scenarios");
 ck(policy.documentationSections.length===5&&policy.corporateApprovalRequirements.length===5&&
 Object.values(policy.safe).every(x=>x===true),"public_no_go_policy");
 ck(handoff.version==="1.3.74"&&handoff.summary.raciActivities===9&&handoff.summary.decisionTopics===3&&
 handoff.summary.realDecisionsTaken===0&&handoff.summary.realDocumentsReceived===0&&
 handoff.summary.gatesBlocked===8&&handoff.state==="NO_GO_REQUEST_NOT_SENT"&&
 handoff.decisionRegister.every(x=>x.actualDecision===null&&x.authorizedSigner===null)&&
 handoff.missingPrivateRequestQueue.every(x=>x.status==="UNREQUESTED_PRIVATELY"&&x.corporateReference===null),"handoff_is_not_real");
 ck(brief.version==="1.3.73"&&brief.summary.documentaryChecks===9&&brief.summary.privateSubmissionsMade===0&&
 brief.decision==="NO_GO_PUBLIC_PACKAGE_ONLY"&&brief.scopeBoundary.grantedDecision===false&&
 brief.scopeBoundary.privateSecurityApproval===false&&brief.scopeBoundary.privatePrivacyApproval===false&&
 brief.scopeBoundary.licensedOEMReproductionApproval===false&&
 brief.scopeBoundary.downstreamPilotAuthorized===false&&
 brief.documentaryChecklist.every(x=>x.evidenceActuallyReceived===false&&x.approvalSignaturePresent===false),
 "brief_contract");
 ck(closure.version==="1.3.72"&&closure.summary.privateGatesBlocked===8&&closure.summary.overallDecision==="NO_GO","closure_no_go");
 ck(runbook.version==="1.3.62"&&runbook.phases.length===8&&
 runbook.phases.every(p=>p.gate==="BLOCK"&&p.status==="not_started"&&p.decisionToken===null)&&
 runbook.goNoGo.realPilotAllowed===false&&runbook.goNoGo.decision==="NO_GO","runbook_blocked");
 ck(gaps.records.length===10&&gaps.records.every(x=>x.autoRemapAllowed===false&&x.observedFailures===0),"sap_gaps");
 ck(maturity.summary.candidatePreventiveLinks===115&&maturity.summary.fieldConfirmed===0&&
 maturity.summary.serialOemVerified===0&&maturity.summary.sapMappingsApproved===0,"no_field_promotion");
 ck(output.schema==="fmea-mining.pm-sec01-decision-request.v1"&&output.version==="1.3.75"&&output.nature==="public_reusable_submission_template_never_submitted_or_approved","report_identity");
 const s=output.summary;
 ck(s.decisionQuestions===3&&s.privateEvidenceRequirements===9&&s.dryRunResponseCases===6&&
 s.preparedPublicTemplate===1&&s.privateGatesBlocked===8&&s.sapExceptionsBlocked===10&&s.decision==="NO_GO","report_counts");
 ck(["realSubmissions","realOwnerAppointments","realReceivedDocuments","realCorporateDecisions",
 "validCorporateSignatures","approvedPilots","createdOrders","SAPUpdates","operationsReleased"].every(k=>s[k]===0),"no_real_action");
 ck(output.decisions.length===3&&output.decisions.every(d=>d.checkIds.length===3&&
 d.corporateDecision===null&&d.verifiedSigner===null&&d.privateRecordPointer===null&&
 d.decisionTimestamp===null&&d.submitted===false&&d.status==="PENDING_HUMAN_CORPORATE_DECISION"),"decisions_blank");
 ck(output.evidence.length===9&&output.evidence.every(x=>x.requestSent===false&&
 x.privateDocumentReceived===false&&x.custodyVerified===false&&x.privateRecordRef===null&&
 x.status==="NOT_REQUESTED"),"no_private_receipts");
 ck(output.drills.length===6&&output.drills.every(d=>d.verifiedSigner===false&&
 d.privateApproval===false&&d.SEC01GateClosed===false&&d.ID02Enabled===false&&
 d.realPilotAuthorized===false&&d.SAPWrite===false&&d.operationalRelease===false&&
 d.disposition==="NO_GO_SYNTHETIC_ONLY"),"no_simulation_promotion");
 ck(output.memo.length>1300&&output.memo.includes("**não autoriza**")&&
 output.memo.includes("**NO_GO**")&&output.memo.includes("não enviado")&&
 policy.decisionIds.every(id=>output.memo.includes(id)),"memo_scope_no_go");
 ck(output.publicWorkflow==="PREPARED_NOT_SUBMITTED"&&
 output.privateNextAction==="COPY_TO_APPROVED_CORPORATE_CHANNEL_FOR_THREE_HUMAN_REVIEWS"&&
 output.gateDecision==="NO_GO_SEC01_NOT_AUTHORIZED","not_sent");
 return {status:errors.length?"REJECTED":"NO_GO_PUBLIC_DECISION_REQUEST",errors,realSubmissionPerformed:false};
}
