import {getServerList} from "reh.js"
/** @param {NS} ns */
export async function main(ns) {
  const serverList = getServerList(ns)
  const servers =serverList.concat(ns.getPurchasedServers());
  
  for (const server of servers) {
    if (!ns.hasRootAccess(server)) 
      continue
      
    if(ns.scriptRunning("remote_weaken.js", server))
      ns.scriptKill("remote_weaken.js", server)
    if(ns.scriptRunning("remote_grow.js", server))
      ns.scriptKill("remote_grow.js", server)
  }

}