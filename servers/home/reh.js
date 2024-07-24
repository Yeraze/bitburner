import * as CONST from "reh-constants.js"

/** @param {NS} ns */
export function execContinue(ns, script, host, ...cmdArgs) {
  if (ns.scriptRunning(script, host) == false) {
    ns.tprintf("Launching [%s]:%s...", host, script)
    ns.exec(script, host, ...cmdArgs)
  }
}
/** @param {NS} ns */
export function rehprintf(ns, format, ...printvars) {
  ns.tprintf(format, ...printvars)
  ns.printf(format, ...printvars)

  var msg = ns.sprintf(format, ...printvars)
  ns.toast(msg, "info")
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
      ns.printf("-> LAUNCH FAILED")
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
      ns.printf("-> LAUNCH FAILED")
      return
    }
    while (ns.isRunning(pid, host)) {
      await ns.sleep(500)
    }
    ns.printf("Finished %s on %s", scripts[0], host)
  } else {
    ns.printf("Cannot find RAM for %s", scripts[0])
  }
}

/** @param {NS} ns */
export async function execAndWait(ns, script, host, ...cmdArgs) {
  ns.tprintf("Launching [%s]:%s and waiting...", host, script)
  var pid= ns.exec(script, host, ...cmdArgs)
  if(pid == 0) {
    ns.tprintf("-> LAUNCH FAILED")
    return
  }
  while (ns.isRunning(pid, host)) {
    await ns.sleep(500)
  }
  ns.tprintf("-> [%s]:%s Finished...", host, script)
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

