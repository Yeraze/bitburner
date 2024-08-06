import {rehprintf, qualifyAugment, parsearg} from 'reh.js'
import * as CONST from 'reh-constants.js'
import * as db from 'database.js'
/** @param {NS} ns */
export async function main(ns) {
    //ns.tail()
    if(!ns.stanek.acceptGift()) {
        db.dbLogf(ns, "ERROR: Unable to accept Stanek's gift")
        return
    }
    var cycles = 100
    cycles = parsearg(ns, "--cycles", 25)
    db.dbLogf(ns, "STANEK: Charging %i cycles", cycles)
    for(var counter = 0; counter < cycles; counter++) {
        await ns.sleep(10)
        ns.printf("Charge cycle: %i of %i", counter, cycles)
        for(var fragment of ns.stanek.activeFragments()) {
            ns.printf("-> [%i] %i,%i - %i", fragment.id, fragment.x, fragment.y, fragment.highestCharge)
            try {
                await ns.stanek.chargeFragment(fragment.x, fragment.y)
            } catch (error) {
                ns.printf("ERROR: %s", error)
            }
        }
    }
    db.dbLogf(ns, "STANEK: Done with %i cycles", cycles)

}
