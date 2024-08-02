/** @param {NS} ns */
import * as db from 'database.js'

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL')
    var augsFromFaction = db.dbRead(ns, "augs-from-faction")

    var records = []
    for(var _fac of augsFromFaction) {
        for(var aug of _fac.augments) {  
            if(records.filter((A) => (A.augment == aug)).length > 0)
                continue
            var R = {augment: aug,
                     stats: ns.singularity.getAugmentationStats(aug)}
            records.push(R)
        }
    }

    db.dbWrite(ns, "aug-stats", records)
}