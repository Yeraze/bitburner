import {rehprintf, qualifyAugment} from 'reh.js'
import * as CONST from 'reh-constants.js'
import * as db from 'database.js'
/** @param {NS} ns */
export async function main(ns) {
  ns.printf("Reading aug-all")
  const augmentsIHave = db.dbRead(ns, "aug-all")
  ns.printf("Reading aug-installed")
  const augmentsInstalled = db.dbRead(ns, "aug-installed")

  // We always want this one
  //  These augments don't have Stats in the traditional sense, so they
  //  don't pass our auto-classifier.. So just hard-code them here.
  var augsToBuy = ["The Red Pill", "CashRoot Starter Kit", "Neuroreceptor Management Implant"] 
  var priorityAugs = ["The Red Pill", "CashRoot Starter Kit", "Neuroreceptor Management Implant"]
  var minRepFaction = "NONE"
  var minRepValue = 10e9
  var favAugment = ""
  var savingUp = false
  var augsPurchased = augmentsIHave.filter( (A) => (augmentsInstalled.indexOf(A) == -1))

  var record = { augmentsInstalled: augmentsInstalled.length,
                 augmentsPurchased: augsPurchased.length}
  db.dbWrite(ns, "augment-meta", record)

  ns.printf("Loading factions")
  var factionData = db.dbRead(ns, "factions")
  var factionList = []
  for(var fac of factionData)
    factionList.push(fac.name)

  ns.printf("%i factions known", factionList.length)

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
      
      // Attempt to "categorize" the aug
      var stats = augStats.find((A) => (A.augment == aug)).stats
      if(qualifyAugment(ns, stats)) {
        if(!augsToBuy.includes(aug))
          augsToBuy.push(aug)
      }
    }
  }

  ns.printf("%i eligible augments", augsToBuy.length)

  // First search the list to see what the "lowest rep" aug is
  for(var _fac of augsFromFaction) {
    fac = _fac.faction
    var fData = factionData.find((A) => (A.name == fac))
    for(var aug of _fac.augments) { 

 
      if(augmentsIHave.includes(aug) && (aug != "NeuroFlux Governor")) 
        continue; // We already have this
      if(augsToBuy.indexOf(aug) == -1)
        continue; // We don't want this augment

      ns.printf("[%s] %s (%i)", fac, aug, augsToBuy.indexOf(aug))
      var augCost = augCosts.find((A) => (A.augment == aug))
      if(augCost.rep < fData.rep) {
        if(augCost.cost > ns.getServerMoneyAvailable("home")) {
          ns.printf("%s-> Qualify for %s, but too expensive (%s)",
              CONST.fgYellow, aug, 
              ns.formatPercent(ns.getServerMoneyAvailable("home")/ augCost.cost)
          )
          savingUp = true
          continue // too expensive
        }
        rehprintf(ns, "Purchasing %s from %s", aug, fac)
        ns.spawn("singularity-augpurchase.js", {spawnDelay: 0}, fac, aug)
        db.dbLog(ns, "start", ns.sprintf("Purchasing %s from %s", aug, fac))
      } else {
        // We got here by not having enough faction rep to buy it
        // So see if it's the "lowest" faction rep to get
        if (aug == "NeuroFlux Governor")
          continue // don't "grind" for NFG, just buy when convenient
        if(augCost.rep - fData.rep < minRepValue) {
          minRepFaction = fac
          favAugment = aug
          minRepValue = augCost.rep - fData.rep
        }
      }
    }
  }

  // If we got here, there was nothing we could buy right now
  // So we're going to just start a Grind for something later.
  // In that case, let's check the Priority Augment list and see
  // if we can get that going.
  for(var aug of priorityAugs) {
    if(augmentsIHave.includes(aug))
      continue; // we already have it
    for(var _fac of augsFromFaction) {
      fac = _fac.faction
      //var fData jkubnh= factionData.find((A) => (A.name == fac))
      if(_fac.augments.includes(aug)) {
        ns.printf("Found priority aug %s at %s", aug, fac)
        ns.spawn("singularity-augpurchase.js", {spawnDelay: 0}, fac, aug)
      }
    }
  }
  ns.printf("End of main loop")
  if (minRepFaction != "NONE") {
    // So there is an augment available to buy.
    // But we don't have sufficient Faction Rep.. so start grinding!
    ns.printf("Attempting to purchase %s from %s", favAugment, minRepFaction)
    ns.spawn("singularity-augpurchase.js", {spawnDelay: 0}, minRepFaction, favAugment)
  }

  // We only get here if we have NOT found
  //  a faction to join
  //  an augment to purchase
  //  a faction to grind
  // which kinda means "we're done?" with augments

  //rehprintf(ns, "Done with augments....")
  ns.printf("Done!")
}