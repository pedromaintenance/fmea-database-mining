/** Offline editorial queue. No authenticated human or operational authority. */
export const ADJUDICATION_CHOICES=['PENDING','REQUEST_MORE_REVIEWS','REQUEST_OEM_EVIDENCE','REWRITE_INTERPRETATION','WITHDRAW_ASSOCIATION','KEEP_UNVALIDATED'];
export const ADJUDICATION_REASONS=['SAFETY','OEM_APPLICABILITY','MECHANISM','CAUSAL_BOUNDARY','OBSERVABILITY','SAMPLING','WEAK_COUNTERPROOF','REVIEW_INDEPENDENCE'];
const keys=(o,w)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).sort().join('|')===[...w].sort().join('|');
const sha=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const header=['schema','version','sourceSha256','pairSha256','nature','approved','authenticatedAdjudication','independenceVerified','sapChanged','assetReleased','rows'];
const rowKeys=['alternativeId','triageState','decision','reason','evidenceRef'];
export function allowedAdjudicationChoices(result,row){
 if(result.status==='NO_REVIEW_EVIDENCE')return ['PENDING'];
 if(result.status==='POSSIBLE_DUPLICATE_SUBMISSIONS')return ['PENDING','REQUEST_MORE_REVIEWS'];
 if(row.state==='SAFETY_CONCERN')return ADJUDICATION_CHOICES.filter(x=>x!=='KEEP_UNVALIDATED');
 if(row.state==='INCOMPLETE')return ['PENDING','REQUEST_MORE_REVIEWS','REQUEST_OEM_EVIDENCE'];
 return ADJUDICATION_CHOICES;
}
export function makeAdjudicationDraft(result,bridge,sourceSha,pairSha){
 const ids=bridge?.scenarios?.flatMap(s=>s.alternatives.map(a=>a.id))||[];
 if(ids.length!==18||!sha(sourceSha)||!sha(pairSha)||result?.status==='INVALID_INPUT_REJECTED'||
 result?.sourceSha256!==sourceSha||result?.rows?.length!==18||result.rows.some((r,i)=>r.alternativeId!==ids[i]))
  throw Error('Incompatible comparison, source or digest');
 return {schema:'fmea-mining.diesel-bridge-adjudication-draft.v1',version:'1.4.19',
 sourceSha256:sourceSha,pairSha256:pairSha,nature:'anonymous_private_editorial_proposals_only',
 approved:false,authenticatedAdjudication:false,independenceVerified:false,sapChanged:false,assetReleased:false,
 rows:result.rows.map(r=>({alternativeId:r.alternativeId,triageState:r.state,decision:'PENDING',reason:null,evidenceRef:null}))};
}
export function validateAdjudicationDraft(d,result,bridge,sourceSha,pairSha){
 const err=[],ck=(b,id)=>{if(!b)err.push(id)};
 try{makeAdjudicationDraft(result,bridge,sourceSha,pairSha)}catch{err.push('source_pair_or_comparison')}
 ck(keys(d,header),'top_allowlist');
 if(!d||typeof d!=='object'||Array.isArray(d))return err;
 ck(d.schema==='fmea-mining.diesel-bridge-adjudication-draft.v1'&&d.version==='1.4.19','identity');
 ck(sha(d.sourceSha256)&&d.sourceSha256===sourceSha&&sha(d.pairSha256)&&d.pairSha256===pairSha,'hashes');
 ck(d.nature==='anonymous_private_editorial_proposals_only','nature');
 ck(d.approved===false&&d.authenticatedAdjudication===false&&d.independenceVerified===false&&
 d.sapChanged===false&&d.assetReleased===false,'no_false_authority');
 ck(Array.isArray(d.rows)&&d.rows.length===18,'row_count');
 const alts=bridge?.scenarios?.flatMap(s=>s.alternatives)||[];
 for(let i=0;i<18;i++){
  const row=Array.isArray(d.rows)?d.rows[i]:null,ref=result?.rows?.[i],alt=alts[i];
  ck(keys(row,rowKeys),'row_fields_'+i);if(!row||typeof row!=='object'||Array.isArray(row))continue;
  ck(row.alternativeId===alt?.id&&row.triageState===ref?.state,'row_binding_'+i);
  ck(allowedAdjudicationChoices(result,ref||{state:'INCOMPLETE'}).includes(row.decision),'decision_allowed_'+i);
  const pending=row.decision==='PENDING';
  ck(pending?(row.reason===null&&row.evidenceRef===null):ADJUDICATION_REASONS.includes(row.reason),'reason_'+i);
  const known=alt?.evidenceRefs||[];
  ck(row.evidenceRef===null||(typeof row.evidenceRef==='string'&&known.includes(row.evidenceRef)),'evidence_'+i);
  if(['REQUEST_OEM_EVIDENCE','REWRITE_INTERPRETATION','WITHDRAW_ASSOCIATION','KEEP_UNVALIDATED'].includes(row.decision))
   ck(row.evidenceRef!==null&&known.includes(row.evidenceRef),'evidence_required_'+i);
 }
 return err;
}
export function summarizeAdjudicationDraft(d,result,bridge,sourceSha,pairSha){
 const errors=validateAdjudicationDraft(d,result,bridge,sourceSha,pairSha);
 if(errors.length)return {status:'INVALID',errors};
 return {status:'PRIVATE_EDITORIAL_PROPOSALS_ONLY',proposals:d.rows.filter(x=>x.decision!=='PENDING').length,
 pending:d.rows.filter(x=>x.decision==='PENDING').length,
 criticalSafetyCases:result.rows.filter(x=>x.state==='SAFETY_CONCERN').length,
 independentHumanAdjudications:0,approvedMachines:0,implementedEdits:0};
}
