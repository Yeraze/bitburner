import {rehprintf, execAndWait, execAnywhere} from 'reh.js'
import * as db from 'database.js'

var factionList = []
/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL')

  if (ns.getHackingLevel() < 10) {
    db.dbLog(ns, "start", "Starting CS to hit level 10...")
    rehprintf(ns, "Starting CS to hit level 10...")
    ns.singularity.universityCourse("rothman university", "computer science", true);
    while (ns.getHackTime() < 10) {
      await ns.sleep(1000);
    }
  }

  db.dbLog(ns, "start", "Waiting for $250k...")
  while(ns.getServerMoneyAvailable("home") < 250000) {
    await ns.sleep(1000);
  }

  var keepGoing = true
  var counter = 59
  db.dbLog(ns, "start","Entering main loop...")
  var playerLevel = ns.getHackingLevel()
  var resetCount = 0
  while(keepGoing) {
    await ns.sleep(1000)
    counter++
    
    manageDarkweb(ns)
    await installBackdoors(ns)

    if (counter % 5 == 0) {
      await manageFactions(ns)
      await manageHome(ns)
    }
    if (counter % 60 == 0) {
      await manageAugments(ns)
      await manageSleeves(ns)
    }
    // every 5 minutes or so (300 cycles)
    if (counter % 300 == 0) {
      // If the average Hacking Levels per Second drops under 2
      //  Since this happens every 5 minutes, check for 10 levels
      if(ns.getHackingLevel() - playerLevel < 10) {
        var augsPurchased = ns.singularity.getOwnedAugmentations(true).filter( 
            (A) => (ns.singularity.getOwnedAugmentations(false).indexOf(A) == -1))
        if (augsPurchased.length == 0) {
          db.dbLogf(ns, "WARN:-> Should be a reset, but wait for an augmentation purchase")
        } else {
          resetCount++
          ns.toast(ns.sprintf("CONSIDERING RESET: %i of 3", resetCount), "warning", null)
          if(resetCount >= 3) {
            ns.toast("RESETTING!!!", "warning", null)
            ns.spawn("reset.js", 1)
          }  
        }
      } else {
        resetCount = 0
      }
      
      var record = {velocity: ns.formatNumber((ns.getHackingLevel() - playerLevel)/5, 2),
                    strikes: resetCount
              }
      db.dbWrite(ns, "global", record)
      
      playerLevel = ns.getHackingLevel()

    }

  }
}

async function manageSleeves(ns) {
  await execAndWait(ns, "singularity-sleeve.js", "home", 1)
}
/** @param {NS} ns */
async function manageAugments(ns) {
  const pkg = ["singularity-augments.js", "reh.js", "reh-constants.js", "singularity-factionjoin.js", "singularity-augpurchase.js"]
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
      db.dbLog(ns, "start", "Buying TOR router...")
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
      db.dbLogf(ns, "Buying program %s", prog)
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
//  const backdoorServers = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z", "w0r1d_d43m0n"]
  const backdoorServers = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z"]
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
    db.dbLogf(ns, "Backdooring %s", S)
    await execAndWait(ns, "install-backdoor.js", "home", 1, S)
  }
}