import {parsearg} from "reh.js"
/** @param {NS} ns */
export async function main(ns) {
  if (ns.args.length < 3) {
    ns.printf("ERROR: INsufficient args")
    return
  }
  var target = ns.args[0]
  var minSec= parsearg(ns, "--minsec", 1)
  let Sec = ns.getServerSecurityLevel(target);
  while (true) {
    if (Sec > minSec*1.01){
      await ns.weaken(target);
    } else {
      await ns.sleep(1000);
    }
    Sec = ns.getServerSecurityLevel(target);
  }
}