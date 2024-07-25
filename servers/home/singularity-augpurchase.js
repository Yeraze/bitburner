import {rehprintf} from 'reh.js'
/** @param {NS} ns */
export async function main(ns) {
    const faction = ns.args[0]
    const aug = ns.args[1]
    // If we have the NMI we can background the hacking

    if (ns.singularity.purchaseAugmentation(faction, aug)) {
        rehprintf(ns, "Purchased %s from %s", aug, faction)
        ns.toast(ns.sprintf("Purchased %s", aug), "success", null)
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
            if(ns.singularity.getAugmentationRepReq(aug) > ns.singularity.getFactionRep(faction)) {
                boughtIt = true
                rehprintf(ns, "-> Donations enabled purchasing %s from %s", aug, faction)
                ns.singularity.purchaseAugmentation(faction, aug)
            }    
        }
    }   
    // If we still coudn't buy it, just flag that we're grinding for it
    // Triggering "factionjoin" will also starting hacking for it
    if(!boughtIt) {
        rehprintf(ns, "Grinding up for %s from %s (%s)", 
            aug, faction,
            ns.formatPercent( ns.singularity.getFactionRep(faction) / ns.singularity.getAugmentationRepReq(aug)))
        ns.spawn("singularity-factionjoin.js", {spawnDelay: 0}, faction)
    }

}