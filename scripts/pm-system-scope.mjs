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
const REQUIRED_GROUPS=Object.freeze({
 arrefecimento:['COSY'],motor_diesel:['ENGN'],combustivel:['FUSY'],
 ar_comprimido:['COMR'],avanco_perfuratriz:['DFAS','ROHE'],cabeca_rotativa:['CARO']
});
export function matchesRoot(rule,location){
 const roots=ROOT_SCOPES[rule.system];
 if(!roots)throw new Error('Sistema sem filtro definido: '+rule.system);
 if(!roots.includes(location.sistema?.codigo))return false;
 const group=location.grupo?.codigo;
 if(REQUIRED_GROUPS[rule.system]&&!REQUIRED_GROUPS[rule.system].includes(group))return false;
 // Brakes and steering have HSVV/HYPU but are not generic implement hydraulic circuits.
 if(rule.system==='hidraulico'&&['BRSY','STSY'].includes(group))return false;
 return true;
}
