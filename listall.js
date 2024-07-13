/** @param {NS} ns */
import { getServerList } from "reh.js"

export async function main(ns) {
  ns.disableLog('ALL')
  const serverList = getServerList(ns)
  ns.tprintf("%20s| %1s | %1s | %10s | %5s | %6s | Status",
    "Server Name", "B", "N", "Money", "Avail", "RAM")
  for (const S of serverList) {
    var srv = ns.getServer(S)
    if (ns.hasRootAccess(S)) {
      let status = "UNKNOWN"
      if (ns.scriptRunning("remote_grow.js", S))
        status = "Remote Grow"
      if (ns.scriptRunning("remote_weaken.js", S))
        status = "Remote Weaken"
      if (ns.scriptRunning("install-backdoor.js", S))
        status = "Installing Backdoor.."
      if (ns.scriptRunning("loop_hack.js", S))
        status = "Hacking.."
      ns.tprintf("%20s| %1s | %1s | $%9s | %4i%% | %6s | %s",
        S,
        (srv.backdoorInstalled ? "Y" : "N"),
        (ns.hasRootAccess(S) ? "Y" : "N"),
        ns.formatNumber(ns.getServerMaxMoney(S)),
        ns.getServerMoneyAvailable(S) / ns.getServerMaxMoney(S) * 100,
        ns.formatRam(srv.maxRam, 0),
        status
      )
    }

  }
}