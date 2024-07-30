import {getServerList} from 'reh.js'
/** @param {NS} ns */
export async function main(ns) {
  ns.tprintf("Bitnode Multiplers:" )
  Object.keys(ns.getBitNodeMultipliers()).forEach(function(key,index) {
    // key: the name of the object key
    // index: the ordinal position of the key within the object 
    ns.tprintf(" -> %s: %s", key, ns.getBitNodeMultipliers()[key])
  });
  //ns.getBitNodeMultipliers())
  
  var NFG_delta = ns.singularity.getAugmentationStats("NeuroFlux Governor")
  ns.tprintf("NFG Multiplers:" )
  Object.keys(NFG_delta).forEach(function(key,index) {
    // key: the name of the object key
    // index: the ordinal position of the key within the object 
    ns.tprintf(" -> %s: %s", key, NFG_delta[key])
  });
}