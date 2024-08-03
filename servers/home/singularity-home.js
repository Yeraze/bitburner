import {doCommand, rehprintf} from 'reh.js'
import * as db from 'database.js'
/** @param {NS} ns */
export async function main(ns) {
  var ramCost = ns.singularity.getUpgradeHomeRamCost()
  if (ns.getServerMoneyAvailable("home") > ramCost) {
    if (await doCommand(ns, "ns.singularity.upgradeHomeRam()")) {
      rehprintf(ns, "Upgraded home RAM")
      ns.toast(ns.sprintf("Upgrading home RAM: $%s", ns.formatNumber(ramCost)),
          "success", null)  
    }
  }

  var coreCost = ns.singularity.getUpgradeHomeCoresCost()
  if (ns.getServerMoneyAvailable("home") > coreCost) {
    if(await doCommand(ns, "ns.singularity.upgradeHomeCores()")) {
      rehprintf(ns, "Upgraded home CORES")
      ns.toast(ns.sprintf("Upgrading home CORES: $%s", ns.formatNumber(coreCost)),
          "success", null)      
    }
  }

  var S = ns.getServer("home")
  var record = { ram : S.maxRam,
                 ramUsed: S.ramUsed,
                 cores : S.cpuCores,
                 ramUpgrade: ramCost,
                 coreUpgrade: coreCost}
  db.dbWrite(ns, "home", record)
}