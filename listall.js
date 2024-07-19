import { table, getSortedServerList } from "reh.js"
import * as CONST from "reh-constants.js"

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL')
  ns.tail()
  ns.resizeTail(800, 600)

  let avgMoneyIncrease = [ns.getServerMoneyAvailable("home")]
  var cash = ns.getServerMoneyAvailable("home")
  while (true) {
    // Header line first, cash flow data
    var newCash = ns.getServerMoneyAvailable("home")
    avgMoneyIncrease.push(newCash - cash)
    cash = newCash
    while (avgMoneyIncrease.length > 10)
      avgMoneyIncrease.shift()
    
    var cashRate = avgMoneyIncrease.reduce(
        (partial, a) => (partial +a), 0 ) / avgMoneyIncrease.length
    
    var hnRate = 0
    for(var index=0; index < ns.hacknet.numNodes(); index++) {
      hnRate += ns.hacknet.getNodeStats(index).production
    }

    ns.printf("Money: $%s (+$%s/s)\t%i HN (+$%s/sec)\t PS:%i",
        ns.formatNumber(cash, 2), ns.formatNumber(cashRate, 2),
        ns.hacknet.numNodes(),
        ns.formatNumber(hnRate, 2),
        ns.getPurchasedServers().length)


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
      if (ns.getServerMaxRam(S) == 0) 
        continue
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
        rowc = [status == "Remote Weaken" ? CONST.fgCyan : 
                status == "Hacking.."    ? CONST.fgBlue :
                "",  // server name
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