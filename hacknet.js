/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL')
  var stop =false;
  ns.tail()
  ns.moveTail(400,0)
  ns.resizeTail(420, 110)

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
              value: (16 - ns.hacknet.numNodes()) ,
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
                    value: HowMany * 10,
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
                    value: HowMany * 5,
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
    ns.printf("%i potential upgrades", upgrades.length)
    var upgrade = upgrades.pop()
    if (upgrade) {
      if(upgrade.value < 10) {
        ns.printf("-> Value too low (%i), waiting", upgrade.value)
      } else if (upgrade.type == "NODE") {
        ns.print("Purchasing a new node")
        ns.hacknet.purchaseNode()
      } else if (upgrade.type == "CORE") {
        ns.printf("Upgrading CORES : Node %i Cores +%i",
          upgrade.node, upgrade.q)
        var ret = ns.hacknet.upgradeCore(upgrade.node, upgrade.q)
        if(ret)
          ns.printf(" -> Success!")
        else
          ns.printf(" -> Fail!")
      } else if (upgrade.type == "LEVEL") {
        ns.printf("Upgrading LEVELS : Node %i Level +%i",
          upgrade.node, upgrade.q)
        var ret= ns.hacknet.upgradeLevel(upgrade.node, upgrade.q)
        if(ret)
          ns.printf(" -> Success!")
        else
          ns.printf(" -> Fail!")
      } else if (upgrade.type == "RAM") {
        ns.printf("Upgrading RAM : Node %i RAM +%i",
          upgrade.node, upgrade.q)
        var ret = ns.hacknet.upgradeRam(upgrade.node, upgrade.q)
        if(ret)
          ns.printf(" -> Success!")
        else
          ns.printf(" -> Fail!")
      }
    // Now upgrade the cheapest
    } else {
      ns.printf("Nothing to upgrade for now...")
    }
    var totalProduction = 0
    for(var index=0; index < ns.hacknet.numNodes(); index++) {
      totalProduction += ns.hacknet.getNodeStats(index).production
    }
    ns.printf("-> %i nodes producing $%s/s", ns.hacknet.numNodes(),
      ns.formatNumber(totalProduction, 2))
    await ns.sleep(60000);
  }
}