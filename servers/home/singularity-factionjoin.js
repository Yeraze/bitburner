import {rehprintf} from 'reh.js'
/** @param {NS} ns */
export async function main(ns) {
    const faction = ns.args[0]
    ns.singularity.joinFaction(faction)
    ns.toast(ns.sprintf("Joined faction %s", faction), "success", null)
    // If we have the NMI we can background the hacking
    var focus = ns.singularity.getOwnedAugmentations(false).indexOf("Neuroreceptor Management Implant") == -1
    ns.singularity.workForFaction(faction, "hacking", focus)
}