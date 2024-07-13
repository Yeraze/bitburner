/** @param {NS} ns */
export async function main(ns) {
  var target = ns.getHostname()
  if (ns.args.length > 0)
    target= ns.args[0]
  const ramOfHack = 2.5;
  if (ns.fileExists("BruteSSH.exe", "home")) {
      ns.brutessh(target);
  }
  if (ns.fileExists("FTPCrack.exe", "home")) {
      ns.ftpcrack(target);
  }
  if (ns.fileExists("relaySMTP.exe", "home")) {
      ns.relaysmtp(target)
  }
  if (ns.fileExists("HTTPWorm.exe", "home")) {
      ns.httpworm(target)
  }
  if (ns.fileExists("SQLInject.exe", "home")) {
      ns.sqlinject(target)
  }
  ns.nuke(target);
  if (ns.args.length >1) {
    if (ns.args[1] == "backdoor") {
      ns.scp("install-backdoor.js", target)
      ns.exec("install-backdoor.js", target)
    }
  }
}