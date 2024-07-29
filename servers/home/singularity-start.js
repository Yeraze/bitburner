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
      await manageSleeves(ns)
    }

    if (counter % 300 == 0) {
      if(ns.getHackingLevel() - playerLevel < 10) {
        resetCount++
        ns.toast(ns.sprintf("CONSIDERING RESET: %i of 3", resetCount), "warning", null)
        if(resetCount >= 3) {
          ns.toast("RESETTING!!!", "warning", null)
          ns.spawn("reset.js", 1)
        }
      } else {
        resetCount = 0
      }
      rehprintf(ns, "Averaging %s levels/min [%i strike(s) remaining]", 
          ns.formatNumber((ns.getHackingLevel() - playerLevel)/5, 2),
          3 - resetCount)
      
      playerLevel = ns.getHackingLevel()

    }

  }
}

async function manageSleeves(ns) {
  await execAndWait(ns, "singularity-sleeve.js", "home", 1)
}
/** @param {NS} ns */
async function manageAugments(ns) {
  const pkg = ["singularity-augments.js", "reh.js", "reh-constants.js", "singulariry-factionjoin.js", "singularity-augpurchase.js"]
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
    if(ns.getServerMoneyAvailable("home") > 200000) {
      rehprintf(ns, "Buying TOR router...")
      ns.singularity.purchaseTor();
    } else {
      return false
    }
  }
  const progsICareAbout = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"]
  for(var prog of progsICareAbout) {
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
  const pkg = ["singularity-factions.js","reh.js", "reh-constants.js", "singularity-factionjoin.js"]
  await execAnywhere(ns, pkg, 1)
}

/** @param {NS} ns */
async function installBackdoors(ns) {
  const backdoorServers = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z", "w0r1d_d43m0n"]
  for(var S of backdoorServers) {
    // if we are of sufficient level to hack
    //    and have root access
    //    and there is no backdoor
    if(!ns.serverExists(S)) 
      continue

    if(ns.getHackingLevel() < ns.getServerRequiredHackingLevel(S)) 
      continue
    
    if(!ns.hasRootAccess(S)) 
      continue
    
    if(ns.getServer(S).backdoorInstalled)
      continue
    
    await execAndWait(ns, "install-backdoor.js", "home", 1, S)
  }
}