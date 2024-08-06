import {doCommand, rehprintf} from 'reh.js'
import * as db from 'database.js'

let crimeList = ["Traffick Arms", "Kidnap", "Deal Drugs", "Homicide"]

async function doCrime(ns, sleeveNum, univCourse) {
    var C = crimeList.shift()
    if (C) {
        ns.printf("Setting sleeve %i to crime %s", sleeveNum, C)
        var job = ns.sleeve.getTask(sleeveNum)
        if (job && (job.type == "CRIME") && (job.crimeType == C)) {
            // Nothing to do.. we're already doing it.
        } else {
            await doCommand(ns, `ns.sleeve.setToCommitCrime(${sleeveNum}, "${C}")`)
        }
    } else { 
        ns.printf("No crimes, setting %i to study %s", sleeveNum, univCourse)

        // As a last resort, study
        await doCommand(ns, 
            `ns.sleeve.setToUniversityCourse(${sleeveNum}, "Rothman University", "${univCourse}")`)
    }
}

/** @param {NS} ns */
export async function main(ns) {
    var records = []
    var jobsToAssign = 0
    const sleeveCount = await doCommand(ns, "ns.sleeve.getNumSleeves()")
    crimeList = ["Traffick Arms", "Kidnap", "Deal Drugs", "Homicide"]

    // Get the list of factions we can Grind on 
    // no sense grinding when we can just donate/buy whatever Rep we need
    var factionList =  []
    for(var fac of (db.dbRead(ns, "factions") ?? [])) {
        if(ns.singularity.getFactionFavor(fac.name) > 150) 
            continue; // We don't need to grind when we can just Donate/buy
        factionList.push(fac)
    }

    // Get the current Augment we're working on 
    var augment = db.dbRead(ns, "augment")
    // Get the list of factions _not_ part of the Augment
    var eligibleList = factionList.filter((A) => (A.status && (A.name != augment?.faction)))
    ns.printf("Eligible Factions:")
    for(var A of eligibleList) ns.printf(" -> %s", A.name)

    // Reset any sleeve doing Faction work to Idle.
    //  This is so that later when we start assigning work, we don't wind up with
    //  errors about trying to have 2 do work for the same faction
    for(var sleeveNum =0; sleeveNum < sleeveCount; sleeveNum++) {
        var job = ns.sleeve.getTask(sleeveNum)
        if(job && job.type == "FACTION") {
            await doCommand(ns, `ns.sleeve.setToIdle(${sleeveNum})`)
        }
    }
    
    // If we have cash on hand, take the Algorithms course
    // If not, take the free computer Science course
    var univCourse = ns.getServerMoneyAvailable("home") > 1000000 ? "Algorithms" : "Computer Science"

    for(var sleeveNum =0; sleeveNum < sleeveCount; sleeveNum++) {
        var sleeve = ns.sleeve.getSleeve(sleeveNum)
        // Build the prototype object for our JSON storage later
        var sleeveRecord = { id: sleeveNum,
                             sync: sleeve.sync,
                             shock: sleeve.shock,
                             int: sleeve.skills.intelligence,
                             stats: [sleeve.skills.hacking, 
                                     sleeve.skills.strength, sleeve.skills.defense, 
                                     sleeve.skills.dexterity, sleeve.skills.agility, 
                                     sleeve.skills.charisma],                            
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
        if(sleeve.sync < 100) {
            await doCommand(ns, `ns.sleeve.setToSynchronize(${sleeveNum})`)
            sleeveRecord.job = "Synchronize"
            records.push(sleeveRecord)
            continue
        }
        // Put the sleeve to work
        if(sleeveNum == 0) { // Sleeve 0 supports Player in faction grind
            // var pWork = await doCommand(ns, "ns.singularity.getCurrentWork()")
            // for Sleeve 0, since it's assisting the player in the grind for an augment
            // pick the fastest action, Hacking preferred.
            if (augment) {
                var work = ""
                if(ns.singularity.getFactionWorkTypes(augment.faction).includes("security"))
                    work = "security"
                if(ns.singularity.getFactionWorkTypes(augment.faction).includes("field"))
                    work = "field"
                if(ns.singularity.getFactionWorkTypes(augment.faction).includes("hacking"))
                    work = "hacking"  
                if(work == "") // No work we can do here, so resort to CRIME!
                    await doCrime(ns, sleeveNum, univCourse)
                else
                    await doCommand(ns, 
                        `ns.sleeve.setToFactionWork(${sleeveNum}, "${augment.faction}", "${work}")`)   
            } else {
                // Player isn't working on an augment, so just do Crime
                // or as a last resort educate yourself (Int grind)
                await doCrime(ns, sleeveNum, univCourse)
            }
        } else {
            // Here we try and assist with other faction grinds
            // Otherwise we fall back on University studies for that INT 
            var fac = eligibleList.shift()
            if (fac) {
                // Prioritize reputation grind for any other joined factions
                var work = ""
                if(ns.singularity.getFactionWorkTypes(fac.name).includes("hacking"))
                    work = "hacking"               
                // Prefer combat-stat work over Hacking, if available
                if(ns.singularity.getFactionWorkTypes(fac.name).includes("security"))
                    work = "security"
                if(ns.singularity.getFactionWorkTypes(fac.name).includes("field"))
                    work = "field"
                if(work == "") 
                    await doCrime(ns, sleeveNum, univCourse)
                else
                    await doCommand(ns, 
                        `ns.sleeve.setToFactionWork(${sleeveNum}, "${fac.name}", "${work}")`)               
            } else {
                // No more factions, Next run some crimes
                await doCrime(ns, sleeveNum, univCourse)
            }
        }
        var job = ns.sleeve.getTask(sleeveNum)
        if(job == null) {
            // If we got here and the sleeve is _still_ idle, then something went pretty wrong..
            // Try one last time to enroll in university
            await doCommand(ns, 
                `ns.sleeve.setToUniversityCourse(${sleeveNum}, "Rothman University", "${univCourse}")`)
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
    // Save the sleeve status to disk
    db.dbWrite(ns, "sleeves", records)

    // Now buy any augments we can
    for(var sleeveNum =0; sleeveNum < sleeveCount; sleeveNum++) {
        var sleeve = ns.sleeve.getSleeve(sleeveNum)
        if (sleeve.shock > 0)
            continue
        // Purchase any augments
        for(var aug of ns.sleeve.getSleevePurchasableAugs(sleeveNum)) {
            if(aug.cost < ns.getServerMoneyAvailable("home")) {
                if(await doCommand(ns, `ns.sleeve.purchaseSleeveAug(${sleeveNum}, "${aug.name}")`)) {
                    ns.toast(ns.sprintf("[SLEEVE:%i] Buying augment %s", sleeveNum, aug.name), "info")
                    db.dbLogf(ns, "[SLEEVE:%i] Buying augment %s", sleeveNum, aug.name)
                }
            }
        }     
    }
}