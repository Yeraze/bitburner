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
