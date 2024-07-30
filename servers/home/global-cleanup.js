import {getServerList} from "reh.js"
/** @param {NS} ns */
export async function main(ns) {
  const serverList = getServerList(ns)
  var servers =serverList.concat(ns.getPurchasedServers());
  servers.push("home")
  
  for (const server of servers) {
    if (!ns.hasRootAccess(server)) 
      continue
      
    if(ns.args.indexOf("--super") != -1) {
      if(server != "home")
        ns.killall(server)
      else {
        ns.scriptKill("batcher/controller.js", "home")
        ns.scriptKill("batcher/tGrow.js", "home")
        ns.scriptKill("batcher/tWeaken.js", "home")
        ns.scriptKill("batcher/tHack.js", "home")
      }
    } else {
      if(ns.scriptRunning("remote_weaken.js", server))
        ns.scriptKill("remote_weaken.js", server)
      if(ns.scriptRunning("remote_grow.js", server))
        ns.scriptKill("remote_grow.js", server)
      if(ns.args.indexOf("--loop") != -1){
        ns.scriptKill("loop_grow.js", server)
        ns.scriptKill("loop_hack.js", server)
        ns.scriptKill("loop_weaken.js", server)
      }
    }
  }

}