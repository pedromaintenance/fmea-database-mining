#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const d=load('data/quality/hydraulic-circuit-differential.v1.json');
const sources=load('data/research/sources.v1.json').sources;
const cylinder=load('data/quality/pm-implement-cylinder-differentials.v1.json');
const hose=load('data/quality/hydraulic-hose-differential.v1.json');
const maturity=load('data/quality/pm-maturity-matrix.v1.json');
const gaps=load('data/quality/pm-gap-review.v1.json').records;
const schema=load('schemas/hydraulic-circuit-differential.schema.json');
const sourceIds=new Set(sources.map(x=>x.id));
const refIds=new Set(cylinder.classes.map(x=>x.conditionId));
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const errors=[];
const assert=(v,label,array=errors)=>{if(!v)array.push(label)};
const fields=['id','scope','signal','potentialFunctionalEffect','competingHypotheses','evidenceToRequest','confounders','existingConceptRefs','sourceIds','safeInitialDisposition','observedOnAsset','performedTests','confirmedDamage','confirmedRootCause','pressureReference','flowReference','driftReference','applicableOemSerial','approvedSapMapping','independentReviewStatus'];
const safeFlags=['pressureDoesNotProveFlow','lowPressureDoesNotProvePumpFailure','normalPumpPressureDoesNotProveActuatorPressure','driftDoesNotProvePistonSealFailure','temperatureDoesNotProveInternalLeakage','oilChemistryDoesNotProveFailedValve','electronicCodeDoesNotProveMechanicalFault','plannedTestIsNotExecutedEvidence','noUniversalPressureFlowOrDriftLimits','noCrossModelArchitectureAssumptions','noAutomaticRiskScores','noAutomaticSapMapping','noAutomaticWorkOrder','noOperatingRelease','requiresApplicableOemProcedure','requiresIndependentEngineeringReview','requiresPermissionForFieldTesting'];
const clone=x=>JSON.parse(JSON.stringify(x));
function validate(x){
 const e=[],a=(v,k)=>assert(v,k,e);
 a(x?.schema==='fmea-mining.hydraulic-circuit-differential.v1'&&x.version==='1.3.90'&&x.nature==='conceptual_system_differential_no_field_diagnosis','identity');
 a(x.scope?.architecture==='illustrative_not_serial_verified'&&eq(x.scope.machineModelsVerified,[])&&eq(x.scope.serialsVerified,[])&&x.scope.applicabilityApproved===false&&x.scope.candidatePmBundles===25,'applicability_boundary');
 a(typeof x.globalSafety==='string'&&x.globalSafety.length>=250&&x.globalSafety.includes('energia residual')&&x.globalSafety.includes('injeção')&&x.globalSafety.includes('OEM'),'field_safety');
 for(const k of safeFlags)a(x.interpretationPolicy?.[k]===true,'policy_'+k);
 a(x.interpretationPolicy?.actualFieldEvents===0&&x.interpretationPolicy?.testsPerformed===0&&x.interpretationPolicy?.approvedSapMappings===0&&x.interpretationPolicy?.privateCorporateGates==='NO_GO','evidence_or_private_gate');
 a(x.topologyGates?.length===8,'eight_topology_gates');
 for(let i=0;i<(x.topologyGates||[]).length;i++){
  const g=x.topologyGates[i],id='TG-'+String(i+1).padStart(2,'0');
  a(g.id===id&&g.status==='PENDING'&&typeof g.ask==='string'&&g.ask.length>25,'gate_'+id);
 }
 const graph=x.genericCircuitGraph||{},nodes=graph.nodes||[],edges=graph.edges||[];
 a(graph.status==='illustrative_not_machine_specific'&&nodes.length===8&&edges.length===10,'generic_graph');
 const nids=new Set(nodes.map(n=>n.id));
 a(nids.size===8&&nodes.every(n=>typeof n.name==='string'&&n.name.length>8),'graph_nodes');
 a(edges.every(z=>z.conditional===true&&nids.has(z.from)&&nids.has(z.to)&&typeof z.relationship==='string'&&z.relationship.length>5),'graph_edges_not_conditional');
 a(x.records?.length===10,'scenario_count');
 const seen=new Set(),hypIds=new Set();
 for(let i=0;i<(x.records||[]).length;i++){
  const r=x.records[i],id='HC-DIFF-'+String(i+1).padStart(2,'0');
  a(r.id===id&&!seen.has(r.id),'scenario_id_'+id);seen.add(r.id);
  a(eq(Object.keys(r).sort(),fields.slice().sort()),'scenario_field_contract_'+id);
  a(typeof r.signal==='string'&&r.signal.length>=40&&typeof r.potentialFunctionalEffect==='string'&&r.potentialFunctionalEffect.length>=35,'signal_or_function_'+id);
  a(typeof r.scope==='string'&&r.scope.length>5,'boundary_'+id);
  a(r.competingHypotheses?.length===3,'exactly_three_alternatives_'+id);
  for(const h of r.competingHypotheses||[]){
   a(typeof h.id==='string'&&h.id.startsWith(id+'-')&&!hypIds.has(h.id),'hyp_id_'+id);hypIds.add(h.id);
   a(['mechanism','proposedDiscriminant','alternativeInterpretation'].every(k=>typeof h[k]==='string'&&h[k].length>=25),'hyp_discriminants_'+id);
  }
  a(r.evidenceToRequest?.length>=4&&r.evidenceToRequest.every(v=>typeof v==='string'&&v.length>=20),'documentary_evidence_'+id);
  a(r.confounders?.length>=2&&r.confounders.every(v=>typeof v==='string'&&v.length>=20),'confounding_'+id);
  a(Array.isArray(r.existingConceptRefs)&&r.existingConceptRefs.every(ref=>refIds.has(ref)),'legacy_crossrefs_'+id);
  a(r.sourceIds?.length>=2&&new Set(r.sourceIds).size===r.sourceIds.length&&r.sourceIds.every(s=>sourceIds.has(s)),'source_ids_'+id);
  a(typeof r.safeInitialDisposition==='string'&&r.safeInitialDisposition.length>=40,'safe_disposition_'+id);
  a(r.observedOnAsset===false&&r.performedTests===0&&r.confirmedDamage===false&&r.confirmedRootCause===false,'no_fabricated_evidence_'+id);
  a(r.pressureReference===null&&r.flowReference===null&&r.driftReference===null&&r.applicableOemSerial===null,'no_universal_measurement_'+id);
  a(r.approvedSapMapping===false&&r.independentReviewStatus==='not_performed','no_sap_approval_'+id);
 }
 a(hypIds.size===30,'hypothesis_count');
 const drift=x.records?.[4];a(drift?.id==='HC-DIFF-05'&&drift.safeInitialDisposition.includes('apoiar positivamente')&&eq(drift.competingHypotheses.map(h=>h.id),['HC-DIFF-05-PISTON','HC-DIFF-05-HOLD','HC-DIFF-05-SPOOL']),'critical_load_hold_boundary');
 const press=x.records?.[2];a(press?.id==='HC-DIFF-03'&&press.competingHypotheses.some(h=>h.id==='HC-DIFF-03-CONTEXT'),'pressure_context_counterhypothesis');
 const electronics=x.records?.[9];a(electronics?.id==='HC-DIFF-10'&&electronics.competingHypotheses.some(h=>h.id==='HC-DIFF-10-SENSOR'),'sensor_vs_real_discrimination');
 return e;
}
errors.push(...validate(d));
assert(schema?.properties?.records?.minItems===10&&schema?.properties?.records?.maxItems===10&&schema?.properties?.interpretationPolicy?.properties?.noOperatingRelease?.const===true,'schema_constraints');
assert(maturity.summary.seedRules===25&&maturity.summary.sapExceptionsBlocked===10&&maturity.summary.engineeringApprovalsRecorded===0&&maturity.summary.serialOemVerified===0,'pm_maturity_baseline');
assert(cylinder.fieldMeasurements===0&&cylinder.confirmedFailures===0&&cylinder.approvedSapMappings===0,'cylinder_baseline');
assert(hose.policy.noOperatingRelease===true&&hose.policy.recordedFieldEvents===0&&hose.policy.privateCorporateGates==='NO_GO','hose_boundary');
for(const id of ['hydraulic-hose-leak','hydraulic-hose-abrasion']){
 const gap=gaps.find(g=>g.ruleId===id);
 assert(gap?.status==='bloqueado_aguardando_curadoria'&&gap?.expectedBlocker==='subgroup_not_in_scope'&&gap?.autoRemapAllowed===false,'hose_sap_blocker_'+id);
}
const mutations=[
 x=>x.interpretationPolicy.lowPressureDoesNotProvePumpFailure=false,
 x=>x.interpretationPolicy.driftDoesNotProvePistonSealFailure=false,
 x=>x.interpretationPolicy.actualFieldEvents=1,
 x=>x.interpretationPolicy.privateCorporateGates='GO',
 x=>x.topologyGates[0].status='APPROVED',
 x=>x.genericCircuitGraph.edges[0].conditional=false,
 x=>x.scope.serialsVerified=['FAKE-SERIAL'],
 x=>x.records.splice(0,1),
 x=>x.records[0].id='HC-DIFF-99',
 x=>x.records[1].competingHypotheses.pop(),
 x=>x.records[2].pressureReference=240,
 x=>x.records[3].confirmedDamage=true,
 x=>x.records[4].safeInitialDisposition='testar cilindro com carga sem suporte',
 x=>x.records[5].sourceIds=['SOURCE-NOT-CATALOGED'],
 x=>x.records[6].performedTests=1,
 x=>x.records[7].existingConceptRefs=['FAKE-CONDITION'],
 x=>x.records[8].approvedSapMapping=true,
 x=>x.records[9].independentReviewStatus='approved'
];
let rejected=0;
for(const edit of mutations){const x=clone(d);edit(x);if(validate(x).length)rejected++;else errors.push('unsafe_mutation_escaped');}
assert(rejected===18,'adversarial_coverage');
const totals={scenarioPatterns:d.records.length,hypotheses:d.records.reduce((n,r)=>n+r.competingHypotheses.length,0),topologyGates:d.topologyGates.length,conceptualNodes:d.genericCircuitGraph.nodes.length,conditionalEdges:d.genericCircuitGraph.edges.length,adversarialMutationsRejected:rejected,fieldEvents:0,testsPerformed:0,confirmedRoots:0,approvedSapMappings:0,privateGates:'NO_GO'};
const report={schema:'fmea-mining.hydraulic-circuit-differential-audit.v1',version:d.version,status:errors.length?'FAIL':'OK',totals,errors};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports/hydraulic-circuit-differential.generated.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
process.exit(errors.length?1:0);
