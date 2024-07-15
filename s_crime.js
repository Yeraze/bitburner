/** @param {NS} ns */
export async function main(ns) {
  const crime = ns.args[0]
  ns.singularity.commitCrime(crime)
}