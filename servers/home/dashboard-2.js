/** @param {NS} ns */
import {table} from 'reh.js'
import * as db from 'database.js'
import * as color from 'reh-constants.js'
/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL')
    ns.tail()
    ns.moveTail(50,0)
    ns.resizeTail(650, 850)
    let avgMoneyIncrease = [ns.getServerMoneyAvailable("home")]
    var cash = 0
 
    while(true) {
        await ns.sleep(1000)
        var global = db.dbRead(ns, "global")
        var faction = db.dbRead(ns, "faction") 

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
        

        ns.printf("[RUN] %s\t\t[NODE] %s", 
                db.formatTime(ns, Date.now() - ns.getResetInfo().lastAugReset),
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

        ns.printf("Kills: %s\tKarma: %s\tHacking: %s",
            ns.formatNumber(ns.getPlayer().numPeopleKilled,0),
            ns.formatNumber(ns.getPlayer().karma),
            ns.formatNumber(ns.getPlayer().skills.hacking, 3))
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
        if(ns.scriptRunning("ipvgo.js", "home")) {
            var ipvgo = db.dbRead(ns, "ipvgo")
            ns.printf("=== IPvGO ============================================")
            if(ipvgo) {
                ns.printf("Iterations: %i (%s s per iteration)", 
                    ipvgo.iteration, ns.formatNumber( ipvgo.avgTime / 1000 ))
                ns.printf("Result: %s %s", ns.formatPercent(ipvgo.percent / 100), ipvgo.description)
            } else {
                ns.printf(" <pending>")
            }
        }
        if(ns.scriptRunning('ipvgo2.js', 'home')) {
            var ipvgo = db.dbRead(ns, "ipvgo2")
            ns.printf("=== IPvGO(v2) ============================================")
            if (ipvgo) {
                ns.printf("Iterations: %i (%s s per iteration)", 
                    ipvgo.iterations, ns.formatNumber( ipvgo.avgTime / 1000 ))
                for(var impact of ipvgo.results) {
                    var desc = impact.description
                    if (desc == "strength, defense, dexterity, and agility levels")
                        desc = "combat stats"
                    if (desc == "faster hack(), grow(), and weaken()")
                        desc = "faster HGW"
                    ns.printf(" => [%s]: %s %s",
                        impact.opponent,
                        ns.formatPercent(impact.percent, 2),
                        desc)
                }
            }
        }

        var lineCount = 22
        if(ns.scriptRunning("pservs.js", "home")) {
            ns.printf("=== Purchased Server Log: [running] ============================")
            var lines = db.dbLogFetch(ns, "pserv", 5)
            for(var l of lines)
                ns.print(l)
        } else {
            lineCount = 30
        }


        lines = db.dbLogFetch(ns, "start", lineCount)
        ns.printf("=== Startup Log: ============================================")
        for(var l of lines)
            ns.print(l)

    }

}