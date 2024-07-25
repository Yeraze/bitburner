import {rehprintf} from 'reh.js'
import * as CONST from 'reh-constants.js'
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
  // First search the list to see what the "lowest rep" aug is
  for(var aug of augmentsToBuy) {
    if (augmentsIHave.indexOf(aug) != -1) 
      continue // we already own this one

    for(var fac of ns.getPlayer().factions) {
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
        } else {
          if(ns.singularity.getAugmentationRepReq(aug)  < minRepValue) {
            minRepFaction = fac
            favAugment = aug
            minRepValue = ns.singularity.getAugmentationRepReq(aug)
          }
        }
      }
    }
  }
  // If there are invitations I haven't accepted, maybe I should?
  // We run this in a totally separate loop, so that we only consider
  //. augments here that are cheaper than anything we could buy above
  for(var aug of augmentsToBuy) {
    if (augmentsIHave.indexOf(aug) != -1) 
      continue // we already own this one
    for(var fac of ns.singularity.checkFactionInvitations()) {
      if(ns.singularity.getAugmentationsFromFaction(fac).indexOf(aug) != -1) {
        if(ns.singularity.getAugmentationRepReq(aug)  < minRepValue) {
          // So we found a "rep-cheaper" aug than anything we have accessto already
          // but it's offered by a faction we haven't joined yet.. So join up!
          //  This isn't perfect.. if we have multiple outstanding fac invites 
          // that conflict, we could choose poorly..But eventually it'll all work itself out
          minRepFaction = fac
          favAugment = aug
          minRepValue = ns.singularity.getAugmentationRepReq(aug)

          // Join the faction and start hacking for it
          ns.spawn("singularity-factionjoin.js", {spawnDelay: 0}, fac)
        }
      }
    }
  }

  // ok... If we got here then there's probably nothing to buy.
  // so NFG it is!
  // Unless we're saving up for something
  if(savingUp == false) 
    for(var fac of ns.getPlayer().factions) {
      for(var aug of ns.singularity.getAugmentationsFromFaction(fac)) {
        if(aug.startsWith("NeuroFlux Governor")) {
          if(ns.getServerMoneyAvailable("home") < ns.singularity.getAugmentationPrice(aug))
            continue // we can't afford this with cash
          if(ns.singularity.getFactionRep(fac) < ns.singularity.getAugmentationRepReq(aug))
            continue // we can't afford this with rep
          // If we got here, we should be able to afford it.
          ns.spawn("singularity-augpurchase.js", {spawnDelay: 0}, fac, aug)      
          // We never start grinding for NFG, we just buy it when it's available.  
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

  rehprintf(ns, "Done with augments....")
}