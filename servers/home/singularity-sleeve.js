import {rehprintf} from 'reh.js'
import * as db from 'database.js'
/** @param {NS} ns */
export async function main(ns) {
    var records = []
    for(var sleeveNum =0; sleeveNum < ns.sleeve.getNumSleeves(); sleeveNum++) {
        var sleeve = ns.sleeve.getSleeve(sleeveNum)
        var sleeveRecord = { id: sleeveNum,
                             sync: sleeve.sync,
                             shock: sleeve.shock,
                             job: ''
         }
        // If this sleeve has Shock, drive it to 0
        if(sleeve.shock > 0) {
            ns.sleeve.setToShockRecovery(sleeveNum)
            sleeveRecord.job = "Shock Recovery"
            records.push(sleeveRecord)
            continue
        }

        // If this sleeve is not synchronized, then synchronize it
        if(sleeve.sync < 99) {
            ns.sleeve.setToSynchronize(sleeveNum)
            sleeveRecord.job = "Synchronize"
            records.push(sleeveRecord)
            continue
        }
        // Put the sleeve to work
        if(ns.sleeve.getTask(sleeveNum) == null) {
            ns.sleeve.setToUniversityCourse(sleeveNum, "Rothman University", "Algorithms")
            sleeveRecord.job = "Studying Algorithms"
        } else {
            sleeveRecord.job = ns.sleeve.getTask(sleeveNum).actionName
        }
        records.push(sleeveRecord)
    }
    db.dbWrite(ns, "sleeves", records)

    for(var sleeveNum =0; sleeveNum < ns.sleeve.getNumSleeves(); sleeveNum++) {
        var sleeve = ns.sleeve.getSleeve(sleeveNum)
        if (sleeve.shock > 0)
            continue
        // Purchase any augments
        for(var aug of ns.sleeve.getSleevePurchasableAugs(sleeveNum)) {
            if(aug.cost < ns.getServerMoneyAvailable("home")) {
                if(ns.sleeve.purchaseSleeveAug(sleeveNum, aug.name))
                    ns.toast(ns.sprintf("[SLEEVE:%i] Buying augment %s", sleeveNum, aug.name), "info", null)
            }
        }     
    }
}