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

        var job = ns.sleeve.getTask(sleeveNum)

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
                case "COMPANY":
                    sleeveRecord.job = ns.sprintf("W: %s", job.companyName)
                    break;
                default:
                    sleeveRecord.job = job.type
            } 
        }
        records.push(sleeveRecord)
    }
    // Save the sleeve status to disk
    db.dbWrite(ns, "sleeves", records)
}