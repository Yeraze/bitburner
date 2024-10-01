import * as db from 'database.js'
import {execAndWait} from 'reh.js'
/** @param {NS} ns */
export async function main(ns) {
    if(ns.fileExists("extend.txt","home")) {
        if(ns.args[0] != "--force") {
            ns.tprintf("Aborting reset, extend flag exists.")
            ns.tprintf(" override with --force")
            return
        }
    }
    ns.rm("extend.txt", "home")

    await execAndWait(ns, "singularity-purchaseall.js", "home") 
    var globalRecord = db.dbRead(ns, "resets", "global") ?? {}

    globalRecord.resets = globalRecord?.resets + 1
    await db.dbGlobalLogf(ns, "Node reset %i", globalRecord.resets)

    db.dbWrite(ns, "resets", globalRecord, "global")
    
    ns.singularity.softReset("start.js")
}