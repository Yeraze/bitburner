/** @param {NS} ns */
export async function main(ns) {
  const target = ns.getHostname();
  const maxMoney = ns.getServerMaxMoney(target);
  const moneyThresh = maxMoney * 0.9;
  while (true){
    const availMoney = ns.getServerMoneyAvailable(target);
    if (availMoney > moneyThresh) {
      await ns.hack(target);
    } else {
      await ns.sleep(1000);
    }
  }
}