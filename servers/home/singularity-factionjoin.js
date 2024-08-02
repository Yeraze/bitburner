import {rehprintf} from 'reh.js'
import * as db from 'database.js'

/** @param {NS} ns */
export async function main(ns) {
    const faction = ns.args[0]
    if(ns.singularity.joinFaction(faction))
        ns.toast(ns.sprintf("Joined faction %s", faction), "success", null)
    // If we have the NMI we can background the hacking
    var focus = ns.singularity.getOwnedAugmentations(false).indexOf("Neuroreceptor Management Implant") == -1
    var work = ns.singularity.getFactionWorkTypes(faction)[0]
    if (ns.singularity.getFactionWorkTypes(faction).includes("hacking"))
        work = "hacking"
    ns.singularity.workForFaction(faction, work, focus)
    var record = { faction: faction, work: work}
    db.dbWrite(ns, "faction", record)
}