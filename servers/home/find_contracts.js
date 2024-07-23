import { getSortedServerList } from "reh.js"
/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL')
  var solve = false
  if (ns.args.indexOf("--solve") != -1)
    solve = true
  const serverList = getSortedServerList(ns)
  for (const S of serverList) {
    var contracts = ns.ls(S, ".cct")
    for (const C of contracts) {
      ns.tprintf("%s  %s", S, C)
      if (solve) {
        ns.exec("solve_contract.js", "home", 1, S, C)
      }
    }
  }
}