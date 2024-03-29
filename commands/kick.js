const discordDatabase = require(`${process.cwd()}/dbhandler`);

module.exports = {
	name: 'kick',
	description: 'kicks a member',
	args: true,
	usage: '<member>',
	guildOnly: true,
	adminOnly:true,
	permission: ['MANAGE_ROLES','MENTION_EVERYONE','KICK_MEMBERS'],
	cooldown: 5,
	async execute(message, args) {
		if(message.member.hasPermission('MANAGE_ROLES','MENTION_EVERYONE','KICK_MEMBERS')){
			if(message.mentions.members.size==0){
				return message.reply('Please mention at least one member. Thank You!').then(sentMessage => {
					sentMessage.delete({timeout:10000});
					message.delete({timeout:10000});
				}).catch()
			}
			const serverInfo = await discordDatabase.getServer(message.guild.id);
			memberMessage = [];
			let members = message.mentions.members;
			kickedMembers = [];
			notKickedMembers = [];
			members.each(async member=>{
					if((member.roles.highest.position<message.member.roles.highest.position||message.guild.ownerID===message.member.id)&&member.roles.highest.position<message.guild.me.roles.highest.position&&message.guild.ownerID!==member.id){
						kickedMembers.push(`${member.user.username}`);
						member.kick();
						if(serverInfo){
							if(serverInfo.keepMemberRole){
								await discordDatabase.removeGuildMemberRoles(JSON.parse(`{"user_id":"${member.id}","guild_id":"${message.guild.id}"}`));								
							}
						}
					}else{
						notKickedMembers.push(`${member.user.username}`);
				}
			})
			setTimeout(()=>{
				if(kickedMembers.length!=0){
					memberMessage.push(`${kickedMembers.length} members kicked`);
				}
				if(notKickedMembers.length!=0&&kickedMembers.length!=0){
					memberMessage.push(`and currently ${notKickedMembers.length} unkickable members`);
				}else if(notKickedMembers.length!=0){
					memberMessage.push(`currently ${notKickedMembers.length} unkickable members`);
				}
				message.reply(memberMessage.join(' ')+'.').then(sentMessage => {
					sentMessage.delete({timeout:5000});
					message.delete({timeout:5000});
				}).catch();
			},1000);
			
		}else{
			return message.reply('You do not have the necessary permissions').then(sentMessage => sentMessage.delete({timeout:10000})).catch()
		}
	}
}
