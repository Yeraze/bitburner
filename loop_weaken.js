/** @param {NS} ns */
export async function main(ns) {
  var target = ns.getHostname();
  if (ns.args.length > 0) {
    target = ns.args[0]
  }
  var minSec= ns.getServerMinSecurityLevel(target);
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