import {rehprintf} from 'reh.js'
/** @param {NS} ns */
export async function main(ns) {
  if (ns.getServerMoneyAvailable("home") > ns.singularity.getUpgradeHomeRamCost()) {
    if (ns.singularity.upgradeHomeRam()) {
      rehprintf(ns, "Upgraded home RAM")
      ns.toast(ns.sprintf("Upgrading home RAM: $%s", ns.formatNumber(ns.singularity.getUpgradeHomeRamCost())),
          "success", null)  
    }
  }
  if (ns.getServerMoneyAvailable("home") > ns.singularity.getUpgradeHomeCoresCost()) {
    if(ns.singularity.upgradeHomeCores()) {
      rehprintf(ns, "Upgraded home CORES")
      ns.toast(ns.sprintf("Upgrading home CORES: $%s", ns.formatNumber(ns.singularity.getUpgradeHomeCoresCost())),
          "success", null)      
    }
  }
}