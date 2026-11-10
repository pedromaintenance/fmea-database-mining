/** Fail-closed policy shared by diesel bridge builder and auditor. */
export const RELATIONS=new Set(['INDEPENDENT','SHARED_CONTEXT','POSSIBLE_COUPLING','MEASUREMENT_ARTIFACT']);
export function validateBridge(b,c,t,m,registry){
 const err=[],ck=(x,name)=>{if(!x)err.push(name)};
 const plain=x=>x&&typeof x==='object'&&!Array.isArray(x);
 const keys=(x,w)=>plain(x)&&Object.keys(x).sort().join('|')===w.sort().join('|');
 const str=x=>typeof x==='string'&&x.trim().length>20;
 ck(b?.schema==='fmea-mining.engine-thermal-crossfluid-bridge.v1'&&b?.version==='1.4.16','identity');
 ck(b?.nature==='source_traced_editorial_comparison_of_two_independent_dossiers_not_an_integrated_approved_diagnosis','nature');
 ck(str(b?.epistemicRule)&&b.epistemicRule.includes('não validada'),'editorial_boundary');
 ck(Array.isArray(b?.parentStudies)&&b.parentStudies.length===2&&b.parentStudies[0].path==='data/knowledge/engine-oil-coolant-differential.v1.json'&&b.parentStudies[1].path==='data/knowledge/engine-cooling-thermal-differential.v1.json','parent_paths');
 ck(b?.evidenceMatrix==='data/quality/engine-crossfluid-evidence-matrix.v1.json'&&b?.sourceRegistry==='data/research/sources.v1.json','evidence_paths');
 ck(c?.version==='1.4.13'&&t?.version==='1.4.15'&&m?.version==='1.4.14'&&registry?.sources?.length===114,'parents_versions');
 const stat=b?.status||{};
 ck(keys(stat,['evidenceClass','reviewStatus','humanReviewCompleted','assetCount','verifiedSerials','oemTestLimits','fieldTests','confirmedCauses','automaticDiagnosis','operationalApproval','sapWrites']),'status_keys');
 ck(stat.evidenceClass==='CONCEPTUAL'&&stat.reviewStatus==='PENDING_REVIEW'&&stat.humanReviewCompleted===false,'no_review_claim');
 ck(stat.assetCount===0&&Array.isArray(stat.verifiedSerials)&&stat.verifiedSerials.length===0&&stat.oemTestLimits===null&&stat.fieldTests===0&&stat.confirmedCauses===0&&stat.automaticDiagnosis===false&&stat.operationalApproval===false&&stat.sapWrites===0,'no_asset_authority');
 ck(keys(b?.relationVocabulary||{},[...RELATIONS])&&[...RELATIONS].every(k=>str(b.relationVocabulary[k])),'relation_vocabulary');
 const ha=new Map([...(c?.hypotheses||[]),...(t?.hypotheses||[])].map(h=>[h.id,h]));
 const ea=new Set([...(m?.evidence||[]).map(x=>'EC:'+x.id),...(t?.documentRequirements||[]).map(x=>'CL:'+x.id)]);
 const sources=new Set((registry?.sources||[]).map(x=>x.id));
 const used=new Set();
 ck(Array.isArray(b?.scenarios)&&b.scenarios.length===6,'six_scenarios');
 for(const s of b?.scenarios||[]){
  ck(keys(s,['id','title','observations','alternatives','distinction','fieldObservations','operationalDecision']),'scenario_keys_'+s.id);
  ck(/^BR-S0[1-6]$/.test(s.id)&&!used.has(s.id),'scenario_unique_'+s.id);used.add(s.id);
  ck(str(s.title)&&str(s.distinction)&&s.fieldObservations===0&&s.operationalDecision==='NO_AUTOMATIC_DECISION','scenario_safe_'+s.id);
  ck(Array.isArray(s.observations)&&s.observations.length===2&&s.observations.every(str),'observations_'+s.id);
  ck(Array.isArray(s.alternatives)&&s.alternatives.length===3,'alternatives_count_'+s.id);
  for(const a of s.alternatives||[]){
   ck(keys(a,['id','label','relation','hypothesisIds','evidenceRefs','why','counterEvidence','invalidConclusion','certainty']),'alternative_keys_'+a.id);
   ck(/^BR-S0[1-6]-[ABC]$/.test(a.id)&&!used.has(a.id),'alternative_unique_'+a.id);used.add(a.id);
   ck(RELATIONS.has(a.relation)&&a.certainty==='UNCONFIRMED','certainty_'+a.id);
   ck(str(a.why)&&str(a.counterEvidence)&&str(a.invalidConclusion)&&str(a.label),'discriminators_'+a.id);
   ck(Array.isArray(a.hypothesisIds)&&a.hypothesisIds.length===2&&a.hypothesisIds[0]?.startsWith('CL-')&&a.hypothesisIds[1]?.startsWith('EC-')&&a.hypothesisIds.every(id=>ha.has(id)),'hypotheses_'+a.id);
   ck(Array.isArray(a.evidenceRefs)&&a.evidenceRefs.length>=2&&a.evidenceRefs.every(id=>ea.has(id)),'evidenceRefs_'+a.id);
   for(const id of a.hypothesisIds||[]){
    const h=ha.get(id);
    if(h)ck(Array.isArray(h.sourceIds)&&h.sourceIds.length>0&&h.sourceIds.every(x=>sources.has(x)),'source_refs_'+a.id);
   }
  }
 }
 ck(b?.provenance?.crossStudyRelations==='EDITORIAL_INFERENCE_NOT_OEM_CONFIRMED'&&b.provenance.peerReview==='NOT_PERFORMED'&&b.provenance.sourceCountAdded===0,'provenance');
 ck(b?.frozenPilot?.includedInFrozenRetrieval===false&&b.frozenPilot.modifiesFrozenRecords===false&&b.frozenPilot.version==='1.4.11','frozen_untouched');
 ck(Array.isArray(b?.safety?.never)&&b.safety.never.length>=5&&b.safety.never.some(s=>/termostato/i.test(s))&&b.safety.never.some(s=>/alarme/i.test(s))&&str(b.safety.allowed),'safety');
 return err;
}
