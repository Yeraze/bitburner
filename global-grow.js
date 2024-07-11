/** @param {NS} ns */
import {getServerList} from "reh.js"
export async function main(ns) {
  const target = ns.args[0]
  const serverList = getServerList(ns)
  const servers =serverList.concat(ns.getPurchasedServers())
  
  ns.printf("Targeting %s",target)
  for (const server of servers) {
    if (!ns.hasRootAccess(server)) 
      continue
    if (ns.getServerMaxRam(server) == 0) 
      continue
    if (ns.getServerUsedRam(server) > 1)
      continue
    if (target == server) {
      let threads = ns.getServerMaxRam(server) / 2
      ns.scp("remote_weaken.js", server)
      ns.exec("remote_weaken.js", server, threads, target, "nostop")
      continue
    }

    ns.scp("remote_grow.js", server)
    let threads = ns.getServerMaxRam(server) / 2
    ns.exec("remote_grow.js", server, threads, target)
  }
}