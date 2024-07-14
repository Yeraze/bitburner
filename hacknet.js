/** @param {NS} ns */
export async function main(ns) {
  var stop =false;

  while(!stop) {
    var cash = ns.getServerMoneyAvailable("home")

    if(ns.hacknet.numNodes() == 0) {
      // There are no nodes.. So buy the first one
      ns.hacknet.purchaseNode()
      continue;
    }

    // Now find out the cheapest option to try
    var nodeCost = ns.hacknet.getPurchaseNodeCost()

    var idxLevel = -1
    var costLevel = 1e20;
    var idxRam = -1
    var costRam = 1e20;
    var idxCores = -1
    var costCores = 1e20;

    // Find our cheapest Level, Ram, and Core upgrade
    for(var index=0; index < ns.hacknet.numNodes(); index++) {
      if (ns.hacknet.getCoreUpgradeCost(index) < costCores) {
        costCores = ns.hacknet.getCoreUpgradeCost(index)
        idxCores = index
      }
      if (ns.hacknet.getRamUpgradeCost(index) < costRam) {
        costRam = ns.hacknet.getRamUpgradeCost(index)
        idxRam = index;
      }
      if (ns.hacknet.getLevelUpgradeCost(index) < costLevel) {
        costLevel = ns.hacknet.getLevelUpgradeCost(index)
        idxLevel = index;
      }
    }
    // Now upgrade the cheapest
    var cheapest = Math.min(costCores, costRam, costLevel, nodeCost)
    if (cheapest < cash) {
      if (cheapest == nodeCost) {
        ns.hacknet.purchaseNode()
      } else if (cheapest == costCores) {
        ns.hacknet.upgradeCore(idxCore)
      } else if (cheapest == costLevel) {
        ns.hacknet.upgradeLevel(idxLevel)
      } else if (cheapest == costRam) {
        ns.hacknet.upgradeRam(idxRam)
      }
      await ns.sleep(20);
    } else {
      await ns.sleep(1000);
    }
  }

}