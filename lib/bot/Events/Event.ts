import { Awaitable, ClientEvents, Guild, NonThreadGuildBasedChannel, } from "discord.js";

interface EventOptions<Event extends keyof ClientEvents> {
    name: Event,
    once: boolean
}

export default abstract class Event<Event extends keyof ClientEvents> {
    name: Event;
    once: boolean
    constructor(options: EventOptions<Event>) {
        this.name = options.name;
        this.once = this.once;
    }

    abstract execute(...args: ClientEvents[Event]): Awaitable<void>;
}

class TestEventWithOneParameters extends Event<'channelCreate'> {
    constructor() {
        super({
            name: 'channelCreate',
            once: false,
        });
    }

    execute(channel: NonThreadGuildBasedChannel): Awaitable<void> {

    }
}

class TestEventWithTwoParameters extends Event<'guildUpdate'> {
    constructor() {
        super({
            name: 'guildUpdate',
            once: false,
        });
    }

    execute(oldGuild: Guild, newGuild: Guild): Awaitable<void> {

    }
}