/** @param {NS} ns */
import * as db from 'database.js'

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL')

    var augList = ns.singularity.getOwnedAugmentations(true)
    db.dbWrite(ns, "aug-all", augList)

    var augList = ns.singularity.getOwnedAugmentations(false)
    db.dbWrite(ns, "aug-installed", augList)


}