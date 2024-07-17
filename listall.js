import { table, getSortedServerList } from "reh.js"
import * as CONST from "reh-constants.js"

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL')
  ns.tail()
  ns.resizeTail(800, 600)
  while (true) {
    var serverList = getSortedServerList(ns)
    let tableData = []
    let tableColors = []
    let row = ["Server Name", "Level", "B", "Security", "Money", "Avail", "Ram", "Status"]
    let rowc = [CONST.fgWhite,
      CONST.fgWhite,
      CONST.fgWhite,
      CONST.fgWhite,
      CONST.fgWhite,
      CONST.fgWhite,
      CONST.fgWhite,
      CONST.fgWhite]
    tableData.push(row)
    tableColors.push(rowc)
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
        if (ns.scriptRunning("simplehack.js", S))
          status = "Hacking.."
        if (ns.scriptRunning("loop_hack.js", S))
          status = "Hacking.."

        row = [S,
          ns.sprintf("%i", ns.getServerRequiredHackingLevel(S)),
          (srv.backdoorInstalled ? "Y" : "N"),
          ns.formatNumber(ns.getServerSecurityLevel(S), 2) + " / " +
          ns.formatNumber(ns.getServerMinSecurityLevel(S), 2),
          "$" + ns.formatNumber(ns.getServerMaxMoney(S), 0),
          ns.getServerMaxMoney(S) > 0 ?
            ns.formatPercent(ns.getServerMoneyAvailable(S) /
              ns.getServerMaxMoney(S), 1) :
            "--",
          ns.formatRam(srv.maxRam, 0),
          status]
        rowc = ["",  // server name
          ns.getServerRequiredHackingLevel(S) < ns.getHackingLevel() ?
            CONST.fgGreen : CONST.fgRed,
          srv.backdoorInstalled ? CONST.fgGreen : CONST.fgRed,
          "",  // Security
          "",  // Money
          "",  // MoneyAvail
          "",  // Ram
          "" // status
        ]
        tableData.push(row)
        tableColors.push(rowc)
      }
    }
    table(ns, tableData, tableColors)
    if (ns.args.indexOf("--loop") == -1) {
      return
    }
    await ns.sleep(1000);
  }
}