/**
 * Exercício conceitual de raciocínio diagnóstico hidráulico.
 * Respostas são treinamentos sintéticos, NUNCA diagnóstico, certificação
 * profissional, prescrição de teste ou liberação de máquina.
 */
export const TRAINING_REPORT_SCHEMA='fmea-mining.hydraulic-reasoning-training-attempt.v1';
export const TRAINING_REPORT_FIELDS=['schema','catalogVersion','trainingOnly','qualificationGranted','operationalApproval','score','total','attempts'];
export const TRAINING_ATTEMPT_FIELDS=['caseId','choiceCode','correct'];
const choicesAllowed=new Set(['VERIFY_OEM_DISCRIMINANT','SAFETY_STOP','RECONCILE_OBSERVABILITY',
  'PREMATURE_CAUSE','UNSAFE_TEST','APPLY_UNRELATED_REFERENCE']);
export function gradeHydraulicReasoning(entry,chosenCode){
 const valid=entry&&typeof entry==='object'&&entry.requiredBoundary==='conceptual_education_no_operational_authority'&&
  entry.operatingRelease===false&&entry.confirmedRootCause===null&&entry.privateCorporateGate==='NO_GO'&&
  Array.isArray(entry.choices)&&entry.choices.length===3&&
  entry.choices.some(c=>c.code===entry.expectedChoiceCode);
 const selected=valid&&choicesAllowed.has(chosenCode)?entry.choices.find(c=>c.code===chosenCode):null;
 const correct=Boolean(selected&&chosenCode===entry.expectedChoiceCode);
 return Object.freeze({
  caseId:valid?entry.id:null,
  completed: Boolean(selected),
  correct,
  expectedChoiceCode:valid?entry.expectedChoiceCode:null,
  educationalFeedback:selected?selected.feedback:'Escolha ou exercício inválido; nenhuma avaliação concedida.',
  engineeringExplanation:valid?entry.engineeringExplanation:'Exercício não validado.',
  trainingOnly:true,
  operationalApproval:false,
  confirmedRootCause:false
 });
}
export function safeTrainingExport(benchmark,answers){
 const entries=Array.isArray(benchmark?.entries)?benchmark.entries:[];
 const allowed=new Map(entries.map(c=>[c.id,c]));
 const seen=new Set();
 const attempts=[];
 for(const a of Array.isArray(answers)?answers:[]){
  const id=a?.caseId,choice=a?.choiceCode;
  if(typeof id!=='string'||!allowed.has(id)||seen.has(id)||!choicesAllowed.has(choice))continue;
  const grade=gradeHydraulicReasoning(allowed.get(id),choice);
  if(!grade.completed)continue;
  seen.add(id);attempts.push(Object.freeze({caseId:id,choiceCode:choice,correct:grade.correct}));
 }
 const correctCount=attempts.reduce((n,a)=>n+(a.correct?1:0),0);
 return Object.freeze({
  schema:TRAINING_REPORT_SCHEMA,
  catalogVersion:'1.3.94',
  trainingOnly:true,
  qualificationGranted:false,
  operationalApproval:false,
  score:correctCount,
  total:attempts.length,
  attempts:Object.freeze(attempts)
 });
}
