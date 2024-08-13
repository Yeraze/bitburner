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
  if(ns.getResetInfo().ownedAugs.has("Stanek's Gift - Genesis")) {
    ns.printf("Found stanek's gift!")
  } else {
    ns.printf("No stanek")

  }
  for(var sf of ns.getResetInfo().ownedSF)
    ns.printf("%s", sf)

  ns.printf(Object.prototype.toString.call("Hello"));

  ns.printf( await doCommand(ns,`ns.getResetInfo().currentNode`))

  ns.printf("Hashes = %i", ns.hacknet.numHashes())

}