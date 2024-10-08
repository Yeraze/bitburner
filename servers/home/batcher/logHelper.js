/*
	This script is completely unchanged from the last part. As a note, if you find that saves are taking a very long time
	it may help to disable txt logging when you aren't actively debugging. The log files generated by this script
	are quite big even when it's erasing the data on each new instance.
*/

/** @param {NS} ns */
export async function main(ns) {

	const logFile = "/batcher/log.txt";
	ns.clear(logFile);  // Clear the previous log for each instance.
	ns.disableLog("ALL");
	ns.tail();
	ns.moveTail(200, 200);  // Move it out of the way so it doesn't cover up the controller.
	const logPort = ns.getPortHandle(ns.pid);
	logPort.clear();

	// Pretty simple. Just wait until something writes to the log and save the info.
	// Writes to its own console as well as a text file.
	let max = 0;
	let count = 0;
	let total = 0;
	let errors = 0;
	while (true) {
		await logPort.nextWrite();
		do {
			const data = logPort.read();
			// if (data > max) max = data;
			// if (data > 5) ++errors;
			// total += data;
			// ++count;
			// ns.clearLog();
			// ns.print(`Max desync: ${max}`);
			// ns.print(`Average desync: ${total / count}`);
			// ns.print(`Errors: ${errors}`);

			// if (data.startsWith("WARN")) ns.print(data);
			ns.print(data);
			// ns.write(logFile, data);  // Comment this line out to disable txt logging.
		} while (!logPort.empty());
	}
}