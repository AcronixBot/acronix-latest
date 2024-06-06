import { Channel, GuildMember, PermissionFlagsBits, PermissionResolvable, PermissionsBitField } from "discord.js";

export async function testChannel(channel: Channel, perms: PermissionResolvable[], member: GuildMember) {
	try {
		let allPerms = true;

		let permArray: string[] = [];

		let ch = await channel.fetch(true);

		if (ch.isThread()) {
			for (const perm of perms) {
				if (ch.permissionsFor(member).has(perm)) {
					permArray.push(`\`✅ ${new PermissionsBitField(perm).toArray()}\``);
				} else {
					allPerms = false;
					permArray.push(`\`❌ ${new PermissionsBitField(perm).toArray()}\``);
				}
			}

			return {
				allPerms,
				permArray,
			};
		} else if (ch.isDMBased()) {
			allPerms = false;
			permArray.push(`\`Is Dm Channel\``);
			return {
				allPerms,
				permArray,
			};
		} else if (ch.isTextBased()) {
			for (const perm of perms) {
				if (ch.permissionsFor(member).has(perm)) {
					permArray.push(`\`✅ ${new PermissionsBitField(perm).toArray()}\``);
				} else {
					allPerms = false;
					permArray.push(`\`❌ ${new PermissionsBitField(perm).toArray()}\``);
				}
			}

			return {
				allPerms,
				permArray,
			};
		} else {
			allPerms = false;
			permArray.push(`\`Unknown Channel Type\``);
			return {
				allPerms,
				permArray,
			};
		}
	} catch (e) {
		let allPerms = false;

		let permArray = [];
		for (const key of perms) {
			permArray.push(`\`❌ ${new PermissionsBitField(key).toArray()}\``);
		}

		return {
			permArray,
			allPerms,
		};
	}
}
