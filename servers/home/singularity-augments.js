import {rehprintf} from 'reh.js'
import * as CONST from 'reh-constants.js'
import * as db from 'database.js'
/** @param {NS} ns */
export async function main(ns) {
  const augmentsIHave = ns.singularity.getOwnedAugmentations(true)
  const augmentsToBuy=["ADR-V1 Pheromone Gene",
                       "Artificial Synaptic Potentiation",
                       "BitWire",
                       "CashRoot Starter Kit",
                       "Cranial Signal Processors - Gen I",
                       "Cranial Signal Processors - Gen II",
                       "Cranial Signal Processors - Gen III",
                       "Cranial Signal Processors - Gen IV",
                       "Cranial Signal Processors - Gen V",
                       "CRTX42-AA Gene Modification",
                       "DataJack",
                       "Embedded Netburner Module",
                       "Embedded Netburner Module Core Implant",
                       "Enhanced Myelin Sheathing",
                       "Neural-Retention Enhancement",
                       "Neurotrainer I",
                       "Neurotrainer II",
                       "Social Negotiation Assistant (S.N.A)",
                       "Synaptic Enhancement Implant",
                       "The Black Hand",
                       "BitRunners Neurolink",
                       "Artificial Bio-neural Network Implant",
                       "Neural Accelerator",
                       "Embedded Netburner Module Core V2 Upgrade",
                       "Neuralstimulator",
                       "Neuroreceptor Management Implant",
                       "Neuregen Gene Modification",
                       "Wired Reflexes",
                       "Speech Enhancement",
                       "Nuoptimal Nootropic Injector Implant",
                       "Speech Processor Implant",
                       "Nanofiber Weave",
                       "Embedded Netburner Module Core V3 Upgrade",
                       "Embedded Netburner Module Analyze Engine",
                       "Embedded Netburner Module Direct Memory Access Upgrade",
                       "The Red Pill"]
  var minRepFaction = "NONE"
  var minRepValue = 10e9
  var favAugment = ""
  var augsToBuy = []
  var savingUp = false
  var augsPurchased = augmentsIHave.filter( (A) => (ns.singularity.getOwnedAugmentations(false).indexOf(A) == -1))
  if (augsPurchased.length > 0) {
    ns.toast(ns.sprintf("%i purchased augments pending", augsPurchased.length), "info", 10000)
  }
  var record = { augmentsInstalled: ns.singularity.getOwnedAugmentations(false).length,
                 augmentsPurchased: augsPurchased.length}
  db.dbWrite(ns, "augment-meta", record)

  var factionStats = []
  for(var fac of ns.getPlayer().factions.concat(ns.singularity.checkFactionInvitations())) {
    var record = { name : fac,
                   rep : ns.singularity.getFactionRep(fac),
                   favor : ns.singularity.getFactionFavor(fac),
                   favorGain : ns.singularity.getFactionFavorGain(fac),
                   status : (ns.getPlayer().factions.indexOf(fac) != -1),
    }
    factionStats.push(record)
  }
  db.dbWrite(ns, "factions", factionStats)


  // First search the list to see what the "lowest rep" aug is
  for(var fac of ns.getPlayer().factions.concat(ns.singularity.checkFactionInvitations())) {
    for(var aug of ns.singularity.getAugmentationsFromFaction(fac)) {
      if(augmentsIHave.includes(aug) && (aug != "NeuroFlux Governor")) 
        continue; // We already have this
      if(ns.singularity.getAugmentationsFromFaction(fac).indexOf(aug) != -1) {
        if(ns.singularity.getAugmentationRepReq(aug) < ns.singularity.getFactionRep(fac)) {
          if(ns.singularity.getAugmentationPrice(aug) > ns.getServerMoneyAvailable("home")) {
            ns.tprintf("%s-> Qualify for %s, but too expensive (%s)",
                CONST.fgYellow, aug, 
                ns.formatPercent(ns.getServerMoneyAvailable("home")/ ns.singularity.getAugmentationPrice(aug))
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
          if(ns.singularity.getAugmentationRepReq(aug) - ns.singularity.getFactionRep(fac) < minRepValue) {
            minRepFaction = fac
            favAugment = aug
            minRepValue = ns.singularity.getAugmentationRepReq(aug) - ns.singularity.getFactionRep(fac)
          }
        }
      }
    }
  }

  if (minRepFaction != "NONE") {
    // So there is an augment available to buy.
    // But we don't have sufficient Faction Rep.. so start grinding!
    ns.spawn("singularity-augpurchase.js", {spawnDelay: 0}, minRepFaction, favAugment)
  }

  // We only get here if we have NOT found
  //  a faction to join
  //  an augment to purchase
  //  a faction to grind
  // which kinda means "we're done?" with augments

  //rehprintf(ns, "Done with augments....")
}