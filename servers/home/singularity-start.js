import {rehprintf, execAndWait, execAnywhere} from 'reh.js'

var factionList = []
/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL')
  ns.tail()
  ns.moveTail(50,0)
  ns.resizeTail(500, 110)
  if (ns.getHackingLevel() < 10) {
    rehprintf(ns, "Starting CS to hit level 10...")
    ns.singularity.universityCourse("rothman university", "computer science", true);
    while (ns.getHackTime() < 10) {
      await ns.sleep(1000);
    }
  }

  rehprintf(ns, "Waiting for $250k...")
  while(ns.getServerMoneyAvailable("home") < 250000) {
    await ns.sleep(1000);
  }

  var keepGoing = true
  var counter = 59
  rehprintf(ns, "Entering main loop...")
  var playerLevel = ns.getHackingLevel()
  var resetCount = 0
  while(keepGoing) {
    await ns.sleep(1000)
    counter++
    
    manageDarkweb(ns)
    await installBackdoors(ns)

    if (counter % 60 == 0) {
      await manageFactions(ns)
      await manageHome(ns)
      await manageAugments(ns)
    }

    if (counter % 300 == 0) {
      if(ns.getHackingLevel() - playerLevel < 10) {
        resetCount++
        ns.toast(ns.sprintf("CONSIDERING RESET: %i of 3", resetCount), "warning", null)
        if(resetCount > 3) {
          ns.toast("RESETTING!!!", "warning", null)
          ns.spawn("reset.js", 1)
        }
      } else {
        rehprintf(ns, "Moved %i levels since last check...", ns.getHackingLevel() - playerLevel)
        playerLevel = ns.getHackingLevel()
      }
    }

  }
}

/** @param {NS} ns */
async function manageAugments(ns) {
  const pkg = ["singularity-augments.js", "reh.js", "reh-constants.js"]
  await execAnywhere(ns, pkg, 1)
}

/** @param {NS} ns */
async function manageHome(ns) {
  const pkg = ["singularity-home.js", "reh.js", "reh-constants.js"]
  await execAnywhere(ns, pkg, 1)
}

/** @param {NS} ns */
function manageDarkweb(ns) {
  var keepGoing = false
  if ( ns.singularity.getDarkwebPrograms().length == 0) {
    rehprintf(ns, "Buying TOR router...")
    ns.singularity.purchaseTor();
    return false
  }
  for(var prog of ns.singularity.getDarkwebPrograms()) {
    if(ns.fileExists(prog, "home") == false) {
      if (ns.singularity.getDarkwebProgramCost(prog) > ns.getServerMoneyAvailable("home")) {
        keepGoing = true
        continue
      }
      rehprintf(ns, "Buying program %s", prog)
      ns.singularity.purchaseProgram(prog)
    }
  }
  return keepGoing
}

/** @param {NS} ns */
async function manageFactions(ns) {
  // This script is pretty fat..
  //  So only run it if we're >127G ram
  if (ns.getServerMaxRam("home") > 127) 
    await execAndWait(ns, "singularity-factions.js", "home", 1)
}

/** @param {NS} ns */
async function installBackdoors(ns) {
  const backdoorServers = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z"]
  var keepGoing = false
  for(var S of backdoorServers) {
    // if we are of sufficient level to hack
    //    and have root access
    //    and there is no backdoor
    if(ns.getHackingLevel() < ns.getServerRequiredHackingLevel(S)) {
      keepGoing = true
      continue
    }
    if(!ns.hasRootAccess(S)) {
      keepGoing = true
      continue
    }
    if(ns.getServer(S).backdoorInstalled)
      continue
    await execAndWait(ns, "install-backdoor.js", "home", 1, S)
  }
}