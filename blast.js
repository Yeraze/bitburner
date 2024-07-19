/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0]
  const threadCount = ns.args[1]
  var maxMoney = ns.getServerMaxMoney(target)
  ns.exec("crosshair.js", "home", 1, target)

  var cmdArgs = [target,
    "--minsec", ns.getServerMinSecurityLevel(target),
    "--maxmoney", ns.getServerMaxMoney(target)]


  ns.scriptKill("loop_weaken.js", "home")
  ns.scriptKill("loop_hack.js", "home")
  ns.scriptKill("loop_grow.js", "home")
  ns.exec("loop_weaken.js", "home", threadCount * 0.15, ...cmdArgs)
  ns.exec("loop_hack.js", "home", threadCount * 0.10, ...cmdArgs)
  ns.exec("loop_grow.js", "home", threadCount * 0.75, ...cmdArgs)

}