import {rehprintf, doCommand} from 'reh.js'
import * as db from 'database.js'
import { qualifyAugment } from './reh'
/** @param {NS} ns */
export async function main(ns) {
    // Only bother with grafting if we have cash
    const cash = ns.getServerMoneyAvailable("home")

    const priorityAugs = ['violet', 'QLink', 'CashRoot', 'Neuroreceptor']
    // If we're already grafting then don't bother
    if(ns.singularity.getCurrentWork().type == "GRAFTING") {
        ns.printf("EXITING: Already grafting")
        db.dbLogf(ns, "GRAFT: Already grafting")
        return
    }
    var faction = db.dbRead(ns, "faction") 
    if(faction) {
      if(faction.faction =="Daedalus") {
        ns.printf("Aborting graft to grind Daedalus")
        db.dbLogf(ns, "GRAFT: Grinding Daedalus")
        return
      }   
    }

    var factionAugs = []
    for(var fac of db.dbRead(ns, "augs-from-faction")) {
        factionAugs = factionAugs.concat( fac.augments )
    }

    // const augList = doCommand(ns, "ns.grafting.getGraftableAugmentations()")
    const augList = ns.grafting.getGraftableAugmentations()
    if(augList == null) {
        ns.printf("ERROR: No augments")
        db.dbLogf(ns, "GRAFT: No graftable augments")
        return
    }

    // Trim to augs we can afford
    const affordableAugs = augList.filter((A) => (
        (ns.grafting.getAugmentationGraftPrice(A)*1.1) < cash
    ))
    const interestedAugs = []
    for(var aug of affordableAugs) {
        var stats = ns.singularity.getAugmentationStats(aug)
        // See if this augment hits our BN qualifications as useful
        //   Priority augs are _always_ interesting
        var qualified = qualifyAugment(ns, stats, "GRAFT")
        var priority = false
        for(var a of priorityAugs) 
          if(aug.includes(a)) {
            qualified = true
            priority = true
          }
        
        if(qualified == false)
            continue
        // See if this is available for purchase directly
        // If it's a Priority aug, then we will graft it anyway
        if(factionAugs.includes(aug) && !priority)
            continue

        // Check for pre-requisite augments
        var preReq = ns.singularity.getAugmentationPrereq(aug)
        var myAugs= ns.singularity.getOwnedAugmentations()
        var meetsPreReq = true
        for(var req of preReq) {
            if(!myAugs.includes(req)) 
                meetsPreReq = false
        }
        if (!meetsPreReq)
            continue


        ns.printf("Possible augment: %s", aug)
        interestedAugs.push( {aug: aug,
                              cost: ns.grafting.getAugmentationGraftPrice(aug),
                              time: ns.grafting.getAugmentationGraftTime(aug) } )
    }


    if (interestedAugs.length == 0) {
        db.dbLogf(ns, "GRAFT: No interesting augments..")
        return
    }

    // Reverse sort on price, so [0] is most expensive
    //interestedAugs.sort((A,B) => (A.cost - B.cost)).reverse()
    // Sort on time, so [0] is fastest
    interestedAugs.sort((A,B) => (A.time - B.time))


/*
    if(ns.getPlayer().entropy >= 10) {
        // We need to get rid of this entropy before we go any further
        interestedAugs.unshift( { aug: "violet Congruity Implant"})
    }
    */

    var augToGraft = interestedAugs[0]
    
    // doubleCheck for priority augs in the list
    for(var aug of interestedAugs){
      for(var P of priorityAugs) {
        if(aug.aug.includes(P))
          augToGraft = aug
      }
    }

    try { 
        if (ns.getPlayer().city != "New Tokyo") {
            db.dbLogf(ns, "GRAFT: Traveling to New Tokyo for grafting..")
            ns.singularity.travelToCity("New Tokyo")
        }
        if(ns.grafting.graftAugmentation(augToGraft.aug)) {
            db.dbLogf(ns, "GRAFT: Starting graft for %s",augToGraft.aug)
            ns.write("/tmp/grafted.txt", augToGraft.aug, "w")
        } else {
            db.dbLogf(ns, "GRAFT: Failed to start graft of %s", augToGraft.aug)
        }
    } catch (error) {
        db.dbLogf(ns, "ERROR: Failed to start graft of %s: %s", augToGraft.aug, error)
    }
}