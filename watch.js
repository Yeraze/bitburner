/** @param {NS} ns */
export async function main(ns) {
  const serverList = [
        "n00dles","foodnstuff","sigma-cosmetics", "CSEC",
        "joesguns", "hong-fang-tea", "nectar-net", "zer0",
        "harakiri-sushi", "max-hardware", "iron-gym","omega-net",
        "phantasy", "avmnite-02h", "neo-net", "silver-helix",
        "rothman-uni", "I.I.I.I", "summit-uni", "the-hub",
        "zb-institute","catalyst", "netlink"];
  const servers = serverList.concat(ns.getPurchasedServers())
  
  ns.disableLog("getServerSecurityLevel")
  ns.disableLog("getServerMoneyAvailable")
  ns.disableLog("getServerGrowth")
  ns.disableLog("getServerMinSecurityLevel")
  ns.disableLog("getServerMaxMoney")
  ns.disableLog("getServerMaxRam")
  ns.disableLog("getServerUsedRam")
  ns.disableLog("sleep")
  ns.tail()
 //@ignore-infinite 
  while(true) {
    ns.printf("---------\n");
    for (const server of servers) {
      let num = ns.getServerSecurityLevel(server);
      let s_min = ns.getServerMinSecurityLevel(server)
      let s_perc = (num / s_min * 100.0) - 100.0;
      
      num = ns.getServerMoneyAvailable(server)
      let m_max= ns.getServerMaxMoney(server)
      let m_perc= num / m_max * 100;

      let memMax = ns.getServerMaxRam(server)
      let memCur = ns.getServerUsedRam(server)

      if (!ns.hasRootAccess(server))
        continue;
      if (ns.args[0] == "flow") {
        // Flow mode... only show loop_hack
        if (!ns.scriptRunning("loop_hack.js", server))
          continue
      } else {
        // Regular mode.. only show open for use
        if (ns.scriptRunning("loop_hack.js", server))
          continue
      }
      if (m_max > 0) {
        ns.printf("%15s\tR:%3i%% S:%5.1f%%  M:%i%% ($%.2fM)\n", 
            server, memCur / memMax * 100, s_perc, m_perc, m_max/(1000*1000));
      } else {
        ns.printf("%15s\tR:%3i%% S:%5.1f%%  \n", 
            server, memCur / memMax * 100, s_perc, m_perc)

      }
    }
    await ns.sleep(1* 1000);
  }

}