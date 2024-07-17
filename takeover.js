/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0]
  // Takeover is in 3 phases.
  // 1. global_weaken
  // 2. global_grow
  // 3. continuous_drain
        
  ns.disableLog("getServerSecurityLevel")      
  ns.disableLog("getServerMinSecurityLevel")      
  ns.disableLog("getServerMoneyAvailable")      
  ns.disableLog("getServerMaxMoney")      
  ns.disableLog("sleep")
  ns.disableLog("exec")

//  ns.tail()
  
  ns.printf("PHASE1: global-weaken of %s", target)
  ns.exec("global-weaken.js", "home", 1, target)
  ns.exec("remote_weaken.js", "home", 20, target, "nostop")
  while( ns.getServerSecurityLevel(target)>ns.getServerMinSecurityLevel(target)) {
    ns.printf("PHASE1: %s security is %i of %i",
      target, ns.getServerSecurityLevel(target), 
      ns.getServerMinSecurityLevel(target))
    var times = ns.getWeakenTime(target) / 1000
    if (times > 120) {
      ns.printf("Weaken time is %i min, %i sec", Math.floor(times/60), times % 60)
    } else {
      ns.printf("Weaken time is %i seconds", times)
    }
    await ns.sleep(5000);
  }

  await ns.sleep(1000)
  // cleanup
  ns.exec("global-cleanup.js", "home")
  await ns.sleep(1000)

  ns.printf("PHASE2: global-grow of %s", target)
  if (ns.exec("global-grow.js", "home", 1, target)== 0) {
    ns.printf("ERROR: Something failed on exec...")
    return
  }
  while( ns.getServerMoneyAvailable(target)<(ns.getServerMaxMoney(target)*0.95)) {
    ns.printf("PHASE2: %s money is %.2f of %.2f", target,
      ns.getServerMoneyAvailable(target) / (1000*1000),
      ns.getServerMaxMoney(target) / (1000*1000))
    var times = ns.getGrowTime(target) / 1000
    if (times > 120) {
      ns.printf("Grow time is %i min, %i sec", Math.floor(times/60), times % 60)
    } else {
      ns.printf("Grow time is %i seconds", times)
    }
    await ns.sleep(5000);
  }

  await ns.sleep(1000)
  // cleanup
  ns.scriptKill("remote_weaken.js", "home")
  ns.exec("global-cleanup.js", "home")
  await ns.sleep(1000)

  ns.printf("PHASE3: Drain!")
  if (ns.getServerMaxRam(target) > 0)
    ns.exec("continuous_hack.js", "home", 1, target)
  else
    ns.printf("--> Server has no RAM!")
  await ns.sleep(1000)
  ns.closeTail()
}