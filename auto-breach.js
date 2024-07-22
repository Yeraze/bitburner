
import {getServerList} from "reh.js"
/** @param {NS} ns */
export async function main(ns) {
  ns.tail()
  ns.disableLog("ALL")
  ns.moveTail(850,0)
  ns.resizeTail(620, 110)
  const contractCycle = 30
  
  const enableBackdoor = false
  
  let hackInProgress = ""
  let serversKnown = 0
  let backdoorServers=["CSEC", "avmnite-02h","I.I.I.I", "run4theh111z"]
  let contractCounter = contractCycle;
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
      var srv = ns.getServer(server)
      if(server == "home")
        continue
      
      if(ns.hasRootAccess(server))
        continue

      if(srv.numOpenPortsRequired > PortsAvail) {
        continue
      }

      ns.printf("[%s] P:%i L:%i", server, 
        srv.numOpenPortsRequired, ns.getServerRequiredHackingLevel(server))  
      ns.printf("Breaching %s", server)
      ns.tprintf("Breaching %s", server)
      ns.exec("breach.js", "home", 1, server)
    }
    contractCounter--;
    if(contractCounter <= 0) {
      contractCounter = contractCycle;
      ns.printf("Solving contracts...")
      ns.exec("find_contracts.js", "home", 1, "--solve")
    }
    await ns.sleep(10 * 1000);
  }
}