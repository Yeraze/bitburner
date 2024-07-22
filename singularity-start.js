import {rehprintf, execAndWait} from 'reh.js'
/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL')
  ns.tail()
  if (ns.getHackingLevel() < 10) {
    rehprintf(ns, "Starting CS to hit level 10...")
    ns.singularity.universityCourse("rothman university", "computer science", true);
    while (ns.getHackTime() < 10) {
      await ns.sleep(1000);
    }
  }

  rehprintf(ns, "Waiting for $200k...")
  while(ns.getServerMoneyAvailable("home") < 250000) {
    await ns.sleep(1000);
  }
  rehprintf(ns, "Buying TOR router...")
  ns.singularity.purchaseTor();

  var keepGoing = true
  var factionList = []
  while(keepGoing) {
    await ns.sleep(1000)
    keepGoing = false;
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

    for(var faction of ns.singularity.checkFactionInvitations()) {
      if(factionList.indexOf(faction) == -1) {
        factionList.push(faction)
        if (ns.singularity.getFactionEnemies(faction).length == 0) {
          rehprintf(ns, "Joining faction %s", faction)
          ns.singularity.joinFaction(faction)
          ns.scriptKill("s_crime.js", "home")
          ns.singularity.workForFaction(faction, "hacking")
        } else {
          rehprintf(ns, "Not joining faction %s, due to enemies", faction)
        }
      }
    }

    const backdoorServers = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z"]
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
}