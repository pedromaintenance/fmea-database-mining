/**
 * Strict content-contract validation for the original thermal differential.
 * Never accepts machine evidence, tested causes, OEM limits or runtime actions.
 */
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const array=x=>Array.isArray(x);
const text=x=>typeof x==='string'&&x.trim().length>0;
export function validateThermalDossier(d,registry){
 const errors=[],ck=(ok,id)=>{if(!ok)errors.push(id)};
 if(!object(d))return ['dossier_not_object'];
 ck(d.schema==='fmea-mining.engine-cooling-thermal-differential.v1'&&d.version==='1.4.15','schema_version');
 ck(d.nature==='conceptual_competing_mechanisms_not_model_specific_diagnosis','nonconceptual_nature');
 const s=d.status;
 ck(object(s)&&s.evidenceClass==='CONCEPTUAL'&&s.reviewStatus==='PENDING_REVIEW'&&s.reviewedByHuman===false,'status_unreviewed');
 ck(object(s)&&s.operationalApproval===false&&s.sapMappingApproved===false&&s.automaticDiagnosisAllowed===false,'status_authority');
 ck(object(s)&&array(s.verifiedModels)&&s.verifiedModels.length===0&&array(s.verifiedSerials)&&s.verifiedSerials.length===0,'model_specific_claim');
 ck(object(s)&&s.fieldObservations===0&&s.performedTests===0&&s.confirmedRootCauses===0&&s.oemLimits===null,'actual_evidence_claim');
 ck(object(d.safety)&&d.safety.noNumericOemLimits===true&&d.safety.noApprovedProcedures===true&&d.safety.noFieldTests===true&&d.safety.noAutomaticSapAction===true,'safety_authority');
 ck(object(d.safety)&&array(d.safety.doNot)&&d.safety.doNot.length>=5,'missing_hazard_controls');
 ck(object(d.frozenPilot)&&d.frozenPilot.baselineVersion==='1.4.11'&&d.frozenPilot.includedInFrozenSearch===false&&d.frozenPilot.newAnnexIsPostFreeze===true&&d.frozenPilot.modifiedLockedTechnicalFiles===false,'frozen_baseline_violated');
 ck(object(d.provenance)&&d.provenance.notPeerReviewed===true&&d.provenance.originalSynthesis===true,'provenance_unreviewed');
 const srcs=new Set((registry?.sources||[]).map(x=>x.id));
 const notes=d.primarySourceNotes;
 ck(array(notes)&&notes.length===7&&new Set(notes?.map(x=>x.sourceId)).size===7,'source_notes_count');
 for(const n of (array(notes)?notes:[])){
  ck(srcs.has(n.sourceId)&&text(n.supports)&&text(n.doesNotSupport),'invalid_source_note_'+n.sourceId);
 }
 const expectedIds=new Set((array(notes)?notes:[]).map(x=>x.sourceId));
 const hh=d.hypotheses;
 ck(array(hh)&&hh.length===10&&new Set(hh?.map(x=>x.id)).size===10,'hypotheses_count');
 const hi=new Set((array(hh)?hh:[]).map(x=>x.id));
 for(const h of (array(hh)?hh:[])){
  if(!object(h)){ck(false,'hypothesis_shape');continue}
  ck(h.certainty==='UNCONFIRMED'&&h.fieldTests===0&&text(h.title)&&text(h.mechanism),'unsupported_confirmation_'+h.id);
  ck(array(h.sourceIds)&&h.sourceIds.length>=2&&h.sourceIds.every(id=>expectedIds.has(id)),'hypothesis_provenance_'+h.id);
  ck(array(h.discriminatingQuestions)&&h.discriminatingQuestions.length>=2&&h.discriminatingQuestions.every(x=>text(x)),'missing_questions_'+h.id);
  ck(array(h.competingInterpretations)&&h.competingInterpretations.length>=2&&h.competingInterpretations.every(x=>text(x)),'missing_counterclaim_'+h.id);
  for(const forbidden of ['operationalApproval','confirmedRootCause','verifiedSerial','oemTestPressure','machinePartNumber'])
    ck(!Object.hasOwn(h,forbidden),'extra_operational_claim_'+h.id+'_'+forbidden);
 }
 ck(array(d.scenarios)&&d.scenarios.length===8&&new Set(d.scenarios?.map(x=>x.id)).size===8,'scenarios_count');
 for(const s of (array(d.scenarios)?d.scenarios:[])){
  if(!object(s)){ck(false,'scenario_shape');continue}
  ck(array(s.hypothesisIds)&&s.hypothesisIds.length>=3&&new Set(s.hypothesisIds).size===s.hypothesisIds.length&&s.hypothesisIds.every(id=>hi.has(id)),'scenario_links_'+s.id);
  ck(array(s.missingEvidence)&&s.missingEvidence.length>=2&&s.missingEvidence.every(x=>text(x)),'missing_evidence_'+s.id);
  ck(text(s.invalidConclusion)&&s.invalidConclusion.length>30,'missing_refusal_'+s.id);
 }
 ck(array(d.documentRequirements)&&d.documentRequirements.length>=6&&new Set(d.documentRequirements?.map(x=>x.id)).size===d.documentRequirements.length,'document_requirements');
 ck(object(d.conceptualHeatBalance)&&array(d.conceptualHeatBalance.paths)&&d.conceptualHeatBalance.paths.length===4,'heat_balance_paths');
 ck(array(d.crossLinks)&&d.crossLinks.length>=2,'cross_document_refs');
 return errors;
}
