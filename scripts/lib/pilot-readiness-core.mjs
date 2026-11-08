/**
 * Local pilot gatekeeper. Validates and interprets self-attestations only.
 * Does not confirm signatures, real participants, field authority, or data quality.
 */
export const REQUIRED_GATES=Object.freeze(Array.from({length:11},(_,i)=>'G'+String(i+1).padStart(2,'0')));
export const PHASES=Object.freeze([
 {id:'COLLECTION',required:['G01'],label:'Coleta pode ser organizada (autodeclarado)'},
 {id:'BLIND_REVIEW',required:['G01','G02','G03','G04'],label:'Pareceres cegos podem ser organizados (autodeclarado)'},
 {id:'LOCAL_SCORING',required:['G01','G02','G03','G04','G05','G06','G07','G08'],label:'Pontuação local pode ser solicitada (autodeclarado)'},
 {id:'INTERPRETATION',required:['G01','G02','G03','G04','G05','G06','G07','G08','G09'],label:'Interpretação pode ser revisada (autodeclarado)'},
 {id:'PUBLIC_SUMMARY',required:REQUIRED_GATES,label:'Resumo agregado pode ser considerado após autorização (autodeclarado)'}
]);
const allowedKeys=x=>Object.keys(x||{}).sort().join(',');
export function emptyPilotAttestation(bundle){
 return {
  schema:'fmea-mining.pilot-operational-attestation.v1',version:'1.4.10',
  nature:'self_attested_manual_gates_not_certified_evidence',
  checklistVersion:bundle.config.version,engineSha256:bundle.engineSha256,corpusSha256:bundle.corpusSha256,
  flags:Object.fromEntries(REQUIRED_GATES.map(id=>[id,false]))
 };
}
export function validatePilotAttestation(input,bundle){
 const errors=[],v=input||{};
 const keys='checklistVersion,corpusSha256,engineSha256,flags,nature,schema,version';
 if(!v||Array.isArray(v)||typeof v!=='object'||allowedKeys(v)!==keys)errors.push('invalid_attestation_shape');
 if(v.schema!=='fmea-mining.pilot-operational-attestation.v1'||v.version!=='1.4.10')errors.push('invalid_protocol_version');
 if(v.nature!=='self_attested_manual_gates_not_certified_evidence')errors.push('missing_self_attestation_disclaimer');
 if(v.checklistVersion!==bundle?.config?.version)errors.push('checklist_changed_since_attestation');
 if(v.engineSha256!==bundle?.engineSha256||v.corpusSha256!==bundle?.corpusSha256)errors.push('engine_or_corpus_fingerprint_mismatch');
 const flags=v.flags;
 if(!flags||typeof flags!=='object'||Array.isArray(flags)||allowedKeys(flags)!==REQUIRED_GATES.slice().sort().join(','))errors.push('invalid_gate_set');
 else for(const id of REQUIRED_GATES)if(typeof flags[id]!=='boolean')errors.push('nonboolean_'+id);
 return errors;
}
export function assessPilotAttestation(input,bundle){
 const errors=validatePilotAttestation(input,bundle);
 const empty=emptyPilotAttestation(bundle);
 const flags=errors.length?empty.flags:input.flags;
 const completed=REQUIRED_GATES.filter(id=>flags[id]);
 const pending=REQUIRED_GATES.filter(id=>!flags[id]);
 const contradictions=[];
 const requires=(id,ancestors)=>{
  if(flags[id])for(const required of ancestors)if(!flags[required])contradictions.push(id+'_requires_'+required);
 };
 requires('G05',['G01','G02','G03','G04']);
 requires('G06',['G01','G02','G03','G04']);
 requires('G07',['G05','G06']);
 requires('G09',['G07','G08']);
 requires('G10',['G09']);
 requires('G11',['G09','G10']);
 const phase=PHASES.map(p=>({...p,satisfied:!errors.length&&!contradictions.length&&p.required.every(id=>flags[id]),
  remaining:p.required.filter(id=>!flags[id])}));
 let status='NOT_READY';
 if(!errors.length&&!contradictions.length){
  const reached=phase.filter(p=>p.satisfied);
  if(reached.length)status=reached[reached.length-1].id+'_SELF_ATTESTED';
 }
 if(errors.length)status='INVALID_ATTESTATION';
 else if(contradictions.length)status='INCONSISTENT_SEQUENCE';
 return {
  schema:'fmea-mining.pilot-readiness-assessment.v1',version:'1.4.10',
  status,completed:completed.length,total:11,completedIds:completed,pendingIds:pending,
  contradictions,errors,phases:phase,
  humanEvidenceVerified:false,externalHumanReviewCount:null,externalRetrievalAccuracy:null,
  caution:'These are manually checked flags. Neither checked gates nor a ready phase prove authorization, participants, safe redaction, blinded review, OEM validity, or operational release.'
 };
}
