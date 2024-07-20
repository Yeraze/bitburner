import {getServerList} from "reh.js"
export function autocomplete(data, args) {
    return [...data.servers]; // This script autocompletes the list of servers.
}
/** @param {NS} ns */
export async function main(ns) {
  const targets = ns.args
  var ramScript = Math.max(ns.getScriptRam("loop_hack.js"),
                            ns.getScriptRam("loop_weaken.js"), 
                            ns.getScriptRam("loop_grow.js"))
  ns.tprintf("Cross targets: %s", targets)


  var targetId = 0
  for(const S of getServerList(ns).concat(ns.getPurchasedServers())) {
    // copy the scripts we need
    ns.scp("reh.js", S)
    ns.scp("reh-constants.js", S)
    ns.scp("loop_hack.js", S)
    ns.scp("loop_grow.js", S)
    ns.scp("loop_weaken.js", S)
  
    var ram = ns.getServerMaxRam(S)
    if(ram < 4) {
      continue
    }
    if(!ns.hasRootAccess(S))
      continue

    var target = targets[targetId]
    var cmdArgs = [
      "--maxmoney", ns.getServerMaxMoney(target),
      "--minsec", ns.getServerMinSecurityLevel(target)]
    targetId = (targetId + 1) % targets.length
    var tWeaken = Math.max(1, Math.floor((ram / ramScript) * 0.15))
    var tHack   = Math.max(1, Math.floor((ram / ramScript) * 0.10))
    var tGrow   = Math.max(1, Math.floor((ram - (tWeaken + tHack)*ramScript) 
                / ramScript))
    ns.tprintf("-> %s Crosshair target: %s [H:%i G:%i W:%i]", 
          S, target, tHack, tGrow, tWeaken)

    ns.killall(S);
    await ns.sleep(250);
    ns.exec("loop_hack.js",   S, tHack, target, ...cmdArgs);
    ns.exec("loop_weaken.js", S, tWeaken, target, ...cmdArgs)
    ns.exec("loop_grow.js",   S, tGrow, target, ...cmdArgs)
  }
}