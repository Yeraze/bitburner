import {parsearg} from "reh.js"
import * as db from "./database";

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog('ALL')
  var stop =false;
  //ns.tail()
  ns.moveTail(400,0)
  ns.resizeTail(420, 110)

  var revenue = 0
  var sim = parsearg(ns, "--dryrun", 0)
  var cash = ns.getServerMoneyAvailable("home")

  var kickBatcher = false
  var kickBatcherTimeout = 0

  var opModel = parsearg(ns, "--model", "roi")
  while(!stop) {
    if (sim) {
      ns.printf("New cash value: $%s", ns.formatNumber(cash))
    } else {
      cash = ns.getServerMoneyAvailable("home")
    }
    if(ns.hacknet.numNodes() == 0) {
      // There are no nodes.. So buy the first one
      if (ns.hacknet.purchaseNode() == -1) {
        // For some reason, we couldn't buy it.
        await ns.sleep(5000); 
        continue
      }
    }
    var maxNodes = 60

    let hashCount = 0

    // We only really want to do this if we would get some benefit from it..
    // Which means either the Player is studying, or a Sleeve
    var someoneIsStudying = false

    if(ns.singularity.getCurrentWork()?.type == "CLASS")
      someoneIsStudying = true

    var sleeves = db.dbRead(ns, "sleeves")
    if (sleeves) {
      for(var sleeve of sleeves) {
        if(sleeve.job.startsWith("U:"))
          someoneIsStudying = true
      }
    }
    // See if we can upgrade our studying a bit
    var lvlStudying = ns.hacknet.getHashUpgradeLevel("Improve Studying")
    var upgCost = ns.formulas.hacknetServers.hashUpgradeCost("Improve Studying", lvlStudying)
    var hashUpgrades = []
    if (someoneIsStudying && (ns.hacknet.numHashes() > upgCost))  {
      var levels = 1
      var hashes = ns.hacknet.numHashes()
      while(ns.formulas.hacknetServers.hashUpgradeCost("Improve Studying", lvlStudying+levels) < hashes) {
        levels++
        hashes -= ns.formulas.hacknetServers.hashUpgradeCost("Improve Studying", lvlStudying+levels)
      }
      hashUpgrades.push({name: "STUDY", amount: levels -1})
    }

    // See if we can boost the situation around our Hacking Target
    var batcher = db.dbRead(ns, "batcher")
    if (batcher) {
      var target = batcher.target
      var lvlMinSec = ns.hacknet.getHashUpgradeLevel("Reduce Minimum Security")
      var levels = 1
      var hashes = ns.hacknet.numHashes()
      while(ns.formulas.hacknetServers.hashUpgradeCost("Reduce Minimum Security", lvlMinSec+levels) < hashes) {
        levels++
        hashes -= ns.formulas.hacknetServers.hashUpgradeCost("Reduce Minimum Security", lvlStudying+levels)
      }
      if(levels > 1)
        hashUpgrades.push({name: "SECURITY", amount:  levels -1})
      
      
      var lvlMaxMoney = ns.hacknet.getHashUpgradeLevel("Increase Maximum Money")
      var levels = 1
      var hashes = ns.hacknet.numHashes()
      while(ns.formulas.hacknetServers.hashUpgradeCost("Increase Maximum Money", lvlMaxMoney+levels) < hashes) {
        levels++
        hashes -= ns.formulas.hacknetServers.hashUpgradeCost("Increase Maximum Money", lvlStudying+levels)
      }
      if(levels > 1)
        hashUpgrades.push({name: "MONEY", amount: levels -1 })
    }

    if (hashUpgrades.length > 0) {
      var chosenUpgrade = hashUpgrades[Math.floor(Math.random()*hashUpgrades.length)]
      ns.printf("Upgrade count = %i", hashUpgrades.length)
      ns.printf(" Chosen upgrade: %s +%i", chosenUpgrade.name, chosenUpgrade.amount)
      switch (chosenUpgrade.name) {
      case "STUDY":
        if(ns.hacknet.spendHashes("Improve Studying", "", chosenUpgrade.amount)) {
          hashCount += upgCost
          db.dbLogf(ns, "Upgrading studying to %s",
            ns.formatPercent(ns.hacknet.getStudyMult()))
        }
        break;
      case  "SECURITY":
        if (ns.hacknet.spendHashes("Reduce Minimum Security", target, chosenUpgrade.amount)) {
          hashCount += upgCost
          db.dbLogf(ns, "Lowering Security of %s  %s", target,
              ns.formatNumber(ns.getServerMinSecurityLevel(target)))
          kickBatcher = true
          kickBatcherTimeout = 5
        }
        break;
      case "MONEY":
        if (ns.hacknet.spendHashes("Increase Maximum Money", target, chosenUpgrade.amount)) {
          hashCount += upgCost
          db.dbLogf(ns, "Increasing Maximum Money of %s $%s", target,
              ns.formatNumber(ns.getServerMaxMoney(target))) 
          kickBatcher = true
          kickBatcherTimeout = 5
        }
        break;
      }
    } else {
      ns.printf("No Hash upgrades I can afford")
    }
    if(kickBatcher) {
      kickBatcherTimeout--
      if(kickBatcherTimeout < 0) {
        db.dbLogf(ns, "Killing batcher to adopt new stats")
        ns.scriptKill("batcher/controller.js", "home")
        kickBatcher = false
      }
    }
  
    var hashesSold = 0
    while(ns.hacknet.numHashes() > 10) {
      ns.hacknet.spendHashes("Sell for Money")
      hashCount+=4
      hashesSold++
      //await ns.sleep(10)
    }

    if (revenue > 8) {
      // We've got a decent bit of revenue coming in..
      // 8hash/sec => $2mil/sec
      // So reserve $100Mil
      cash -= (100 * 1000000)
      if (cash < 0)
        cash = 0
    }

    if(hashCount > 0) {
      var line = ns.sprintf("Sold %i hashes for $%s", hashCount, ns.formatNumber(hashesSold*1000000,0))
      ns.print(line)
      db.dbLogf(ns, line)
    }  

    var totalHProduction = 0
    for(var index=0; index < ns.hacknet.numNodes(); index++) {
      totalHProduction += ns.hacknet.getNodeStats(index).hashCapacity
    }
    if ((hashCount) > (totalHProduction*0.8)) {
      // We just sold over 80% of our total Hash Storage Capacity
      // time to buy more
      var minCost = 1e99
      var minCostIndex = -1
      for(var index=0; index < ns.hacknet.numNodes(); index++) {
        if (ns.hacknet.getCacheUpgradeCost(index) < minCost) {
          minCost = ns.hacknet.getCacheUpgradeCost(index)
          minCostIndex = index
        }
      }
      if(ns.hacknet.upgradeCache(minCostIndex)) {
        db.dbLogf(ns, "Upgrading Hacknet Server Cache")
      }
    }
    // Now find out the cheapest option to try
    var nodeCost = ns.hacknet.getPurchaseNodeCost()

    var upgrades = []
    if(ns.hacknet.numNodes() < maxNodes) {
      if(nodeCost < cash) {
        var newRate = ns.formulas.hacknetServers.hashGainRate(1, 0, 1, 1)
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
      var moneyRate = ns.formulas.hacknetServers.hashGainRate(nLevel, 0, nRam, nCores)
      
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
            var newRate = ns.formulas.hacknetServers.hashGainRate(nLevel, 0, nRam, nCores + HowMany)
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
            var newRate = ns.formulas.hacknetServers.hashGainRate(nLevel, 0, nRam + HowMany, nCores)
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
            var newRate = ns.formulas.hacknetServers.hashGainRate(nLevel + HowMany, 0, nRam, nCores)
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

    // Look for a changed opmodel
    var dbModel = db.dbRead(ns, "opmodel")
    if (dbModel) {
      if (opModel != dbModel.opModel) {
        db.dbLogf(ns, "HNSERV: Changed opmodel to %s", dbModel.opModel)
        opModel = dbModel.opModel
      }
    }
    var upgrade
    switch(opModel) {
      case "sellonly":
        upgrade = null
        break
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
      } else if (upgrade.type == "CACHE") {
        ns.printf("Upgrading CACHE: Node %i Cache +%i",
            upgrade.node, upgrade.q)
        if (sim == 0) {
            var ret = ns.hacknet.upgradeCache(upgrade.node, upgrade.q)
            if(!ret)
                ns.printf(" -> FAIL!") 
        } else {
            cache -= upgrade.price
        }   
      } else if (upgrade.type == "CORE") {
        ns.printf("Upgrading CORES : Node %i Cores +%i (+%.4f)",
          upgrade.node, upgrade.q, upgrade.value)
        if (sim == 0) {
          var ret = ns.hacknet.upgradeCore(upgrade.node, upgrade.q)
          if(!ret)
            ns.printf(" -> Fail!")
        } else {
          cash -= upgrade.price
        }
      } else if (upgrade.type == "LEVEL") {
        ns.printf("Upgrading LEVELS : Node %i Level +%i (+%.4f)",
          upgrade.node, upgrade.q, upgrade.value)
        if (sim == 0) {
          var ret= ns.hacknet.upgradeLevel(upgrade.node, upgrade.q)
          if(!ret)
            ns.printf(" -> Fail!")
        } else {
          cash -= upgrade.price
        }
      } else if (upgrade.type == "RAM") {
        ns.printf("Upgrading RAM : Node %i RAM +%i (+%.4f)",
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
      var msg =ns.sprintf("-> %i nodes producing %s h/s (+%s/s)", ns.hacknet.numNodes(),
        ns.formatNumber(totalProduction, 4), ns.formatNumber(totalProduction - revenue, 4))
      ns.toast(msg, "info")
      revenue = totalProduction
      if (sim) 
        return

      var counter = 0;
      var timeToWait = 60 // 5 minutes
      while(counter < timeToWait) {
        counter++
        var record = { numNodes: ns.hacknet.numNodes(),
                       numHashes: ns.hacknet.numHashes(),
                       rate: totalProduction,
                       maxHashes: ns.hacknet.hashCapacity() }
        db.dbWrite(ns, "hacknet", record)
        await ns.sleep(1000)
      }
    }
  }
}
