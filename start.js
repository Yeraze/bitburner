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
  ns.exec("blast.js", "home",1, "n00dles", "4")
  while (ns.getHackingLevel() < 10)
    await ns.sleep(1000);
  
  ns.exec("global-cleanup.js", "home", 1, "--loop")
  await ns.sleep(1000)
  ns.exec("blast.js", "home",1, "joesguns", "4")
  while (ns.getHackingLevel() < 300)
    await ns.sleep(1000);
  ns.exec("global-cleanup.js", "home", 1, "--loop")
  await ns.sleep(1000)
  ns.exec("blast.js", "home",1, "joesguns", "phantasy", "4")
  while (ns.getHackingLevel() < 1000)
    await ns.sleep(1000);
  ns.exec("global-cleanup.js", "home", 1, "--loop")
  await ns.sleep(1000)
  ns.exec("blast.js", "home",1, "joesguns", "phantasy", "the-hub", "4")

  
}