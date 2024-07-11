/** @param {NS} ns */
export async function main(ns) {
  const target = ns.getHostname();
  const maxMoney = ns.getServerMaxMoney(target);
  let Money = ns.getServerMoneyAvailable(target)
  while (true){
    if (Money < maxMoney){
      await ns.grow(target);
    } else {
      await ns.sleep(1000);
    }
    Money = ns.getServerMoneyAvailable(target)
  }
}