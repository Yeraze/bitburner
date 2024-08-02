/** @param {NS} ns */
export async function main(ns) {
    ns.rm("extend.txt", "home")
    ns.singularity.softReset("start.js")
}