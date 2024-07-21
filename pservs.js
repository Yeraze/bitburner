/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL')
  ns.exec("build-farm.js", "home", 1)

  while(ns.getServerMoneyAvailable("home") < 100000000) 
    await ns.sleep(5000)

  ns.exec("build-farm.js", "home", 1, "--upgrade", "64")

  while(ns.getServerMoneyAvailable("home") < 1000000000) 
    await ns.sleep(5000)

  ns.exec("build-farm.js", "home", 1, "--upgrade", "1024")

  while(ns.getServerMoneyAvailable("home") < 3000000000) 
    await ns.sleep(5000)
  ns.exec("build-farm.js", "home", 1, "--upgrade", "65536")
}