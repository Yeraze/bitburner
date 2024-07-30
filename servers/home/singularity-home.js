import {rehprintf} from 'reh.js'
/** @param {NS} ns */
export async function main(ns) {
  var ramCost = ns.singularity.getUpgradeHomeRamCost()
  if (ns.getServerMoneyAvailable("home") > ramCost) {
    if (ns.singularity.upgradeHomeRam()) {
      rehprintf(ns, "Upgraded home RAM")
      ns.toast(ns.sprintf("Upgrading home RAM: $%s", ns.formatNumber(ramCost)),
          "success", null)  
    }
  }

  var coreCost = ns.singularity.getUpgradeHomeCoresCost()
  if (ns.getServerMoneyAvailable("home") > coreCost) {
    if(ns.singularity.upgradeHomeCores()) {
      rehprintf(ns, "Upgraded home CORES")
      ns.toast(ns.sprintf("Upgrading home CORES: $%s", ns.formatNumber(coreCost)),
          "success", null)      
    }
  }
}