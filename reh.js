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