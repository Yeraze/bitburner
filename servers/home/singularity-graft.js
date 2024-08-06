import {rehprintf, doCommand} from 'reh.js'
import * as db from 'database.js'
import { qualifyAugment } from './reh'
/** @param {NS} ns */
export async function main(ns) {
    // Only bother with grafting if we have cash
    const cash = ns.getServerMoneyAvailable("home")
    if(cash < 1000000000) {
        ns.printf("EXITING: Insufficient funds")
        return
    }

    // If we're already grafting then don't bother
    if(ns.singularity.getCurrentWork().type == "GRAFTING") {
        ns.printf("EXITING: Already grafting")
        return
    }

    var factionAugs = []
    for(var fac of db.dbRead(ns, "augs-from-faction")) {
        factionAugs = factionAugs.concat( fac.augments )
    }

    // const augList = doCommand(ns, "ns.grafting.getGraftableAugmentations()")
    const augList = ns.grafting.getGraftableAugmentations()
    if(augList == null) {
        ns.printf("ERROR: No augments")
        return
    }

    const affordableAugs = augList.filter((A) => (
        ns.grafting.getAugmentationGraftPrice(A) < cash
    ))
    const interestedAugs = []
    for(var aug of affordableAugs) {
        var stats = ns.singularity.getAugmentationStats(aug)
        // See if this augment hits our BN qualifications as useful
        //   And the violet entropy virus aug is always interesting
        if((qualifyAugment(ns, stats)==false) && (aug.includes("violet") == false))
            continue
        // See if this is available for purchase directly
        if(factionAugs.includes(aug))
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
                              cost: ns.grafting.getAugmentationGraftPrice(aug) } )
    }


    if (interestedAugs.length == 0) {
        db.dbLogf(ns, "GRAFT: No augments available...")
        return
    }

    interestedAugs.sort((A,B) => (A.cost - B.cost)).reverse()

    try { 
        if(ns.grafting.graftAugmentation(interestedAugs[0].aug)) {
            db.dbLogf(ns, "GRAFT: Starting graft for %s",interestedAugs[0].aug)
            ns.write("/tmp/grafted.txt", interestedAugs[0].aug, "w")
        } else {
            db.dbLogf(ns, "GRAFT: Failed to start graft of %s", interestedAugs[0].aug)
        }
    } catch (error) {
        db.dbLogf(ns, "ERROR: Failed to start graft of %s: %s", interestedAugs[0].aug, error)
    }
}