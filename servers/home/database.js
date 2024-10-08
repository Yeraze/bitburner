import {pushover}  from 'pushover.js'
/** @param {NS} ns */
export function setConfig(ns, prop, value) {
  var record = dbRead(ns, "config")
  if (record === null) {
    record = {}
  }
  record[prop] = value
  dbWrite(ns, "config", record)
}

/** @param {NS} ns */
export function getConfig(ns, prop, defaultValue) {
  var record = dbRead(ns, "config")
  if(record != null) {
    if (record.hasOwnProperty(prop)) {
      return record[prop]
    }
  }
  return defaultValue
}

/** @param {NS} ns */
export function dbWrite(ns, table, object, root = "db") {
    var filename = `${root}/${table}.txt`
    ns.write(filename, JSON.stringify(object), "w")
}

/** @param {NS} ns */
export function dbRead(ns, table, root = "db") {
    var filename = `${root}/${table}.txt`
    if (ns.fileExists(filename, "home"))
        try {
            return JSON.parse(ns.read(filename))            
        } catch (error) {
            // ns.printf(`ERROR: ${table} corrupted`)
            return null
        }
    else    
        return null
}

export function formatTime(ns, time) {
    var seconds = Math.floor(time / 1000) 
    var ms = time % 1000
    var min = Math.floor(seconds / 60) 
    var hours = Math.floor(min / 60)
    return ns.sprintf("%i:%02i:%02i.%03i", hours,
        min % 60, seconds % 60,ms)

}

/** @param {NS} ns */
export function dbLogf(ns, format, ...args) {
    dbLog(ns, "start", ns.sprintf(format, ...args))
}

export async function dbGlobalLogf(ns, format, ...args) {
  var msgLine = ns.sprintf(format, ...args)
  var logLine = ns.sprintf("[HL:%i] [%s] [%s] %s\n",
        ns.getPlayer().skills.hacking,
        formatTime(ns, Date.now() - ns.getResetInfo().lastNodeReset),
        formatTime(ns, Date.now() - ns.getResetInfo().lastAugReset),
         msgLine)
  ns.write("runlog.txt", logLine, "a")
  if(getConfig(ns, "pushover", false) == true)
    await pushover(logLine)
}


/** @param {NS} ns */
export function dbLog(ns, table, line) {
    var filename = `db/log_${table}.txt`
    var logline = ns.sprintf("[%s] %s",
        formatTime(ns, Date.now() - ns.getResetInfo().lastAugReset), line)
    var lines = dbRead(ns, `log_${table}`)
    if (lines == null)
        lines = []
    lines.unshift(logline)
    if (lines.length > 100) 
        lines = lines.slice(0, 100)

    ns.write(filename, JSON.stringify(lines), "w")
}

/** @param {NS} ns */
export function dbLogFetch(ns, table, count) {
    var filename = `db/log_${table}.txt`
    var lines = []
    if (ns.fileExists(filename, "home")) 
        lines = dbRead(ns, `log_${table}`)
    if(lines == null) 
        lines = []
    
    while(lines.length < count)
        lines.push([])

    return lines.slice(0,count)
}
