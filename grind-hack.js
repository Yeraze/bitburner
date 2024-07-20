import {getServerList} from "reh.js"
export function autocomplete(data, args) {
    return [...data.servers]; // This script autocompletes the list of servers.
}
/** @param {NS} ns */
export async function main(ns) {
  const targets = ns.args
  ns.tprintf("Cross targets: %s", targets)

  var targetId = 0
  var servers = getServerList(ns).concat(ns.getPurchasedServers())
  servers.push("home")
  for(const S of servers) {
    // copy the scripts we need
    ns.scp("reh.js", S)
    ns.scp("reh-constants.js", S)
    ns.scp("loop_grow.js", S)
  
    var ram = ns.getServerMaxRam(S)
    if(ram < 4) {
      continue
    }
    if(!ns.hasRootAccess(S))
      continue

    var target = ns.args[0]
    var cmdArgs = [
      "--maxmoney", ns.getServerMaxMoney(target),
      "--minsec", ns.getServerMinSecurityLevel(target),
      "--force", "1"]
    var ramScript= ns.getScriptRam("loop_grow.js")
    var tGrow   = Math.max(1, Math.floor(ram / ramScript))
    ns.tprintf("-> %s Crosshair target: %s [G:%i]", 
          S, target, tGrow)

    ns.killall(S);
    await ns.sleep(25);
    ns.exec("loop_grow.js",   S, tGrow, target, ...cmdArgs)
  }
}