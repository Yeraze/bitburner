import {getServerList, doCommand, qualifyAugment} from 'reh.js'
import * as db from 'database.js'
/** @param {NS} ns */
export async function main(ns) {
  /*
  ns.tprintf("Bitnode Multiplers:" )
  Object.keys(ns.getBitNodeMultipliers()).forEach(function(key,index) {
    // key: the name of the object key
    // index: the ordinal position of the key within the object 
    ns.tprintf(" -> %s: %s", key, ns.getBitNodeMultipliers()[key])
  });
  //ns.getBitNodeMultipliers())
  */
  for(var fragment of ns.stanek.activeFragments()) {
    const frag = ns.stanek.fragmentDefinitions().find((A) => (A.id == fragment.id))
    ns.printf("-> [%i] %s", fragment.id, frag.effect)
  }

  ns.printf("-> Entropy: %s", ns.getPlayer().entropy)

}