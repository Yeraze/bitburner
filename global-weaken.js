import {getServerList} from "reh.js"
export function autocomplete(data, args) {
    return [...data.servers]; // This script autocompletes the list of servers.
}
/** @param {NS} ns */
export async function main(ns) {
  const target = ns.args[0]
  const serverList = getServerList(ns)
  const servers =serverList.concat(ns.getPurchasedServers());
  
  ns.printf("Targeting %s",target)
  var ramWeaken = ns.getScriptRam("remote_weaken.js")
  if(ns.getServerMaxRam("home") > ramWeaken*100) {
    ns.exec("remote_weaken.js", "home", 40, target)
  }
  for (const server of servers) {
    if (!ns.hasRootAccess(server)) 
      continue
    if (ns.getServerMaxRam(server) == 0) 
      continue
    if (ns.getServerUsedRam(server)>1)
      continue
      
    ns.scp("remote_weaken.js", server)
    ns.scp("reh.js", server)
    ns.scp("reh-constants.js", server)
    let threads = Math.floor(ns.getServerMaxRam(server) / ramWeaken)
    ns.exec("remote_weaken.js", server, threads, target)
  }

}