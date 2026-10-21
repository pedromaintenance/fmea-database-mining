#!/usr/bin/env node
/* Gate para versão independente do contrato público — não altera consumidores. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const policy=read('data/governance/public-export-policy.v1.json');
const contract=read('data/governance/public-contract.v1.json');
const regressions=read('data/quality/contract-compatibility-regressions.v1.json');
const pub=read('reports/public-knowledge.v1.json');
const manifest=read('reports/public-manifest.v1.json');
const raw=fs.readFileSync(path.join(root,'reports/public-knowledge.v1.json'));
const err=[];const check=(v,m)=>{if(!v)err.push(m)};
const sorted=a=>[...a].sort().join('|');
function categorize(c){
 if(c.promotesCausalState)return 'reject';
 if(c.changedPublicFields.length||c.removedPublicFields.length||c.changedMeanings.length||c.removedStableIds.length)return 'major';
 if(c.safeOptionalAdditions.length)return 'minor';
 return 'patch';
}
check(contract.schema==='fmea-mining.public-contract.v1'&&contract.version==='1.3.33'&&contract.contractVersion==='1.0.0','Versões contratuais inválidas');
check(contract.existingPreviewSchema===pub.schema&&contract.existingPreviewVersion===pub.version,'Contrato congelado mudou');
check(contract.existingManifestSchema===manifest.schema,'Schema do manifesto alterado');
check(contract.versioningPolicy.independentFromPackageRelease===true&&contract.versioningPolicy.noSilentSchemaDrift===true&&contract.versioningPolicy.enforceFormerPreviewByteIdentityUntilExplicitRevision===true,'Mudança silenciosa habilitada');
check(contract.versioningPolicy.noAutomaticEvidencePromotion===true,'Diagnóstico automático passou a ser permitido');
const base=contract.compatibilityReference;
check(base.sourceRelease==='1.3.12','Baseline incorreto');
check(sorted(base.publicChainFields)===sorted(policy.allowedChainFields),'Campos públicos mudaram sem contrato');
check(sorted(base.publicSourceFields)===sorted(policy.allowedSourceFields),'Campos de fontes mudaram sem contrato');
check(pub.records.length===base.recordCount&&pub.sources.length===base.sourceCount,'Contagem do snapshot público mudou');
const sha=crypto.createHash('sha256').update(raw).digest('hex');
check(sha===base.sha256&&manifest.sha256===base.sha256,'Hash do preview v1.3.12 mudou sem revisão do contrato');
for(const row of pub.records){
 check(row.nature==='hypothesis_not_event'&&row.reviewStatus==='inferido_com_literatura_geral'&&row.empiricalOccurrences===0&&row.confirmedRootCause===false,'Promoção causal indevida '+row.id);
 check(row.applicability.modelId===null&&row.applicability.locationId===null&&row.applicability.serialOrArrangement===null,'Aplicabilidade não homologada '+row.id);
}
check(regressions.nature==='synthetic_only'&&regressions.cases.length===8,'Fixtures semânticos inválidos');
const used=new Set();
for(const item of regressions.cases){
 check(!used.has(item.id),'Teste duplicado '+item.id);used.add(item.id);
 for(const k of ['changedPublicFields','removedPublicFields','changedMeanings','removedStableIds','safeOptionalAdditions'])
  check(Array.isArray(item[k]),'Campo sintético inválido '+item.id+'/'+k);
 check(categorize(item)===item.expected,'Classificação de compatibilidade incorreta '+item.id);
}
check(contract.unsafeSemanticChanges.length>=4&&contract.independentCompatibilityTestPolicy.ifBreakingChangeDetected==='reject_change_until_new_contract_major_and_migration','Regra de migração não explicitada');
const report={status:err.length?'FAIL':'OK',publicContractVersion:contract.contractVersion,sourceRelease:base.sourceRelease,
 currentPackageRelease:contract.version,sourceSha256:sha,
 backwardCompatiblePreview:true,syntheticCompatibilityScenarios:regressions.cases.length,
 forbiddenAutoPromotions:contract.unsafeSemanticChanges.length,errors:err.slice(0,30)};
console.log(JSON.stringify(report,null,2));process.exit(err.length?1:0);
