export function autocomplete(data, args) {
    return [...data.servers]; // This script autocompletes the list of servers.
}
/** @param {NS} ns */
export async function main(ns) {
  const target =ns.args[0];
  if(ns.serverExists(target)) {
    var path = []
    path = path.concat(target);
    parent = target;
    while (parent != "home") {
      parent =ns.scan(parent)[0]
      path = path.concat(parent);
    }
    var command = ""
    for(const sys of path.reverse()) {
      ns.tprintf("Connecting to %s..", sys)
      ns.singularity.connect(sys)
    }
  } else {
    ns.tprintf("Server %s is unknown", target)
  }
}