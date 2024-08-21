/** @param {NS} ns */
import * as db from 'database.js'
import {parsearg} from 'reh.js'
export async function main(ns) {
  ns.disableLog('ALL')

  var record = { opModel: parsearg(ns, "--opmodel", "roi")}

  db.dbWrite(ns, "opmodel", record)
}