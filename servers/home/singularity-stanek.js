import {rehprintf, qualifyAugment} from 'reh.js'
import * as CONST from 'reh-constants.js'
import * as db from 'database.js'
/** @param {NS} ns */
export async function main(ns) {
    ns.tail()
    if(!ns.stanek.acceptGift()) {
        db.dbLogf(ns, "ERROR: Unable to accept Stanek's gift")
        return
    }
    while(true) {
        await ns.sleep(10)
        ns.printf("[%s] Beginning charge loop...", db.formatTime(ns, Date.now() - ns.getResetInfo().lastAugReset))
        for(var fragment of ns.stanek.activeFragments()) {
            ns.printf("-> [%i] %i,%i - %i", fragment.id, fragment.x, fragment.y, fragment.highestCharge)
            try {
                await ns.stanek.chargeFragment(fragment.x, fragment.y)
            } catch (error) {
                ns.printf("ERROR: %s", error)
            }
        }

    }

}
