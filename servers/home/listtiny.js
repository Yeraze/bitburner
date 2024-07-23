import { table, getSortedServerList } from "reh.js"
import * as CONST from "reh-constants.js"

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL')
  ns.tail()
  ns.resizeTail(700, 200)
  const progressIndicator = ["|", "/", "-", "\\"]
  var progressPhase = 0;
  let avgMoneyIncrease = [ns.getServerMoneyAvailable("home")]
  var cash = 0
  while (true) {
    // Header line first, cash flow data
    var newCash = ns.getServerMoneyAvailable("home")
    if ((cash > 0) && ((newCash-cash) >= 0)) 
      avgMoneyIncrease.push(newCash-cash)
    cash = newCash
    while (avgMoneyIncrease.length > 10)
      avgMoneyIncrease.shift()
    
    var cashRate = avgMoneyIncrease.reduce(
        (partial, a) => (partial +a), 0 ) / avgMoneyIncrease.length
    
    ns.printf("Money: $%s (+$%s/s)\t\t\t\t PS:%i\t%s",
        ns.formatNumber(cash, 2), ns.formatNumber(cashRate*4.0, 2),
        ns.getPurchasedServers().length,
        progressIndicator[progressPhase])
    progressPhase = (progressPhase+1) % progressIndicator.length

    var serverList= ["joesguns", "phantasy", "rho-construction", "ecorp"]
    let tableData = []
    let tableColors = []
    let row = ["Server Name", "Level", "Value", "B", "Security", "Money", "Avail", "Ram"]
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
      if ((ns.getServerMaxRam(S) == 0) && (ns.args.indexOf("--all") == -1)) 
        continue
      if (ns.hasRootAccess(S)) {
        var msrv = ns.formulas.mockServer()
        // Clone srv into msrv for tinkering
        Object.assign(msrv, srv)
        // Tweak msrv into optimal state
        //. Max cash, min Security
        msrv.moneyAvailable = msrv.moneyMax
        msrv.hackDifficulty = msrv.minDifficulty
        var hackAmount = msrv.moneyMax * ns.formulas.hacking.hackPercent(msrv, ns.getPlayer())
        var hackTime = ns.formulas.hacking.hackTime(msrv, ns.getPlayer())
        var value = ((hackAmount ) / hackTime)

        row = [S,
          ns.sprintf("%i", ns.getServerRequiredHackingLevel(S)),
          ns.sprintf("%.1f", value),
          (srv.backdoorInstalled ? "Y" : "N"),
          ns.formatNumber(ns.getServerSecurityLevel(S), 2) + " / " +
          ns.formatNumber(ns.getServerMinSecurityLevel(S), 2),
          "$" + ns.formatNumber(ns.getServerMaxMoney(S), 0),
          ns.getServerMaxMoney(S) > 0 ?
            ns.formatPercent(ns.getServerMoneyAvailable(S) /
              ns.getServerMaxMoney(S), 1) :
            "--",
          ns.formatRam(srv.maxRam, 0)]
        rowc = ["",  // server name
          ns.getServerRequiredHackingLevel(S) < ns.getHackingLevel() ?
            CONST.fgGreen : CONST.fgRed,
          "",
          srv.backdoorInstalled ? CONST.fgGreen : CONST.fgRed,
          "",  // Security
          "",  // Money
          "",  // MoneyAvail
          ""   // Ram
        ]
        tableData.push(row)
        tableColors.push(rowc)
      }
    }
    table(ns, tableData, tableColors)
    if (ns.args.indexOf("--loop") == -1) {
      return
    }
    await ns.sleep(250);
  }
}