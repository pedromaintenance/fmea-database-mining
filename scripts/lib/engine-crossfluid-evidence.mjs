/** Pure documentary evidence gap logic. Browser-compatible, no network, no
 * diagnosis, no authorization. Flags are only operator self-attestations. */
const isObj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const equalKeys=(x,keys)=>isObj(x)&&Object.keys(x).sort().join('|')===[...keys].sort().join('|');
export function emptyCrossfluidChecklist(bundle){
 return {schema:'fmea-mining.engine-crossfluid-document-checklist.v1',version:'1.4.14',
  nature:'local_boolean_self_attestation_not_verified_evidence',
  matrixSha256:bundle.matrixSha256,engineDossierSha256:bundle.engineDossierSha256,
  selectedHypothesisId:bundle.matrix.hypothesisGates[0].hypothesisId,
  available:Object.fromEntries(bundle.matrix.evidence.map(x=>[x.id,false]))};
}
export function validateCrossfluidChecklist(obj,bundle){
 const errors=[];
 if(!equalKeys(obj,['schema','version','nature','matrixSha256','engineDossierSha256','selectedHypothesisId','available']))
  return ['invalid_checklist_shape'];
 if(obj.schema!=='fmea-mining.engine-crossfluid-document-checklist.v1'||obj.version!=='1.4.14')errors.push('invalid_version');
 if(obj.nature!=='local_boolean_self_attestation_not_verified_evidence')errors.push('not_self_attested');
 if(obj.matrixSha256!==bundle.matrixSha256||obj.engineDossierSha256!==bundle.engineDossierSha256)errors.push('base_changed');
 if(!bundle.matrix.hypothesisGates.some(g=>g.hypothesisId===obj.selectedHypothesisId))errors.push('unknown_hypothesis');
 const ids=bundle.matrix.evidence.map(x=>x.id);
 if(!equalKeys(obj.available,ids))errors.push('wrong_evidence_ids');
 else for(const id of ids)if(typeof obj.available[id]!=='boolean')errors.push('not_boolean_'+id);
 return errors;
}
export function assessCrossfluidEvidence(obj,bundle){
 const errors=validateCrossfluidChecklist(obj,bundle);
 if(errors.length)return {schema:'fmea-mining.engine-crossfluid-document-assessment.v1',version:'1.4.14',
  status:'INVALID_CHECKLIST_INPUT',errors,missing:[],present:[],required:[],
  humanEvidenceVerified:false,rootCauseConfirmed:false,operationalApproval:false,sapActionAuthorized:false};
 const gate=bundle.matrix.hypothesisGates.find(g=>g.hypothesisId===obj.selectedHypothesisId);
 const required=[...new Set([...gate.commonRequired,...gate.specificRequired])];
 const present=required.filter(id=>obj.available[id]===true);
 const missing=required.filter(id=>obj.available[id]!==true);
 return {
  schema:'fmea-mining.engine-crossfluid-document-assessment.v1',version:'1.4.14',
  hypothesisId:gate.hypothesisId,
  status:missing.length?'DOCUMENTS_NOT_YET_SELF_ATTESTED':'DOCUMENT_SET_SELF_ATTESTED_FOR_HUMAN_REVIEW_ONLY',
  required,present,missing,completed:present.length,total:required.length,
  interpretationBoundary:gate.interpretationBoundary,errors:[],
  humanEvidenceVerified:false,rootCauseConfirmed:false,operationalApproval:false,
  sapActionAuthorized:false,readyForPhysicalTest:false,
  caveat:'Boolean flags are self-attested, not verified documents. Even all true never validates an actual engine, cause, OEM procedure, physical testing or release.'
 };
}
export function buildCrossfluidRequest(obj,bundle){
 const a=assessCrossfluidEvidence(obj,bundle);
 if(a.status==='INVALID_CHECKLIST_INPUT')return 'Checklist incompatível; recarregue a versão vigente.';
 const h=bundle.dossier.hypotheses.find(x=>x.id===a.hypothesisId);
 const rows=bundle.matrix.evidence.filter(e=>a.missing.includes(e.id));
 const lines=[
 'SOLICITAÇÃO DOCUMENTAL DE ENGENHARIA / PCM — MODELO VAZIO',
 'Hipótese conceitual: '+a.hypothesisId+' — '+(h?.title||''),
 'Situação: '+a.status+' · '+a.completed+'/'+a.total+' requisitos autodeclarados',
 'Não incluir no repositório público dados de equipamento, série, PN, SAP, laudos ou pessoas.',
 'Itens documentais pendentes:'
 ];
 if(!rows.length)lines.push('- Nenhum item pendente segundo marcações locais; verificar autenticidade com responsável e revisar hipóteses concorrentes.');
 for(const r of rows)lines.push('- ['+r.id+'] '+r.title+' — '+r.request);
 lines.push('Ressalva técnica: '+a.interpretationBoundary);
 lines.push('Sem confirmação de causa, autorização de teste, reparo, ordem SAP ou liberação operacional.');
 return lines.join('\n')+'\n';
}
