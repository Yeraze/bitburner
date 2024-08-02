import {rehprintf, execContinue, execAnywhere, execAndWait, execAnywhereNoWait, getServerList} from 'reh.js'
import * as CONST from 'reh-constants.js'
import { getServers } from './batcher/utils'
import * as db from 'database.js'
/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL')
  for(var file of ns.ls("home", "/db/")) 
    ns.clear(file)
  db.dbLog(ns, "start", "Initial setup...")
  db.dbLog(ns, "start", "Starting auto-breach.js")
  await execAnywhere(ns, ["s_crime.js"], 1, "Rob Store")
  //execAnywhereNoWait(ns, ["auto-breach.js", "reh.js", "reh-constants.js"], 1)
  execAnywhereNoWait(ns, ["pservs.js","reh.js", "reh-constants.js"], {threads:1, temporary:true})
  ns.exec("dashboard.js", "home")
  // These scripts area bit "fat",so make sure we have ram
  if (ns.getServerMaxRam("home") < 128) {
    db.dbLog(ns, "start", "Looks like we're still earlygame, starting n00dle blast")

    // Use the blast.js script to hack n00dles
    // until our Hacking level is 30 (3x Joesguns)
    await execAndWait(ns, "blast.js", "home", {threads:1, temporary:true}, "n00dles", 4);
    var totalRam = getServerList(ns)
        .filter((S) => ns.hasRootAccess(S))
        .reduce((a, S) => (a + ns.getServerMaxRam(S)), 0)
    while(ns.getHackingLevel() < 30) {
      await ns.sleep(10000)
      await checkForBreaches(ns)
      await checkContracts(ns)

      var totalRamNow = getServerList(ns)
        .filter((S) => ns.hasRootAccess(S))
        .reduce((a, S) => (a + ns.getServerMaxRam(S)), 0)
      if (totalRamNow > totalRam) {
        db.dbLog(ns, "start", "-> Extending n00dle blast")
        await execAndWait(ns, "blast.js", "home", {threads:1, temporary:true}, "n00dles", "EXTEND", 4 );
        totalRam = totalRamNow
      }
    }
    await ns.sleep(5000)
    ns.scriptKill("loop_hack.js", "home")
    ns.scriptKill("loop_grow.js", "home")
    ns.scriptKill("loop_weaken.js", "home")
    await execAndWait(ns, "global-cleanup.js", "home", 1, "--loop")
    await ns.sleep(5000)

    db.dbLog(ns, "start", "Looks like we're still earlygame, starting joesguns blast")
    // Now use the blast.js script to hack joesguns
    // until we have 128G RAM ... 
    await execAndWait(ns, "blast.js", "home", {threads:1, temporary:true}, "joesguns", 4);
    while(ns.getServerMaxRam("home") < 128) {
      await ns.sleep(10000)
      await checkForBreaches(ns)
      await checkContracts(ns)

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
        db.dbLog(ns, "start", "-> Extending joesguns blast")
        await execAndWait(ns, "blast.js", "home", {threads:1, temporary:true}, "joesguns", "EXTEND", 4 );
        totalRam = totalRamNow
      }
    }
    ns.scriptKill("loop_hack.js", "home")
    ns.scriptKill("loop_grow.js", "home")
    ns.scriptKill("loop_weaken.js", "home")
    await execAndWait(ns, "global-cleanup.js", "home", 1, "--loop")
  }
  db.dbLog(ns, "start", "Beginning Singularity manager...")
  execContinue(ns, "singularity-start.js", "home", {threads:1, temporary:true})

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
  db.dbLogf(ns, "Waiting for root access on %s", target)
  while (ns.hasRootAccess(target) == false) {
    await ns.sleep(1000);
    await checkForBreaches(ns)
  }
  db.dbLogf(ns, "Waiting for Hack level on %s", target)
  while (ns.getHackingLevel() < ns.getServerRequiredHackingLevel(target)) {
    await checkForBreaches(ns)
    await ns.sleep(1000)
  }

  // Calculate the initial amount of RAM available
  var totalRam = getServerList(ns)
      .filter((S) => ns.hasRootAccess(S))
      .reduce((a, S) => (a + ns.getServerMaxRam(S)), 0)
  db.dbLogf(ns, "HWGW Attack on %s (%s available ram)", target, 
      ns.formatRam(totalRam))

  // and START
  ns.exec("batcher/controller.js", "home", {threads:1, temporary:true}, target)
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
    await checkForBreaches(ns)
    await checkContracts(ns)
    var rekick = false
    // First check if the script is still running...
    //    Itmight have crashed.. especially in very early-game, low ram
    if (ns.scriptRunning("batcher/controller.js", "home")== false) {
      rekick = true
      db.dbLogf(ns, "%s-> Looks like batcher crashed..", CONST.fgRed);
    }


    // Now look and see if we have new resources
    //  If we have doubled in available RAM since we started the batcher
    //  then we want to restart it.. Gotta get them gainz
    var totalRamNow = getServerList(ns)
      .filter((S) => ns.hasRootAccess(S))
      .reduce((a, S) => (a + ns.getServerMaxRam(S)), 0)
    if(totalRamNow!=spokenRam){
      db.dbLogf(ns, "Detected new ram: %s (+%s)", ns.formatRam(totalRamNow),
        ns.formatPercent( (totalRamNow / totalRam) - 1.0)) 
      spokenRam= totalRamNow
    }
    if (totalRamNow > totalRam * 2.0) {
      rekick = true
    }

    if (rekick) {
      db.dbLogf(ns, "-> Restarting HWGW attack on %s (%s available ram)",
        target, ns.formatRam(totalRamNow))
      // This isa bit messy, yes.. And can leave the target in an unprepped state
      // But it's the fastest way..
      await execAndWait(ns, "global-cleanup.js", "home", {threads:1, temporary:true}, "--super")
      ns.exec("batcher/controller.js", "home", 1, target)
      totalRam = totalRamNow
    }
  }
  db.dbLogf(ns, "Ending attack on %s", target)
  await execAndWait(ns, "global-cleanup.js", "home", 1, "--super")
  ns.scriptKill("batcher/controller.js", "home")
}

async function checkContracts(ns) {
  const serverList = getServerList(ns)
  for (const S of serverList) {
    var contracts = ns.ls(S, ".cct")
    for (const C of contracts) {
      db.dbLogf(ns, "Found contract %s %s", S, C)
      await execAndWait(ns, "solve_contract.js", "home", 1, S, C)
    }
  }
}

/** @param {NS} ns */
async function checkForBreaches(ns) {
  let PortsAvail = 0;
  if (ns.fileExists("BruteSSH.exe", "home")) {
      PortsAvail = PortsAvail +1
  }
  if (ns.fileExists("FTPCrack.exe", "home")) {
      PortsAvail = PortsAvail +1
  }
  if (ns.fileExists("relaySMTP.exe", "home")) {
      PortsAvail = PortsAvail +1
  }
  if (ns.fileExists("HTTPWorm.exe", "home")) {
      PortsAvail = PortsAvail +1
  }
  if (ns.fileExists("SQLInject.exe", "home")) {
      PortsAvail = PortsAvail +1
  }
  var serverList = getServerList(ns).filter((A) => 
    (ns.getServerNumPortsRequired(A) <= PortsAvail))
  for(const server of serverList){
    if(server == "home")
      continue
    
    if(ns.hasRootAccess(server))
      continue

    db.dbLogf(ns, "Breaching %s", server)
    await execAndWait(ns, "breach.js", "home", 1, server)
  }
}