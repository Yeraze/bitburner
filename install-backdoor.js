/** @param {NS} ns */
export async function main(ns) {
  ns.tail()
  await ns.singularity.installBackdoor();
}