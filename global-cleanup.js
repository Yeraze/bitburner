/** @param {NS} ns */
export async function main(ns) {
  const serverList = [
        "n00dles","foodnstuff","sigma-cosmetics", "CSEC",
        "joesguns", "hong-fang-tea", "nectar-net", "zer0",
        "harakiri-sushi", "max-hardware", "iron-gym","omega-net",
        "phantasy", "avmnite-02h", "neo-net", "silver-helix",
        "rothman-uni", "I.I.I.I", "summit-uni", "the-hub",
        "zb-institute","catalyst", "netlink"];
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