import {parsearg} from "reh.js"
/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL')
  var stop =false;
  ns.tail()
  ns.moveTail(400,0)
  ns.resizeTail(420, 110)

  var revenue = 0
  var sim = parsearg(ns, "--dryrun", 0)
  var cash = ns.getServerMoneyAvailable("home")
  while(!stop) {
    if (sim) {
      ns.printf("New cash value: $%s", ns.formatNumber(cash))
    } else {
      cash = ns.getServerMoneyAvailable("home")
    }
    if(ns.hacknet.numNodes() == 0) {
      // There are no nodes.. So buy the first one
      ns.hacknet.purchaseNode()
      continue;
    }

    // Now find out the cheapest option to try
    var nodeCost = ns.hacknet.getPurchaseNodeCost()

    var upgrades = []
    if(ns.hacknet.numNodes() < 20) {
      if(nodeCost < cash) {
        var newRate = ns.formulas.hacknetNodes.moneyGainRate(1,1,1)
        upgrades.push( {node: -1,
                price: nodeCost,
                value: (16 - ns.hacknet.numNodes()) ,
                q: newRate,
                ratio: newRate / nodeCost,
                type: "NODE"} );
      }
    }

    // Find our cheapest Level, Ram, and Core upgrade
    for(var index=0; index < ns.hacknet.numNodes(); index++) {
      var nLevel = ns.hacknet.getNodeStats(index).level
      var nCores = ns.hacknet.getNodeStats(index).cores
      var nRam = ns.hacknet.getNodeStats(index).ram
      var moneyRate = ns.formulas.hacknetNodes.moneyGainRate(nLevel, nRam, nCores)
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
          } else { 
            var newRate = ns.formulas.hacknetNodes.moneyGainRate(nLevel, nRam, nCores + HowMany)
            upgrades.push( {node: index, 
                    price: cost,
                    value: newRate - moneyRate,
                    q: HowMany,
                    ratio: (newRate - moneyRate) / cost,
                    type: "CORE"} )
          }
        }
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
          } else {
            var newRate = ns.formulas.hacknetNodes.moneyGainRate(nLevel, nRam + HowMany, nCores)
            upgrades.push( {node: index, 
                    price: cost,
                    value: newRate - moneyRate,
                    q: HowMany,
                    ratio: (newRate - moneyRate) / cost,
                    type: "RAM"} )
          }
        }
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
          } else {
            var newRate = ns.formulas.hacknetNodes.moneyGainRate(nLevel + HowMany, nRam, nCores)
            upgrades.push( {node: index,
                    price: cost,
                    value: newRate - moneyRate,
                    q: HowMany,
                    ratio: (newRate - moneyRate) / cost,
                    type: "LEVEL"} )
          }
        }
      }
    }

    var upgrade
    switch(parsearg(ns, "--model", "roi")) {
      case "windfall":
        // This finds the single biggest cash-maker
        upgrade = upgrades.sort((A,B) => (A.value - B.value)).pop()
        break;
      case "roi":
      default:
        // This finds the item with the best ROI..This typically results 
        //  in a bunch of smaller upgrades
        upgrade = upgrades.sort(((a, b) => (a.ratio - b.ratio))).pop()
    }




    if (upgrade) {
      if (upgrade.type == "NODE") {
        ns.print("Purchasing a new node")
        if (sim == 0)
           ns.hacknet.purchaseNode()
        else
          cash -= upgrade.price
      } else if (upgrade.type == "CORE") {
        ns.printf("Upgrading CORES : Node %i Cores +%i (+$%.2f)",
          upgrade.node, upgrade.q, upgrade.value)
        if (sim == 0) {
          var ret = ns.hacknet.upgradeCore(upgrade.node, upgrade.q)
          if(!ret)
            ns.printf(" -> Fail!")
        } else {
          cash -= upgrade.price
        }
      } else if (upgrade.type == "LEVEL") {
        ns.printf("Upgrading LEVELS : Node %i Level +%i (+$%.2f)",
          upgrade.node, upgrade.q, upgrade.value)
        if (sim == 0) {
          var ret= ns.hacknet.upgradeLevel(upgrade.node, upgrade.q)
          if(!ret)
            ns.printf(" -> Fail!")
        } else {
          cash -= upgrade.price
        }
      } else if (upgrade.type == "RAM") {
        ns.printf("Upgrading RAM : Node %i RAM +%i (+$%.2f)",
          upgrade.node, upgrade.q, upgrade.value)
        if (sim ==0) {
          var ret = ns.hacknet.upgradeRam(upgrade.node, upgrade.q)
          if(!ret)
            ns.printf(" -> Fail!")
        } else {
          cash -= upgrade.price
        }
      }
      await ns.sleep(20)
    // Now upgrade the cheapest
    } else {
      ns.print("Nothing to upgrade for now...")
      var totalProduction = 0
      for(var index=0; index < ns.hacknet.numNodes(); index++) {
        totalProduction += ns.hacknet.getNodeStats(index).production
      }
      var msg =ns.sprintf("-> %i nodes producing $%s/s (+%s/s)", ns.hacknet.numNodes(),
        ns.formatNumber(totalProduction, 2), ns.formatNumber(totalProduction - revenue, 2))
      ns.toast(msg, "info")
      revenue = totalProduction
      if (sim) 
        return
      await ns.sleep(5 * 60 * 1000);
    }
  }
}