/** @param {NS} ns */
import * as db from 'database.js'

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL')

    var factionData = db.dbRead(ns, "factions") ?? []
    var factionList = []
    for(var fac of factionData)
      factionList.push(fac.name)

    var records = []
    for(var fac of factionList) {
        var augs = ns.singularity.getAugmentationsFromFaction(fac)
        var record = {
            faction : fac,
            augments: augs
        }
        records.push(record)
    }

    db.dbWrite(ns, "augs-from-faction", records)

}