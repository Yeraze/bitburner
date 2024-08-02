/** @param {NS} ns */
export async function main(ns) {
    if(ns.fileExists("extend.txt","home")) {
        if(ns.args[0] != "--force") {
            ns.tprintf("Aborting reset, extend flag exists.")
            ns.tprintf(" override with --force")
            return
        }
    }
    ns.rm("extend.txt", "home")
    ns.singularity.softReset("start.js")
}