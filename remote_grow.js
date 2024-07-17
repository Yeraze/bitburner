import {parsearg} from "reh.js"
export function autocomplete(data, args) {
    return [...data.servers]; // This script autocompletes the list of servers.
}
/** @param {NS} ns */
export async function main(ns) {
  if (ns.args.length < 4) {
    ns.printf("ERROR:Insufficient args")
    return
  }
  const target= ns.args[0]
  const maxMoney = parsearg(ns, "--maxmoney", -1)
  const minSec= parsearg(ns, "--minsec", 0)
  let Money = ns.getServerMoneyAvailable(target)
  ns.printf("MaxMoney = %s", maxMoney)
  while (Money < maxMoney){
    if (ns.getServerSecurityLevel(target) < minSec) 
      await ns.grow(target);
    else
      await ns.sleep(1000)
    Money = ns.getServerMoneyAvailable(target)
  }
}