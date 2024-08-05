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
  
  var NFG_delta = ns.singularity.getAugmentationStats("NeuroFlux Governor")
  ns.tprintf("NFG Multiplers:" )
  Object.keys(NFG_delta).forEach(function(key,index) {
    // key: the name of the object key
    // index: the ordinal position of the key within the object 
    ns.tprintf(" -> %s: %s", key, NFG_delta[key])
  });*/

  //ns.printf(await doCommand(ns, `ns.singularity.getAugmentationRepReq("NeuroFlux Governor")`))
  var augsToBuy = ["The Red Pill"]
  const augmentsIHave = db.dbRead(ns, "aug-all")
  ns.printf("Loading augs-from-faction")
  var augsFromFaction = db.dbRead(ns, "augs-from-faction")
  ns.printf("Loading aug-prereqs")
  var augPrereqs = db.dbRead(ns, "aug-prereqs")
  ns.printf("Loading aug-cost")
  var augCosts = db.dbRead(ns, "aug-cost")
  ns.printf("Loading aug-stats")
  var augStats = db.dbRead(ns, "aug-stats")

  // First build the list of Augments to Buy

  for(var _fac of augsFromFaction) {
    var fac = _fac.faction
    ns.tprintf("-> Looking at %s", fac)
    for(var aug of _fac.augments) {  
      // See if we meet the prereq's
      for(var preReq of augPrereqs.find((A) => (A.augment == aug)).prereqs ) {
        if (augmentsIHave.indexOf(preReq) == -1) {
          ns.tprintf("ERROR: Missing prereq %s for %s", preReq, aug)
          continue
        }
      }
      // Attempt to "categorize" the aug
      var stats = augStats.find((A) => (A.augment == aug)).stats

      if(qualifyAugment(ns, stats)) {
        if(!augsToBuy.includes(aug))
          augsToBuy.push(aug)
        //ns.tprintf("%s", aug)
      }
    }
  }
  ns.tprintf("%s", augsToBuy)
}