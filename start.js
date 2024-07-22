import {rehprintf, execContinue, execAndWait, getServerList} from 'reh.js'
/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL')
  ns.tail()
  rehprintf(ns, "Initial setup...")
  rehprintf(ns, "Starting auto-breach.js")
  execContinue(ns, "auto-breach.js", "home", 1)

  // These scripts area bit "fat",so make sure we have ram
  if (ns.getServerMaxRam("home") > 127) {
    execContinue(ns, "pservs.js", "home", 1)
    execContinue(ns, "singularity-start.js", "home", 1)
  }
  if (ns.getServerMaxRam("home") < 65) {
    while(ns.getHackingLevel() < 10) {
      rehprintf(ns, "Waiting for level10...")
      await ns.sleep(1000)
    }
    execContinue(ns, "blast.js", "home", 1, "joesguns", 4)
  } else {}
  
    while(ns.getHackingLevel() < 10) {
      rehprintf(ns, "Waiting for level10...")
      await ns.sleep(1000)
    }
    execContinue(ns, "s_crime.js", "home", 1, "--loop")
    
    // At HL10 we can switch to joesguns
    // We'll be here a while, so there's more logic going on
    // Monitor for new servers added to the list,
    //    Either servers we bought, or new ones available as our HL grows
    //.   For Purchased servers, monitor total RAM available
    //        to account for Upgrades
    // When those come online, add them to the queue
    await hackUntilLevel(ns, "joesguns", 300)
    await hackUntilLevel(ns, "phantasy", 3000)
    await hackUntilLevel(ns, "ecorp", 10000)
}

/** @param {NS} ns */
async function hackUntilLevel(ns, target, stopAtLevel) {
  if (ns.getHackingLevel() > stopAtLevel)
    return
  // First wait until we have root
  rehprintf(ns, "Waiting for breach & level on %s", target)
  while (ns.hasRootAccess(target) == false) 
    await ns.sleep(1000);
  while (ns.getHackingLevel() < ns.getServerRequiredHackingLevel(target)) 
    await ns.sleep(1000)
  rehprintf(ns, "HWGW Attack on %s", target)
  ns.exec("batcher/controller.js", "home", 1, target)

  while (ns.getHackingLevel() < stopAtLevel)
    await ns.sleep(1000);
  rehprintf(ns, "Ending attack on %s", target)
  await execAndWait(ns, "global-cleanup.js", "home", 1, "--super")
  ns.scriptKill("batcher/controller.js", "home")
}