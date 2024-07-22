import {rehprintf, execAndWait} from 'reh.js'
/** @param {NS} ns */
async function waitForMoney(ns, limit){
  rehprintf(ns, "Waiting for $%s", ns.formatNumber(limit))
  while(ns.getServerMoneyAvailable("home") < limit) 
    await ns.sleep(5000)
}
/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL')
  ns.tail()
  rehprintf(ns, "Beginning with basic 8GB Nodes")
  await execAndWait(ns, "build-farm.js", "home", 1)

  await waitForMoney(ns, 100000000)
  rehprintf(ns, "Upgrading to 64GB Nodes")
  await execAndWait(ns, "build-farm.js", "home", 1, "--upgrade", "64")

  await waitForMoney(ns, 1000000000) 
  rehprintf(ns, "Upgrading to 1TB Nodes")
  await execAndWait(ns, "build-farm.js", "home", 1, "--upgrade", "1024")

  await waitForMoney(ns, 30000000000) 
  rehprintf(ns, "Upgrading to 64TB nodes")
  await execAndWait(ns, "build-farm.js", "home", 1, "--upgrade", "65536")
  rehprintf(ns, "Finished with Purchased Servers!!")
}