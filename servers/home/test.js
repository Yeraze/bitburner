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
  
  ns.tprintf("Purchased Server Ram: %i",
      ns.getPurchasedServers().reduce((a, b) => a + ns.getServerMaxRam(b), 0))
  var slist = getServerList(ns)
      .filter((S) => ns.hasRootAccess(S))
  ns.tprintf("Servers = %s", slist)
  var totalRamNow = getServerList(ns)
      .filter((S) => ns.hasRootAccess(S))
      .reduce((a, S) => (a + ns.getServerMaxRam(S)), 0 )
  ns.tprintf("Total available ram = %i" , totalRamNow)

  ns.tprintf("Player is in factions: %s", ns.getPlayer().factions)
  for(var faction of ["Daedalus"]) {
    for(var aug of ns.singularity.getAugmentationsFromFaction(faction))  {
      var status="UNKNOWN"
      if(ns.singularity.getOwnedAugmentations(true).indexOf(aug) != -1)
        status = "OWNED"
      else 
        status = "UNOWNED"
      ns.tprintf("%s : %s [%s]", faction,aug,status)
    }
  }

  ns.sleeve.setToUniversityCourse(0, "Rothman University", "Computer Science")

}