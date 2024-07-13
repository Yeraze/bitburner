/** @param {NS} ns */
import { getSortedServerList } from "reh.js"

export async function main(ns) {
  ns.disableLog('ALL')
  const serverList = getSortedServerList(ns)
  for (const S of serverList) {
    var contracts = ns.ls(S, ".cct")
    for (const C of contracts) {
      ns.tprintf("%s: %s", S, C)
    }
  }
}