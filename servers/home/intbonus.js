/** @param {NS} ns */
export async function main(ns) {
ns.clearLog()
ns.tail()
let player = ns.getPlayer();
let sleeve = ns.sleeve.getSleeve(0).skills.intelligence
//player.skills.intelligence = 2383
//sleeve = 176
ns.print("Player Int: " +player.skills.intelligence)
ns.print("Sleeve Int: " +sleeve)
ns.print(" ")
ns.print("Player Bonuses ")
ns.print("Grafting Time Bonus:        "+ns.formatNumber((1 + (calculateIntelligenceBonus(player.skills.intelligence, 3) - 1) / 3)) +"x")
ns.print("Crime Success Bonus:        "+ns.formatNumber(calculateIntelligenceBonus(player.skills.intelligence, 1))+"x")
ns.print("Faction Rep Gain Bonus:     "+ns.formatNumber(calculateIntelligenceBonus(player.skills.intelligence, 1))+"x")
ns.print("Share Thread Bonus:         "+ns.formatNumber(calculateIntelligenceBonus(player.skills.intelligence, 2))+"x")
ns.print("Hacking Time Bonus:         "+ns.formatNumber(calculateIntelligenceBonus(player.skills.intelligence, 1))+"x")
ns.print("Hacking Chance Bonus:       "+ns.formatNumber(calculateIntelligenceBonus(player.skills.intelligence, 1))+"x")
ns.print("Company Rep Extra Amount:   "+ns.formatNumber(player.skills.intelligence/975))
ns.print("Program Creation Boost:     "+ns.formatNumber(calculateIntelligenceBonus(player.skills.intelligence, 3))+"x")
ns.print("BB Success Chance:          "+ns.formatNumber(calculateIntelligenceBonus(player.skills.intelligence, 0.75))+"x")
ns.print(" ")
ns.print("Sleeve Bonuses ")
ns.print("Sleeve Passive Shock Bonus: "+ns.formatNumber(calculateIntelligenceBonus(sleeve, 0.75))+"x")
ns.print("Sleeve Active Shock Bonus:  "+ns.formatNumber(calculateIntelligenceBonus(sleeve, 0.75))+"x")
ns.print("Sleeve Sync Bonus:          "+ns.formatNumber(calculateIntelligenceBonus(sleeve, 0.5))+"x")
}

export function calculateIntelligenceBonus(intelligence,weight) {
  return 1 + (weight * Math.pow(intelligence, 0.8)) / 600;
}
