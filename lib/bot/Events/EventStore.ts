import { ClientEvents, Collection } from "discord.js";
import * as globPkg from "glob";

import Event from "./Event.js";
import * as path from "path";
import { log } from "../../../src/main.js";
import { pathToFileURL } from "url";
import { CustomClient } from "../CustomClient.js";

const { glob } = globPkg;
/**
 * `/dist/src/${dirName}/*.js`
 */
type safeDirectory = `/${string}/*.js`;

export interface EventStoreOptions {
    safeDirectory: safeDirectory;
}

export default class EventStore {
    private options: EventStoreOptions;
    constructor(options: EventStoreOptions) {
        this.options = options;
    }

    public get getOptions() {
        return this.options;
    }

    public async LoadEvents() {
        const files = (await glob(`dist/src/Events/*.js`)).map(filePath => path.resolve(filePath));

        const events = new Collection<string, Event<keyof ClientEvents>>();

        await Promise.all(files.map(async (file: string) => {
            const event: Event<keyof ClientEvents> = new (await import(`${pathToFileURL(file).href}`)).default;

            if (!event.name) {
                log.$info(`Could not load command: ${file} does not have a name`);
            } else {
                events.set(event.name, event)
            }
        }));

        return events;
    }
}