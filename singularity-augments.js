import {rehprintf} from 'reh.js'
/** @param {NS} ns */
export async function main(ns) {
  const augmentsIHave = ns.singularity.getOwnedAugmentations(true)
  const augmentsToBuy=["ADR-V1 Pheromone Gene",
                       "Artificial Synaptic Potentiation",
                       "BitWire",
                       "Cranial Signal Processors - Gen I",
                       "Cranial Signal Processors - Gen II",
                       "Cranial Signal Processors - Gen II",
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
                       "PCMatrix",
                       "Neuroreceptor Management Implant",
                       "Embedded Netburner Module Core V3 Upgrade",
                       "Embedded Netburner Module Analyze Engine",
                       "Embedded Netburner Module Direct Memory Access Upgrade",
                       "The Red Pill"]
  var minRepFaction = "NONE"
  var minRepValue = 10e9
  var favAugment = ""
  for(var aug of augmentsToBuy) {
    if (augmentsIHave.indexOf(aug) != -1) 
      continue // we already own this one
    if(ns.singularity.getAugmentationPrice(aug) > ns.getServerMoneyAvailable("home"))
      continue // too expensive
    for(var fac of ns.getPlayer().factions) {
      if(ns.singularity.getAugmentationsFromFaction(fac).indexOf(aug) != -1) {
        if(ns.singularity.getAugmentationRepReq(aug) < ns.singularity.getFactionRep(fac)) {
          rehprintf(ns, "Purchasing %s from %s", aug, fac)
          ns.singularity.purchaseAugmentation(fac, aug)
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
  if (minRepFaction != "NONE") {
    // So this augment is available to buy.
    // But we don't have sufficient Faction Rep.. so start grinding!
    var focus = augmentsIHave.indexOf("Neuroreceptor Management Implant") == -1
    ns.singularity.workForFaction(minRepFaction, "hacking", focus)
    rehprintf(ns, "Hacking for %s to buy %s", minRepFaction, favAugment)
  }

}