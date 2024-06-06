import winston, { format, transports } from "winston";
import * as fs from "fs";
import * as path from "path";

export class AcronixLogger extends winston.Logger {
	static logDir = "logs";

	static getSafePath(name: string) {
		return path.join(AcronixLogger.logDir, name);
	}

	static genLogDir() {
		if (!fs.existsSync(AcronixLogger.logDir)) {
			fs.mkdirSync(AcronixLogger.logDir);

			// Pfad für die .gitignore-Datei erstellen
			const gitignorePath = path.join(AcronixLogger.logDir, '.gitignore');

			// Inhalt der .gitignore-Datei
			const gitignoreContent = '*.log';

			// .gitignore-Datei schreiben
			fs.writeFileSync(gitignorePath, gitignoreContent);
		}
	}

	static defaultConsole: transports.ConsoleTransportInstance = new transports.Console({
		handleExceptions: true,
		handleRejections: true,
		format: format.combine(
			format.colorize({ all: true }),
			format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
			format.printf(({ level, message, timestamp }) => {
				return `[${timestamp}] ${level} :: ${message}`;
			}),
		),
	});

	/**
	 ** Default Logger
	 */
	// static defaultLogStream = fs.createWriteStream(AcronixLogger.getSafePath("default.log"), { flags: "a" });
	// static defaultStreamLog = new transports.File({
	// 	stream: AcronixLogger.defaultLogStream,
	// 	format: format.combine(
	// 		format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	// 		format.printf(({ level, message, timestamp }) => {
	// 			return `[${timestamp}] ${level} :: ${message}`;
	// 		}),
	// 	),
	// });

	/**
	 ** Error Logger
	 */
	static errorLogStream = fs.createWriteStream(AcronixLogger.getSafePath("error.log"), { flags: "a" });
	static errorStreamLog = new transports.Stream({
		stream: AcronixLogger.errorLogStream,
		level: "error",
		handleExceptions: true,
		handleRejections: true,
		format: format.combine(
			format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
			format.printf(({ level, message, timestamp }) => {
				return `[${timestamp}] ${level} :: ${message}`;
			}),
		),
	});

	/**
	 ** Rejection / Exception Handler
	 */
	//static rejExcStream = fs.createWriteStream(AcronixLogger.getSafePath("rejectionExceptions.log"), { flags: "a" });
	//static rejectionExceptionHandlerStream: transports.StreamTransportInstance = new transports.Stream({
	//	stream: AcronixLogger.rejExcStream,
	//	format: format.combine(
	//		format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	//		format.printf(({ level, message, timestamp }) => {
	//			return `[${timestamp}] ${level} :: ${message}`;
	//		}),
	//	),
	//});

	constructor() {
		super({
			exitOnError: false,
			transports: [
				AcronixLogger.defaultConsole,
				new transports.Stream({
					stream: AcronixLogger.errorLogStream,
					level: 'error',
					handleExceptions: true,
					handleRejections: true,
					format: format.combine(
						format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
						format.printf(({ level, message, timestamp }) => {
							return `[${timestamp}] ${level} :: ${message}`;
						}),
					),
				})
			],
		});
	}

	$error(msg: string | object) {
		this.log({
			level: "error",
			//@ts-ignore
			message: msg,
		});
	}

	$info(msg: string | object) {
		this.log({
			level: "info",
			message: typeof msg === "object" ? JSON.stringify(msg) : msg,
		});
	}
}
