import {rehprintf} from 'reh.js'
import * as CONST from 'reh-constants.js'
import * as db from 'database.js'
/** @param {NS} ns */
export async function main(ns) {
  ns.printf("Reading aug-all")
  const augmentsIHave = db.dbRead(ns, "aug-all")
  ns.printf("Reading aug-installed")
  const augmentsInstalled = db.dbRead(ns, "aug-installed")

  var augsToBuy = ["The Red Pill"] // We always want this one
  var minRepFaction = "NONE"
  var minRepValue = 10e9
  var favAugment = ""
  var savingUp = false
  var augsPurchased = augmentsIHave.filter( (A) => (augmentsInstalled.indexOf(A) == -1))
  if (augsPurchased.length > 0) {
    ns.toast(ns.sprintf("%i purchased augments pending", augsPurchased.length), "info", 10000)
  }
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
  var maskHack = false
  var maskFaction = false
  var maskCompany = false
  var maskHacknet = false
  var maskCrime = false
  var maskBody = false
  var maskBladeburner = false
  var maskCharisma = false
  ns.printf("In bitnode %i", ns.getResetInfo().currentNode)

  switch(ns.getResetInfo().currentNode) {
    case 2: // gangs
      maskFaction = true; maskHack = true; maskBody = true; maskCrime = true; break;
    case 3: // Corporations
      maskHack = true; maskCompany = true; break;
    case 4: // Singularity
      maskFaction = true; maskHack = true; break;
    case 5: // Intelligence
      maskFaction = true; maskHack = true; break;
    case 6: // Bladeburners
    case 7:
      maskFaction = true; maskHack = true; maskBladeburner = true; break;
    case 9: // Hacknet Server
      maskFaction = true; maskHack = true; maskHacknet = true; break;
    case 10: // Sleeves, need Body points to reach Covenant
      maskFaction = true; maskHack = true; maskBody = true; break;
    case 12: // Recursion
    case 11: // the big crash
    case 13: // Church of Staken
    case 8: // Wall Street
    case 1: // default
    default:
      maskFaction = true; maskHack = true; break;
  }
  for(var _fac of augsFromFaction) {
    fac = _fac.faction
    for(var aug of _fac.augments) {  
      // See if we meet the prereq's
      for(var preReq of augPrereqs.find((A) => (A.augment == aug)).prereqs ) {
        if (augmentsIHave.indexOf(preReq) == -1) {
          continue
        }
      }
      // Attempt to "categorize" the aug
      var stats = augStats.find((A) => (A.augment == aug)).stats

      var fHack = (stats.hacking != 1.0) || (stats.hacking_chance != 1.0) || 
                  (stats.hacking_exp != 1.0) || (stats.hacking_grow != 1.0) ||
                  (stats.hacking_money != 1.0) || (stats.hacking_speed != 1.0)
      var fFaction =  (stats.faction_rep != 1.0)
      var fCompany =  (stats.company_rep != 1.0) || (stats.work_money != 1.0)
      var fHacknet = (stats.hacknet_node_core_cost != 1.0) || (stats.hacknet_node_level_cost != 1.0) ||
                  (stats.hacknet_node_money != 1.0) || (stats.hacknet_node_purchase_cost != 1.0) ||
                  (stats.hacknet_node_ram_cost != 1.0)
      var fCrime = (stats.crime_money != 1.0) || (stats.crime_success != 1.0)
      var fBody = (stats.defense != 1.0) || (stats.defense_exp != 1.0) ||
                  (stats.dexterity != 1.0) || (stats.dexterity_exp != 1.0) ||
                  (stats.strength != 1.0) || (stats.strength_exp != 1.0) ||
                  (stats.agility != 1.0) || (stats.agility_exp != 1.0)
      var fCharisma = (stats.charisma != 1.0) || (stats.charisma_exp != 1.0) 
      var fBladeburner = (stats.bladeburner_analysis != 1.0) ||
                  (stats.bladeburner_max_stamina != 1.0) || (stats.bladeburner_stamina_gain != 1.0) ||
                  (stats.bladeburner_success_chance != 1.0)
      if ( (maskHack && fHack) || (maskFaction && fFaction) ||
            (maskCompany && fCompany) || (maskHacknet && fHacknet) ||
            (maskCrime && fCrime) || (maskBody && fBody) ||
            (maskBladeburner && fBladeburner) || 
            (maskCharisma && fCharisma)) {
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
      ns.printf("[%s] %s", fac, aug)
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