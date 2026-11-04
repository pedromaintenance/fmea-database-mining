#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {buildHydraulicPeerReviewTemplate,validateHydraulicPeerReview,EXPERT_REVIEW_FIELDS,EXPERT_REVIEW_ROW_FIELDS,EXPERT_REVIEW_DIMENSIONS,EXPERT_REVIEW_RATINGS,EXPERT_REVIEW_TAGS} from './lib/hydraulic-expert-review.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const baseline={
 benchmark:read('data/quality/hydraulic-diagnostic-reasoning-benchmark.v1.json'),
 protocol:read('data/quality/hydraulic-expert-review-protocol.v1.json'),
 sheet:read('data/quality/hydraulic-expert-review-sheet.v1.json'),
 schema:read('schemas/hydraulic-expert-review-sheet.schema.json'),
 circuit:read('data/quality/hydraulic-circuit-differential.v1.json'),
 sources:read('data/research/sources.v1.json'),
 html:fs.readFileSync(path.join(root,'docs/revisao-hidraulica-especialistas.html'),'utf8')
};
const clone=x=>structuredClone(x),eq=(x,y)=>JSON.stringify(x)===JSON.stringify(y),fail=(v,k,e)=>{if(!v)e.push(k)};
const expectedIds=Array.from({length:20},(_,i)=>'HY-DRILL-'+String(i+1).padStart(2,'0'));
const expectedKeys=Object.fromEntries(Array.from({length:10},(_,i)=>[expectedIds[i*2],'VERIFY_OEM_DISCRIMINANT']).concat(
 [['HY-DRILL-02','SAFETY_STOP'],['HY-DRILL-04','RECONCILE_OBSERVABILITY'],['HY-DRILL-06','RECONCILE_OBSERVABILITY'],
 ['HY-DRILL-08','SAFETY_STOP'],['HY-DRILL-10','SAFETY_STOP'],['HY-DRILL-12','SAFETY_STOP'],
 ['HY-DRILL-14','SAFETY_STOP'],['HY-DRILL-16','SAFETY_STOP'],['HY-DRILL-18','RECONCILE_OBSERVABILITY'],['HY-DRILL-20','RECONCILE_OBSERVABILITY']]));
const policyKeys=['gabaritoHiddenFromReviewInterface','referenceAnswerPreservedUntilHumanCuration','noVerifiedExpertIdentityInPublicTool','noExpertEndorsementImplied','ratingIsEditorialNotOperational','disagreementTriggersManualEditorialReview','noAutomaticBenchmarkAnswerUpdate','noQualifyingExamOrCertificate','noPrivateFieldsOrFreeTextInExport','noRealAssetTagsOrSerials','noFieldMeasurementsOrOEMLicensedContent','noSAPOrOperatingApproval','replaysAndRoleClaimsNotCryptographicallyVerified'];
const expectedDim=['safety_boundary','causal_discrimination','oem_effectivity','observability','distractor_quality'];
const expectedIssueTags=['unsafe_action_risk','premature_cause','oem_applicability','observability_gap','answer_key_ambiguity','distractor_unrealistic','explanation_weak','editorial_other'];
const expectedRatings=['unreviewed','adequate','needs_revision','critical_issue'];
function validateAll(b){
 const err=[],ck=(v,id)=>fail(v,id,err);
 const {benchmark:d,protocol:p,sheet, schema, circuit, sources, html}=b;
 ck(d.schema==='fmea-mining.hydraulic-diagnostic-reasoning-benchmark.v1'&&d.version==='1.3.94'&&d.entries.length===20&&circuit.records.length===10,'benchmark_version_and_count');
 ck(d.policy.independentOemReviewStillRequired===true&&d.policy.noActualMeasurements===true&&d.policy.noOperatingRelease===true&&d.policy.privateGates==='NO_GO','benchmark_safety');
 ck(eq(d.entries.map(x=>x.id),expectedIds)&&d.entries.every(x=>x.expectedChoiceCode===expectedKeys[x.id]),'benchmark_answer_key_integrity');
 ck(d.entries.every(x=>x.requiredBoundary==='conceptual_education_no_operational_authority'&&x.operatingRelease===false&&x.oemSerialVerified===false&&x.actualMeasurements===null&&x.confirmedRootCause===null),'benchmark_fake_approval');
 const sourceIds=new Set(sources.sources.map(s=>s.id)),scenarioIds=new Set(circuit.records.map(x=>x.id));
 ck(d.entries.every(x=>scenarioIds.has(x.scenarioId)&&x.sourceIds.length===3&&x.sourceIds.every(id=>sourceIds.has(id))),'benchmark_source_traceability');
 ck(p.schema==='fmea-mining.hydraulic-expert-review-protocol.v1'&&p.version==='1.3.95'&&p.sourceBenchmarkVersion==='1.3.94'&&p.nature==='public_synthetic_editorial_peer_review_not_a_verified_expert_opinion','protocol_version');
 ck(eq(p.dimensions.map(x=>x.id),expectedDim)&&p.dimensions.every(x=>x.question.length>60),'rubric_quality');
 ck(eq(p.allowedRatings,expectedRatings)&&eq(p.issueTags.map(x=>x.code),expectedIssueTags),'rubric_enumerations');
 ck(eq(Object.keys(p.reviewRules),policyKeys)&&Object.values(p.reviewRules).every(x=>x===true),'review_safety_flags');
 ck(p.humanExpertReviewsReceived===0&&p.engineeringApprovals===0&&p.realTrainingCertificates===0,'no_review_or_certification_claim');
 ck(p.dataProhibited.length===13&&p.dataProhibited.includes('serialNumber')&&p.dataProhibited.includes('comments'),'public_privacy_prohibitions');
 ck(schema.additionalProperties===false&&eq(schema.required,EXPERT_REVIEW_FIELDS)&&schema.properties.rows.minItems===20&&schema.properties.rows.maxItems===20&&schema.properties.rows.items.additionalProperties===false,'export_schema_locked');
 ck(eq(schema.properties.rows.items.required,EXPERT_REVIEW_ROW_FIELDS)&&eq(schema.properties.rows.items.properties.ratings.required,EXPERT_REVIEW_DIMENSIONS),'schema_rubric_fields');
 ck(eq(EXPERT_REVIEW_DIMENSIONS,expectedDim)&&eq(EXPERT_REVIEW_RATINGS,expectedRatings)&&eq(EXPERT_REVIEW_TAGS,expectedIssueTags),'runtime_rubric_constants');
 let template=null;try{template=buildHydraulicPeerReviewTemplate(d,p)}catch(x){err.push('builder_exception_'+x.message)}
 ck(template!==null&&eq(template,sheet),'snapshot_reproducible');
 const result=validateHydraulicPeerReview(d,p,sheet);
 ck(result.status==='EDITORIAL_FEEDBACK_ONLY'&&result.errors.length===0&&result.independentlyApproved===false&&result.reviewCompleted===false&&result.summary?.ratedCases===0,'empty_review_sheet_not_signed');
 ck(sheet.rows.length===20&&sheet.rows.every(x=>x.recommendedChoiceCode===null&&x.issueTags.length===0&&Object.values(x.ratings).every(v=>v==='unreviewed')),'no_fake_peer_reviews');
 ck(html.includes('FMEA 1.3.95')&&html.includes('PUBLIC_REVIEW_DATA')&&html.includes('Importar sessão JSON')&&html.includes('Exportar feedback JSON'),'offline_ui_present');
 ck(!/expectedChoiceCode|\.engineeringExplanation|\.feedback\b|localStorage|sessionStorage|\bfetch\s*\(|XMLHttpRequest|sendBeacon|<script\s+src/i.test(html),'blinded_offline_privacy');
 const match=html.match(/<script>([\s\S]*?)<\/script>/);
 ck(!!match,'inline_html_script_present');
 if(match){
  const js=match[1];try{new vm.Script(js,{filename:'revisao-hidraulica-especialistas.html'})}catch(x){err.push('html_syntax_'+x.message)}
  const beforeNode=js.split('function node(tag')[0];
  try{
   const ctx=vm.createContext({});
   new vm.Script(beforeNode+'\nthis.__test={data:PUBLIC_REVIEW_DATA,dimensions:PUBLIC_REVIEW_DIMENSIONS,ratings:PUBLIC_REVIEW_RATINGS,tags:PUBLIC_REVIEW_TAGS,isValid,rootExport};').runInContext(ctx,{timeout:500});
   const embedded=Array.from(ctx.__test.data);
   ck(embedded.length===20&&embedded.every((x,i)=>x.caseId===d.entries[i].id&&x.scenarioId===d.entries[i].scenarioId&&x.simulatedContext===d.entries[i].simulatedContext&&x.question===d.entries[i].question&&eq(Array.from(x.choices).map(c=>({code:c.code,label:c.label})),d.entries[i].choices.map(c=>({code:c.code,label:c.label})))),'html_embedded_cases');
   ck(ctx.__test.isValid(JSON.parse(JSON.stringify(sheet)))===true,'html_import_baseline');
   const altered=clone(sheet);altered.rows[0].serialNumber='REAL-COMPONENT-PRIVATE';
   ck(ctx.__test.isValid(altered)===false,'html_import_blocks_extra_sensitive_data');
  }catch(x){err.push('html_parity_exception_'+x.message)}
 }
 return err;
}
const errors=validateAll(baseline);
const positive=clone(baseline.sheet);
for(let i=0;i<positive.rows.length;i++){
 const row=positive.rows[i],caseSource=baseline.benchmark.entries[i];
 row.recommendedChoiceCode=caseSource.choices[0].code;
 row.ratings.safety_boundary='adequate';
 row.ratings.distractor_quality=i%3===0?'critical_issue':'needs_revision';
 if(i%4===0)row.issueTags=['answer_key_ambiguity'];
}
const valid=validateHydraulicPeerReview(baseline.benchmark,baseline.protocol,positive);
if(valid.status!=='EDITORIAL_FEEDBACK_ONLY'||valid.summary.ratedCases!==20||valid.reviewCompleted!==false||valid.independentlyApproved!==false)errors.push('positive_anonymous_feedback');
const baselineChoice=baseline.benchmark.entries[0].expectedChoiceCode,wrong=baseline.benchmark.entries[0].choices.find(x=>x.code!==baselineChoice).code;
const divergence=clone(baseline.sheet);divergence.rows[0].recommendedChoiceCode=wrong;
const dResult=validateHydraulicPeerReview(baseline.benchmark,baseline.protocol,divergence);
if(dResult.status!=='EDITORIAL_FEEDBACK_ONLY'||dResult.summary.possibleKeyDisagreements!==1||dResult.independentlyApproved!==false)errors.push('disagreement_does_not_approve_rekey');
const mutations=[];
function attack(id,fn){
 const x=clone(baseline);fn(x);let rejected=false;
 try{rejected=validateAll(x).length>0}catch(e){rejected=true}
 mutations.push({id,rejected});if(!rejected)errors.push('mutation_accepted_'+id);
}
attack('root_name_leak',x=>x.sheet.reviewerName='PRIVATE_PERSON');
attack('root_company_email',x=>x.sheet.companyEmail='private@example.com');
attack('root_asset_number',x=>x.sheet.assetTag='040-003');
attack('root_wrong_version',x=>x.sheet.version='1.3.96');
attack('root_wrong_nature',x=>x.sheet.nature='human_approved');
attack('root_train_flag',x=>x.sheet.trainingOnly=false);
attack('root_human_verification',x=>x.sheet.humanIdentityVerified=true);
attack('root_engineering_approval',x=>x.sheet.engineeringApproved=true);
attack('root_operational_release',x=>x.sheet.operationalRelease=true);
attack('root_SAP_approval',x=>x.sheet.sapApproved=true);
attack('missing_case',x=>x.sheet.rows.pop());
attack('extra_case',x=>x.sheet.rows.push(clone(x.sheet.rows[0])));
attack('duplicate_case_id',x=>x.sheet.rows[1].caseId=x.sheet.rows[0].caseId);
attack('case_id_fabricated',x=>x.sheet.rows[0].caseId='REAL-SERIAL-123');
attack('wrong_scenario',x=>x.sheet.rows[0].scenarioId='HC-DIFF-10');
attack('unrelated_choice',x=>x.sheet.rows[0].recommendedChoiceCode='NOT_A_RESPONSE');
attack('invalid_rating',x=>x.sheet.rows[0].ratings.safety_boundary='approved');
attack('rating_missing',x=>delete x.sheet.rows[0].ratings.observability);
attack('rating_injected_field',x=>x.sheet.rows[0].ratings.mechanicName='REAL');
attack('issue_unknown',x=>x.sheet.rows[0].issueTags=['OEM-123']);
attack('issue_duplicate',x=>x.sheet.rows[0].issueTags=['answer_key_ambiguity','answer_key_ambiguity']);
attack('case_extra_comment',x=>x.sheet.rows[0].comments='private note');
attack('case_private_url',x=>x.sheet.rows[0].privateURL='https://private.invalid');
attack('case_serial_field',x=>x.sheet.rows[0].serialNumber='REAL-SERIAL');
attack('policy_disable_no_auto_rekey',x=>x.protocol.reviewRules.noAutomaticBenchmarkAnswerUpdate=false);
attack('policy_allow_private_feedback',x=>x.protocol.reviewRules.noPrivateFieldsOrFreeTextInExport=false);
attack('policy_allow_SAP',x=>x.protocol.reviewRules.noSAPOrOperatingApproval=false);
attack('policy_remove_dimension',x=>x.protocol.dimensions.pop());
attack('policy_remove_issue_category',x=>x.protocol.issueTags.pop());
attack('policy_add_approval_rating',x=>x.protocol.allowedRatings.push('approved'));
attack('policy_claim_expert_review',x=>x.protocol.humanExpertReviewsReceived=1);
attack('benchmark_wrong_answer_key',x=>x.benchmark.entries[0].expectedChoiceCode='PREMATURE_CAUSE');
attack('benchmark_fabricated_measurement',x=>x.benchmark.entries[1].actualMeasurements=100);
attack('schema_allow_root_extension',x=>x.schema.additionalProperties=true);
attack('html_stealth_answer_exposure',x=>x.html=x.html.replace('PUBLIC_REVIEW_DATA','expectedChoiceCode_PUBLIC_REVIEW_DATA'));
attack('html_inject_network_upload',x=>x.html+='\nfetch(\'/upload\')');
const n=mutations.length,rejected=mutations.filter(x=>x.rejected).length;
if(n!==36||rejected!==36)errors.push('mutation_suite_incomplete_'+n+'_'+rejected);
const report={schema:'fmea-mining.hydraulic-expert-review-audit.v1',version:'1.3.95',
status:errors.length?'FAIL':'OK',referenceCases:baseline.benchmark.entries.length,qualityDimensions:EXPERT_REVIEW_DIMENSIONS.length,
reviewSheetUnverifiedCases:baseline.sheet.rows.length,expertReviewsRecorded:0,realFieldEvidence:0,
anonymousFeedbackCaseTests:positive.rows.length,disagreementRequiresManualCuration:true,
mutationsRejected:rejected,mutationsTotal:n,errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/hydraulic-expert-review.generated.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));process.exit(errors.length?1:0);
