import {doCommand, rehprintf} from 'reh.js'
import * as db from 'database.js'
/** @param {NS} ns */
export async function main(ns) {
    const faction = ns.args[0]
    const aug = ns.args[1]
    // If we have the NMI we can background the hacking

    if (await doCommand(ns, `ns.singularity.purchaseAugmentation("${faction}", "${aug}")`)) {
        //rehprintf(ns, "Purchased %s from %s", aug, faction)
        db.setConfig(ns, "buynfg", 1)
        db.dbLogf(ns, "Purchased %s from %s", aug, faction)
        await db.dbGlobalLogf(ns, "Purchased %s from %s", aug, faction)
        ns.toast(ns.sprintf("Purchased %s", aug), "success", null)
        if(aug == "NeuroFlux Governor") {
            var record = db.dbRead(ns, "nfg")
            var count = 0
            if(record)
                count = record.count
            count++
            var nr = {count:count, last: Date.now()}
            db.dbWrite(ns, "nfg", nr)
        }
        if(aug == "The Red Pill") {
            ns.toast("Restarting to ENDGAME!", "info", null)
            ns.spawn("reset.js")
        }
        return
    }
    // We couldn't buy it.. see if we can donate up to it..
    var boughtIt = false

    if( ns.singularity.getFactionFavor(faction) >= ns.getFavorToDonate()) {
        // See how many donations we can make before we run out of cash
        //  or can just buy the augment we're looking at
        //  each donation is 100e9 = $100B
        const donation = 100e9
        if (faction == "Church of the Machine God")
          return // We can't donate to this faction
        while((ns.getServerMoneyAvailable("home") > donation) && !boughtIt) {
            await doCommand(ns, `ns.singularity.joinFaction("${faction}")`)
            await doCommand(ns, `ns.singularity.donateToFaction("${faction}", ${donation})`)

            db.dbLogf(ns, "Donated $%s to %s", ns.formatNumber(donation), faction)
            if(ns.singularity.getAugmentationRepReq(aug) < ns.singularity.getFactionRep(faction)) {
                boughtIt = true
                rehprintf(ns, "-> Donations enabled purchasing %s from %s", aug, faction)
                if(await doCommand(ns, `ns.singularity.purchaseAugmentation("${faction}", "${aug}")`)) {
                    await db.dbGlobalLogf(ns, "Purchased %s from %s", aug, faction)
                    db.setConfig(ns, "buynfg", 1)
                    ns.toast(ns.sprintf("Purchased %s", aug), "success", null)
                    db.dbLogf(ns, "Purchased %s from %s", aug, faction)
                }

                if(aug == "The Red Pill") {
                    ns.toast("Restarting to ENDGAME!", "info", null)
                    ns.spawn("reset.js")
                }
            }    
        }
    }   
    // If we still coudn't buy it, just flag that we're grinding for it
    // Triggering "factionjoin" will also starting hacking for it
    if(!boughtIt) {
        var favor = ns.singularity.getFactionFavor(faction)
        if (favor < ns.getFavorToDonate()) {
            // See if a reset to convert Rep->Favor would be enough to
            // enable donations on the next run.
            var convFavor = ns.singularity.getFactionFavorGain(faction)
            var trigger = false
            for(var breakpoint of [ns.getFavorToDonate() * 0.33, 
                               ns.getFavorToDonate() * 0.66,
                               ns.getFavorToDonate()]) {

              if (favor < breakpoint) {
                if (favor + convFavor > breakpoint) {
                  trigger = true;
                }
              }
            }
            
            if(trigger) {
                if(await doCommand(ns, `ns.singularity.getCurrentWork().type`) == "GRAFTING") {
                    ns.printf("WARN: Ready for %s, but awaiting Graft", faction)
                } else {
                    ns.toast(ns.sprintf("Restarting to accelerate faction for %s", faction), "info")
                    await db.dbGlobalLogf(ns, "Restarting to accelerate %s", faction)
                    ns.spawn("reset.js")
                }
            }
        }
        var record = {augment: aug,
                      faction: faction,
                      repRemaining: ns.singularity.getAugmentationRepReq(aug) - ns.singularity.getFactionRep(faction),
                      progress: ns.formatPercent( ns.singularity.getFactionRep(faction) / ns.singularity.getAugmentationRepReq(aug))
        }
        db.dbWrite(ns, "augment", record)
        ns.spawn("singularity-factionjoin.js", {spawnDelay: 0}, faction)
    }

}
