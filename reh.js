import * as CONST from "reh-constants.js"

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
        if(ns.getServer(connected).purchasedByPlayer) 
          continue
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

