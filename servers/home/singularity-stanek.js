import {rehprintf, qualifyAugment, parsearg, doCommand, doMaxCommand} from 'reh.js'
import * as CONST from 'reh-constants.js'
import * as db from 'database.js'
/** @param {NS} ns */
export async function main(ns) {
    //ns.tail()
    if(ns.getResetInfo().ownedAugs.has("Stanek's Gift - Genesis") == false) {
        db.dbLogf(ns, "STANEK: Gift not found, exiting")
        return
    }
    var cycles = 100
    cycles = parsearg(ns, "--cycles", 25)
    db.dbLogf(ns, "STANEK: Charging %i cycles", cycles)
    var trickle = ns.args.includes('--trickle')
    var fragments = []
    for(var fragment of ns.stanek.activeFragments()) {
        try {
            await ns.stanek.chargeFragment(fragment.x, fragment.y)
            fragments.push(fragment)
        } catch (error) {
            ns.printf("ERROR: %s", error)
        }
    }

    for(var counter = 0; counter < cycles; counter++) {
        await ns.sleep(10)
        ns.printf("Charge cycle: %i of %i", counter, cycles)
        for(var fragment of fragments) {
            ns.printf("-> [%i] %i,%i - %i", fragment.id, fragment.x, fragment.y, fragment.highestCharge)
            var cmd = `await ns.stanek.chargeFragment(${fragment.x}, ${fragment.y})`
            if (trickle)
                await doCommand(ns, cmd)
            else
                await doMaxCommand(ns, cmd)
        }
    }
    db.dbLogf(ns, "STANEK: Done with %i cycles", cycles)

}
