/** @param {NS} ns */
export async function main(ns) {
  const target= ns.args[0]
  ns.scp("loop_hack.js", target)
  ns.scp("loop_grow.js", target)
  ns.scp("loop_weaken.js", target)

  ns.killall(target);
  const ram = ns.getServerMaxRam(target) - 2;
  
  // Each of these scripts takes 2G Ram
  // So mark 2G used for hacking
  // Then 25% of what's leftover for weakening, and
  // the rest for growing
  ns.exec("loop_hack.js", target);
  ns.exec("loop_weaken.js", target, Math.round((ram / 2) * 0.25))
  ns.exec("loop_grow.js", target, Math.floor((ram / 2) * 0.75))
}