/** @param {NS} ns */
import * as db from 'database.js'
import {getConfig} from 'reh.js'
export async function main(ns) {
  ns.disableLog('ALL')

  if(ns.args.length === 0) {
    ns.tprint('Usage: conf.js <set|get> <prop> ?value?')
    return
  }
  var record = db.dbRead(ns, "config")
  if (record === null) {
    record = {}
  }

  var op = ns.args[0]
  var prop = ns.args[1]
  switch (op) {
      case 'set':
        var value = ns.args[2]
        if (value === undefined) {
          ns.tprint('Usage: conf.js set <prop> <value>')
          return
        }
        record[prop] = value
        break
      case 'get':
        ns.tprintf("[%s] = %s", prop, getConfig(ns, prop, "<UNSET>")) 
        return
      default:
        ns.tprint('Invalid operation')
        return
  }

  db.dbWrite(ns, "config", record)
}
