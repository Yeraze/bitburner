import {parsearg} from "reh.js"
/** @param {NS} ns */
export async function main(ns) {
  if (ns.args.length < 3) {
    ns.print("ERROR: Insufficient args")
    return
  }
  var target = ns.args[0]
  var maxMoney = parsearg(ns, "--maxmoney", -1)
  var force = parsearg(ns, "--force", 0)
  let Money = ns.getServerMoneyAvailable(target)
  while (true){
    if ((Money < (maxMoney*0.92)) || (force == 1)){
      await ns.grow(target);
    } else {
      await ns.sleep(1000);
    }
    Money = ns.getServerMoneyAvailable(target)
  }
}