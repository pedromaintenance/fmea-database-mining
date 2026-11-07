#!/usr/bin/env node
/** Uncalibrated editorial paraphrase challenge for a FROZEN lexical v1.4.4 baseline.
 * This is neither a blinded panel nor an AI/generalization benchmark.
 * Do not change aliases to improve this result within the same cycle.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {retrieveFundamentals} from './lib/fundamentals-retrieval.mjs';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const gold=json('data/quality/fundamentals-unseen-challenge.v1.json');
const prior=json('data/quality/fundamentals-retrieval-golden.v1.json');
const knownFiles=[
 'data/knowledge/fundamentals/hydraulic-cavitation.v2.json',
 'data/knowledge/fundamentals/hydraulic-aeration.v2.json',
 'data/knowledge/fundamentals/particulate-abrasive-wear.v2.json',
 'data/knowledge/fundamentals/lubricating-film.v2.json',
 'data/knowledge/fundamentals/solid-contamination.v2.json',
 'data/knowledge/fundamentals/rolling-contact-fatigue.v2.json'
];
const records=knownFiles.map(p=>({...json(p),__path:p}));
const known=new Set(records.map(r=>r.id));
const registry=new Set(json('data/research/sources.v1.json').sources.map(s=>s.id));
const script=read('scripts/lib/fundamentals-retrieval.mjs');
const hash=crypto.createHash('sha1').update('blob '+Buffer.byteLength(script)+'\0').update(script).digest('hex');
const checks=[],errors=[],matches=[],byClass={};
function assert(name,condition){checks.push({name,passed:!!condition});if(!condition)errors.push(name)}
assert('frozen_keyword_blob',hash===gold.frozenLexicalScriptBlobSha&&hash==='4d4356489691200c97c65b64660aaabc99fcfe3d');
assert('challenge_is_post_baseline',gold.baselineCommit==='50caa628f9123a0efaf3d39ff75d24663de9b848'&&gold.nature.includes('not_independent_external'));
assert('24_distinct_cases',gold.cases.length===24&&new Set(gold.cases.map(c=>c.id)).size===24);
assert('no_duplicate_prior_phrasing',gold.cases.every(c=>!prior.cases.some(p=>p.question.normalize('NFD').toLowerCase()===c.question.normalize('NFD').toLowerCase())));
assert('expected_classes_valid',gold.cases.filter(c=>c.expectedStatus==='FOUND_CONCEPTUAL').length===12&&gold.cases.filter(c=>c.expectedStatus==='ABSTAIN_UNSUPPORTED_OPERATIONAL').length===6&&gold.cases.filter(c=>c.expectedStatus==='MULTIPLE_CONCEPTS').length===4&&gold.cases.filter(c=>c.expectedStatus==='NOT_FOUND_IN_CATALOG').length===2);
let unsafeConceptualLeakage=0,exactStatusAndIds=0,foundTop1=0;
for(const c of gold.cases){
 const got=retrieveFundamentals(c.question,records),observed=got.hits.map(x=>x.id).sort(),expected=[...c.expectedIds].sort();
 const exact=got.status===c.expectedStatus&&JSON.stringify(observed)===JSON.stringify(expected);
 if(exact)exactStatusAndIds++;
 const matchId=got.hits.some(h=>expected.includes(h.id));
 if(matchId)foundTop1++;
 const unsafe=c.intent==='asset_specific_unsafe_decision';
 const leak=unsafe&&(got.status==='FOUND_CONCEPTUAL'||got.status==='MULTIPLE_CONCEPTS');
 if(leak)unsafeConceptualLeakage++;
 const cls=byClass[c.intent]||(byClass[c.intent]={total:0,exact:0,unsafeConceptualLeakage:0});
 cls.total++;if(exact)cls.exact++;if(leak)cls.unsafeConceptualLeakage++;
 assert(c.id+'_hit_references_valid',got.hits.every(h=>known.has(h.id)&&records.some(r=>r.id===h.id&&r.__path===h.path)&&h.sourceIds.every(id=>registry.has(id))));
 matches.push({id:c.id,intent:c.intent,question:c.question,expectedStatus:c.expectedStatus,observedStatus:got.status,expectedIds:expected,returnedIds:observed,strictMatch:exact,foundAtLeastOneExpected:matchId,unsafeConceptualLeakage:leak});
}
assert('no_unsafe_conceptual_answer',unsafeConceptualLeakage===0);
assert('baseline_records_still_conceptual',records.length===6&&records.every(x=>x.operationalApproval===false&&x.sapMappingApproved===false&&x.automaticDiagnosisAllowed===false&&x.reviewStatus==='PENDING_REVIEW'));
const report={schema:'fmea-mining.fundamentals-uncalibrated-challenge-report.v1',version:'1.4.5',
 methodology:'Post-baseline editorial challenge run against frozen prior lexical code. Questions, correct labels and test structure were all authored by this project, with NO blind independent human or LLM evaluation. Low coverage is recorded, not remediated in this cycle.',
 baselineSha:hash,baselineFrozen:true,corpusSize:records.length,status:errors.length?'INTEGRITY_FAIL':'MEASURED',
 questions:gold.cases.length,strictStatusAndIdMatches:exactStatusAndIds,strictMatchRate:exactStatusAndIds/gold.cases.length,
 atLeastOneExpectedId:foundTop1,unsafeConceptualLeakage,byClass,integrityChecks:checks.length,errors,cases:matches,
 recommendation:'Review unanswered paraphrases and unsafe misses in an independently governed subsequent cycle, not by optimizing to this set now.'};
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/fundamentals-uncalibrated-challenge.generated.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,questions:report.questions,strictMatches:report.strictStatusAndIdMatches,rate:report.strictMatchRate,unsafeConceptualLeakage,byClass:report.byClass,errors},null,2));
process.exit(errors.length?1:0);
