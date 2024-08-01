import {rehprintf} from 'reh.js'
import * as db from 'database.js'

/** @param {NS} ns */
export async function main(ns) {
    const faction = ns.args[0]
    if(ns.singularity.joinFaction(faction))
        ns.toast(ns.sprintf("Joined faction %s", faction), "success", null)
    // If we have the NMI we can background the hacking
    var focus = ns.singularity.getOwnedAugmentations(false).indexOf("Neuroreceptor Management Implant") == -1
    ns.singularity.workForFaction(faction, "hacking", focus)
    var record = { faction: faction, work: "hacking"}
    db.dbWrite(ns, "faction", record)
}