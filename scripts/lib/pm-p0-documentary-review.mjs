/** Derived PUBLIC review packet. Do not pass real OEM/SAP attachments or field data. */
export const TARGETS=['cooling-radiator-blockage','fuel-filter-contamination'];
const tasks={
 'cooling-radiator-blockage':{
  reviewDiscipline:'confiabilidade_arrefecimento_e_dados_mestres_sap',
  discriminations:[
    {id:'RAD-EXT',hypothesis:'Depósito externo nas aletas com restrição de passagem de ar',neededEvidence:'Fotografia referenciada da face de entrada e saída e método seguro de avaliação de passagem de ar, conforme manual por série',competingExplanation:'Vazão do ventilador e condição de operação podem elevar temperatura mesmo com colmeia desobstruída'},
    {id:'RAD-INT',hypothesis:'Restrição interna da circulação do arrefecedor',neededEvidence:'Diagnóstico OEM da circulação e condição do fluido por compartimento, sem assumir limite numérico universal',competingExplanation:'Termostato, bomba, nível ou condição do fluido podem mimetizar restrição interna'},
    {id:'RAD-SENSOR',hypothesis:'Temperatura alta relatada sem bloqueio físico localizado',neededEvidence:'Tendência e posição de sensor, carga, ambiente e comparação de evidências do conjunto',competingExplanation:'Falha de instrumento, ventoinha ou carga térmica elevada'},
  ],
  falseConclusions:['Sujidade externa não prova entupimento interno','Temperatura alta não confirma causa raiz ou dano no trocador','Código SAP 03.02/C2.09 não pode ser aprovado por analogia'],
  safety:['Bloquear e resfriar sistema conforme OEM antes de aproximação','Não abrir sistema quente ou pressurizado','Não empregar lavagem de alta pressão ou teste improvisado'],
  manufacturerLinks:['CAT-RADIATOR-CARE','CAT-FILTERS-FLUIDS-GUIDE']
 },
 'fuel-filter-contamination':{
  reviewDiscipline:'diesel_filtragem_e_dados_mestres_sap',
  discriminations:[
    {id:'FUEL-FILTER',hypothesis:'Meio filtrante restringindo a alimentação de combustível',neededEvidence:'Diagrama e conjunto real de filtros por série, medição OEM aplicável e inspeção autorizada do elemento',competingExplanation:'Restrição na tubulação, válvula, bomba, sensor ou abastecimento'},
    {id:'FUEL-WATER',hypothesis:'Água ou partículas detectadas no combustível ou separador',neededEvidence:'Amostra rastreável antes da intervenção, coleta com método válido e registro do compartimento',competingExplanation:'Contaminação pode vir de tanque, armazenamento, abastecimento ou método de coleta'},
    {id:'FUEL-HSVV',hypothesis:'Filtro associado indevidamente ao subgrupo HSVV',neededEvidence:'BOM OEM e árvore SAP real, sem inserir PN real neste repositório; distinguir filtro/separador de mangueira e válvula',competingExplanation:'HSVV cadastra mangueiras/válvulas e não comprova a existência de filtro nessa posição'},
  ],
  falseConclusions:['Água no combustível não comprova dano no filtro','Filtro não pode ser atribuído automaticamente ao grupo HSVV','Código de componente, dano e causa não são homologados sem revisão independente'],
  safety:['Isolamento do circuito, combustão e pressão residual segundo OEM','Amostra representativa antes de troca ou drenagem quando aplicável e seguro','Descarte e controle ambiental pela rotina autorizada'],
  manufacturerLinks:['CAT-FUEL-WATER-SEPARATOR-PURPOSE','CAT-FILTERS-FLUIDS-GUIDE']
 }
};
export function buildPmP0ReviewPacket({gaps,evidence,maturity,sources}){
 const gapMap=new Map(gaps.records.map(x=>[x.ruleId,x]));
 const gateMap=new Map(evidence.records.map(x=>[x.ruleId,x]));
 const matrixMap=new Map(maturity.rules.map(x=>[x.ruleId,x]));
 const sourceIds=new Set(sources.sources.map(x=>x.id));
 const queue=gaps.records.filter(x=>x.priority==='P0').sort((a,b)=>a.ruleId.localeCompare(b.ruleId));
 const rows=queue.map(g=>{
  const e=gateMap.get(g.ruleId),m=matrixMap.get(g.ruleId);if(!e||!m)throw Error('missing_evidence_gate_'+g.ruleId);
  const target=tasks[g.ruleId]||null;
  const ids=target?target.manufacturerLinks:e.sourcesGeneral;
  if(ids.some(id=>!sourceIds.has(id)))throw Error('unknown_public_source_'+g.ruleId);
  return {ruleId:g.ruleId,bundleId:m.bundleId,priority:g.priority,blocker:g.expectedBlocker,
   system:m.system,subgroupCandidate:g.ruleId==='cooling-radiator-blockage'?'RADI':g.ruleId==='fuel-filter-contamination'?'HSVV':m.subgroupCode,
   state:'blocked_pending_documentary_review',actualEvidenceReceived:0,oemSerialEffectivityVerified:false,fieldTestCompleted:false,independentReviewCompleted:false,
   approvedSapLocation:null,approvedComponentCode:null,approvedDamageCode:null,approvedCauseCode:null,autoRemapAllowed:false,
   minimumEvidence:[...e.minimumEvidence],independentAlternative:e.independentAlternative,
   requestedDamageId:e.requestedDamageId,requestedCauseId:e.requestedCauseId,
   sourceIds:[...ids],reviewDiscipline:target?.reviewDiscipline||m.sap.reviewDiscipline,
   reviewDepth:target?'detailed_preparation':'queue_only',
   differentialQuestions:target?.discriminations||[],falseConclusions:target?.falseConclusions||[],safety:target?.safety||[],
   nextDecision:'obtain_OEM_serial_BOM_and_actual_evidence_in_authorized_private_environment'};
 });
 return {schema:'fmea-mining.pm-p0-documentary-review.v1',version:'1.3.62',nature:'public_review_requests_no_real_maintenance_evidence',
  referencedMaturityVersion:maturity.version,
  summary:{p0Rules:queue.length,detailedPreparation:rows.filter(x=>x.reviewDepth==='detailed_preparation').length,queuedForLater:rows.filter(x=>x.reviewDepth==='queue_only').length,approvedSapMappings:0,fieldEvidenceReceived:0},
  reviews:rows};
}
