/**
 * Two-person, prediction-blind collection and human adjudication workflow.
 * Pure functions: NEVER query the retrieval engine, infer labels, or certify
 * that two self-declared reviewer roles belong to different human beings.
 */
export const CLASSES=Object.freeze([
 'FOUND_CONCEPTUAL','MULTIPLE_CONCEPTS','ABSTAIN_UNSUPPORTED_OPERATIONAL',
 'NOT_FOUND_IN_CATALOG','NEEDS_ADJUDICATION'
]);
export const CATEGORIES=Object.freeze([
 'explanation','differential','operational_decision','out_of_scope','other'
]);
const keys=o=>Object.keys(o||{}).sort().join('|');
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const idOk=x=>typeof x==='string'&&/^EXT-\d{3}$/.test(x);
const equal=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
const allIds=(items)=>new Set(items.map(x=>x.id)).size===items.length;
const sourcePrivateHint=q=>/\b\d{3}[- ]\d{3}\b|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|\b\d{8,12}\b/i.test(q);
const rate=(n,d)=>d?Number((n/d).toFixed(6)):null;

export function validateCollection(collection){
 const errors=[];
 const test=(name,ok)=>{if(!ok)errors.push(name)};
 test('header',obj(collection)&&collection.schema==='fmea-mining.question-collection.v1'&&collection.version==='1.4.8'&&collection.nature==='external_unlabelled_questions');
 if(!obj(collection))return errors;
 test('public_safe_attestation',collection.publicSafe===true);
 test('origin_self_attestation',typeof collection.outsideDevelopmentSelfAttested==='boolean');
 test('exact_fields',keys(collection)==='cases|nature|outsideDevelopmentSelfAttested|publicSafe|schema|version');
 test('nonempty_cases',Array.isArray(collection.cases)&&collection.cases.length>=1&&collection.cases.length<=100);
 if(Array.isArray(collection.cases)){
  test('unique_case_ids',allIds(collection.cases));
  const questions=new Set();
  for(const [i,c] of collection.cases.entries()){
   const prefix='collection_'+i+'_';
   test(prefix+'fields',obj(c)&&keys(c)==='id|question');if(!obj(c))continue;
   test(prefix+'id',idOk(c.id)&&c.id==='EXT-'+String(i+1).padStart(3,'0'));
   test(prefix+'question',typeof c.question==='string'&&c.question.trim().length>=12&&c.question.length<=1000);
   const norm=String(c.question||'').trim().normalize('NFD').toLowerCase();
   test(prefix+'unique_question',!questions.has(norm));questions.add(norm);
   test(prefix+'sensitive_pattern_guard',!sourcePrivateHint(c.question||''));
  }
 }
 return errors;
}
function validateRating(c,recordIds,prefix,errors){
 const test=(name,ok)=>{if(!ok)errors.push(prefix+name)};
 test('fields',obj(c)&&keys(c)==='category|expectedIds|expectedStatus|id|question|rationale|reviewedBeforePrediction');
 if(!obj(c))return;
 test('status',CLASSES.includes(c.expectedStatus));
 test('category',CATEGORIES.includes(c.category));
 test('rationale',typeof c.rationale==='string'&&c.rationale.trim().length>=15&&c.rationale.length<=1500);
 test('blind',c.reviewedBeforePrediction===true);
 test('ids',Array.isArray(c.expectedIds)&&c.expectedIds.length<=10&&new Set(c.expectedIds).size===c.expectedIds.length&&c.expectedIds.every(id=>recordIds.includes(id)));
 if(Array.isArray(c.expectedIds)){
  if(c.expectedStatus==='FOUND_CONCEPTUAL')test('one_relevant',c.expectedIds.length===1);
  if(c.expectedStatus==='MULTIPLE_CONCEPTS')test('two_or_more',c.expectedIds.length>=2);
  if(['ABSTAIN_UNSUPPORTED_OPERATIONAL','NOT_FOUND_IN_CATALOG','NEEDS_ADJUDICATION'].includes(c.expectedStatus))test('no_relevant_ids',c.expectedIds.length===0);
 }
}
export function validateBlindReview(review,collection,recordIds,role){
 const errors=[...validateCollection(collection)];
 const test=(name,ok)=>{if(!ok)errors.push('review_'+role+'_'+name)};
 test('header',obj(review)&&review.schema==='fmea-mining.blind-review.v1'&&review.version==='1.4.8'&&review.role===role);
 if(!obj(review))return errors;
 test('fields',keys(review)==='cases|declaration|role|schema|version');
 const d=review.declaration;
 test('declaration',obj(d)&&keys(d)==='didNotSeePredictions|independentOfOtherReviewer|notInEngineDevelopment|publicSafe'&&
   ['didNotSeePredictions','independentOfOtherReviewer','notInEngineDevelopment','publicSafe'].every(k=>typeof d[k]==='boolean'));
 test('length',Array.isArray(review.cases)&&review.cases.length===collection.cases.length);
 if(Array.isArray(review.cases)&&Array.isArray(collection.cases)){
  for(let i=0;i<collection.cases.length;i++){
   const c=review.cases[i],base=collection.cases[i];
   test('question_'+i,!!c&&c.id===base.id&&c.question===base.question);
   validateRating(c,recordIds,'review_'+role+'_'+i+'_',errors);
  }
 }
 return errors;
}
function ratingEqual(a,b){
 return a.expectedStatus===b.expectedStatus&&equal(a.expectedIds,b.expectedIds)&&a.category===b.category;
}
export function compareBlindReviews(collection,r1,r2,recordIds){
 const errors=[...new Set([
  ...validateBlindReview(r1,collection,recordIds,'R1'),
  ...validateBlindReview(r2,collection,recordIds,'R2')
 ])];
 if(errors.length)return {status:'INVALID_REVIEW',errors,summary:null,conflicts:[],agreed:[]};
 const classes=CLASSES;
 const matrix=Object.fromEntries(classes.map(a=>[a,Object.fromEntries(classes.map(b=>[b,0]))]));
 const conflicts=[],agreed=[];let statusAgree=0,fullAgree=0;
 for(let i=0;i<collection.cases.length;i++){
  const a=r1.cases[i],b=r2.cases[i];
  matrix[a.expectedStatus][b.expectedStatus]++;
  if(a.expectedStatus===b.expectedStatus)statusAgree++;
  const yes=ratingEqual(a,b);
  const item={id:a.id,question:a.question,r1:{status:a.expectedStatus,ids:[...a.expectedIds],category:a.category,rationale:a.rationale},
    r2:{status:b.expectedStatus,ids:[...b.expectedIds],category:b.category,rationale:b.rationale}};
  if(yes){fullAgree++;agreed.push(item)}else conflicts.push(item);
 }
 const n=collection.cases.length,observed=rate(statusAgree,n);
 let chance=0;
 for(const status of classes){
  const row=classes.reduce((s,b)=>s+matrix[status][b],0)/n;
  const col=classes.reduce((s,a)=>s+matrix[a][status],0)/n;
  chance+=row*col;
 }
 const kappa=Math.abs(1-chance)<1e-12?null:rate((statusAgree/n-chance)/(1-chance),1);
 const declared=collection.outsideDevelopmentSelfAttested===true&&
  [r1,r2].every(r=>Object.values(r.declaration).every(Boolean));
 return {status:conflicts.length?'NEEDS_ADJUDICATION':'AGREEMENT_REACHED',errors:[],
  summary:{questions:n,statusAgreement:statusAgree,fullAgreement:fullAgree,
   statusAgreementRate:observed,fullAgreementRate:rate(fullAgree,n),cohensKappaForStatus:kappa,
   kappaLimit:'small/nonrepresentative samples and degenerate marginals can make chance agreement unstable',
   independenceSelfAttested:declared,independenceExternallyVerified:false,
   reviewerIdentitiesVerified:false,peopleRepresented:'two reviewer roles, human distinctness self-attested only'},
  matrix,conflicts,agreed};
}
export function buildAdjudicatedGold(collection,r1,r2,decisions,recordIds,{engineSha256,corpusSha256}){
 const compared=compareBlindReviews(collection,r1,r2,recordIds);
 if(compared.status==='INVALID_REVIEW')return {...compared,gold:null};
 const required=new Set([...compared.conflicts.map(x=>x.id),...compared.agreed.filter(x=>x.r1.status==='NEEDS_ADJUDICATION').map(x=>x.id)]);
 const errors=[];
 if(required.size){
  if(!obj(decisions)||decisions.schema!=='fmea-mining.adjudication-decisions.v1'||decisions.version!=='1.4.8'||decisions.predictionsNotViewed!==true||!Array.isArray(decisions.decisions))errors.push('missing_blind_adjudication_file');
 }else if(decisions&&!obj(decisions))errors.push('invalid_optional_decisions');
 const decisionsById=new Map();
 if(obj(decisions)&&Array.isArray(decisions.decisions)){
  for(const item of decisions.decisions){
   if(!obj(item)||!idOk(item.id)||decisionsById.has(item.id)||!required.has(item.id))errors.push('invalid_adjudication_id');
   else decisionsById.set(item.id,item);
  }
 }
 for(const id of required)if(!decisionsById.has(id))errors.push('unresolved_'+id);
 if(errors.length)return {...compared,status:'NEEDS_ADJUDICATION',errors,gold:null};
 const agreeById=new Map(compared.agreed.filter(x=>!required.has(x.id)).map(x=>[x.id,x]));
 const cases=collection.cases.map(c=>{
  const agreement=agreeById.get(c.id),decision=decisionsById.get(c.id);
  if(agreement)return {id:c.id,question:c.question,expectedStatus:agreement.r1.status,expectedIds:agreement.r1.ids,
   rationale:agreement.r1.rationale,category:agreement.r1.category,reviewedBeforePrediction:true};
  const line={id:c.id,question:c.question,expectedStatus:decision.expectedStatus,
   expectedIds:decision.expectedIds,rationale:decision.rationale,category:decision.category,reviewedBeforePrediction:true};
  validateRating(line,recordIds,'adjudicated_'+c.id+'_',errors);
  if(keys(decision)!=='category|expectedIds|expectedStatus|id|rationale')errors.push('unexpected_decision_fields_'+c.id);
  return line;
 });
 if(errors.length)return {...compared,status:'INVALID_ADJUDICATION',errors,gold:null};
 const declarations=[r1,r2].map(r=>r.declaration),independent=collection.outsideDevelopmentSelfAttested&&declarations.every(d=>d.notInEngineDevelopment&&d.independentOfOtherReviewer&&d.didNotSeePredictions);
 const gold={schema:'fmea-mining.external-review-batch.v1',version:'1.4.7',nature:'self_attested_external_questions_and_blind_human_labels',
  engineSha256,corpusSha256,
  reviewerDeclaration:{questionsOutsideDevelopment:collection.outsideDevelopmentSelfAttested===true,
   reviewerNotInEngineDevelopment:declarations.every(d=>d.notInEngineDevelopment),
   predictionsHiddenUntilLabelsFrozen:declarations.every(d=>d.didNotSeePredictions)&&(!decisions||decisions.predictionsNotViewed===true),
   redactedPublicSafe:collection.publicSafe&&declarations.every(d=>d.publicSafe),
   judgementMethod:independent?'independent_panel':'internal_calibration',
   notes:'Two reviewer roles and blinded adjudication are self-attested, not externally verified.'},
  cases};
 return {...compared,status:'READY_GOLD_PRIVATE',errors:[],gold};
}
