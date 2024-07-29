import {rehprintf, execContinue, execAnywhere, execAndWait, execAnywhereNoWait, getServerList} from 'reh.js'
import * as CONST from 'reh-constants.js'
/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL')
  ns.tail()
  ns.moveTail(50, 600)
  ns.resizeTail(500,110)
  rehprintf(ns, "Initial setup...")
  rehprintf(ns, "Starting auto-breach.js")
  await execAnywhere(ns, ["s_crime.js"], 1, "Rob Store")
  execAnywhereNoWait(ns, ["auto-breach.js", "reh.js", "reh-constants.js"], 1)
  execAnywhereNoWait(ns, ["pservs.js","reh.js", "reh-constants.js"], 1)

  // These scripts area bit "fat",so make sure we have ram
  if (ns.getServerMaxRam("home") < 128) {
    rehprintf(ns, "Looks like we're still earlygame, starting n00dle blast")
    await execAndWait(ns, "blast.js", "home", 1, "n00dles", 4);
    var totalRam = getServerList(ns)
        .filter((S) => ns.hasRootAccess(S))
        .reduce((a, S) => (a + ns.getServerMaxRam(S)), 0)
    while(ns.getHackingLevel() < 30) {
      await ns.sleep(10000)
      var totalRamNow = getServerList(ns)
        .filter((S) => ns.hasRootAccess(S))
        .reduce((a, S) => (a + ns.getServerMaxRam(S)), 0)
      if (totalRamNow > totalRam) {
        rehprintf(ns, "-> Extending n00dle blast")
        await execAndWait(ns, "blast.js", "home", 1, "n00dles", "EXTEND", 4 );
        totalRam = totalRamNow
      }
    }
    await ns.sleep(5000)
    ns.scriptKill("loop_hack.js", "home")
    ns.scriptKill("loop_grow.js", "home")
    ns.scriptKill("loop_weaken.js", "home")
    await execAndWait(ns, "global-cleanup.js", "home", 1, "--loop")
    await ns.sleep(5000)

    rehprintf(ns, "Looks like we're still earlygame, starting joesguns blast")

    await execAndWait(ns, "blast.js", "home", 1, "joesguns", 4);
    while(ns.getServerMaxRam("home") < 128) {
      await ns.sleep(10000)
      if(ns.getServerMaxRam("home") < 64) {
        ns.scriptKill("loop_hack.js", "home")
        ns.scriptKill("loop_grow.js", "home")
        ns.scriptKill("loop_weaken.js", "home")
      }
      await execAndWait(ns, "singularity-home.js", "home", 1)
      var totalRamNow = getServerList(ns)
        .filter((S) => ns.hasRootAccess(S))
        .reduce((a, S) => (a + ns.getServerMaxRam(S)), 0)
      if (totalRamNow > totalRam) {
        rehprintf(ns, "-> Extending joesguns blast")
        await execAndWait(ns, "blast.js", "home", 1, "joesguns", "EXTEND", 4 );
        totalRam = totalRamNow
      }
    }
    ns.scriptKill("loop_hack.js", "home")
    ns.scriptKill("loop_grow.js", "home")
    ns.scriptKill("loop_weaken.js", "home")
    await execAndWait(ns, "global-cleanup.js", "home", 1, "--loop")
  }
  rehprintf(ns, "Beginning Singularity manager...")
  execContinue(ns, "singularity-start.js", "home", 1)

  // Now we can switch to joesguns
  // We'll be here a while, so there's more logic going on
  // Monitor for new servers added to the list,
  //    Either servers we bought, or new ones available as our HL grows
  //.   For Purchased servers, monitor total RAM available
  //        to account for Upgrades
  // When those come online, add them to the queue
  await hackUntilTarget(ns, "joesguns", "phantasy")
  await hackUntilTarget(ns, "phantasy", "rho-construction")
  await hackUntilTarget(ns, "rho-construction", "global-pharm")
  await hackUntilTarget(ns, "global-pharm", "megacorp")
  await hackUntilTarget(ns, "megacorp", "FOREVER")
  ns.closeTail()
}

/** @param {NS} ns */
async function hackUntilTarget(ns, target, stopAtTarget) {
  if (stopAtTarget != "FOREVER")
    if (ns.getHackingLevel() > ns.getServerRequiredHackingLevel(stopAtTarget)*3)
      return

  // First wait until we have root & proper hacking level
  rehprintf(ns, "Waiting for root access on %s", target)
  while (ns.hasRootAccess(target) == false) 
    await ns.sleep(1000);
  rehprintf(ns, "Waiting for Hack level on %s", target)
  while (ns.getHackingLevel() < ns.getServerRequiredHackingLevel(target)) 
    await ns.sleep(1000)

  // Calculate the initial amount of RAM available
  var totalRam = getServerList(ns)
      .filter((S) => ns.hasRootAccess(S))
      .reduce((a, S) => (a + ns.getServerMaxRam(S)), 0)
  rehprintf(ns, "HWGW Attack on %s (%s available ram)", target, 
      ns.formatRam(totalRam))

  // and START
  ns.exec("batcher/controller.js", "home", 1, target)
  var spokenRam = totalRam
  var keepGoing =true 


  while (keepGoing) {
    // See if we've hit the proper target level
    //  General rule of thumb is 3x the required Hacking level
    if(stopAtTarget != "FOREVER") 
      if(ns.getHackingLevel() > ns.getServerRequiredHackingLevel(stopAtTarget)*3) {
        if(ns.hasRootAccess(stopAtTarget)) {
          keepGoing= false
        }
      }

    await ns.sleep(5000);
    var rekick = false
    // First check if the script is still running...
    //    Itmight have crashed.. especially in very early-game, low ram
    if (ns.scriptRunning("batcher/controller.js", "home")== false) {
      rekick = true
      ns.tprintf("%s-> Looks like batcher crashed..", CONST.fgRed);
    }


    // Now look and see if we have new resources
    //  If we have doubled in available RAM since we started the batcher
    //  then we want to restart it.. Gotta get them gainz
    var totalRamNow = getServerList(ns)
      .filter((S) => ns.hasRootAccess(S))
      .reduce((a, S) => (a + ns.getServerMaxRam(S)), 0)
    if(totalRamNow!=spokenRam){
      ns.printf("Detected new ram: %s (+%s)", ns.formatRam(totalRamNow),
        ns.formatPercent( (totalRamNow / totalRam) - 1.0)) 
      spokenRam= totalRamNow
    }
    if (totalRamNow > totalRam * 2.0) {
      rekick = true
    }

    if (rekick) {
      rehprintf(ns, "-> Restarting HWGW attack on %s (%s available ram)",
        target, ns.formatRam(totalRamNow))
      // This isa bit messy, yes.. And can leave the target in an unprepped state
      // But it's the fastest way..
      await execAndWait(ns, "global-cleanup.js", "home", 1, "--super")
      ns.exec("batcher/controller.js", "home", 1, target)
      totalRam = totalRamNow
    }
  }
  rehprintf(ns, "Ending attack on %s", target)
  await execAndWait(ns, "global-cleanup.js", "home", 1, "--super")
  ns.scriptKill("batcher/controller.js", "home")
}