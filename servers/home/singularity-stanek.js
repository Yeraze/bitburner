import {rehprintf, qualifyAugment, parsearg, doCommand, doMaxCommand} from 'reh.js'
import * as CONST from 'reh-constants.js'
import * as db from 'database.js'
/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL')
    if(ns.getResetInfo().ownedAugs.has("Stanek's Gift - Genesis") == false) {
        db.dbLogf(ns, "STANEK: Gift not found, exiting")
        return
    }
    ns.printf("Preparing to charge Stanek")
    var cycles = 100
    cycles = parsearg(ns, "--cycles", 25)
    ns.printf(" --> %i cycles", cycles)
    db.dbLogf(ns, "STANEK: Charging %i cycles", cycles)
    var trickle = ns.args.includes('--trickle')
    if (!trickle) { 
      ns.tail()
      ns.moveTail(400,300)
      ns.resizeTail(510, 100)
    }
    var fragments = []
    for(var fragment of ns.stanek.activeFragments()) {
        try {
            await ns.stanek.chargeFragment(fragment.x, fragment.y)
            fragments.push(fragment)
        } catch (error) {
            //ns.printf("ERROR: %s", error)
        }
    }

    const steps = fragments.length * cycles
    var curStep = 0

    for(var counter = 0; counter < cycles; counter++) {
        for(var fragment of fragments) {
            ns.clearLog()
            curStep += 1
            
            let length = 50
            let progress = Math.floor(length * curStep / steps)
            let sProgress = new Array(progress+1).join( '#' );
            ns.printf("Charging %i Stanek fragments", fragments.length)
            ns.printf("[%-50s]", sProgress)
            //ns.printf("-> [%i] %i,%i - %i", fragment.id, fragment.x, fragment.y, fragment.highestCharge)
            var cmd = `await ns.stanek.chargeFragment(${fragment.x}, ${fragment.y})`
            if (trickle)
                await doCommand(ns, cmd)
            else
                await doMaxCommand(ns, cmd)
        }
    }
    db.dbLogf(ns, "STANEK: Done with %i cycles", cycles)
    ns.closeTail()
}
