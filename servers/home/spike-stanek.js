import {rehprintf, qualifyAugment, parsearg, doCommand, doMaxCommand} from 'reh.js'
import * as CONST from 'reh-constants.js'
import * as db from 'database.js'
/** @param {NS} ns */
export async function main(ns) {
    //ns.tail()
    ns.disableLog('ALL')
    var cycles = 100
    cycles = parsearg(ns, "--cycles", 25)
    db.dbLogf(ns, "STANEK: Charging %i cycles", cycles)

    for(var counter = 0; counter < cycles; counter++) {
        ns.clearLog()
        ns.printf("Charge cycle: %i of %i", counter, cycles)


        await ns.sleep(10)
        var cmd = `await ns.stanek.chargeFragment(2, 1)`
        await doMaxCommand(ns, cmd)
    }
    db.dbLogf(ns, "STANEK: Done with %i cycles", cycles)

}
