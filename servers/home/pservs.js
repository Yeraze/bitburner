import {rehprintf, execAndWait} from 'reh.js'
import * as db from 'database.js'
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
  var line = ns.sprintf("Preparing to buy %i servers : %iGB Ram", 
    limit, ram)
  //rehprintf(ns, line) 
  db.dbLog(ns, "pserv", line)
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
        //rehprintf(ns, msg)
        db.dbLog(ns, "pserv", msg)
    } else {
      db.dbLog(ns, "pserv", ns.sprintf("Purchase of server costs $%s", 
        ns.formatNumber(ns.getPurchasedServerCost(ram)))) 

      await ns.sleep(30 * 1000);
    }
  }
}

/** @param {NS} ns */
async function upgradeServers(ns, upgrade) {
  var keepgoing = true
  var line = ns.sprintf("Preparing to upgrade to %s Ram", 
    ns.formatRam(upgrade))
  //rehprintf(ns, line)
  db.dbLog(ns, "pserv", line)

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
      if(ns.getPurchasedServerUpgradeCost(S, upgrade) == Infinity) {
        rehprintf(ns, "ERROR: There isn't one!  We're done!")
        return
      }

      if(ns.getServerMoneyAvailable("home") > ns.getPurchasedServerUpgradeCost(S, upgrade)) {
        lastUpgrade= S
        if (firstUpgrade == "")
          firstUpgrade = S
        ns.upgradePurchasedServer(S, upgrade)
      } else {
        keepgoing = true
        db.dbLog(ns, "pserv", ns.sprintf("Upgrade of %s costs $%s", S, 
            ns.formatNumber(ns.getPurchasedServerUpgradeCost(S, upgrade))))
      }
    }
    if (firstUpgrade == "") {
      // Nothing to do, nothing got upgraded...
    } else if (firstUpgrade == lastUpgrade) {
      // one server gotupgraded
      db.dbLog(ns, "pserv", ns.sprintf("Upgraded %s to %s RAM", firstUpgrade, 
        ns.formatRam(upgrade)))
    } else {
      // multiple servers got upgraded
      db.dbLog(ns, "pserv", ns.sprintf("Upgraded %s -> %s to %s RAM", firstUpgrade, lastUpgrade, 
        ns.formatRam(upgrade)))
    }
    if (keepgoing) {
      await ns.sleep(30 * 1000)
    }
  }
}
/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL')

  rehprintf(ns, "Beginning with basic 8GB Nodes")
  db.dbLogf(ns, "Beginning with basic 8GB Nodes")
  db.dbLog(ns, "pserv", "Beginning 8GB Server purchase!")
  await buyServers(ns)
  var size = 64
  while (size <= 1024*1024) {
    await upgradeServers(ns, size)
    size = size * 4
  }
  rehprintf(ns, "Finished with Purchased Servers!!")
  db.dbLogf(ns, "Finished buying servers!")
  ns.closeTail()
}