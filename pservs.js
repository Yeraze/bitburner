import {execAndWait} from 'reh.js'
/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL')
  await execAndWait(ns, "build-farm.js", "home", 1)

  while(ns.getServerMoneyAvailable("home") < 100000000) 
    await ns.sleep(5000)

  await execAndWait(ns, "build-farm.js", "home", 1, "--upgrade", "64")

  while(ns.getServerMoneyAvailable("home") < 1000000000) 
    await ns.sleep(5000)

  await execAndWait(ns, "build-farm.js", "home", 1, "--upgrade", "1024")

  while(ns.getServerMoneyAvailable("home") < 30000000000) 
    await ns.sleep(5000)
  await execAndWait(ns, "build-farm.js", "home", 1, "--upgrade", "65536")
  ns.tprintf("Finished with Purchased Servers!!")
}