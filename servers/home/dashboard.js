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
 

    while(true) {
        await ns.sleep(1000)
        var batcher = db.dbRead(ns, "batcher")
        var sleeves = db.dbRead(ns, "sleeves") || []
        var faction = db.dbRead(ns, "faction") 
        var factionList = db.dbRead(ns, "factions") || []
        var augment = db.dbRead(ns, "augment")
        var global = db.dbRead(ns, "global")
        var home = db.dbRead(ns, "home")
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
        

        ns.printf("Time of this run: %s", ns.tFormat(ns.getTimeSinceLastAug()))
        ns.printf("Money: $%s (+$%s/s)",
            ns.formatNumber(cash, 2), ns.formatNumber(cashRate, 2))
        if(global) {
            if(global.strikes > 0) 
                ns.printf("Velocity: %s/min [%i strikes]", global.velocity, global.strikes)
            else
                ns.printf("Velocity: %s/min", global.velocity)
        } else {
            ns.printf("Velocity: pending")
        }

        if(batcher) {
            ns.printf("Current target: %s", batcher.target)
            ns.printf("-> %s :: %s", batcher.greed, batcher.status)
        } else {
            ns.printf("Current target: <unknown>")
            ns.printf("-> (no current target)")
        }

        if(augment) {
            ns.printf("Augment: Saving for %s [%s] (%s)", 
                augment.augment, augment.faction, augment.progress
            )
        } else {
            ns.printf("Augment: <none>")
        }
        ns.printf("=== Home computer")
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
                    sleeve.job
            ]
            colors = ["",
                sleeve.shock > 0 ? color.fgRed : color.fgGreen,
                sleeve.sync < 95 ? color.fgRed : color.fgGreen,
                ""
            ]
            dtable.push(row)
            ctable.push(colors)
        }
        table(ns, dtable, ctable)

        dtable = []; ctable = []
        row = ["Faction", "Status", "Rep", "Favor"]
        var colors = [color.fgWhite, color.fgWhite, color.fgWhite, color.fgWhite]
        dtable.push(row)
        ctable.push(colors)       

        for(var fac of factionList) {
            row = [ fac.name, 
                    fac.status ? "Member" : "Invited",
                    ns.formatNumber(fac.rep),
                    ns.sprintf("%s (+%s)", ns.formatNumber(fac.favor,1), 
                        ns.formatNumber(fac.favorGain, 1))
            ]
            colors = ["",
                "",
                fac.favor > 150 ? color.fgGreen : "",
                ""
            ]
            dtable.push(row)
            ctable.push(colors)
        }
        table(ns, dtable, ctable)

        var lines = db.dbLogFetch(ns, "pserv", 5)
        ns.printf("=== Purchased Server Log:")
        for(var l of lines)
            ns.print(l)

        lines = db.dbLogFetch(ns, "start", 5)
        ns.printf("=== Startup Log:")
        for(var l of lines)
            ns.print(l)

    }

}