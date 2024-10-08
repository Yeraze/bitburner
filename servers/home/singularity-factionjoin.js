import {rehprintf} from 'reh.js'
import * as db from 'database.js'

/** @param {NS} ns */
export async function main(ns) {
    const faction = ns.args[0]
    //ns.tail()
    ns.printf("Considering %s", faction)
    if(ns.singularity.joinFaction(faction)) {
        let msg = ns.sprintf("Joined faction %s", faction)
        ns.toast(msg, "success")
        db.dbLogf(ns, msg)
    }

    if (ns.singularity.getCurrentWork()?.type == "GRAFTING") {
        var record = { work: "GRAFTING", faction: ns.singularity.getCurrentWork().augmentation}
        db.dbWrite(ns, "faction", record)
        return
    }

    var focus = ns.singularity.getOwnedAugmentations(false).indexOf("Neuroreceptor Management Implant") == -1
    if (ns.singularity.getFactionWorkTypes(faction).length == 0) {
        ns.printf("This faction has no work!")
        return
    }
    var work = ns.singularity.getFactionWorkTypes(faction)[0]
    if (ns.singularity.getFactionWorkTypes(faction).includes("hacking"))
        work = "hacking"
    if(ns.singularity.getCurrentWork() && 
       (ns.singularity.getCurrentWork().type == "FACTION") && 
       (ns.singularity.getCurrentWork().factionName == faction) &&
       (ns.singularity.getCurrentWork().factionWorkType == work)) {
        // Do nothing, we're already doing it.
    } else {
        ns.singularity.workForFaction(faction, work, focus)
    }

    var record = { faction: faction, work: work}
    db.dbWrite(ns, "faction", record)
}