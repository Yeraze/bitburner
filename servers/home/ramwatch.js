/** @param {NS} ns */
import {table} from 'reh.js'

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog('ALL')    
    ns.tail()

    var fileList = []
    for(var file of ns.ls("home", ".js")) {
        var record = {file: file,
                      size : ns.getScriptRam(file)}

        fileList.push(record)
    }
    fileList.sort( (A,B) => (A.size - B.size))
    var tData = []
    var tColor= []
    tData.push(["File", "Size"])
    tColor.push(["",""])
    for(var file of fileList.filter((A) => (! A.file.startsWith("tmp/")))) {
        var row = [file.file, ns.formatRam(file.size)]
        tData.push(row)
        tColor.push( ["", ""])
    }
    table(ns, tData, tColor)
}