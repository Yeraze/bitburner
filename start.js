/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL')
  ns.tprint("Initial setup...")
  ns.exec("auto-breach.js", "home")
  ns.exec("build-farm.js", "home")
  if(ns.fileExists("BruteSSH.exe")) {
    // We started with BruteSSH!
    ns.singularity.purchaseTor()
    ns.exec("s_crime.js", "home", 1, "Kidnap")
    while(ns.getHackingLevel() < 500) {
      await ns.sleep(5000)
      
      for(var program of ns.singularity.getDarkwebPrograms()) {
        ns.singularity.purchaseProgram(program)
      }
    }
  } else {
    ns.exec("hacknet.js", "home")
  
    ns.tprint("Starting store robbery")
    ns.exec("s_crime.js", "home", 1, "Rob Store")
  
    while(ns.getHackingLevel() < 50)
      await ns.sleep(1000)
  
    ns.exec("s_createprogram.js", "home", 1, "BruteSSH.exe")
    while(ns.fileExists("BruteSSH.exe") == false)
      await ns.sleep(1000)
  
    ns.exec("s_crime.js", "home", 1, "Kidnap")
    await ns.sleep(5000)
    while(ns.getHackingLevel() < 100) {
      await ns.sleep(1000)
      for(var faction of ns.singularity.checkFactionInvitations()) {
        ns.singularity.joinFaction(faction)
      }
    }
  
    ns.exec("s_createprogram.js", "home", 1, "FTPCrack.exe")
    while(ns.fileExists("FTPCrack.exe") == false)
      await ns.sleep(1000)
    
    ns.exec("s_crime.js", "home", 1, "Kidnap")
    while(ns.getHackingLevel() < 150) {
      await ns.sleep(1000)
      for(var faction of ns.singularity.checkFactionInvitations()) {
        ns.singularity.joinFaction(faction)
      }
    }
  }
}