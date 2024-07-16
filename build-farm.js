import {parsearg} from "reh.js"
/** @param {NS} ns */
export async function main(ns) {
  // How much RAM each purchased server will have. In this case, it'll
  // be 8GB.
  var ram = parsearg(ns, "--ram", 8);
  var limit = parsearg(ns, "--limit", ns.getPurchasedServerLimit())
  
  // Continuously try to purchase servers until we've reached the maximum
  // amount of servers

  ns.tprintf("Preparing to buy %i servers : %iGB Ram", 
    limit, ram)
  while (ns.getPurchasedServers().length < limit) {
      // Check if we have enough money to purchase a server
      if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
          // If we have enough money, then:
          //  1. Purchase the server
          //  2. Copy our hacking script onto the newly-purchased server
          //  3. Run our hacking script on the newly-purchased server with 3 threads
          //  4. Increment our iterator to indicate that we've bought a new server
          var hostname = ns.purchaseServer(
                "pserv-" + ns.getPurchasedServers().length, ram);
      } else {
        await ns.sleep(30 * 1000);
      }

  }
}