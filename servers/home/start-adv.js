/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL')
  ns.tprint("Initial setup...")
  ns.exec("auto-breach.js", "home")
  ns.exec("build-farm.js", "home")
  ns.tail()
  ns.moveTail(250,0)
  ns.resizeTail(620, 110)
  if(ns.fileExists("BruteSSH.exe")) {
    // We started with BruteSSH!
    ns.printf("BruteSSH.exe already exists, moving to TOR")
    ns.singularity.purchaseTor()
    ns.exec("s_crime.js", "home", 1, "Kidnap")
    while(ns.getHackingLevel() < 500) {
      await ns.sleep(5000)
      
      for(var program of ns.singularity.getDarkwebPrograms()) {
        ns.printf("-> Purchasing %s",program)
        ns.singularity.purchaseProgram(program)
      }
    }
  } else {
    ns.exec("hacknet.js", "home")
  
    ns.print("Starting store robbery")
    ns.exec("s_crime.js", "home", 1, "Rob Store")
  
    while(ns.getHackingLevel() < 50)
      await ns.sleep(1000)
  
    ns.print("Starting research BruteSSH.exe")
    ns.exec("s_createprogram.js", "home", 1, "BruteSSH.exe")
    while(ns.fileExists("BruteSSH.exe") == false)
      await ns.sleep(1000)
    ns.print("Back to crime")
  
    ns.exec("s_crime.js", "home",)
    await ns.sleep(5000)
    while(ns.getHackingLevel() < 100) {
      await ns.sleep(1000)
      for(var faction of ns.singularity.checkFactionInvitations()) {
        ns.printf("-> Joining faction %s", faction)
        ns.singularity.joinFaction(faction)
      }
    }
  
    ns.print("Starting research FTPCrack.exe")
    ns.exec("s_createprogram.js", "home", 1, "FTPCrack.exe")
    while(ns.fileExists("FTPCrack.exe") == false)
      await ns.sleep(1000)
    
    ns.print("Back to crime")
    ns.exec("s_crime.js", "home", 1, "--loop")
    while(ns.getHackingLevel() < 150) {
      await ns.sleep(1000)
      for(var faction of ns.singularity.checkFactionInvitations()) {
        ns.printf("-> Joining faction %s", faction)
        ns.singularity.joinFaction(faction)
      }
    }
  }
}