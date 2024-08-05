import {doCommand, rehprintf} from 'reh.js'
import * as db from 'database.js'
/** @param {NS} ns */
export async function main(ns) {
  // Check for travel reqs
  if (ns.getServerMoneyAvailable("home") > 200000) {
    // This is a map of the factions we care about, and the location 
    // we have to travel to for eligibility
    // The list is ordered by priority
    var factionOrder = [{faction: "Cybersec", location: ""},
                        {faction: "Nitesec",  location: ""}, 
                        {faction: "The Black Hand", location: ""},
                        {faction: "Aevum", location: "Aevum"},
                        {faction: "Tian Di Hui", location: "Chongqing"},
                        {faction: "New Tokyo", location:"New Tokyo"},
                        {faction: "BitRunners", location: ""},
                        {faction: "Daedalus", location:""}
                        ]
    // get the list of all factions we know of: Joined and Pending
    var currentFactions = ns.getPlayer().factions.concat(
        ns.singularity.checkFactionInvitations())
    
    for(var faction of factionOrder) {
      // Search every faction in the list..
      //  If the faction has not already invited us,
      //  and there is a city specified, then travel there.
      // We exit on the first one found.
      if(currentFactions.indexOf(faction.faction) == -1) {
        if(faction.location != "") {
          if (ns.getPlayer().city != faction.location) {
            if (await doCommand(ns, `ns.singularity.travelToCity("${faction.location}")`))  {
              rehprintf(ns, "Traveling to %s, looking for %s", faction.location,
                faction.faction)
              db.dbLogf(ns, "Traveling to %s",faction.location)
              return
            }
          } else if (!currentFactions.includes(faction.faction)) {
            ns.printf("Waiting, haven't received invitation from %s yet", faction.faction)
            return
          }
        }
      }
    }
  }  
}