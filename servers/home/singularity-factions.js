import {rehprintf} from 'reh.js'
/** @param {NS} ns */
export async function main(ns) {
  // Check for travel reqs
  if (ns.getServerMoneyAvailable("home") > 200000) {
    var factionOrder = [{faction: "Cybersec", location: ""},
                        {faction: "Nitesec",  location: ""}, 
                        {faction: "The Black Hand", location: ""},
                        {faction: "Aevum", location: "Aevum"},
                        {faction: "Tian Di Hui", location: "Chongqing"},
                        {faction: "BitRunners", location: ""},
                        {faction: "Daedalus", location:""}
                        ]
    
    var currentFactions = ns.getPlayer().factions.concat(
        ns.singularity.checkFactionInvitations())
    
    for(var faction of factionOrder) {
      if(currentFactions.indexOf(faction.faction) == -1) {
        if(faction.location != "") {
          if (ns.getPlayer().city != faction.location) {
            rehprintf(ns, "Traveling to %s, looking for %s", faction.location,
              faction.faction)
            ns.singularity.travelToCity(faction.location)
            return
          }
        }
      }
    }
  }  
}