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

    var upgrades = []
    if(nodeCost < cash) {
      upgrades.push( {node: -1,
              price: nodeCost,
              value: 1,
              q: 1,
              type: "NODE"} );
    }

    // Find our cheapest Level, Ram, and Core upgrade
    for(var index=0; index < ns.hacknet.numNodes(); index++) {
      if (ns.hacknet.getCoreUpgradeCost(index) < cash) {
        var HowMany = 0
        var keepGoing = true
        while(keepGoing) {
          HowMany++
          var cost= ns.hacknet.getCoreUpgradeCost(index, HowMany)
          if (cost > cash) {
            keepGoing = false
          } else if (cost == -1) {
            keepGoing = false
          }
        }
        HowMany--
        upgrades.push( {node: index, 
                    price: ns.hacknet.getCoreUpgradeCost(index, HowMany),
                    value: HowMany * 4,
                    q:HowMany,
                    type: "CORE"} )
      }
      if (ns.hacknet.getRamUpgradeCost(index) < cash) {
        var HowMany = 0
        var keepGoing = true
        while(keepGoing) {
          HowMany++
          var cost= ns.hacknet.getRamUpgradeCost(index, HowMany)
          if (cost > cash) {
            keepGoing = false
          } else if (cost == -1) {
            keepGoing = false
          }
        }
        HowMany--
        upgrades.push( {node: index, 
                    price: ns.hacknet.getRamUpgradeCost(index, HowMany),
                    value: HowMany * 2,
                    q:HowMany,
                    type: "RAM"} )
      }
      if (ns.hacknet.getLevelUpgradeCost(index) < cash) {
        var HowMany = 0
        var keepGoing = true
        while(keepGoing) {
          HowMany++
          var cost= ns.hacknet.getLevelUpgradeCost(index, HowMany)
          if (cost > cash) {
            keepGoing = false
          } else if (cost == -1) {
            keepGoing = false
          }
        }
        HowMany--
        upgrades.push( {node: index, 
                    price: ns.hacknet.getLevelUpgradeCost(index, HowMany),
                    q: HowMany,
                    value: HowMany,
                    type: "LEVEL"} )
      }
    }
    upgrades.sort(((a, b) => (a.value - b.value)))

    var upgrade = upgrades.pop();
    if (upgrade) {
      if (upgrade.type == "NODE") {
        ns.print("Purchasing a new node")
        ns.hacknet.purchaseNode()
      } else if (upgrade.type == "CORE") {
        ns.printf("Upgrading CORES : Node %i Cores %i",
          upgrade.node, upgrade.q)
        var ret = ns.hacknet.upgradeCore(upgrade.node, upgrade.q)
        if(ret)
          ns.printf(" -> Success!")
        else
          ns.printf(" -> Fail!")
      } else if (upgrade.type == "LEVEL") {
        ns.printf("Upgrading LEVELS : Node %i Level %i",
          upgrade.node, upgrade.q)
        var ret= ns.hacknet.upgradeLevel(upgrade.node, upgrade.q)
        if(ret)
          ns.printf(" -> Success!")
        else
          ns.printf(" -> Fail!")
      } else if (upgrade.type == "RAM") {
        ns.printf("Upgrading RAM : Node %i Level %i",
          upgrade.node, upgrade.q)
        var ret = ns.hacknet.upgradeRam(upgrade.node, upgrade.q)
        if(ret)
          ns.printf(" -> Success!")
        else
          ns.printf(" -> Fail!")
      }
      await ns.sleep(20);
    // Now upgrade the cheapest
    } else {
      ns.printf("Nothing to upgrade for now...")
      await ns.sleep(60000);
    }
  }
}