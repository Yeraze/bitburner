/** @param {NS} ns */
export async function main(ns) {
  var target = ns.getHostname();
  if (ns.args.length > 0) {
    target = ns.args[0]
  }
  var maxMoney = ns.getServerMaxMoney(target);
  var moneyThresh = maxMoney * 0.9;
  while (true){
    const availMoney = ns.getServerMoneyAvailable(target);
    if(ns.fileExists("pretend.js")) {
      ns.printf("Pretending")
      await ns.sleep(1000);
    } else {
      if (availMoney > moneyThresh) {
        await ns.hack(target);
      } else {
        await ns.sleep(1000);
      }
    }
  }
}