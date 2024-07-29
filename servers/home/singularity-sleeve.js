import {rehprintf} from 'reh.js'
/** @param {NS} ns */
export async function main(ns) {
    for(var sleeveNum =0; sleeveNum < ns.sleeve.getNumSleeves(); sleeveNum++) {
        var sleeve = ns.sleeve.getSleeve(sleeveNum)
        
        // If this sleeve has Shock, drive it to 0
        if(sleeve.shock > 0) {
            ns.sleeve.setToShockRecovery(sleeveNum)
            continue
        }

        // If this sleeve is not synchronized, then synchronize it
        if(sleeve.sync < 99) {
            ns.sleeve.setToSynchronize(sleeveNum)
            continue
        }

        // Put the sleeve to work

        // Purchase any augments
        for(var aug of ns.sleeve.getSleevePurchasableAugs(sleeveNum)) {
            if(aug.cost < ns.getServerMoneyAvailable("home")) {
                if(ns.sleeve.purchaseSleeveAug(sleeveNum, aug))
                    ns.toast(ns.sprintf("[SLEEVE:%i] Buying augment %s", sleeveNum, aug.name), "info", null)
            }
        }
        
    }
}