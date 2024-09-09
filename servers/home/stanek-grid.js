/** @param {NS} ns */
export async function main(ns) {
    ns.clearLog()
    const constSize = 9
    const sfLvl = ns.getResetInfo().ownedSF.get(13)
    let prevW = 0
    let prevH = 0
    for (let x = 1; x < 1000; x++) {
        const bnSizeMult = ns.getBitNodeMultipliers(12, x).StaneksGiftExtraSize
        const baseSize = constSize + bnSizeMult + sfLvl
        let width = Math.max(2, Math.min(Math.floor(baseSize / 2 + 1), 25))
        let height = Math.max(3, Math.min(Math.floor(baseSize / 2 + 0.6), 25))
        if (prevH != height || prevW != width) {
            ns.print("BN Level: " + x + " Height: " + height + " Width: " + width)
            prevW = width
            prevH = height
        }
    }

}
