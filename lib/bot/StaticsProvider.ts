import { ChatInputCommandInteraction } from "discord.js";
import StatisticsModel, { Key, mostUsedCommandObject } from "../../src/database/statistics";
import StatusModel from "../../src/database/status";
/*
 * command Run
 * most used commands
 *
 * avg Uptime
 *  -> use the already implemnted Uptime Logger
 *
 * cpu, memory load and usage, (network bandwidth)
 */

/*
 * - methode for interaction handeling -> count command
 * - return methodes
 *      - status
 *      - commandRun
 *      - system data
 */

export default class Statistics {
	constructor() { }

	async handleCommandInteraction(interaction: ChatInputCommandInteraction) {
		const { commandName } = interaction;

		let numArr = [0, 2, 4, 6, 8];

		await StatisticsModel.findOne({ key: Key }).then(async (db) => {
			if (!db)
				throw new Error(
					`cannot find StatisticsModel for command ${commandName} with key ${Key.split("").map((key, p) =>
						numArr.includes(p) ? key.replace(/./g, `*`) : key,
					)}`,
				);
			else {
				let getCommandInDB = db.mostUsedCommands.find((e) => e.commandName === commandName);
				let setCommandInDBData: mostUsedCommandObject = null;
				let newArray: mostUsedCommandObject[] = [];

				if (getCommandInDB === undefined) {
					setCommandInDBData = { commandName, runs: 1 };
					newArray.push(...db.mostUsedCommands, setCommandInDBData);
				} else {
					//TODO Check if this works!
					//FIXME Check if this works!
					setCommandInDBData = { commandName: getCommandInDB.commandName, runs: getCommandInDB.runs++ };
					newArray.push(...db.mostUsedCommands);
					newArray.fill(setCommandInDBData, db.mostUsedCommands.indexOf(getCommandInDB));
				}

				await StatisticsModel.findOneAndUpdate(
					{
						key: Key,
					},
					{
						$set: {
							commandRunAllTime: db.commandRunAllTime,
							mostUsedCommands: newArray,
						},
					},
				);
			}
		});
	}

	async statusData() { }

	async commandData() { }

	async systemData() { }
}
