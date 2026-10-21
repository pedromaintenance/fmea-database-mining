#!/usr/bin/env node
// Strict PM generator contract: not proof of applicability by OEM serial.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {auditPmCandidateSet} from './lib/pm-link-integrity.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const db=read('data/catalog/failure-db.v1.json');
const rules=read('data/knowledge/pm-prevention/seed-rules.json').records;
const generation=read('data/knowledge/pm-prevention/generated-links.json');
const audit=auditPmCandidateSet(db,rules,generation.records);
const errors=[...audit.errors];
if(generation.schema!=='fmea-mining.pm-links.v1'||generation.version!=='1.2.0'||generation.status!=='hipoteses_de_inspecao_sem_evidencia')errors.push('generation_identity_modified');
if(generation.counts.rules!==rules.length||generation.counts.generatedLinks!==generation.records.length)errors.push('generation_counts_inconsistent');
if(generation.records.length===0)errors.push('no PM candidate links generated');
console.log(JSON.stringify({status:errors.length?'FAIL':'OK',ruleCount:rules.length,generatedCandidateLinks:generation.records.length,rulesWithoutCandidates:audit.counts.rulesWithoutLinks,strictReconciliationErrors:errors.length,observedFailures:0,confirmedOemApplication:0,errors:errors.slice(0,30)},null,2));
process.exit(errors.length?1:0);
