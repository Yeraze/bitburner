import {execContinue, execAndWait, getServerList, doCommand} from 'reh.js'
import * as CONST from 'reh-constants.js'
import { getServers } from './batcher/utils'
import * as db from 'database.js'
/** @param {NS} ns */
export async function main(ns) {
  for(var file of ns.ls("home", "/db/")) 
    ns.clear(file)
  for(var file of ns.ls("home", "/tmp/"))
    ns.rm(file)


  db.dbLog(ns, "start", "Initial setup...")
  if(ns.getResetInfo().ownedSF.has(4))
    await doCommand(ns, `ns.singularity.commitCrime('Rob Store')`)
  execContinue(ns, "dashboard-2.js", "home", {temporary: true, threads:1})

  if(ns.getResetInfo().ownedSF.has(9))
    ns.exec("hacknet-servers.js", "home", {temporary:true, threads:1})


  if(ns.getResetInfo().ownedSF.has(13)) {
    if((Date.now() - ns.getResetInfo().lastAugReset) > 60*1000) {
      db.dbLogf(ns, "Bypassing Stanek bootstrap")
    } else {
      // Configure Stanek's gift
        // Reload the Fragment DB
      ns.write("db/stanek-fragments.txt", ns.read("stanek-fragments.txt"), "w")
      await execAndWait(ns, "stanek-bootstrap.js", "home", {temporary: true, threads:1}, "--load)")

      db.dbLogf(ns, "Initializing Stanek's gift")
      await execAndWait(ns, "singularity-stanek.js", "home", {temporary: true, threads:1}, "--cycles", 20)
    }
    ns.exec("singularity-stanek.js", "home", {temporary:true}, "--cycles", "5000", "--trickle")
  }

  if(ns.getResetInfo().currentNode == 9)
    execContinue(ns, "hacknet-servers.js", "home", {threads:1, temporary:true})
  else
    execContinue(ns, "pservs.js", "home", {threads:1, temporary:true})
  // These scripts area bit "fat",so make sure we have ram

  ns.spawn("basicstart.js", {threads: 1, spawnDelay: 0})
}
