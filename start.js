/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL')
  ns.tprint("Initial setup...")
  ns.exec("auto-breach.js", "home")
  ns.exec("hacknet.js", "home")
  if (ns.getServerMaxRam("home") > 128) {
    ns.exec("build-farm.js", "home")
    ns.exec("listall.js", "home", 1, "--loop")
  }
}