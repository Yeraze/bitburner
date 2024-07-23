import {rehprintf} from 'reh.js'
/** @param {NS} ns */
export async function main(ns) {
  if (ns.getServerMoneyAvailable("home") > ns.singularity.getUpgradeHomeRamCost()) {
    rehprintf(ns, "Upgrading home RAM")
    ns.singularity.upgradeHomeRam()
  }
  if (ns.getServerMoneyAvailable("home") > ns.singularity.getUpgradeHomeCoresCost()) {
    rehprintf(ns, "Upgrading home CORES")
    ns.singularity.upgradeHomeCores()
  }
}