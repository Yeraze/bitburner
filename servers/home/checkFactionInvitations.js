/** @param {NS} ns */
import * as db from 'database.js'

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL')

    var factionStats = []
    for(var fac of ns.getPlayer().factions.concat(ns.singularity.checkFactionInvitations())) {
      var record = { name : fac,
                     rep : ns.singularity.getFactionRep(fac),
                     favor : ns.singularity.getFactionFavor(fac),
                     favorGain : ns.singularity.getFactionFavorGain(fac),
                     status : (ns.getPlayer().factions.indexOf(fac) != -1),
      }
      factionStats.push(record)
    }
    db.dbWrite(ns, "factions", factionStats)
  
}