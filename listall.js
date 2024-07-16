import { table, getSortedServerList } from "reh.js"
import * as CONST from "reh-constants.js"

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL')
  const serverList = getSortedServerList(ns)
  let tableData = []
  let tableColors = []
  let row = ["Server Name", "B", "Security", "Money", "Avail", "Ram", "Status"]
  let rowc= [CONST.fgWhite,
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
      
      row= [S,
        (srv.backdoorInstalled ? "Y" : "N"),
        ns.formatNumber(ns.getServerSecurityLevel(S),2) +" / " +
              ns.formatNumber(ns.getServerMinSecurityLevel(S),2),
        ns.formatNumber(ns.getServerMaxMoney(S)),
        ns.getServerMaxMoney(S) > 0 ? 
          ns.formatPercent(ns.getServerMoneyAvailable(S) / 
                           ns.getServerMaxMoney(S), 1) :
          "--",              
        ns.formatRam(srv.maxRam, 0),
        status]
      rowc=["", 
            srv.backdoorInstalled ? CONST.fgGreen : CONST.fgRed,
            "",
            "",
            (ns.maxRam == 0)      ? CONST.dim     : "",
            ""]
      tableData.push(row)
      tableColors.push(rowc)
    }
  }
  table(ns, tableData, tableColors)
}