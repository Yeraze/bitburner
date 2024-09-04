import * as db from 'database.js'
/** @param {NS} ns */
export async function main(ns) {
  if(ns.stanek.acceptGift() == false) {
    ns.toast("Unable to accept Stanek's gift", "error")
    return
  }

  if(ns.args[0] == "--write") {
    var fragList = []
    for (const frag of ns.stanek.activeFragments()) {
      var record = {x: frag.x,
                    y: frag.y,
                    id: frag.id,
                    rotation: frag.rotation}
      fragList.push(record)
    }

    db.dbWrite(ns, 'stanek-fragments', fragList)
    ns.write("stanek-fragments.txt", ns.read("db/stanek-fragments.txt"), "w")
  } else if (ns.args[0] == "--load") {
    var fragList = db.dbRead(ns, "stanek-fragments")
    ns.stanek.clearGift()
    for(const frag of fragList) {
      if(ns.stanek.placeFragment(frag.x, frag.y, frag.rotation, frag.id) == false) {
        ns.tprintf("Error placing fragment at %i x %i", frag.x, frag.y)
      }
    }
  } else {
    ns.tprintf("Pass either --write or --load")
  }
  
}