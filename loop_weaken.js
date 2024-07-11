/** @param {NS} ns */
export async function main(ns) {
  const target = ns.getHostname();
  const minSec= ns.getServerMinSecurityLevel(target);
  let Sec = ns.getServerSecurityLevel(target);
  while (true) {
    if (Sec > minSec){
      await ns.weaken(target);
    } else {
      await ns.sleep(1000);
    }
    Sec = ns.getServerSecurityLevel(target);
  }
}