export function autocomplete(data, args) {
    return [...data.servers]; // This script autocompletes the list of servers.
}
/** @param {NS} ns */
export async function main(ns) {
  const target= ns.args[0]
  const maxMoney = ns.getServerMaxMoney(target);
  let Money = ns.getServerMoneyAvailable(target)
  while (Money < maxMoney){
    if (ns.getServerSecurityLevel(target) < (ns.getServerMinSecurityLevel(target) * 1.1)) 
      await ns.grow(target);
    else
      await ns.sleep(1000)
    Money = ns.getServerMoneyAvailable(target)
  }
}