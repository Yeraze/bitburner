import {rehprintf} from 'reh.js'
/** @param {NS} ns */
export async function main(ns) {
  if (ns.getServerMoneyAvailable("home") > ns.singularity.getUpgradeHomeRamCost()) {
    rehprintf(ns, "Upgrading home RAM")
    ns.toast(ns.sprintf("Upgrading home RAM: $%s", ns.formatNumber(ns.singularity.getUpgradeHomeRamCost())),
        "success", null)
    ns.singularity.upgradeHomeRam()
  }
  if (ns.getServerMoneyAvailable("home") > ns.singularity.getUpgradeHomeCoresCost()) {
    rehprintf(ns, "Upgrading home CORES")
    ns.toast(ns.sprintf("Upgrading home CORES: $%s", ns.formatNumber(ns.singularity.getUpgradeHomeCoresCost())),
        "success", null)    
    ns.singularity.upgradeHomeCores()
  }
}