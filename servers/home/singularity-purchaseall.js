import * as db from 'database.js'
/** @param {NS} ns */
export async function main(ns) {
  ns.printf("Reading aug-all")
  const augmentsIHave = db.dbRead(ns, "aug-all") ?? []
  ns.printf("Reading aug-installed")
  const augmentsInstalled = db.dbRead(ns, "aug-installed") ?? []

  // We always want this one
  //  These augments don't have Stats in the traditional sense, so they
  //  don't pass our auto-classifier.. So just hard-code them here.
  var augsPurchased = augmentsIHave.filter( (A) => (augmentsInstalled.indexOf(A) == -1)) 
 
  ns.printf("Loading factions")
  var factionData = db.dbRead(ns, "factions") ?? []
  var factionList = []
  for(var fac of factionData)
    factionList.push(fac.name)

  ns.printf("%i factions known", factionList.length)

  ns.printf("Loading augs-from-faction")
  var augsFromFaction = db.dbRead(ns, "augs-from-faction") ?? []
  ns.printf("Loading aug-prereqs")
  var augPrereqs = db.dbRead(ns, "aug-prereqs") ?? []
  ns.printf("Loading aug-cost")
  var augCosts = db.dbRead(ns, "aug-cost") ?? []

  // First build the list of Augments to Buy
  var augIndex = 0
  var augsToBuy = []
  for(var _fac of augsFromFaction) {
    var fac = _fac.faction
    augIndex++
    ns.printf("Evaluating Faction %s (%i/%i)", fac,
      augIndex, augsFromFaction.length)
    if(ns.args.includes("--slow"))
      await ns.sleep(1000)
    for(var aug of _fac.augments) {  
      // See if we meet the prereq's
      var meetsPrereqs = true
      for(var preReq of augPrereqs.find((A) => (A.augment == aug)).prereqs ) {
        if (augmentsIHave.indexOf(preReq) == -1) {
          ns.printf("ERROR: Missing prereq %s for %s", preReq, aug)
          var meetsPrereqs = false
        }
      }
      if(!meetsPrereqs)
        continue
      if(aug == "NeuroFlux Governor")
        continue
      var augCost = augCosts.find((A) => (A.augment == aug))

      augsToBuy.push({augment : aug,
                      faction : fac,
                      cost: augCost})
    }
  }

  ns.printf("%i eligible augments", augsToBuy.length)
  augsToBuy.sort((A,B) => (A.cost - B.cost)).reverse()
  ns.printf("Beginning install...")
  for(var aug of augsToBuy) {
    ns.printf("-> Attempting %s", aug.augment)
    if(ns.singularity.purchaseAugmentation(aug.faction, aug.augment)) {
      var msg = ns.sprintf("Installed augment %s", aug.augment)
      await db.dbGlobalLogf(ns, msg)
      ns.toast(msg, "info")
    }
  }
  ns.printf("Attempting to install NFGs");
  var installed = true;
  var nfgCount = 0
  while(installed) {
    installed = false
    for(var _fac of augsFromFaction) {
      var fac = _fac.faction
      if(ns.singularity.purchaseAugmentation(fac, "NeuroFlux Governor")) {
        nfgCount++
        installed = true
      }
    }
  }
  if(nfgCount > 0) {
    var msg = ns.sprintf("Installed %i NFG's",nfgCount)
    await db.dbGlobalLogf(ns, msg)
    ns.toast(msg, "info")
  }

}
