export function autocomplete(data, args) {
    return [...data.servers]; // This script autocompletes the list of servers.
}
/** @param {NS} ns */
export async function main(ns) {
  const targets = ns.args.slice(0, -1)
  var threadCount = ns.args.slice(-1)
  ns.exec("crosshair.js", "home", 1, ...targets)

  ns.scriptKill("loop_weaken.js", "home")
  ns.scriptKill("loop_hack.js", "home")
  ns.scriptKill("loop_grow.js", "home")
  threadCount = Math.floor(threadCount / targets.length)
  for(var target of targets) {
    ns.tprintf("Spawning %i threads at %s", threadCount, target)
    var maxMoney = ns.getServerMaxMoney(target)
  
    var cmdArgs = [target,
      "--minsec", ns.getServerMinSecurityLevel(target),
      "--maxmoney", ns.getServerMaxMoney(target)]
  
  
    ns.exec("loop_weaken.js", "home", Math.floor(threadCount * 0.15), ...cmdArgs)
    ns.exec("loop_hack.js", "home", Math.floor(threadCount * 0.10), ...cmdArgs)
    ns.exec("loop_grow.js", "home", Math.floor(threadCount * 0.75), ...cmdArgs)
  }

}