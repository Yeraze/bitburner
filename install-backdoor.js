/** @param {NS} ns */
export async function main(ns) {
  var target = ns.args[0]
  // first build the connection graph
  var path = []
  path.push(target)
  var parent = target;
  while (parent != "home") {
    parent =ns.scan(parent)[0]
    path.push(parent)
  }
  for(const sys of path.reverse()) {
    ns.printf("Connecting to %s...", sys)
    ns.singularity.connect(sys)
  }
  ns.printf("Installing backdoor...")
  await ns.singularity.installBackdoor();
}