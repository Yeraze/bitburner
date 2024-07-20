import {getServerList} from 'reh.js'
/** @param {NS} ns */
export async function main(ns) {
  ns.tprint("Initial setup...")
  ns.tprintf("Starting auto-breach.js")
  if(ns.scriptRunning("auto-breach.js", "home") == false)
    ns.exec("auto-breach.js", "home")
  if (ns.getServerMaxMoney("home") > 1000000) {
    ns.tprintf("starting hacknet.js")
    if(ns.scriptRunning("hacknet.js", "home") == false)
      ns.exec("hacknet.js", "home")
  } else {
    ns.tprintf("Loaded, skipping hacknet")
  }

  // These scripts area bit "fat",so make sure we have ram
  if (ns.getServerMaxRam("home") > 128) {
    ns.tprintf("Starting build-farm.js")
    if(ns.scriptRunning("build-farm.js", "home") == false)
      ns.exec("build-farm.js", "home")
    ns.tprintf("starting listall.js")
    if(ns.scriptRunning("listall.js", "home") == false)
      ns.exec("listall.js", "home", 1, "--loop")
  }
  var localThreadCount = Math.max(4, 
          Math.floor((ns.getServerMaxRam("home") * .75) / 2))
  ns.tprintf("localThread safety = %i" , localThreadCount)
  // At the beginning of the game, not much we can do but hack n00dles
  if (ns.getHackingLevel() < 10) {
    ns.exec("blast.js", "home",1, "n00dles", localThreadCount)
    while (ns.getHackingLevel() < 10)
      await ns.sleep(1000);
    
    ns.exec("global-cleanup.js", "home", 1, "--loop")
    await ns.sleep(1000)
  }
  // At HL10 we can switch to joesguns
  // We'll be here a while, so there's more logic going on
  // Monitor for new servers added to the list,
  //    Either servers we bought, or new ones available as our HL grows
  //.   For Purchased servers, monitor total RAM available
  //        to account for Upgrades
  // When those come online, add them to the queue
  if (ns.getHackingLevel()< 300) {
    ns.exec("blast.js", "home",1, "joesguns", localThreadCount)
    var ramPServers = ns.getPurchasedServers().reduce(
        (a,b) => a + ns.getServerMaxRam(b), 0  )
    var numNPCServers = getServerList(ns).reduce(
        (a, S) => a+ (ns.hasRootAccess(S) ? 1 : 0),0)
    while (ns.getHackingLevel() < 300) {
      await ns.sleep(1000);
      var newServers = false
      var pservRam = ns.getPurchasedServers().reduce(
        (a,b) => a + ns.getServerMaxRam(b), 0    )
      if (pservRam > ramPServers) {
        newServers = true
        ramPServers = pservRam
      }
      var curnumNPCServers = getServerList(ns).reduce(
        (a, S) => a+ (ns.hasRootAccess(S) ? 1 : 0),0)
      if(curnumNPCServers > numNPCServers) {
        newServers = true
        numNPCServers = curnumNPCServers
      }
      if (newServers) {
        ns.exec("blast.js", "home",1, "joesguns", "EXTEND", localThreadCount)
      }
    }
    ns.exec("global-cleanup.js", "home", 1, "--loop")
    await ns.sleep(1000)
  }

  // Once we hit level 300, we can move on to 
  // joesguns & phantasy

  if(ns.getHackingLevel() < 1000) {
    ns.exec("blast.js", "home",1, "joesguns", "phantasy", localThreadCount)
    var ramPServers = ns.getPurchasedServers().reduce(
        (a,b) => a + ns.getServerMaxRam(b), 0  )
    numNPCServers = getServerList(ns).reduce(
        (a, S) => a+ (ns.hasRootAccess(S) ? 1 : 0),0)
    while (ns.getHackingLevel() < 1000) {
      await ns.sleep(1000);
      var newServers = false
      var pservRam = ns.getPurchasedServers().reduce(
        (a,b) => a + ns.getServerMaxRam(b), 0    )
      if (pservRam > ramPServers) {
        newServers = true
        ramPServers = pservRam
      }
      var curnumNPCServers = getServerList(ns).reduce(
        (a, S) => a+ (ns.hasRootAccess(S) ? 1 : 0),0)
      if(curnumNPCServers > numNPCServers) {
        newServers = true
        numNPCServers = curnumNPCServers
      }
      if (newServers) {
        ns.exec("blast.js", "home",1, "joesguns", "phantasy", "EXTEND", localThreadCount)
      }
    }
    ns.exec("global-cleanup.js", "home", 1, "--loop")
    await ns.sleep(1000)
  }
  ns.exec("blast.js", "home",1, "joesguns", "phantasy", "the-hub", "4")
  // Once we hit level 1000, just let 
  // these 3run open with a blast.. Anything beyond here
  //  I'llmanage by hand for now
}