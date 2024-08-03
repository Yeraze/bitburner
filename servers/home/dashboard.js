/** @param {NS} ns */
import {table} from 'reh.js'
import * as db from 'database.js'
import * as color from 'reh-constants.js'
/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL')
    ns.tail()
    let avgMoneyIncrease = [ns.getServerMoneyAvailable("home")]
    var cash = 0
 
    var oldFactionList = []
    var factionRates = []
    var factionListTimes = [Date.now(), Date.now()]
    while(true) {
        await ns.sleep(1000)
        var batcher = db.dbRead(ns, "batcher")
        var sleeves = db.dbRead(ns, "sleeves") ?? []
        var faction = db.dbRead(ns, "faction") 
        var factionList = db.dbRead(ns, "factions") ?? []
        var augment = db.dbRead(ns, "augment")
        var global = db.dbRead(ns, "global")
        var home = db.dbRead(ns, "home")
        var augMeta = db.dbRead(ns, "augment-meta")
        var ipvgo = db.dbRead(ns, "ipvgo")
        ns.clearLog()
        // Header line first, cash flow data
        var newCash = ns.getServerMoneyAvailable("home")
        if ((cash > 0) && ((newCash-cash) >= 0)) 
            avgMoneyIncrease.push(newCash-cash)
        cash = newCash
        while (avgMoneyIncrease.length > 10)
            avgMoneyIncrease.shift()
        
        var cashRate = avgMoneyIncrease.reduce(
            (partial, a) => (partial +a), 0 ) / avgMoneyIncrease.length
        

        ns.printf("[RUN] %s\t\t[NODE] %s", 
                db.formatTime(ns, Date.now() - ns.getResetInfo().lastAugReset),
                db.formatTime(ns, Date.now() - ns.getResetInfo().lastNodeReset))
        var vMsg = ""
        if(global) {
            if(global.strikes > 0) 
                vMsg = ns.sprintf("Velocity: %s/min [%i strikes] %s", global.velocity, global.strikes,
                    ns.fileExists("extend.txt", "home") ? `${color.fgWhite}(FLAG)` : "" )
            else
                vMsg = ns.sprintf("Velocity: %s/min", global.velocity)
        } else {
            vMsg = "Vel: pending"
        }
        ns.printf("Money: $%s (+$%s/s)\t%s",
            ns.formatNumber(cash, 2), ns.formatNumber(cashRate, 2), vMsg)

        ns.printf("=== Batcher ============================================")
        if(batcher) {
            ns.printf("Target: %-20s\t%s :: %s", batcher.target,
                    batcher.greed, batcher.status)
        } else {
            ns.printf("Target: <unknown>")
        }

        if(ns.scriptRunning("ipvgo.js", "home")) {
            ns.printf("=== IPvGO ============================================")
            if(ipvgo) {
                ns.printf("Iterations: %i (%s s per iteration)", 
                    ipvgo.iteration, ns.formatNumber( ipvgo.avgTime / 1000 ))
                ns.printf("Result: %s %s", ns.formatPercent(ipvgo.percent / 100), ipvgo.description)
            } else {
                ns.printf(" <pending>")
            }
        }
        ns.printf("=== Home computer ============================================")
        if (home) {
            ns.printf(" * CPU Cores: %i  \t\t($%s to upgrade)", home.cores,
                ns.formatNumber(home.coreUpgrade))
            ns.printf(" * RAM: %s (%s free)\t($%s to upgrade)", 
                ns.formatRam(home.ram),
                ns.formatPercent((home.ram - home.ramUsed) / home.ram, 0),
                ns.formatNumber(home.ramUpgrade))
            
        } else {
            ns.printf("-> <unknown>")
        }
        var dtable = []
        var ctable = []
        var row = ["Sleeve", "Shock", "Sync", "Status"]
        var colors = [color.fgWhite, color.fgWhite, color.fgWhite, color.fgWhite]
        dtable.push(row)
        ctable.push(colors)
        for(var sleeve of sleeves) {
            row = [ ns.sprintf("%s", sleeve.id), 
                    ns.formatNumber(sleeve.shock, 3),
                    ns.formatNumber(sleeve.sync, 3),
                    ns.sprintf("%s", sleeve.job)
            ]
            colors = ["",
                sleeve.shock > 0 ? color.fgRed : color.fgGreen,
                sleeve.sync < 99 ? color.fgRed : color.fgGreen,
                ""
            ]
            dtable.push(row)
            ctable.push(colors)
        }
        ns.printf("=== Sleeves ============================================")
        table(ns, dtable, ctable)


        ns.printf("=== Factions ============================================")
        dtable = []; ctable = []
        row = ["Faction", "Rep", "Rate/s", "Favor"]
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
                    ns.formatNumber(fac.rep),
                    ns.formatNumber( rate, 2),
                    ns.sprintf("%s (+%s)", ns.formatNumber(fac.favor,1), 
                        ns.formatNumber(fac.favorGain, 1))
            ]
            colors = [fac.status ? color.fgGreen : "",
                "",
                "",
                fac.favor > 150 ? color.fgGreen : ""
            ]
            dtable.push(row)
            ctable.push(colors)
        }

        if(faction) {
            ns.printf("Faction: %s for %s", faction.work, faction.faction)
        } else {
            ns.printf("Faction: <idle>")
        }
        if(augment) {
            ns.printf("Augment: Saving for %s [%s] (%s)", 
                augment.augment, augment.faction, augment.progress
            )
        } else {
            ns.printf("Augment: <none>")
        }

        if(augMeta) {
            ns.printf("-> %i Augments Installed, %i pending",
                augMeta.augmentsInstalled, augMeta.augmentsPurchased)
        } else {
            ns.printf("-> Augments status <pending>")
        }
        table(ns, dtable, ctable)
        var invites = []
        for (var fac of factionList.filter((A) => (!A.status)) )
            invites.push(fac.name)
        ns.printf("Invitations: %s", invites.join(','))

        var lineCount = 5
        if(ns.scriptRunning("pservs.js", "home")) {
            ns.printf("=== Purchased Server Log: [running] ============================")
            var lines = db.dbLogFetch(ns, "pserv", 5)
            for(var l of lines)
                ns.print(l)
        } else {
            lineCount = 10
        }


        lines = db.dbLogFetch(ns, "start", lineCount)
        ns.printf("=== Startup Log: ============================================")
        for(var l of lines)
            ns.print(l)

    }

}