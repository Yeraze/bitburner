export function autocomplete(data, args) {
    return [...data.servers]; // This script autocompletes the list of servers.
}
/** @param {NS} ns */
export async function main(ns) {
  const target= ns.args[0]
  ns.scp("loop_hack.js", target)
  ns.scp("loop_grow.js", target)
  ns.scp("loop_weaken.js", target)

  var ram = ns.getServerMaxRam(target) - 2.1;
  var tWeaken = Math.max(1, Math.floor((ram / 2) * 0.25))
  ram = ram - (tWeaken * 2)
  if ((ram <= 2) && (ns.args.length == 1)) {
    ns.printf("I can't do this, not enough ram!")
  } else {
    var tGrow = Math.max(1, Math.floor((ram / 2)))
    ns.killall(target)
    if (ns.args.length > 1) {
      // Since we specified a ram number, we want to assume
      // we're doing a cross-system hack
      ns.tail()
      ns.printf("-> RAM override of %i G", ns.args[1])
      ram = ns.args[1]
      ns.exec("loop_hack.js",   "home", Math.max(1,Math.floor((ram / 2) * 0.5)), target);
      ns.exec("loop_weaken.js", "home", Math.max(1, Math.floor((ram / 2) * 0.10)), target)
      ns.exec("loop_grow.js",   "home", Math.floor((ram / 2) * 0.85), target)
    } else {
      // Each of these scripts takes 2G Ram
      // So mark 2G used for hacking
      // Then 25% of what's leftover for weakening, and
      // the rest for growing
      ns.killall(target);
      ns.exec("loop_hack.js", target);
      ns.exec("loop_weaken.js", target, tWeaken)
      ns.exec("loop_grow.js", target, tGrow)
    }
  }
  
}