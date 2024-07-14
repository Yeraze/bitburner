/** @param {NS} ns */

import {getServerList} from "reh.js"
export async function main(ns) {
  ns.tail()
  ns.disableLog("ALL")
  ns.moveTail(850,0)
  ns.resizeTail(620, 110)
  
  let hackInProgress = ""
  let serversKnown = 0
  let backdoorServers=["CSEC", "avmnite-02h","I.I.I.I", "run4theh111z"]
  while(true) {
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

    // First build up the list of servers
    var serverList = getServerList(ns);
    if (serverList.length != serversKnown) {
      ns.printf("%i servers known", serverList.length)
      serversKnown = serverList.length
    }
    let easyServer = ""
    let easyServerLvl = 1000
    for(const server of serverList){
      if(server == "home")
        continue
      let srv = ns.getServer(server)
      if(srv.maxRam == 0)
        continue
      if(hackInProgress == "") {
        if(ns.hasRootAccess(server) && (srv.moneyAvailable > 0)) {
          let alreadyHacked = false
          if (ns.getServerMaxRam(server) == 0)
            alreadyHacked = true // Not entire correct, butgood enough
          if (ns.scriptRunning("loop_hack.js", server))
            alreadyHacked = true
          if (ns.scriptRunning("simplehack.js", server))
            alreadyHacked = true
          if (alreadyHacked == false) {
            if (ns.getServerRequiredHackingLevel(server) < easyServerLvl) {
              easyServerLvl = ns.getServerRequiredHackingLevel(server)
              easyServer = server
            }
          }
        }
      }
      
      if(ns.hasRootAccess(server))
        continue

      if(srv.numOpenPortsRequired > PortsAvail) {
        continue
      }

      ns.printf("[%s] P:%i L:%i", server, 
        srv.numOpenPortsRequired, ns.getServerRequiredHackingLevel(server))  
      ns.printf("Breaching %s", server)
      ns.exec("breach.js", "home", 1, server)
    }
    // Seeif any of the special game servers are ready for backdoor
    for(const server of backdoorServers) {
      var srv = ns.getServer(server)
      if(!ns.hasRootAccess(server)) {
        continue  // We needto have root first
      }
      if(srv.backdoorInstalled) {
        continue  // No sense doing it a 2nd time
      }
      if(srv.requiredHackingSkill > ns.getHackingLevel()) {
        continue  // we need to be higher level
      }
      if(ns.scriptRunning("breach.js", server)) {
        continue  // already underway
      }
      ns.printf("-> BACKDOOR of %s", server)
      ns.killall(server)
      ns.exec("breach.js", "home", 1, server, "backdoor")
    }
    if (easyServer != "") {
      // We have an easy server to consider for hack
      ns.printf("Establishing target %s [%i]", easyServer, easyServerLvl)
      if (ns.getServerRequiredHackingLevel(easyServer) > ns.getHackingLevel()) {
        ns.printf("-> Cannot hack,required level %i", 
            ns.getServerRequiredHackingLevel(easyServer))
      } else {
        hackInProgress = easyServer
        if (ns.getServerMaxRam(easyServer) < 8) {
          ns.scp("simplehack.js", easyServer)
          ns.exec("simplehack.js", easyServer, 1, easyServer)
          ns.exec("continuous_hack.js", "home", 1, easyServer, "10") 
          hackInProgress = ""
        } else {
          ns.exec("takeover.js", "home", 1, hackInProgress)
        }
      }
    } else {
      if (hackInProgress != "") {
        if (ns.scriptRunning("takeover.js", "home") == false) {
          ns.printf("Hack of %s complete", hackInProgress)
          hackInProgress = ""
        }
      }
    }
    await ns.sleep(10 * 1000);
  }
}