/** @param {NS} ns */
export function dbWrite(ns, table, object) {
    var filename = `db/${table}.txt`
    ns.write(filename, JSON.stringify(object), "w")
}

/** @param {NS} ns */
export function dbRead(ns, table) {
    var filename = `db/${table}.txt`
    if (ns.fileExists(filename, "home"))
        return JSON.parse(ns.read(filename)) 
    else    
        return []
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
export function dbLog(ns, table, line) {
    var filename = `db/log_${table}.txt`
    var logline = ns.sprintf("[%s] %s",
        formatTime(ns, ns.getTimeSinceLastAug()), line)
    var lines = dbRead(ns, `log_${table}`)

    lines.unshift(logline)
    if (lines.length > 10) 
        lines = lines.slice(0, 10)

    ns.write(filename, JSON.stringify(lines), "w")
}

/** @param {NS} ns */
export function dbLogFetch(ns, table, count) {
    var filename = `db/log_${table}.txt`
    var lines = []
    if (ns.fileExists(filename, "home")) 
        lines = dbRead(ns, `log_${table}`)
   
    while(lines.length < count)
        lines.push([])

    return lines.slice(0,count)
}