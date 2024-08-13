/** @param {NS} ns */
export async function main(ns) {
    var counter = 0
    while(ns.hacknet.spendHashes("Sell for Money")) {
        counter++
    }
    ns.tprintf("%i conversions", counter)
}