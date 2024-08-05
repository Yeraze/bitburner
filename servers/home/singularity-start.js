import {rehprintf, execAndWait, doCommand} from 'reh.js'
import * as db from 'database.js'

var factionList = []
/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL')

  if (ns.getHackingLevel() < 10) {
    db.dbLog(ns, "start", "Starting CS to hit level 10...")
    rehprintf(ns, "Starting CS to hit level 10...")
    await doCommand(ns, 'ns.singularity.universityCourse("rothman university", "computer science", true)');
    while (ns.getHackTime() < 10) {
      await ns.sleep(1000);
    }
  }

  
  var keepGoing = true
  var counter = 59
  db.dbLog(ns, "start","Entering main loop...")
  var playerLevel = ns.getHackingLevel()
  var resetCount = 0
  while(keepGoing) {
    await ns.sleep(1000)
    counter++
    
    await manageDarkweb(ns)
    await installBackdoors(ns)

    if (counter % 5 == 0) {
      await manageFactions(ns)
      await manageHome(ns)
    }
    if (counter % 30 == 0) {
      await manageAugments(ns)
      await manageSleeves(ns)
    }
    // every 20 minutes or so
    if (counter % 1100 == 0) {
      await manageGraft(ns)
    }

    // every 5 minutes or so (300 cycles)
    if (counter % 300 == 0) {
      // If the average Hacking Levels per Second drops under 2
      //  Since this happens every 5 minutes, check for 10 levels
      if(ns.getHackingLevel() - playerLevel < 10) {
        var augMeta = db.dbRead(ns, "augment-meta")
        var augsPurchased = augMeta?.augsPurchased ?? 0

        if (augsPurchased.length == 0) {
          db.dbLogf(ns, "WARN: Run extend: no augmentation purchase")
        } else if (ns.singularity.getCurrentWork().type == "GRAFTING") {
          db.dbLogf(ns, "WARN: Run extend: Waiting on graft..")
        } else {
          resetCount++
          ns.toast(ns.sprintf("CONSIDERING RESET: %i of 3", resetCount), "warning", null)
          if(resetCount >= 3) {
            if(ns.fileExists("extend.txt", "home")) {
              db.dbLogf(ns, "WARN: Run extended: extend.txt flag found")    
            } else {
              ns.toast("RESETTING!!!", "warning", null)
              ns.spawn("reset.js", 1)
            }
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
/** @param {NS} ns */
async function manageGraft(ns) {
  const cash = ns.getServerMoneyAvailable("home")

  if(cash < 1000000000) {
    return
  }

  var augsStartedWith = ns.getResetInfo().ownedAugs
  var augmentsInstalled = db.dbRead(ns, "aug-installed") ?? []

  var delta = augmentsInstalled.filter((A) => (!augsStartedWith.includes(A)))

  if (delta.length > 0) {
    // We've already grafted once this run.
    return
  }

  ns.exec("singularity-graft.js", "home", {temporary: true, threads: 1})

}

async function manageSleeves(ns) {
  await execAndWait(ns, "singularity-sleeve.js", "home", {temporary:true})
}
/** @param {NS} ns */
async function manageAugments(ns) {
  //const pkg = ["singularity-augments.js", "reh.js", "reh-constants.js", "singularity-factionjoin.js", "singularity-augpurchase.js"]
  await execAndWait(ns, "aug-getOwnedAugmentations.js", "home", {temporary:true})
  await execAndWait(ns, "aug-getAugmentationsFromFaction.js", "home", {temporary:true})
  await execAndWait(ns, "aug-getAugmentationPreReq.js", "home", {temporary:true})
  await execAndWait(ns, "aug-getCost.js", "home", {temporary:true})
  await execAndWait(ns, "aug-getStats.js", "home", {temporary:true})
  await execAndWait(ns, "singularity-augments.js", "home", {temporary:true})
}

/** @param {NS} ns */
async function manageHome(ns) {
  //const pkg = ["singularity-home.js", "reh.js", "reh-constants.js"]
  await execAndWait(ns, "singularity-home.js", {temporary: true, threads: 1})
}

/** @param {NS} ns */
async function manageDarkweb(ns) {
  var keepGoing = false
  if ( ns.singularity.getDarkwebPrograms().length == 0) {
    if(ns.getServerMoneyAvailable("home") > 200000) {
      db.dbLog(ns, "start", "Buying TOR router...")
      await doCommand(ns, `ns.singularity.purchaseTor()`);
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
      await doCommand(ns, `ns.singularity.purchaseProgram("${prog}")`)
    }
  }
  return keepGoing
}

/** @param {NS} ns */
async function manageFactions(ns) {
  await execAndWait(ns, "singularity-factions.js", "home", {temporary:true})
  await execAndWait(ns, "checkFactionInvitations.js", "home", {temporary:true})
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
    await execAndWait(ns, "install-backdoor.js", "home", {temporary: true, threads: 1}, S)
  }
}