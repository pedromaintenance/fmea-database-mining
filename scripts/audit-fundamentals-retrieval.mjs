#!/usr/bin/env node
/**
 * Reproducibility check for a deterministic, closed-set keyword baseline.
 * Passing 50 questions does NOT evaluate any generative model's factual accuracy,
 * generalization or field safety.
 */
import fs from 'node:fs';
import {ALIASES,retrieveFundamentals} from './lib/fundamentals-retrieval.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const golden=read('data/quality/fundamentals-retrieval-golden.v1.json');
const files=[
 'data/knowledge/fundamentals/hydraulic-cavitation.v2.json',
 'data/knowledge/fundamentals/hydraulic-aeration.v2.json',
 'data/knowledge/fundamentals/particulate-abrasive-wear.v2.json',
 'data/knowledge/fundamentals/lubricating-film.v2.json',
 'data/knowledge/fundamentals/solid-contamination.v2.json',
 'data/knowledge/fundamentals/rolling-contact-fatigue.v2.json'
];
const records=files.map(p=>({...read(p),__path:p}));
const registry=read('data/research/sources.v1.json');
const sourceIds=new Set(registry.sources.map(x=>x.id));
const failures=[],cases=[];
const check=(id,pass)=>{if(!pass)failures.push(id)};
const fixed=new Set(records.map(x=>x.id));
check('golden_header',golden.schema==='fmea-mining.fundamentals-retrieval-golden.v1'&&golden.version==='1.4.4'&&golden.scope==='six_conceptual_foundational_records_only');
check('golden_count',golden.cases.length===50&&new Set(golden.cases.map(x=>x.id)).size===50);
check('record_ids',records.length===6&&fixed.size===6&&Object.keys(ALIASES).length===6&&Object.keys(ALIASES).every(x=>fixed.has(x)));
const groups={};let allMatched=0,abstained=0,ambiguous=0,found=0;
for(const item of golden.cases){
 const result=retrieveFundamentals(item.question,records);
 const expected=[...item.expectedIds].sort(),actual=result.hits.map(h=>h.id).sort();
 const ok=result.status===item.expectedStatus&&JSON.stringify(expected)===JSON.stringify(actual);
 groups[item.expectedStatus]=(groups[item.expectedStatus]||0)+1;
 if(ok)allMatched++;
 if(result.status==='FOUND_CONCEPTUAL')found++;
 if(result.status==='MULTIPLE_CONCEPTS')ambiguous++;
 if(result.status==='ABSTAIN_UNSUPPORTED_OPERATIONAL'||result.status==='NOT_FOUND_IN_CATALOG')abstained++;
 check(item.id,ok);
 check(item.id+'_source_integrity',result.hits.every(h=>fixed.has(h.id)&&h.sourceIds.every(s=>sourceIds.has(s))&&h.path===records.find(x=>x.id===h.id).__path));
 cases.push({id:item.id,question:item.question,expectedStatus:item.expectedStatus,observedStatus:result.status,expectedIds:expected,returnedIds:actual,passed:ok});
}
check('exact_population',groups.FOUND_CONCEPTUAL===36&&groups.ABSTAIN_UNSUPPORTED_OPERATIONAL===8&&groups.MULTIPLE_CONCEPTS===4&&groups.NOT_FOUND_IN_CATALOG===2);
check('private_data_not_in_output',cases.every(x=>!JSON.stringify(x).includes('assetSerial')&&!JSON.stringify(x).includes('confirmedRootCause')));
check('no_approved_claims',records.every(x=>x.evidenceClass==='CONCEPTUAL'&&x.reviewStatus==='PENDING_REVIEW'&&x.operationalApproval===false&&x.sapMappingApproved===false&&x.automaticDiagnosisAllowed===false));
check('match_all_golden',allMatched===50);
const report={
 schema:'fmea-mining.fundamentals-retrieval-baseline-report.v1',version:'1.4.4',
 nature:'closed_set_non_independent_keyword_baseline_not_an_agent_benchmark',
 note:'Questions and aliases were authored together. This measures deterministic query/routing stability only, NOT AI factual accuracy, real-world diagnosis, precision on unseen questions or independent validation.',
 scope:golden.scope,status:failures.length?'FAIL':'PASS',
 questions:cases.length,exactStatusAndIdMatches:allMatched,closedSetMatchRate:allMatched/cases.length,
 returnedConceptual:found,multiConcept:ambiguous,abstentionsOrOutsideCorpus:abstained,
 expectedClassCounts:groups,operationalApprovals:0,sourceRegistryCount:registry.sources.length,
 failures,cases
};
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/fundamentals-retrieval-baseline.generated.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({schema:report.schema,version:report.version,status:report.status,questions:report.questions,exactStatusAndIdMatches:report.exactStatusAndIdMatches,counts:report.expectedClassCounts,failures:report.failures},null,2));
process.exit(failures.length?1:0);
