/** @param {NS} ns */
export async function main(ns) {
  var target = ns.getHostname();
  if (ns.args.length > 0) {
    target = ns.args[0]
  }
  var maxMoney = ns.getServerMaxMoney(target);
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