import * as db from 'database.js'
import {doCommand} from 'reh.js'
export function autocomplete(data, args) {
    return [...data.servers]; // This script autocompletes the list of servers.
}

/** @param {NS} ns */
export async function main(ns) {
  var target = ns.args[0]
  // first build the connection graph
  if(target == "w0r1d_d43m0n") {

    var resetCount = db.dbRead(ns, "resets", "global").resets
    
    // ENDGAME!
    let level = ns.getResetInfo().ownedSF.get(ns.getResetInfo().currentNode)
    ns.printf("Currently in BN%i.%i", ns.getResetInfo().currentNode, level)
    await db.dbGlobalLogf(ns, "BitNode %i.%i destroyed after %s (%s resets)",
                ns.getResetInfo().currentNode, level,
                db.formatTime(ns, Date.now() - ns.getResetInfo().lastNodeReset),
                resetCount)
    db.dbWrite(ns, "resets", {resets: 0}, "global")
    await doCommand(ns, 'ns.singularity.destroyW0r1dD43m0n(12, "start.js")')
  }
  var path = []
  path.push(target)
  var parent = target;
  while (parent != "home") {
    parent =ns.scan(parent)[0]
    path.push(parent)
  }
  for(const sys of path.reverse()) {
    ns.printf("Connecting to %s...", sys)
    ns.singularity.connect(sys)
  }
  ns.printf("Installing backdoor...")
  await ns.singularity.installBackdoor();
  ns.singularity.connect("home")
}
