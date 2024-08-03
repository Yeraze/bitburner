import {doCommand, rehprintf} from 'reh.js'
import * as db from 'database.js'
/** @param {NS} ns */
export async function main(ns) {
    var records = []
    var jobsToAssign = 0
    const sleeveCount = await doCommand(ns, "ns.sleeve.getNumSleeves()")

    const hourOffset = Math.floor((Date.now() - ns.getResetInfo().lastNodeReset) / (1000 * 3600)) 
    var factionList =  db.dbRead(ns, "factions") ?? []
    var augment = db.dbRead(ns, "augment")
    var eligibleList = factionList.filter((A) => (A.status && (A.name != augment?.faction)))
    var crimeList = ["Traffick Arms", "Kidnap", "Deal Drugs"]
    for(var sleeveNum =0; sleeveNum < sleeveCount; sleeveNum++) {
        var sleeve = ns.sleeve.getSleeve(sleeveNum)
        var sleeveRecord = { id: sleeveNum,
                             sync: sleeve.sync,
                             shock: sleeve.shock,
                             int: sleeve.skills.intelligence,
                             job: ''
         }
        // If this sleeve has Shock, drive it to 0
        if(sleeve.shock > 0) {
            await doCommand(ns, `ns.sleeve.setToShockRecovery(${sleeveNum})`)
            sleeveRecord.job = "Shock Recovery"
            records.push(sleeveRecord)
            continue
        }

        // If this sleeve is not synchronized, then synchronize it
        if(sleeve.sync < 99) {
            await doCommand(ns, `ns.sleeve.setToSynchronize(${sleeveNum})`)
            sleeveRecord.job = "Synchronize"
            records.push(sleeveRecord)
            continue
        }
        // Put the sleeve to work
        if((sleeveNum + hourOffset) % sleeveCount == 0) { // Sleeve 0 supports Player in faction grind
            // var pWork = await doCommand(ns, "ns.singularity.getCurrentWork()")
            if (augment) {
                var work = "hacking"
                // Prefer combat-stat work over Hacking, if available
                if(ns.singularity.getFactionWorkTypes(augment.faction).includes("security"))
                    work = "security"
                if(ns.singularity.getFactionWorkTypes(augment.faction).includes("field"))
                    work = "field"
                await doCommand(ns, 
                    `ns.sleeve.setToFactionWork(${sleeveNum}, "${augment.faction}", "${work}")`)
            } else {
                var job = ns.sleeve.getTask(sleeveNum)
                if(job == null) {  // This sleeve is idle.. 
                    var C = crimeList.shift()
                    await doCommand(ns, `ns.sleeve.setToCommitCrime(${sleeveNum}, "${C}")`)
                }
            }
        } else {
            // Here we try and assist with other faction grinds
            // Otherwise we fall back on University studies for that INT 
            var fac = eligibleList.shift()
            if (fac) {
                var work = "hacking"
                // Prefer combat-stat work over Hacking, if available
                if(ns.singularity.getFactionWorkTypes(fac.name).includes("security"))
                    work = "security"
                if(ns.singularity.getFactionWorkTypes(fac.name).includes("field"))
                    work = "field"
                await doCommand(ns, 
                    `ns.sleeve.setToFactionWork(${sleeveNum}, "${faction.name}", "${work}")`)               
            } else {
                var C = crimeList.shift()
                if (C) 
                    await doCommand(ns, `ns.sleeve.setToCommitCrime(${sleeveNum}, "${C}")`)
                else 
                    await doCommand(ns, 
                        `ns.sleeve.setToUniversityCourse(${sleeveNum}, "Rothman University", "Algorithms")`)
            }
        }
        var job = ns.sleeve.getTask(sleeveNum)
        if(job == null) {
            await doCommand(ns, 
                `ns.sleeve.setToUniversityCourse(${sleeveNum}, "Rothman University", "Algorithms")`)
        }

        job = ns.sleeve.getTask(sleeveNum)

        if(job == null) {
            // This should never happen, due to statement above
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
                    sleeveRecord.job = ns.sprintf("U: %s at %s", job.classType, job.location)
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

    for(var sleeveNum =0; sleeveNum < sleeveCount; sleeveNum++) {
        var sleeve = ns.sleeve.getSleeve(sleeveNum)
        if (sleeve.shock > 0)
            continue
        // Purchase any augments
        for(var aug of ns.sleeve.getSleevePurchasableAugs(sleeveNum)) {
            if(aug.cost < ns.getServerMoneyAvailable("home")) {
                if(await doCommand(ns, `ns.sleeve.purchaseSleeveAug(${sleeveNum}, "${aug.name}")`)) {
                    ns.toast(ns.sprintf("[SLEEVE:%i] Buying augment %s", sleeveNum, aug.name), "info", null)
                    db.dbLogf(ns, "[SLEEVE:%i] Buying augment %s", sleeveNum, aug.name)
                }
            }
        }     
    }
}