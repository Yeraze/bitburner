import {execContinue, execAndWait, getServerList} from 'reh.js'
/** @param {NS} ns */
export async function main(ns) {
  ns.tprint("Initial setup...")
  ns.tprintf("Starting auto-breach.js")
  execContinue(ns, "auto-breach.js", "home", 1)

  // These scripts area bit "fat",so make sure we have ram
  if (ns.getServerMaxRam("home") > 128) {
    execContinue(ns, "pservs.js", "home", 1)
    execContinue(ns, "listtiny.js", "home", 1, "--loop")
  }
  // At HL10 we can switch to joesguns
  // We'll be here a while, so there's more logic going on
  // Monitor for new servers added to the list,
  //    Either servers we bought, or new ones available as our HL grows
  //.   For Purchased servers, monitor total RAM available
  //        to account for Upgrades
  // When those come online, add them to the queue
  await hackUntilLevel(ns, "joesguns", 300)
  await hackUntilLevel(ns, "phantasy", 3000)
  ns.exec("batcher/controller.js", "home", 1, "ecorp")

}

/** @param {NS} ns */
async function hackUntilLevel(ns, target, stopAtLevel) {
  if (ns.getHackingLevel() > stopAtLevel)
    return
  // First wait until we have root
  while (ns.hasRootAccess(target) == false) 
    await ns.sleep(1000);
  while (ns.getHackingLevel() < ns.getServerRequiredHackingLevel(target)) 
    await ns.sleep(1000)

  ns.exec("batcher/controller.js", "home", 1, target)

  while (ns.getHackingLevel() < stopAtLevel)
    await ns.sleep(1000);
  execAndWait(ns, "global-cleanup.js", "home", 1, "--super")
}