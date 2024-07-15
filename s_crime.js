/** @param {NS} ns */

function findBestCrime(ns) {
  const crimes = ["Shoplift",
                  "Rob Store", 
                  "Mug", 
                  "Larceny",
                  "Deal Drugs",
                  "Bond Forgery",
                  "Traffick Arms",
                  "Homicide",
                  "Grand Theft Auto",
                  "Kidnap",
                  "Assassination",
                  "Heist"]
  var maxRatio = 0
  var bestCrime = ""
  for(const C of crimes) {
    var chance = ns.singularity.getCrimeChance(C)
    var length = ns.singularity.getCrimeStats(C).time
    var cash = ns.singularity.getCrimeStats(C).money

    var ratio = ( cash / length) * chance
  //  ns.tprintf("%s : $%.2f / sec", C, ratio)
    if (ratio > maxRatio) {
      maxRatio = ratio
      bestCrime = C
    }
  }
  return bestCrime
}

export async function main(ns) {
  const crimes = ["Shoplift",
                  "Rob Store", 
                  "Mug", 
                  "Larceny",
                  "Deal Drugs",
                  "Bond Forgery",
                  "Traffick Arms",
                  "Homicide",
                  "Grand Theft Auto",
                  "Kidnap",
                  "Assassination",
                  "Heist"]
  var crime = ""
  var loop = false
  if (ns.args.length > 0) {
    if (crimes.indexOf(ns.args[0]) != -1) {
      crime = ns.args[0]
    }
    if (ns.args.indexOf("--loop") != -1) {
      loop = true
    }
  }
    // Try to autodetermine what crime to start..
  if (loop) {
    while(true) {
      var newCrime = findBestCrime(ns)
      if (newCrime != crime) {
        crime = newCrime
        ns.singularity.commitCrime(crime)
      }
      await ns.sleep(60 * 1000);
    }
  } else {
    if(crime == "") {
      crime = findBestCrime(ns)
    }
    ns.singularity.commitCrime(bestCrime)
  }
}