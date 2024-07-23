export function autocomplete(data, args) {
    return [...data.servers]; // This script autocompletes the list of servers.
}
/** @param {NS} ns */
export async function main(ns) {
  const target= ns.args[0]
  const minSec= ns.getServerMinSecurityLevel(target);
  let Sec = ns.getServerSecurityLevel(target);
  do {
    await ns.weaken(target);
    Sec = ns.getServerSecurityLevel(target);
    if (ns.args[1] == "nostop") {
      Sec = minSec + 1
    }
  }  while (Sec > minSec)
}