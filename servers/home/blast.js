export function autocomplete(data, args) {
    return [...data.servers]; // This script autocompletes the list of servers.
}
/** @param {NS} ns */
export async function main(ns) {
  ns.tail()
  var targets = ns.args.slice(0, -1)
  var threadCount = ns.args.slice(-1)
  ns.tprintf("Requested Threadcount: %i", threadCount)
  var extend = (targets.indexOf("EXTEND") != -1)
  if(extend) {
    var newTargets = targets.filter((a) => (a != "EXTEND"))
    ns.tprintf("Extending to new systems")
    targets = newTargets
  }
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
  
    
    var tWeaken = Math.max(1, Math.floor(threadCount * 0.15))
    var tHack = Math.max(1, Math.floor(threadCount * 0.10))
    var tGrow = Math.max(1, threadCount - tWeaken - tHack)
    ns.tprintf("->H:%s G:%s W:%s",tHack, tGrow, tWeaken)
    ns.exec("loop_weaken.js", "home", tWeaken, ...cmdArgs)
    ns.exec("loop_hack.js", "home", tHack, ...cmdArgs)
    ns.exec("loop_grow.js", "home", tGrow, ...cmdArgs)
  }
  ns.spawn("crosshair.js", {spawnDelay: 0}, ...targets)

}