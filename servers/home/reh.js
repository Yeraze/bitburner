import * as CONST from "reh-constants.js"
import * as db from 'database.js'
/** @param {NS} ns */
function writeCmdFile(ns, filename, command) {
  if (ns.fileExists(filename))
    ns.clear(filename)
  ns.printf("Executing '%s'", command)
  ns.write(filename, "export async function main(ns) {\n", "a")
  ns.write(filename, `  const port = ns.getPortHandle(ns.pid)\n`, "a")
  ns.write(filename, `  var result = ""\n`, "a")
  ns.write(filename, `  ns.atExit(() => { port.write(result) })\n`, "a")
  ns.write(filename, `  try {\n`, "a")
  ns.write(filename, `    result = ${command};\n`, "a")
  ns.write(filename, "  } catch (error) {\n", "a")
  ns.write(filename, "    result = []\n", "a")
  ns.write(filename, "  }\n", "a")
  ns.write(filename, "}", "a")
}

/** @param {NS} ns */
export async function doCommand(ns, command, reqthreads = 1) {
  var random = Math.floor(Math.random() * 100000000)
  var filename = `/tmp/${random}.js`

  writeCmdFile(ns, filename, command)

  var threads = 1
  if (reqthreads > 1)
    threads = reqthreads
  if (reqthreads < 1) {
      // Calculate ram
    var availRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home")
    threads = Math.floor( (availRam / ns.getScriptRam(filename) ) * reqthreads )
    if (threads < 1)
      threads = 1
  }

  var pid = ns.exec(filename, "home", {temporary: true, threads: threads})
  if(pid == 0) {
    ns.printf("Failed to launch %s", filename)
    return null
  }
  let port = ns.getPortHandle(pid)
  await port.nextWrite()

  let data = port.read()
  //await execAndWait(ns, filename, "home", {temporary: true, threads: 1})
  try {
    ns.printf("-> Returning %s", data)
    return JSON.parse(data)
  } catch {
    return null
  }
} 

/** @param {NS} ns */
export async function doMaxCommand(ns, command) {
  doCommand(ns, command, 0.975)
} 

/** @param {NS} ns */
export function execContinue(ns, script, host, ...cmdArgs) {
  if (ns.scriptRunning(script, host) == false) {
    ns.tprintf("Launching [%s]:%s...", host, script)
    ns.exec(script, host, ...cmdArgs)
  }
}
/** @param {NS} ns */
export function rehprintf(ns, format, ...printvars) {
  //ns.tprintf(format, ...printvars)
  ns.printf(format, ...printvars)
  db.dbLogf(ns, format, ...printvars)
  var msg = ns.sprintf(format, ...printvars)
  //ns.toast(msg, "info")
}

/** @param {NS} ns */
export async function execAnywhereNoWait(ns, scripts, threads, ...cmdArgs) {
  const reqRam = ns.getScriptRam(scripts[0])
  var candidateServers = getServerList(ns)
      .filter((S) => ns.hasRootAccess(S))
      .filter((S) => (ns.getServerMaxRam(S) - ns.getServerUsedRam(S) > reqRam))
  
  if (candidateServers.length > 0) {
    var host = candidateServers[0]
    // Always prefer home if it's in the list
    if(candidateServers.indexOf("home") > -1) 
      host = "home"
    ns.scp(scripts, host, "home")
    ns.printf("Launching %s on %s", scripts[0], host)
    var pid = ns.exec(scripts[0], host, threads, ...cmdArgs)
    if (pid == 0) {
      ns.printf("-> %s LAUNCH FAILED [%s on %s]", CONST.fgRed, scripts[0], host)
      return
    }
  } else {
    ns.printf("Cannot find RAM for %s", scripts[0])
  }
}

/** @param {NS} ns */
export async function execAnywhere(ns, scripts, threads, ...cmdArgs) {
  const reqRam = ns.getScriptRam(scripts[0])
  var candidateServers = getServerList(ns)
      .filter((S) => ns.hasRootAccess(S))
      .filter((S) => (ns.getServerMaxRam(S) - ns.getServerUsedRam(S) > reqRam))
  
  if (candidateServers.length > 0) {
    var host = candidateServers[0]
    // Always prefer home if it's in the list
    if(candidateServers.indexOf("home") > -1) 
      host = "home"
    ns.scp(scripts, host, "home")
    ns.printf("Launching %s on %s", scripts[0], host)
    var pid = ns.exec(scripts[0], host, threads, ...cmdArgs)
    if (pid == 0) {
      ns.printf("-> %s LAUNCH FAILED [%s on %s]", CONST.fgRed, scripts[0], host)
      return
    }
    while (ns.isRunning(pid, host)) {
      await ns.sleep(500)
    }
    ns.printf("Finished %s on %s", scripts[0], host)
  } else {
    ns.printf("-> %s Cannot find RAM for [%s]", CONST.fgRed, scripts[0])
  }
}

/** @param {NS} ns */
export async function execAndWait(ns, script, host, ...cmdArgs) {
  ns.printf("Launching [%s]:%s and waiting...", host, script)
  var pid= ns.exec(script, host, ...cmdArgs)
  if(pid == 0) {
    ns.printf("-> %s LAUNCH FAILED [%s on HOME]", CONST.fgRed, script)
    return
  }
  while (ns.isRunning(pid, host)) {
    await ns.sleep(100)
  }
  ns.printf("-> [%s]:%s Finished...", host, script)
}


/** @param {NS} ns */
export function getServerList(ns) {
  var serverList = ["home"]
  var newServerList = []
  var lastListLength = 0
  while(serverList.length != lastListLength) {
    lastListLength= serverList.length
    // For every server we know. find connected servers (scan)
    for(const server of serverList){
      let network = ns.scan(server)
      // For every connected server
      //. - See if we already know it
      //. - Seeif we already own it
      // If neither of these are true, remember it
      for(const connected of network){
        if(newServerList.indexOf(connected) == -1) {
          newServerList = newServerList.concat(connected)
        }
      }
    }    
    serverList= newServerList
  }

  return serverList;
}

/** @param {NS} ns */
export function getSortedServerList(ns) {
  var startingList = getServerList(ns)
  var levelList= []
  for (const S of startingList) {
    levelList.push( { name: S, level: ns.getServerRequiredHackingLevel(S) })
  }

  levelList.sort(((a, b) => (a.level - b.level)))
  var endingList = []
  for (const S of levelList) {
    endingList.push(S.name)
  }
  return endingList;
}

/** @param {NS} ns */
export function parsearg(ns, flag, default_value) {
  if (ns.args.indexOf(flag) == -1) {
    return default_value
  } else {
    return ns.args[ns.args.indexOf(flag)+1] 
  }
}

export function table(ns, data, colours) {
    let maxItemAmounts = data.map(arr => arr.length);
    let maxLength = Math.max(...maxItemAmounts);
    for (let i = 0; i < data.length; i++) {
        while (data[i].length < maxLength) {
            data[i].push("");
        }
    }

    const h = "─";
    const dt = "┬";
    const ut = "┴";
    const v = "│";
    const ld = "┐";
    const lu = "┘";
    const ur = "┌";
    const ud = "└";
    let maxes = [];
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            if (maxes.length <= j) maxes.push(0);
            maxes[j] = Math.max(maxes[j], data[i][j].length);
        }
    }
    let upString = ur;
    for (let max of maxes.slice(0,-1)) {
        upString += h.repeat(max);
        upString += dt;
    }
    upString += h.repeat(maxes[maxes.length - 1]);
    upString += ld;
    ns.print(upString);
    for (let i = 0; i < data.length; i++) {
        let column = v;
        for (let j = 0; j < data[i].length; j++) {
            let colour = colours[i % colours.length][j % colours[i % colours.length].length]; // fancy schmancy colour wrapping
            let string = colour + data[i][j] + CONST.reset;
            column += string;
            column += " ".repeat(maxes[j] - data[i][j].length);
            column += v;
        }
        ns.print(column);
    }
    let downString = ud;
    for (let max of maxes.slice(0,-1)) {
        downString += h.repeat(max);
        downString += ut;
    }
    downString += h.repeat(maxes[maxes.length - 1]);
    downString += lu;
    ns.print(downString);
}

/** @param {NS} ns */
export function qualifyAugment(ns, stats) {
  var maskHack = false
  var maskFaction = false
  var maskCompany = false
  var maskHacknet = false
  var maskCrime = false
  var maskBody = false
  var maskBladeburner = false
  var maskCharisma = false
  
  switch(ns.getResetInfo().currentNode) {
    case 2: // gangs
      maskFaction = true; maskHack = true; maskBody = true; maskCrime = true; break;
    case 3: // Corporations
      maskHack = true; maskCompany = true; break;
    case 4: // Singularity
      maskFaction = true; maskHack = true; break;
    case 5: // Intelligence
      maskFaction = true; maskHack = true; break;
    case 6: // Bladeburners
    case 7:
      maskFaction = true; maskHack = true; maskBladeburner = true; break;
    case 9: // Hacknet Server
      maskFaction = true; maskHack = true; maskHacknet = true; break;
    case 10: // Sleeves, need Body points to reach Covenant
      maskFaction = true; maskHack = true; maskBody = true; break;
    case 12: // Recursion
    case 11: // the big crash
    case 13: // Church of Staken
    case 8: // Wall Street
    case 1: // default
    default:
      maskFaction = true; maskHack = true; break;
  }
  var fHack = (stats.hacking != 1.0) || (stats.hacking_chance != 1.0) || 
              (stats.hacking_exp != 1.0) || (stats.hacking_grow != 1.0) ||
              (stats.hacking_money != 1.0) || (stats.hacking_speed != 1.0)
  var fFaction =  (stats.faction_rep != 1.0)
  var fCompany =  (stats.company_rep != 1.0) || (stats.work_money != 1.0)
  var fHacknet = (stats.hacknet_node_core_cost != 1.0) || (stats.hacknet_node_level_cost != 1.0) ||
              (stats.hacknet_node_money != 1.0) || (stats.hacknet_node_purchase_cost != 1.0) ||
              (stats.hacknet_node_ram_cost != 1.0)
  var fCrime = (stats.crime_money != 1.0) || (stats.crime_success != 1.0)
  var fBody = (stats.defense != 1.0) || (stats.defense_exp != 1.0) ||
              (stats.dexterity != 1.0) || (stats.dexterity_exp != 1.0) ||
              (stats.strength != 1.0) || (stats.strength_exp != 1.0) ||
              (stats.agility != 1.0) || (stats.agility_exp != 1.0)
  var fCharisma = (stats.charisma != 1.0) || (stats.charisma_exp != 1.0) 
  var fBladeburner = (stats.bladeburner_analysis != 1.0) ||
              (stats.bladeburner_max_stamina != 1.0) || (stats.bladeburner_stamina_gain != 1.0) ||
              (stats.bladeburner_success_chance != 1.0)
  
  return (maskHack && fHack) || (maskFaction && fFaction) ||
        (maskCompany && fCompany) || (maskHacknet && fHacknet) ||
        (maskCrime && fCrime) || (maskBody && fBody) ||
        (maskBladeburner && fBladeburner) || 
        (maskCharisma && fCharisma)
}