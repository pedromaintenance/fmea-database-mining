/**
 * Offline VPAR review queue. This public output is not a source of OEM/SAP
 * effectiveness; do not write PN, serial numbers or inspection results here.
 */
import {filterTerms} from '../pm-filtration-scan.mjs';
import {classifyFilterDescriptor} from './pm-vpar-provenance.mjs';

export const REVIEW_GATE_IDS=Object.freeze([
 'asset_configuration','oem_bom','circuit_identification','sap_object_mapping',
 'failure_discrimination','safety_and_test_control','independent_review'
]);
export const CIRCUIT_IDS=Object.freeze([
 'compressor_air_intake','compressor_lubricating_oil',
 'air_oil_separation','receiver_tank_filtration'
]);
const getVpar=l=>l.profundidade===3&&l.sistema?.codigo==='AISY'&&l.grupo?.codigo==='COMR'&&l.subgrupo?.codigo==='VPAR';
const clone=x=>JSON.parse(JSON.stringify(x));

export function buildVparEvidenceMatrix(db,rule,differential,plan){
 if(!db?.locations||!db?.partsByObjectType||!db?.compatibleFailureModesByPart)throw Error('invalid_catalogue');
 if(!rule||rule.id!=='drill-compressor-filter')throw Error('invalid_original_rule');
 if(!plan?.target||plan.target.ruleId!==rule.id)throw Error('invalid_plan_target');
 const relevant=db.locations.filter(l=>getVpar(l)&&rule.models.includes(l.modelo));
 const objectTypes=[...new Set(relevant.map(l=>l.objetoTipoSAP))].sort();
 const components=[];
 // A code is unique INSIDE a type of object, not once for each model/location.
 for(let i=0;i<objectTypes.length;i++){
  const type=objectTypes[i];
  const parts=(db.partsByObjectType[type]||[]).filter(p=>filterTerms(p.pt).length>0);
  const byCode=new Map();
  for(const p of parts){
   const key=String(p.code);
   const existing=byCode.get(key)||{hints:new Set(),catalogueDamageCauseEligible:false,descriptionRows:0};
   existing.descriptionRows++;
   existing.hints.add(classifyFilterDescriptor(p.pt));
   existing.catalogueDamageCauseEligible ||= Boolean(
    db.compatibleFailureModesByPart[p.code]?.damageCauses?.[rule.damageId]?.includes(rule.causeId));
   byCode.set(key,existing);
  }
  let counter=0;
  for(const [,p] of [...byCode].sort(([a],[b])=>a.localeCompare(b))){
   counter++;
   const componentSlot='VPAR-T'+String(i+1).padStart(2,'0')+'-C'+String(counter).padStart(2,'0');
   components.push({
    componentSlot,objectTypeOrdinal:i+1,
    descriptorHints:[...p.hints].sort(),
    catalogueDamageCauseEligible:p.catalogueDamageCauseEligible,
    catalogueRowsForComponent:p.descriptionRows,
    models:[...new Set(relevant.filter(l=>l.objetoTipoSAP===type).map(l=>l.modelo))].sort(),
    evidenceClass:'catalogue_object_type_association_only',
    installed:false,
    physicalFunction:'undetermined',
    oemBomConfirmed:false
   });
  }
 }
 const scenarios=components.flatMap(component=>plan.circuits.map(circuit=>({
  scenarioId:component.componentSlot+'__'+circuit.id,
  componentSlot:component.componentSlot,
  circuitId:circuit.id,
  question:circuit.reviewQuestion,
  alternativeExplanation:circuit.counterHypothesis,
  requiredCircuitEvidence:circuit.necessaryCircuitEvidence,
  descriptorHints:clone(component.descriptorHints),
  catalogueDamageCauseEligible:component.catalogueDamageCauseEligible,
  applicability:'unverified_configuration_and_circuit',
  decision:'blocked_no_remap_or_failure_confirmation',
  evidenceGates:plan.gateDefinitions.map(gate=>({
   gateId:gate.id,ownerDiscipline:gate.ownerDiscipline,
   requiredArtifact:gate.artifact,acceptanceCriterion:gate.criterion,
   status:'not_provided',
   evidenceRef:null,reviewedBy:null
  }))
 })));
 return {
  schema:'fmea-mining.pm-vpar-evidence-matrix.v1',version:'1.3.38',
  provenance:'public_catalogue_plus_generic_oem_context_not_installed_configuration',
  scope:{system:'AISY',group:'COMR',candidateSubgroup:'VPAR',originalRuleId:rule.id,
   originalRuleSubgroup:rule.subgroupCode,models:[...rule.models].sort(),
   damageId:rule.damageId,causeId:rule.causeId},
  counts:{distinctObjectTypes:objectTypes.length,leafPaths:relevant.length,
   candidateCodeSlots:components.length,damageCauseEligibleSlots:components.filter(c=>c.catalogueDamageCauseEligible).length,
   circuitAlternatives:plan.circuits.length,
   reviewScenarios:scenarios.length,pendingEvidenceGates:scenarios.reduce((n,x)=>n+x.evidenceGates.length,0),
   receivedEvidence:0,approvedMappings:0,confirmedFailureEvents:0},
  components,scenarios,
  generalOemSourceIds:differential.references.map(r=>r.id).sort(),
  custodian:'private_authorized_environment_required',
  nextDecision:'obtain_effective_OEM_BOM_circuit_SAP_and_independent_review_before_any_rule_change',
  errors:[]
 };
}

export function validateVparEvidenceMatrix(report,db,rule,differential,plan){
 const errors=[],ck=(ok,id)=>{if(!ok)errors.push(id)};
 ck(plan?.schema==='fmea-mining.pm-vpar-evidence-plan.v1'&&plan?.version==='1.3.38','plan_identity');
 ck(plan?.nature==='editorial_requirements_for_private_OEM_SAP_review_no_asset_evidence','plan_provenance');
 ck(plan?.evidenceCustody==='private_authorized_environment_not_public_GitHub','custody_drift');
 ck(plan?.approvedMappings===0&&plan?.realInspections===0&&plan?.receivedPrivateDocuments===0,'invented_plan_results');
 ck(plan?.policy&&Object.values(plan.policy).every(x=>x===true)&&Object.keys(plan.policy).length===8,'relaxed_plan_policy');
 ck(plan?.gateDefinitions?.length===REVIEW_GATE_IDS.length,'gate_count');
 ck(plan?.circuits?.length===CIRCUIT_IDS.length,'circuit_count');
 ck(REVIEW_GATE_IDS.every(id=>plan.gateDefinitions?.filter(g=>g.id===id).length===1),'gate_identity');
 ck(CIRCUIT_IDS.every(id=>plan.circuits?.filter(c=>c.id===id&&c.sourceDifferentialId===id).length===1),'circuit_identity');
 ck(plan?.target?.system==='AISY'&&plan?.target?.group==='COMR'&&plan?.target?.candidateSubgroup==='VPAR'&&plan?.target?.originalRuleSubgroup==='COMR','plan_path');
 ck(plan?.target?.damageId==='03.02'&&plan?.target?.causeId==='C2.09','plan_damage_cause');
 ck(JSON.stringify([...(plan?.target?.models||[])].sort())===JSON.stringify([...rule.models].sort()),'model_drift');
 ck(differential?.functionalAlternatives?.length===CIRCUIT_IDS.length&&
   CIRCUIT_IDS.every(id=>differential.functionalAlternatives.some(x=>x.id===id&&x.canIdentifyVPAR===false)),'invalid_general_OEM_alternatives');
 for(const g of plan?.gateDefinitions||[]){
  ck(typeof g.artifact==='string'&&g.artifact.length>=25,'weak_artifact_'+g.id);
  ck(typeof g.criterion==='string'&&g.criterion.length>=25,'weak_criterion_'+g.id);
  ck(typeof g.ownerDiscipline==='string'&&g.ownerDiscipline.length>=10,'missing_discipline_'+g.id);
 }
 for(const c of plan?.circuits||[]){
  ck(typeof c.reviewQuestion==='string'&&c.reviewQuestion.length>=40,'weak_question_'+c.id);
  ck(typeof c.counterHypothesis==='string'&&c.counterHypothesis.length>=45,'missing_alternative_'+c.id);
  ck(typeof c.necessaryCircuitEvidence==='string'&&c.necessaryCircuitEvidence.length>=45,'missing_circuit_evidence_'+c.id);
 }
 if(errors.length)return errors;
 const expected=buildVparEvidenceMatrix(db,rule,differential,plan);
 if(JSON.stringify(report)!==JSON.stringify(expected))errors.push('report_does_not_match_catalogue_plan_or_safe_baseline');
 return errors;
}
