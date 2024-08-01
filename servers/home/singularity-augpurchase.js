import {rehprintf} from 'reh.js'
import * as db from 'database.js'
/** @param {NS} ns */
export async function main(ns) {
    const faction = ns.args[0]
    const aug = ns.args[1]
    // If we have the NMI we can background the hacking

    if (ns.singularity.purchaseAugmentation(faction, aug)) {
        rehprintf(ns, "Purchased %s from %s", aug, faction)
        ns.toast(ns.sprintf("Purchased %s", aug), "success", null)
        if(aug == "The Red Pill") {
            ns.toast("Restarting to ENDGAME!", "info", null)
            ns.spawn("reset.js")
        }
        return
    }
    // We couldn't buy it.. see if we can donate up to it..
    var boughtIt = false

    if( ns.singularity.getFactionFavor(faction) >= 150) {
        // See how many donations we can make before we run out of cash
        //  or can just buy the augment we're looking at
        //  each donation is 100e9 = $100B
        const donation = 100e9
        while((ns.getServerMoneyAvailable("home") > donation) && !boughtIt) {
            ns.singularity.donateToFaction(faction, donation)
            rehprintf(ns, "Donated $%s to %s", ns.formatNumber(donation), faction)
            if(ns.singularity.getAugmentationRepReq(aug) < ns.singularity.getFactionRep(faction)) {
                boughtIt = true
                rehprintf(ns, "-> Donations enabled purchasing %s from %s", aug, faction)
                if(ns.singularity.purchaseAugmentation(faction, aug))
                    ns.toast(ns.sprintf("Purchased %s", aug), "success", null)

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
        if (favor < 150) {
            // See if a reset to convert Rep->Favor would be enough to
            // enable donations on the next run.
            var convFavor = ns.singularity.getFactionFavorGain(faction)

            if(favor + convFavor > 150) {
                ns.toast(ns.sprintf("Restarting to enable DONATIONS for %s", faction), "info", null)
                ns.spawn("reset.js")
            } else {
                ns.tprintf("INFO: Too early for reset, would only net %i favor (%s)",
                    favor + convFavor, faction)
            }
        }
        var record = {augment: aug,
                      faction: faction,
                      progress: ns.formatPercent( ns.singularity.getFactionRep(faction) / ns.singularity.getAugmentationRepReq(aug))
        }
        db.dbWrite(ns, "augment", record)
        rehprintf(ns, "Grinding up for %s from %s (%s)", 
            record.augment, record.faction, record.progress)
        ns.spawn("singularity-factionjoin.js", {spawnDelay: 0}, faction)
    }

}