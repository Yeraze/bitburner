/** @param {NS} ns */
export async function main(ns) {
  const prog = ns.args[0]
  ns.singularity.createProgram(prog)

}