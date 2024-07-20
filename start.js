import {getServerList} from 'reh.js'
/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('sleep')
  ns.tprint("Initial setup...")
  ns.exec("auto-breach.js", "home")
  ns.exec("hacknet.js", "home")

  // These scripts area bit "fat",so make sure we have ram
  if (ns.getServerMaxRam("home") > 128) {
    ns.exec("build-farm.js", "home")
    ns.exec("listall.js", "home", 1, "--loop")
  }
  var localThreadCount = Math.min(4, 
          Math.floor((ns.getServerMaxRam("home") * .75) / 2))

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
  ns.exec("blast.js", "home",1, "joesguns", localThreadCount)
  var ramPServers = ns.getPurchasedServers().reduce(
      (a,b) => a + ns.getServerMaxRam(B), 0  )
  var numNPCServers = getServerList().filter((S) => ns.hasRootAccess(S)).length()
  while (ns.getHackingLevel() < 300) {
    await ns.sleep(1000);
    var newServers = false
    var pservRam = ns.getPurchasedServers().reduce(
      (a,b) => a + ns.getServerMaxRam(B), 0    )
    if (pservRam > ramPServers) {
      newServers = true
      ramPServers = pservRam
    }
    if(getServerList().filter((S) => ns.hasRootAccess(S)).length > numNPCServers) {
      newServers = true
      numNPCServers = getServerList().filter((S) => ns.hasRootAccess(S)).length()
    }
    if (newServers) {
      ns.exec("blast.js", "home",1, "joesguns", localThreadCount)
    }
  }

  // Once we hit level 300, we can move on to 
  // joesguns & phantasy

  ns.exec("global-cleanup.js", "home", 1, "--loop")
  await ns.sleep(1000)
  ns.exec("blast.js", "home",1, "joesguns", "phantasy", "4")
  var ramPServers = ns.getPurchasedServers().reduce(
      (a,b) => a + ns.getServerMaxRam(B), 0  )
  numNPCServers = getServerList().filter((S) => ns.hasRootAccess(S)).length()
  while (ns.getHackingLevel() < 1000) {
    await ns.sleep(1000);
    var newServers = false
    var pservRam = ns.getPurchasedServers().reduce(
      (a,b) => a + ns.getServerMaxRam(B), 0    )
    if (pservRam > ramPServers) {
      newServers = true
      ramPServers = pservRam
    }
    if(getServerList().filter((S) => ns.hasRootAccess(S)).length > numNPCServers) {
      newServers = true
      numNPCServers = getServerList().filter((S) => ns.hasRootAccess(S)).length()
    }
    if (newServers) {
      ns.exec("blast.js", "home",1, "joesguns", "phantasy", localThreadCount)
    }
  }
  ns.exec("global-cleanup.js", "home", 1, "--loop")
  await ns.sleep(1000)
  ns.exec("blast.js", "home",1, "joesguns", "phantasy", "the-hub", "4")
  // Once we hit level 1000, just let 
  // these 3run open with a blast.. Anything beyond here
  //  I'llmanage by hand for now
}