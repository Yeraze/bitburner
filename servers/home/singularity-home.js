import {getServerList, doCommand, rehprintf} from 'reh.js'
import * as db from 'database.js'
/** @param {NS} ns */
export async function main(ns) {
  var ramCost = ns.singularity.getUpgradeHomeRamCost()
  if (ns.getServerMoneyAvailable("home") > ramCost) {
    if (await doCommand(ns, "ns.singularity.upgradeHomeRam()")) {
      //rehprintf(ns, "Upgraded home RAM")
      await db.dbGlobalLogf(ns, "Upgraded home RAM: $%s", ns.formatNumber(ramCost))
      ns.toast(ns.sprintf("Upgraded home RAM: $%s", ns.formatNumber(ramCost)),
          "success", null)  
      db.dbLogf(ns, "Upgraded home RAM: %s", ns.formatNumber(ramCost))
    }
  }

  var coreCost = ns.singularity.getUpgradeHomeCoresCost()
  if (ns.getServerMoneyAvailable("home") > coreCost) {
    if(await doCommand(ns, "ns.singularity.upgradeHomeCores()")) {
      //rehprintf(ns, "Upgraded home CORES")
      await db.dbGlobalLogf(ns, "Upgraded home CORES: $%s", ns.formatNumber(coreCost))
      ns.toast(ns.sprintf("Upgraded home CORES: $%s", ns.formatNumber(coreCost)),
          "success", null)      
      db.dbLogf(ns, "Upgraded home CORES: $%s", ns.formatNumber(coreCost))
    }
  }

  var totalRam = 0
  var totalCores = 0
  var totalSystems = 0
  var pservSystems = 0
  var pservRam = 0
  var hnetSystems = 0
  var hnetCores = 0
  var hnetRam = 0
  
  for(var S of getServerList(ns)) {
    if(S == "home")
      continue
    var srv = ns.getServer(S)
    if(srv.hasAdminRights) {
      if(S.startsWith("pserv")) {
        pservSystems ++
        pservRam += srv.maxRam
      } else if (S.startsWith("hacknet")) {
        hnetSystems ++
        hnetCores += srv.cpuCores
        hnetRam += srv.maxRam
      } else {
        totalSystems ++
        totalRam += srv.maxRam
        totalCores += srv.cpuCores
      }
    }
  }


  var S = ns.getServer("home")
  var record = { ram : S.maxRam,
                 ramUsed: S.ramUsed,
                 cores : S.cpuCores,
                 ramUpgrade: ramCost,
                 coreUpgrade: coreCost,
                 network_count: totalSystems,
                 network_ram : totalRam,
                 network_cores : totalCores,
                 pserv_count: pservSystems,
                 pserv_ram: pservRam,
                 hnet_count: hnetSystems,
                 hnet_ram: hnetRam,
                 hnet_cores: hnetCores}
  db.dbWrite(ns, "home", record)
}
