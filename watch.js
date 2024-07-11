/** @param {NS} ns */
import {getServerList} from "reh.js"
export async function main(ns) {
  ns.disableLog("getServerSecurityLevel")
  ns.disableLog("scan")
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
    var servers = getServerList(ns)
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
      var hacked = false
      if (ns.scriptRunning("loop_hack.js", server))
        hacked = true
      if (ns.scriptRunning("simplehack.js", server))
        hacked = true
      if (ns.args[0] == "flow") {
        // Flow mode... only show loop_hack
        if (!hacked)
          continue
      } else {
        // Regular mode.. only show open for use
        if (hacked)
          continue
      }
      if (m_max > 0) {
        ns.printf("%18s\tR:%3i%% S:%5.1f%%  M:%i%% ($%.2fM)\n", 
            server, memCur / memMax * 100, s_perc, m_perc, m_max/(1000*1000));
      } else {
        ns.printf("%18s\tR:%3i%% S:%5.1f%%  \n", 
            server, memCur / memMax * 100, s_perc, m_perc)

      }
    }
    await ns.sleep(1* 1000);
  }

}