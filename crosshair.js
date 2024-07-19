import {getServerList} from "reh.js"
export function autocomplete(data, args) {
    return [...data.servers]; // This script autocompletes the list of servers.
}
/** @param {NS} ns */
export async function main(ns) {
  const target= ns.args[0]
  var ramScript = Math.max(ns.getScriptRam("loop_hack.js"),
                            ns.getScriptRam("loop_weaken.js"), 
                            ns.getScriptRam("loop_grow.js"))

  var cmdArgs = [ target,
    "--maxmoney", ns.getServerMaxMoney(target),
    "--minsec", ns.getServerMinSecurityLevel(target)]

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

    var tWeaken = Math.max(1, Math.floor((ram / ramScript) * 0.15))
    var tHack   = Math.max(1, Math.floor((ram / ramScript) * 0.10))
    var tGrow   = Math.max(1, Math.floor((ram - (tWeaken + tHack)*ramScript) 
                / ramScript))

    ns.killall(S);
    await ns.sleep(20);
    ns.exec("loop_hack.js",   S, tHack, ...cmdArgs);
    ns.exec("loop_weaken.js", S, tWeaken, ...cmdArgs)
    ns.exec("loop_grow.js",   S, tGrow, ...cmdArgs)
  }
}