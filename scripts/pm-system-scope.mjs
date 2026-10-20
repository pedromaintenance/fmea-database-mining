/** Raízes funcionais candidatas, não homologação OEM. Revisar por modelo. */
export const ROOT_SCOPES=Object.freeze({
 arrefecimento:['ENSY','ENS1','ENS2'],
 motor_diesel:['ENSY','ENS1','ENS2'],
 combustivel:['ENSY','ENS1','ENS2'],
 rodante:['UNCR'],
 comando_final:['DRTR'],
 diferencial:['DRTR'],
 pneus_rodas:['DRTR','FRBO'],
 hidraulico:['HYSY','IMAT','SWAS','PRSY'],
 implementos:['IMAT'],
 freios:['DRTR','HYSY'],
 avanco_perfuratriz:['MAST'],
 cabeca_rotativa:['MAST'],
 ar_comprimido:['AISY']
});
export function matchesRoot(rule,location){
 const roots=ROOT_SCOPES[rule.system];
 if(!roots)throw new Error('Sistema sem filtro definido: '+rule.system);
 return roots.includes(location.sistema?.codigo);
}
