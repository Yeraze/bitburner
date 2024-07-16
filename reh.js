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