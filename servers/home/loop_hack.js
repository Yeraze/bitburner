import {parsearg} from "reh.js"
/** @param {NS} ns */
export async function main(ns) {
  if (ns.args.length < 3) {
    ns.print("ERROR: Insufficient arguments")
  }
  var target = ns.args[0]
  var maxMoney = parsearg(ns, "--maxmoney", -1)
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