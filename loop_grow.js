/** @param {NS} ns */
export async function main(ns) {
  var target = ns.getHostname();
  var force = false
  if (ns.args.length > 1)
    if (ns.args[1] == "force")
      force = true
  if (ns.args.length > 0) {
    target = ns.args[0]
  }
  var maxMoney = ns.getServerMaxMoney(target);
  let Money = ns.getServerMoneyAvailable(target)
  while (true){
    if ((Money < (maxMoney*0.92)) || force){
      await ns.grow(target);
    } else {
      await ns.sleep(1000);
    }
    Money = ns.getServerMoneyAvailable(target)
  }
}