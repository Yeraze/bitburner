/** @param {NS} ns */
export async function main(ns) {
  const target= ns.args[0]
  const maxMoney = ns.getServerMaxMoney(target);
  let Money = ns.getServerMoneyAvailable(target)
  while (Money < maxMoney){
    await ns.grow(target);
    Money = ns.getServerMoneyAvailable(target)
  }
}