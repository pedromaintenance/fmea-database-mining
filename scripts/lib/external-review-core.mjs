/**
 * Technical retrieval external-review protocol v1.4.7.
 * Human-authored judgments are inputs, NEVER inferred from model answers.
 * No network, mutable repository state, or machine-specific instructions.
 */
export const REVIEW_STATUS=Object.freeze([
 'FOUND_CONCEPTUAL','MULTIPLE_CONCEPTS','ABSTAIN_UNSUPPORTED_OPERATIONAL',
 'NOT_FOUND_IN_CATALOG','NEEDS_ADJUDICATION'
]);
export const REVIEW_CATEGORY=Object.freeze([
 'explanation','differential','operational_decision','out_of_scope','other'
]);
const sameSet=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
const division=(n,d)=>d?Number((n/d).toFixed(6)):null;
export function checkReviewBatch(batch,{engineSha256,corpusSha256,recordIds}){
 const errors=[];
 const fail=(label,ok)=>{if(!ok)errors.push(label)};
 const obj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
 const d=batch?.reviewerDeclaration||{};
 fail('schema',batch?.schema==='fmea-mining.external-review-batch.v1'&&batch?.version==='1.4.7');
 fail('nature',batch?.nature==='self_attested_external_questions_and_blind_human_labels');
 fail('engine_sha256',batch?.engineSha256===engineSha256);
 fail('corpus_sha256',batch?.corpusSha256===corpusSha256);
 fail('reviewer_declaration',obj(d)&&['questionsOutsideDevelopment','reviewerNotInEngineDevelopment','predictionsHiddenUntilLabelsFrozen','redactedPublicSafe'].every(k=>typeof d[k]==='boolean')&&['individual_human','independent_panel','internal_calibration'].includes(d.judgementMethod)&&typeof d.notes==='string'&&d.notes.length<=600);
 const cases=batch?.cases;
 fail('case_array',Array.isArray(cases)&&cases.length>=1&&cases.length<=100);
 if(Array.isArray(cases)){
  const seen=new Set();
  cases.forEach((c,i)=>{
   const prefix='case_'+i+'_';
   fail(prefix+'shape',obj(c)&&Object.keys(c).sort().join(',')==='category,expectedIds,expectedStatus,id,question,rationale,reviewedBeforePrediction');
   if(!obj(c))return;
   fail(prefix+'id',/^EXT-[0-9]{3}$/.test(c.id||'')&&!seen.has(c.id));seen.add(c.id);
   fail(prefix+'question',typeof c.question==='string'&&c.question.trim().length>=12&&c.question.length<=1000);
   fail(prefix+'status',REVIEW_STATUS.includes(c.expectedStatus));
   fail(prefix+'category',REVIEW_CATEGORY.includes(c.category));
   fail(prefix+'rationale',typeof c.rationale==='string'&&c.rationale.trim().length>=15&&c.rationale.length<=1500);
   fail(prefix+'blind_label',c.reviewedBeforePrediction===true);
   const ids=c.expectedIds;
   fail(prefix+'ids',Array.isArray(ids)&&ids.length<=10&&new Set(ids).size===ids.length&&ids.every(x=>recordIds.includes(x)));
   if(Array.isArray(ids)){
    if(c.expectedStatus==='FOUND_CONCEPTUAL')fail(prefix+'single_expected',ids.length===1);
    if(c.expectedStatus==='MULTIPLE_CONCEPTS')fail(prefix+'multiple_expected',ids.length>=2);
    if(['ABSTAIN_UNSUPPORTED_OPERATIONAL','NOT_FOUND_IN_CATALOG','NEEDS_ADJUDICATION'].includes(c.expectedStatus))
     fail(prefix+'no_expected',ids.length===0);
   }
  });
 }
 return errors;
}
export function evaluateReviewBatch(batch,records,retrieve,{engineSha256,corpusSha256}){
 const ids=records.map(r=>r.id);
 const errors=checkReviewBatch(batch,{engineSha256,corpusSha256,recordIds:ids});
 if(errors.length)return {schema:'fmea-mining.external-review-report.v1',version:'1.4.7',status:'INVALID_INPUT',errors,scoredCases:0,metrics:null,cases:[]};
 const evaluated=[],totals={
 submitted:batch.cases.length,scored:0,unresolved:0,exactStatusAndIds:0,
 anyExpectedConceptRetrieved:0,allExpectedConceptsRetrieved:0,conceptQuestions:0,
 unsafeExpected:0,explicitUnsafeAbstention:0,unsafeConceptualLeakage:0,
 falseOperationalAbstentions:0,sourceIntegrityFailures:0
 };
 const byCategory={};
 const validIds=new Set(ids);
 const referencesValid=new Set(records.flatMap(r=>r.provenance.sourceNotes.map(x=>x.sourceId)));
 for(const c of batch.cases){
  const response=retrieve(c.question,records);
  const observed=(response.hits||[]).map(h=>h.id).sort();
  const gold=[...c.expectedIds].sort();
  const srcValid=(response.hits||[]).every(h=>
    validIds.has(h.id)&&referencesValid.size>=0 &&
    records.some(r=>r.id===h.id&&h.path===r.__path&&sameSet(h.sourceIds||[],r.provenance.sourceNotes.map(x=>x.sourceId)))
  );
  if(!srcValid)totals.sourceIntegrityFailures++;
  const unresolved=c.expectedStatus==='NEEDS_ADJUDICATION';
  const exact=!unresolved&&response.status===c.expectedStatus&&sameSet(observed,gold);
  const isConcept=['FOUND_CONCEPTUAL','MULTIPLE_CONCEPTS'].includes(c.expectedStatus);
  if(unresolved)totals.unresolved++;
  else {
   totals.scored++;
   if(exact)totals.exactStatusAndIds++;
   if(isConcept){
    totals.conceptQuestions++;
    if(gold.some(id=>observed.includes(id)))totals.anyExpectedConceptRetrieved++;
    if(gold.every(id=>observed.includes(id)))totals.allExpectedConceptsRetrieved++;
   }
   if(c.expectedStatus==='ABSTAIN_UNSUPPORTED_OPERATIONAL'){
    totals.unsafeExpected++;
    if(response.status==='ABSTAIN_UNSUPPORTED_OPERATIONAL')totals.explicitUnsafeAbstention++;
    if(['FOUND_CONCEPTUAL','MULTIPLE_CONCEPTS'].includes(response.status))totals.unsafeConceptualLeakage++;
   }
   if(isConcept&&response.status==='ABSTAIN_UNSUPPORTED_OPERATIONAL')totals.falseOperationalAbstentions++;
  }
  if(!byCategory[c.category])byCategory[c.category]={submitted:0,scored:0,exact:0};
  const b=byCategory[c.category];b.submitted++;if(!unresolved){b.scored++;if(exact)b.exact++}
  evaluated.push({
   id:c.id,category:c.category,question:c.question,goldStatus:c.expectedStatus,
   goldIds:gold,predictedStatus:response.status,predictedIds:observed,
   sourceIntegrityValid:srcValid,exactStatusAndIds:unresolved?null:exact,
   safetyConsequence:c.expectedStatus==='ABSTAIN_UNSUPPORTED_OPERATIONAL'&&['FOUND_CONCEPTUAL','MULTIPLE_CONCEPTS'].includes(response.status)?'POTENTIAL_UNSAFE_LEAKAGE':null
  });
 }
 const a=batch.reviewerDeclaration;
 const selfAttested= a.questionsOutsideDevelopment&&a.reviewerNotInEngineDevelopment&&a.predictionsHiddenUntilLabelsFrozen&&a.redactedPublicSafe&&a.judgementMethod!=='internal_calibration';
 const qual=!selfAttested?'INDEPENDENCE_NOT_ATTESTED':totals.scored<20?'BELOW_RECOMMENDED_MINIMUM_20':'SELF_ATTESTED_REVIEW_NOT_EXTERNALLY_VERIFIED';
 const metrics=totals.scored?{
  exactStatusAndIdsRate:division(totals.exactStatusAndIds,totals.scored),
  conceptAnyExpectedRate:division(totals.anyExpectedConceptRetrieved,totals.conceptQuestions),
  conceptAllExpectedRate:division(totals.allExpectedConceptsRetrieved,totals.conceptQuestions),
  explicitUnsafeAbstentionRate:division(totals.explicitUnsafeAbstention,totals.unsafeExpected),
  unsafeConceptualLeakageRate:division(totals.unsafeConceptualLeakage,totals.unsafeExpected),
  falseAbstentionRateOnConcepts:division(totals.falseOperationalAbstentions,totals.conceptQuestions)
 }:null;
 return {
  schema:'fmea-mining.external-review-report.v1',version:'1.4.7',
  status:'MEASURED_SELF_ATTESTED_NOT_CERTIFIED',
  qualification:qual,independenceSelfAttested:!!selfAttested,
  caution:'Human judgments and independence declarations are user-supplied, not externally verified. An evaluator may be biased; this is not certified generalization, mechanical diagnosis or operational approval.',
  engineSha256,corpusSha256,totals,metrics,byCategory,cases:evaluated,
  errors:totals.sourceIntegrityFailures?['some_hits_have_unverifiable_source_or_path_links']:[]
 };
}
