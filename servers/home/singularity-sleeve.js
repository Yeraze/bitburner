import {rehprintf} from 'reh.js'
import * as db from 'database.js'
/** @param {NS} ns */
export async function main(ns) {
    var records = []
    var jobsToAssign = 0
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
            // This sleeve is idle.. Find work!
            switch (jobsToAssign) {
                case 0: // Help main faction grind
                    var pWork = ns.singularity.getCurrentWork()
                    if (pWork.type == "FACTION") {
                        ns.sleeve.setToFactionWork(sleeveNum, 
                            pWork.factionName, 
                            ns.singularity.getFactionWorkTypes(pWork.factionName)[0])
                    } 
                    break
                case 1: // crime
                    ns.sleeve.setToCommitCrime(sleeveNum, "Assassination")
                    break;
                default:
                    // Dunno?
            }
            jobsToAssign ++
        } 
        var job = ns.sleeve.getTask(sleeveNum)
        if(job == null) {
            sleeveRecord.job = "<idle>"
        } else {
            switch (job.type) {
                case "FACTION":
                    sleeveRecord.job = ns.sprintf("F: %s for %s", job.factionWorkType, job.factionName)
                    break;
                case "CRIME":
                    sleeveRecord.job = ns.sprintf("C: %s [%i cycles]", job.crimeType, job.tasksCompleted)
                    break;
                case "SYNCHRO":
                    sleeveRecord.job = "Synchronizing"
                    break;
                case "RECOVERY":
                    sleeveRecord.job = "Recovery"
                    break;
                case "INFILTRATE":
                    sleeveRecord.job = "Infiltration"
                    break;
                case "CLASS":
                    sleeveRecord.job = ns.sprintf("C: %s at %s", job.classType, job.location)
                    break;
                case "SUPPORT":
                    sleeveRecord.job = "Support"
                    break;
                default:
                    sleeveRecord.job = job.type
            } 
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
                if(ns.sleeve.purchaseSleeveAug(sleeveNum, aug.name)) {
                    ns.toast(ns.sprintf("[SLEEVE:%i] Buying augment %s", sleeveNum, aug.name), "info", null)
                    db.dbLogf(ns, "[SLEEVE:%i] Buying augment %s", sleeveNum, aug.name)
                }
            }
        }     
    }
}