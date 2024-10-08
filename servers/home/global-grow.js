import {getServerList} from "reh.js"
export function autocomplete(data, args) {
    return [...data.servers]; // This script autocompletes the list of servers.
}
/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0]
  const serverList = getServerList(ns)
  const servers =serverList.concat(ns.getPurchasedServers())

  var ramWeaken = ns.getScriptRam("remote_weaken.js")
  var ramGrow = ns.getScriptRam("remote_grow.js")

  var cmdArgs = ["--maxmoney", ns.getServerMaxMoney(target),
                 "--minsec", ns.getServerMinSecurityLevel(target)]
  
  ns.printf("Targeting %s",target)
  if(ns.getServerMaxRam("home") > ramGrow*100) {
    ns.exec("remote_grow.js", "home", 100, target, ...cmdArgs)
  }
  for (const server of servers) {
    if (!ns.hasRootAccess(server)) 
      continue    // we don't have root
    if (ns.getServerMaxRam(server) == 0) 
      continue    // this server has no RAM
    if (ns.getServerUsedRam(server) > 1)
      continue    // somethign else is already here
    if (target == server) {
      // This is the target server, so spawn a weaken for now
      let threads = Math.floor(ns.getServerMaxRam(server) / ramWeaken)
      ns.scp("reh.js", server)
      ns.scp("reh-constants.js", server)
      ns.scp("remote_weaken.js", server)
      ns.exec("remote_weaken.js", server, threads, target, "nostop")
      continue
    }

    ns.scp("remote_grow.js", server)
    ns.scp("reh.js", server)
    ns.scp("reh-constants.js", server)
    await ns.sleep(20)
    let threads = Math.floor(ns.getServerMaxRam(server) / ramGrow)
    ns.exec("remote_grow.js", server, threads, target, ...cmdArgs)
  }
}