#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const data=read('data/quality/cat395-public-variant-preflight.v1.json');
const schema=read('schemas/cat395-public-variant-preflight.schema.json');
const sources=read('data/research/sources.v1.json').sources;
const previous=read('data/quality/hydraulic-circuit-differential.v1.json');
const maturity=read('data/quality/pm-maturity-matrix.v1.json');
const html=fs.readFileSync(path.join(root,'docs/preflight-cat395.html'),'utf8');
const issues=[];
const check=(v,msg,out=issues)=>{if(!v)out.push(msg);};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const clone=x=>structuredClone(x);
const oemRefs=[
 {id:'CAT-395-BR-TIER3-PRODUCT',url:'https://www.cat.com/pt_BR/products/new/equipment/excavators/large-excavators/127102.html'},
 {id:'CAT-395-US-TIER4-PRODUCT',url:'https://www.cat.com/en_US/products/new/equipment/excavators/large-excavators/126440.html'},
 {id:'CAT-395-FRONT-SHOVEL-PRODUCT',url:'https://www.cat.com/en_US/products/new/equipment/excavators/large-excavators/128240.html'}
];
const ids=['CAT395-BR-TIER3','CAT395-US-T4F','CAT395-FRONT-SHOVEL'];
const fields=['implementMainMaxFlow','equipmentMaxPressure','equipmentLiftModeMaxPressure','travelMaxPressure','swingMaxPressure'];
const expected={
 'CAT395-BR-TIER3':[1064,37000,38000,35000,31000],
 'CAT395-US-T4F':[1064,37000,null,35000,31000],
 'CAT395-FRONT-SHOVEL':[1008,32000,null,35000,31000]
};
const flags=['productSpecIsNotTestAndAdjust','marketingMaximumIsNotAcceptanceThreshold','publishedFlowIsNotPumpSpecificFlow','publishedPressureIsNotReliefValveSetting','noCrossVariantTransfer','missingValueMustRemainNull','modelFamilyIsNotSerialEffectivity','noAutomaticDiagnosticConclusion','noRpnOrFailureRateFromProductSpec','noTestExecutionFromPublicDocuments','noOperatingRelease','noSapMapping'];
const activeSources=new Map(sources.map(s=>[s.id,s]));
const sourceReq=[...oemRefs.map(s=>s.id),'CAT-SIS2GO'];
const scenarioIds=previous.records.map(s=>s.id);
function validate(x, sourceMap=activeSources){
 const e=[],t=(v,n)=>check(v,n,e);
 t(x?.schema==='fmea-mining.cat395-public-variant-preflight.v1'&&x?.version==='1.3.91'&&x?.nature==='public_oem_product_variant_catalog_not_serial_applicability','identity');
 t(x?.studiedProductFamily==='Caterpillar 395'&&x?.evidenceDate==='2026-11-03','context_date');
 t(same(x?.sourceCatalogIds,sourceReq),'source_catalog_set');
 for(const r of oemRefs){
  const s=sourceMap.get(r.id);
  t(s?.organization==='Caterpillar'&&s.url===r.url&&s?.role.includes('primary_oem')&&s?.reviewStatus.includes('sem_aprovacao_por_serie'),'source_'+r.id);
 }
 t(sourceMap.has('CAT-SIS2GO'),'sis2go_catalog_available');
 for(const flag of flags)t(x?.interpretationPolicy?.[flag]===true,'policy_'+flag);
 t(x?.interpretationPolicy?.corporatePrivateGates==='NO_GO'&&x?.approvalOnRealMachine===false&&x?.allMachineSerials===null,'no_approval');
 t(x?.executiveDecision==='BLOCK_OPERATIONAL_USE_UNTIL_SERIAL_OEM_EVIDENCE','blocked_operational_use');
 t(x?.variants?.length===3,'variant_count');
 for(let i=0;i<(x.variants||[]).length;i++){
  const v=x.variants[i],id=ids[i],spec=expected[id];
  t(v.variantId===id&&v.oemSourceId===sourceReq[i],'variant_identification_'+id);
  t(v.marketPage===(i===0?'Brasil':'EUA')&&v.configuration===(i===2?'front_shovel':'retroescavadeira'),'variant_type_'+id);
  t(v.verifiedOnIndividualMachine===false&&v.effectiveSerialNumber===null&&v.verifiedHydraulicSchematicId===null&&v.approvedTestAndAdjustDocument===null,'variant_oem_effectivity_'+id);
  t(v.measuredValues===null&&v.authorizedOperatingLimit===null&&v.approvedSapMapping===null,'measured_or_approved_'+id);
  t(same(Object.keys(v.claims).sort(),[...fields].sort()),'claim_types_'+id);
  for(let k=0;k<fields.length;k++){
   const f=fields[k],m=v.claims[f],val=spec[k],unit=k===0?'L/min':'kPa';
   t(m?.value===val&&m?.unit===unit,'OEM_spec_'+id+'_'+f);
   t(m?.classification===(val===null?'not_reported_on_selected_source':'published_maximum_product_spec'),'claim_provenance_'+id+'_'+f);
  }
 }
 t(x?.documentGates?.length===8,'gate_count');
 for(let i=0;i<(x.documentGates||[]).length;i++){
  const g=x.documentGates[i],id='G395-'+String(i+1).padStart(2,'0');
  t(g.id===id&&g.status==='PENDING'&&g.evidenceReference===null&&g.approvedBy===null&&g.approvedAt===null,'gate_'+id);
  t(typeof g.requirement==='string'&&g.requirement.length>35&&typeof g.evidenceRequest==='string'&&g.evidenceRequest.length>15,'gate_scope_'+id);
 }
 t(x.scenarioCrosswalk?.length===10,'crosswalk_count');
 const seen=new Set();
 for(let i=0;i<(x.scenarioCrosswalk||[]).length;i++){
  const c=x.scenarioCrosswalk[i],id=scenarioIds[i];
  t(c.scenarioId===id&&!seen.has(id),'crosswalk_id_'+id);seen.add(id);
  t(c.publishedContextFields?.every(f=>fields.includes(f))&&new Set(c.publishedContextFields||[]).size===c.publishedContextFields.length,'crosswalk_fields_'+id);
  t(c.operationalDiagnosisAllowed===false&&c.safetyReviewRequired===true&&c.sourceOfDiagnosticTruth==='effective_serial_oem_service_document_not_product_marketing','crosswalk_safety_'+id);
  t(typeof c.interpretationBoundary==='string'&&c.interpretationBoundary.length>=55,'crosswalk_boundary_'+id);
 }
 t(typeof x.notes==='string'&&x.notes.includes('não')&&x.notes.length>180,'source_limit_note');
 t(typeof x.safety==='string'&&x.safety.length>180&&x.safety.includes('não')&&x.safety.includes('energia'),'safety_requirements');
 return e;
}
issues.push(...validate(data));
check(schema?.properties?.variants?.minItems===3&&schema?.properties?.variants?.maxItems===3&&schema?.properties?.documentGates?.minItems===8&&schema?.properties?.scenarioCrosswalk?.minItems===10,'schema_limits');
check(schema?.properties?.interpretationPolicy?.properties?.noOperatingRelease?.const===true,'schema_no_release');
check(maturity.summary.seedRules===25&&maturity.summary.sapExceptionsBlocked===10&&maturity.summary.serialOemVerified===0&&maturity.summary.engineeringApprovalsRecorded===0,'pm_maturity_legacy');
check(previous.records.length===10&&previous.interpretationPolicy.privateCorporateGates==='NO_GO','hydraulic_circuit_legacy');
const embedded=html.match(/<script id="preflight-data" type="application\/json">([\s\S]*?)<\/script>/);
let inlineData;
try{inlineData=JSON.parse(embedded?.[1]||'');}
catch(e){issues.push('embedded_json_invalid');}
check(inlineData&&same(inlineData,data),'html_embedded_catalog_equal_to_versioned_source');
const er=html.match(/<script id="preflight-references" type="application\/json">([\s\S]*?)<\/script>/);
let inlineRefs;
try{inlineRefs=JSON.parse(er?.[1]||'');}
catch(e){issues.push('html_references_invalid');}
check(inlineRefs&&sourceReq.every(id=>inlineRefs[id]?.url===activeSources.get(id)?.url),'html_provenance_links');
const js=html.match(/<script>\s*([\s\S]*?)<\/script>/);
try{new vm.Script(js?.[1]||'','html-inline-script');}
catch(e){issues.push('html_script_syntax_'+String(e));}
const forbidden=['<script src=','<iframe','localStorage','sessionStorage','navigator.sendBeacon','XMLHttpRequest','fetch(','WebSocket('];
for(const token of forbidden)check(!html.includes(token),'offline_forbidden_'+token);
check(html.includes('DRAFT_NOT_SENT')&&html.includes('operationalRelease:false')&&html.includes('privateGateStatus:"NO_GO"'),'html_export_boundary');
check(html.includes('URL.createObjectURL')&&html.includes('document.getElementById("variant")'),'html_offline_usage');
const attacks=[
 x=>x.variants[0].claims.implementMainMaxFlow.value=1008,
 x=>x.variants[2].claims.equipmentMaxPressure.value=37000,
 x=>x.variants[1].claims.equipmentLiftModeMaxPressure.value=38000,
 x=>x.variants[1].claims.equipmentLiftModeMaxPressure.classification='published_maximum_product_spec',
 x=>x.variants[0].claims.equipmentMaxPressure.unit='bar',
 x=>x.variants[0].claims.equipmentMaxPressure.classification='approved_test_limit',
 x=>x.variants[2].oemSourceId='CAT-395-BR-TIER3-PRODUCT',
 x=>x.variants[0].effectiveSerialNumber='FAKE_SERIAL',
 x=>x.variants[1].verifiedHydraulicSchematicId='FAKE_MEDIA',
 x=>x.variants[1].approvedTestAndAdjustDocument='FAKE_ADJUST',
 x=>x.variants[0].measuredValues={pressure:37000},
 x=>x.variants[2].authorizedOperatingLimit=32000,
 x=>x.variants[2].approvedSapMapping='ABC',
 x=>x.documentGates[0].status='APPROVED',
 x=>x.documentGates[1].approvedBy='FAKE',
 x=>x.scenarioCrosswalk[2].operationalDiagnosisAllowed=true,
 x=>x.scenarioCrosswalk[3].publishedContextFields=['unknown'],
 x=>x.sourceCatalogIds.pop(),
 x=>x.interpretationPolicy.noCrossVariantTransfer=false,
 x=>x.interpretationPolicy.corporatePrivateGates='GO',
 x=>x.executiveDecision='GO',
 x=>x.approvalOnRealMachine=true
];
let rejected=0;
for(const mutate of attacks){const x=clone(data);mutate(x);if(validate(x).length)rejected++;else issues.push('adversarial_mutation_escaped');}
check(rejected===attacks.length,'adversarial_coverage');
const tamperedSources=new Map(activeSources);
tamperedSources.set(oemRefs[2].id,{...tamperedSources.get(oemRefs[2].id),url:oemRefs[0].url});
check(validate(data,tamperedSources).includes('source_'+oemRefs[2].id),'counterfeit_source_protection');
const summary={schema:'fmea-mining.cat395-preflight-audit.v1',version:data.version,status:issues.length?'FAIL':'OK',
 totals:{variants:data.variants.length,catalogClaims:data.variants.reduce((n,v)=>n+Object.keys(v.claims).length,0),
 missingPublishedClaimValues:data.variants.reduce((n,v)=>n+Object.values(v.claims).filter(m=>m.value===null).length,0),
 documentaryGates:data.documentGates.length,linkedHydraulicScenarios:data.scenarioCrosswalk.length,
 adversarialMutationsRejected:rejected,sourceTamperingRejected:true,realSerials:0,realTestResults:0,approvedMappings:0,operatingReleases:0,privateGates:'NO_GO'},errors:issues};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/cat395-preflight.generated.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));process.exit(issues.length?1:0);
