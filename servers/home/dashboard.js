/** @param {NS} ns */
import {table} from 'reh.js'
import * as db from 'database.js'
import * as color from 'reh-constants.js'
/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL')
    ns.tail()
    ns.moveTail(800,0)
    ns.resizeTail(650, 850)
    let avgMoneyIncrease = [ns.getServerMoneyAvailable("home")]
    var cash = 0
 
    var oldFactionList = []
    var factionRates = []
    var factionListTimes = [Date.now(), Date.now()]
    var augProgress = []
    var cycle = 0
    while(true) {
        cycle++
        await ns.sleep(1000)
        var faction = db.dbRead(ns, "faction") 
        var factionList = db.dbRead(ns, "factions") ?? []
        var augment = db.dbRead(ns, "augment")
        var global = db.dbRead(ns, "global")
        var home = db.dbRead(ns, "home")
        var augMeta = db.dbRead(ns, "augment-meta")
        ns.clearLog()
        // Header line first, cash flow data
        var newCash = ns.getServerMoneyAvailable("home")
        if ((cash > 0) && ((newCash-cash) >= 0)) 
            avgMoneyIncrease.push(newCash-cash)
        cash = newCash
        while (avgMoneyIncrease.length > 60)
            avgMoneyIncrease.shift()
        
        var cashRate = avgMoneyIncrease.reduce(
            (partial, a) => (partial +a), 0 ) / avgMoneyIncrease.length
        

        let level = ns.getResetInfo().ownedSF.get(ns.getResetInfo().currentNode)
        var nodeString = ns.sprintf("%i.%i",
            ns.getResetInfo().currentNode, level)
        var resetCount = db.dbRead(ns, "resets", "global").resets
        ns.printf("[RUN:%i] %s\t\t[NODE:%s] %s", resetCount+1,
                db.formatTime(ns, Date.now() - ns.getResetInfo().lastAugReset),
                nodeString,
                db.formatTime(ns, Date.now() - ns.getResetInfo().lastNodeReset))
        var vMsg = ""
        if(global) {
            vMsg = ns.sprintf("Velocity: %s%s/min%s", 
                global.velocity > 2.0 ? color.fgGreen : color.fgRed, 
                global.velocity, color.reset)
            if(global.strikes > 0)
                vMsg = ns.sprintf("%s [%i strikes]", vMsg, global.strikes)
            if (ns.fileExists("extend.txt","home"))
                vMsg = ns.sprintf("%s %s(FLAG)", vMsg, color.fgWhite)
        } else {
            vMsg = "Vel: pending"
        }
        ns.printf("Money: $%s (+$%s/s)\t%s",
            ns.formatNumber(cash, 2), ns.formatNumber(cashRate, 2), vMsg)

/*
        ns.printf("Kills: %s\tKarma: %s\tHacking: %s",
            ns.formatNumber(ns.getPlayer().numPeopleKilled,0),
            ns.formatNumber(ns.getPlayer().karma),
            ns.formatNumber(ns.getPlayer().skills.hacking, 0))
        ns.printf("Entropy: %s%i%s\tNFG: %i\t\tWD: %s",
            ns.getResetInfo().ownedAugs.has("violet Congruity Implant") ? color.fgGreen : color.fgRed,
            ns.getPlayer().entropy, 
            color.reset,
            ns.getResetInfo().ownedAugs.get("NeuroFlux Governor") ?? 0,
            ns.formatNumber(3000 * ns.getBitNodeMultipliers().WorldDaemonDifficulty))
        var workString = "<pending>"
        if(faction) {
            workString = ns.sprintf("%s for %s", faction.work, faction.faction)
        }
        ns.printf("Work: %s\t%s", workString,
            (ns.singularity.exportGameBonus() ? color.fgCyan +"[BONUS]" : "")
        )
        ns.printf("%s[START-]%s\t%s[SINGUL]%s\t%s[STANEK]%s\t%s[BATCH]",
            ns.scriptRunning("basicstart.js", "home")? color.fgGreen : color.fgRed,
            color.reset,
            ns.scriptRunning("singularity-start.js", "home")? color.fgGreen : color.fgRed,
            color.reset,
            ns.scriptRunning("singularity-stanek.js", "home")? color.fgGreen : color.fgRed,
            color.reset,
            ns.scriptRunning("batcher/controller.js", "home")? color.fgGreen : color.fgRed
        )
        */
        var batcher = db.dbRead(ns, "batcher")
        if(ns.scriptRunning("batcher/controller.js", "home") && batcher) {
            ns.printf("=== Batcher ============================================")
            ns.printf("Target: %s (%s%s)", batcher.target,
                    (batcher.greed == "95%") ? color.fgCyan : "",
                    (batcher.status.includes("Active") ? 
                        ((cycle % 6 < 3) ? `$${batcher.rate}/s` : batcher.greed) :
                        batcher.status))
        } else {
            ns.printf("Target: <unknown>")
        }

        if(ns.scriptRunning("hacknet.js", "home")) {
            ns.printf("=== Hacknet ============================================")
            let hacknet = db.dbRead(ns, "hacknet")
            if (hacknet) {
                ns.printf("Number of Nodes: %i\tCash: %s/%s",
                    hacknet.numNodes,
                    ns.formatNumber(hacknet.numHashes), 
                    ns.formatNumber(hacknet.maxHashes)
                )
            }
        }
        if(ns.scriptRunning("hacknet-servers.js", "home")) {
            ns.printf("=== Hacknet ============================================")
            let hacknet = db.dbRead(ns, "hacknet")
            if (hacknet) {
                ns.printf("Number of Nodes: %i\tHashes: %s/%s (+%s h/s)",
                    hacknet.numNodes,
                    ns.formatNumber(hacknet.numHashes), 
                    ns.formatNumber(hacknet.maxHashes),
                    ns.formatNumber(hacknet.rate)
                )
            }
        }

        ns.printf("=== Home computer ============================================")
        if (home) {
            ns.printf(" * CPU Cores: %i  \t\t($%s to upgrade)", home.cores,
                ns.formatNumber(home.coreUpgrade))
            var percFree = (home.ram - home.ramUsed) / home.ram
            ns.printf(" * RAM: %s %s(%s free)%s\t($%s to upgrade)", 
                ns.formatRam(home.ram),
                (percFree < .1) ? color.fgRed : "",
                ns.formatPercent(percFree, 0),
                color.reset,
                ns.formatNumber(home.ramUpgrade))
            
        } else {
            ns.printf("-> <unknown>")
        }
        var dtable = []
        var ctable = []
        var row = ["ID", "Int", "Shock", "Sync", "Status"]
        var colors = [color.fgWhite, color.fgWhite, color.fgWhite, color.fgWhite]
        dtable.push(row)
        ctable.push(colors)
        var sleeves = db.dbRead(ns, "sleeves") ?? []
        if(sleeves.length > 0) {
          ns.printf("=== Sleeves ============================================")
          for(var sleeve of sleeves) {
              row = [ ns.sprintf("%s", sleeve.id+1), 
                      ns.sprintf("%3s", sleeve.int),
                      ns.sprintf("%7s", ns.formatNumber(sleeve.shock, 2)),
                      ns.sprintf("%6s", ns.formatNumber(sleeve.sync, 2)),
                      ns.sprintf("%s", sleeve.job)
              ]
              colors = ["", "",
                  sleeve.shock > 0 ? color.fgRed : color.fgGreen,
                  sleeve.sync < 99 ? color.fgRed : color.fgGreen,
                  ""
              ]
              dtable.push(row)
              ctable.push(colors)
          }
          //if(sleeves.length > 0)
          //  ns.printf("Stats: %s", sleeves[0].stats?.join(' / ') )
          table(ns, dtable, ctable)
        }


        ns.printf("=== Factions ============================================")
        dtable = []; ctable = []
        row = ["Faction", "Rep", "Rate/s"]
        row.push(ns.sprintf("Favor [%i]", ns.getFavorToDonate()))
        var colors = [color.fgWhite, color.fgWhite, color.fgWhite]
        dtable.push(row)
        ctable.push(colors)   

        var totalRep = factionList.reduce((A,B) => (A + B.rep), 0)
        var oldTotalRep = oldFactionList.reduce((A,B) => (A+B.rep),0)
        if (totalRep != oldTotalRep) {
            // Ok, there was an update
            factionListTimes[1] = factionListTimes[0]
            factionListTimes[0] = Date.now()
            factionRates = [] // nuke it
            for(var fac of factionList) {
                var prev = oldFactionList.find((A) => (A.name == fac.name))
                var rate = 0
                if (prev) { 
                     rate = (fac.rep - prev.rep) / 
                        ((factionListTimes[0] - factionListTimes[1]) / 1000)
                }
                factionRates.push( { name: fac.name, rate: rate})
            }
            oldFactionList = factionList
        }
        for(var fac of factionList.filter((A) => (A.status))) {
            var rateEntry = factionRates.find((A) => (A.name == fac.name))
            var rate = 0
            if (rateEntry)
                rate = rateEntry.rate
            row = [ fac.name, 
                    ns.sprintf("%7s", ns.formatNumber(fac.rep,2)),
                    ns.sprintf("%7s", ns.formatNumber( rate, 2)),
                    ns.sprintf("%5s (+%s)", ns.formatNumber(fac.favor,1), 
                        ns.formatNumber(fac.favorGain, 1))
            ]
            colors = [fac.status ? color.fgGreen : "",
                "",
                "",
                fac.favor > ns.getFavorToDonate() ? color.fgGreen : 
                    (fac.favor + fac.favorGain > ns.getFavorToDonate()) ? color.fgCyan : ""
            ]
            dtable.push(row)
            ctable.push(colors)
        }


        if(augment) {
            var rateEntry = factionRates.find((A) => (A.name == augment.faction))
            var eta = "<??>"
            if(rateEntry)
                eta=db.formatTime(ns, (augment.repRemaining / (rateEntry.rate) * 1000))
            if (augment.repRemaining < 0)
                eta = "Done!"
            ns.printf("Augment: %s [%s]",
                augment.augment, augment.faction)
            ns.printf(" => (%s) %s", augment.progress, eta)
        } else {
            ns.printf("Augment: <none>")
        }

        if(augMeta) {
            var nfg = db.dbRead(ns, "nfg")
            var dReq = ""
            if(augMeta.augmentsInstalled < augMeta.daedalusRequires) {
              dReq = ns.sprintf(" [%i]", augMeta.daedalusRequires)
            }
            ns.printf(" => %s%i Augments Installed%s%s, %s%i pending %s",
                augMeta.augmentsInstalled >= 30 ? color.fgGreen : color.reset,
                augMeta.augmentsInstalled, 
                dReq,
                color.reset,
                augMeta.augmentsPurchased > 0 ? color.fgCyan : color.reset,
                augMeta.augmentsPurchased,
                nfg?.count > 0 ? `(${nfg.count} NFG)` : ""
            )
        } else {
            ns.printf("-> Augments status <pending>")
        }
        table(ns, dtable, ctable)
        var invites = []
        for (var fac of factionList.filter((A) => (!A.status)) )
            invites.push(fac.name)
        if(invites.length > 0)
          ns.printf("Invitations: %s", invites.join(', '))

    }

}
