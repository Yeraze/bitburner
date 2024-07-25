import {rehprintf, execAndWait} from 'reh.js'
/** @param {NS} ns */
async function waitForMoney(ns, limit){
  rehprintf(ns, "Waiting for $%s", ns.formatNumber(limit))
  while(ns.getServerMoneyAvailable("home") < limit) 
    await ns.sleep(5000)
}

/** @param {NS} ns */
async function buyServers(ns) {
  var ram = 8
  var limit = ns.getPurchasedServerLimit()
  rehprintf(ns, "Preparing to buy %i servers : %iGB Ram", 
    limit, ram)
  while (ns.getPurchasedServers().length < limit) {
    // Check if we have enough money to purchase a server
    if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
        // If we have enough money, then:
        //  1. Purchase the server
        //  2. Copy our hacking script onto the newly-purchased server
        //  3. Run our hacking script on the newly-purchased server with 3 threads
        //  4. Increment our iterator to indicate that we've bought a new server
        var hostname = ns.purchaseServer(
              "pserv-" + ns.getPurchasedServers().length, ram);
        var msg = ns.sprintf("Bought %s" , hostname)
        rehprintf(ns, msg)
    } else {
      await ns.sleep(30 * 1000);
    }
  }
}

/** @param {NS} ns */
async function upgradeServers(ns, upgrade) {
  var keepgoing = true
  rehprintf(ns, "Preparing to upgrade to %s Ram", 
    ns.formatRam(upgrade))

  while(keepgoing) {
    keepgoing = false
    var firstUpgrade = ""
    var lastUpgrade = ""
    for(const S of ns.getPurchasedServers()) {
      if(ns.getServerMaxRam(S) >= upgrade) {
        continue
      }
      if(keepgoing)
        continue
      if(ns.getServerMoneyAvailable("home") > ns.getPurchasedServerUpgradeCost(S, upgrade)) {
        lastUpgrade= S
        if (firstUpgrade == "")
          firstUpgrade = S
        ns.upgradePurchasedServer(S, upgrade)
      } else {
        keepgoing = true
        ns.printf("Upgrade of %s costs $%s", S, 
            ns.formatNumber(ns.getPurchasedServerUpgradeCost(S, upgrade)))
      }
    }
    if (keepgoing) {
      if (firstUpgrade == "") {
        // Nothing to do, nothing got upgraded...
      } else if (firstUpgrade == lastUpgrade) {
        // one server gotupgraded
        rehprintf(ns, "Upgraded %s to %s RAM", firstUpgrade, 
          ns.formatRam(upgrade))
      } else {
        // multiple servers got upgraded
        rehprintf(ns, "Upgraded %s -> %s to %s RAM", firstUpgrade, lastUpgrade, 
          ns.formatRam(upgrade))
      }
      await ns.sleep(30 * 1000)
    }
  }
}
/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL')
  ns.tail()
  ns.moveTail(50, 130)
  ns.resizeTail(500,110)
  rehprintf(ns, "Beginning with basic 8GB Nodes")
  await buyServers(ns)
  var size = 64
  while (size <= 1024*1024) {
    await upgradeServers(ns, size)
    size = size * 4
  }
  rehprintf(ns, "Finished with Purchased Servers!!")
  ns.closeTail()
}