const Discord = require('discord.js');
const { prefix, token, GiphyToken } = require('./config.json');
const ytdl = require('ytdl-core');

const client = new Discord.Client();

var GphApiClient = require('giphy-js-sdk-core')
giphy = GphApiClient(GiphyToken)

const queue = new Map();

client.once('ready', () => {
	console.log('Ready!');
});

client.once('reconnecting', () => {
	console.log('Reconnecting!');
});

client.once('disconnect', () => {
	console.log('Disconnect!');
});

	client.on('message', async message => {
		if (message.author.bot) return;
		if (!message.content.startsWith(prefix)) return;

		const serverQueue = queue.get(message.guild.id);

		if (message.content.startsWith(`${prefix}play`)) {
			execute(message, serverQueue);
			return;
		} else if (message.content.startsWith(`${prefix}skip`)) {
			skip(message, serverQueue);
			return;
		} else if (message.content.startsWith(`${prefix}stop`)) {
			stop(message, serverQueue);
			return;
		} else {
		}
	});

	async function execute(message, serverQueue) {
		const args = message.content.split(' ');

		const voiceChannel = message.member.voiceChannel;
		if (!voiceChannel) return message.channel.send('You need to be in a voice channel to play music!');
		const permissions = voiceChannel.permissionsFor(message.client.user);
		if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
			return message.channel.send('I need the permissions to join and speak in your voice channel!');
		}

		const songInfo = await ytdl.getInfo(args[1]);
		const song = {
			title: songInfo.title,
			url: songInfo.video_url,
		};

		if (!serverQueue) {
			const queueContruct = {
				textChannel: message.channel,
				voiceChannel: voiceChannel,
				connection: null,
				songs: [],
				volume: 5,
				playing: true,
			};

			queue.set(message.guild.id, queueContruct);

			queueContruct.songs.push(song);

			try {
				var connection = await voiceChannel.join();
				queueContruct.connection = connection;
				play(message.guild, queueContruct.songs[0]);
			} catch (err) {
				console.log(err);
				queue.delete(message.guild.id);
				return message.channel.send(err);
			}
		} else {
			serverQueue.songs.push(song);
			console.log(serverQueue.songs);
			return message.channel.send(`${song.title} has been added to the queue!`);
		}

	}

	function skip(message, serverQueue) {
		if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');
		if (!serverQueue) return message.channel.send('There is no song that I could skip!');
		serverQueue.connection.dispatcher.end();
	}

	function stop(message, serverQueue) {
		if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end();
	}

	function play(guild, song) {
		const serverQueue = queue.get(guild.id);

		if (!song) {
			serverQueue.voiceChannel.leave();
			queue.delete(guild.id);
			return;
		}

		const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
			.on('end', () => {
				console.log('Music ended!');
				serverQueue.songs.shift();
				play(guild, serverQueue.songs[0]);
			})
			.on('error', error => {
				console.error(error);
			});
		dispatcher.setVolumeLogarithmic(serverQueue.volume / 15);
	}

	
		//Simple mention
		
	client.on('message', message => {
		if (message.content === '<@592995724875268097>') {
			message.channel.send('Kann ich dir helfen? :innocent:')
		}
		else if (message.content === '<@592995724875268097> bist du single ?') {
			message.channel.send('Tut mir Leid ich gehöre zu <@!266487686011813888> und <@!385922322181128192>')
		}
		else if(message.content === '<@592995724875268097> Love you') {
		message.channel.send("Hab dich auch lieb :heart:")
		}
	})
	
	client.on('message', message => {
	if (message.content.startsWith(`${prefix}help`)) {
		message.channel.send('**Help**')
		message.channel.send('--------------------------------------------\n//**play** YoutubeURL ->> to play a Song from Youtube \n//**stop** ->> to tell me I should leave you alone :frowning:\n//gif ->> searches you a Gif\n--------------------------------------------')
	})
	//if (message.content.startsWith(`${prefix}gif`)) {
		//giphy.random('gifs')
			//.then((response) => {
				//var totalResponses = response.data.length;
				//var responseIndex = Math.floor((Math.random() * 10) +1 ) % totalResponses;
				//var responseFinal = response.data[responseIndex];

				//message.channel.send({
					//files: [responseFinal.images.fixed_height.url]
				//})
			//})
	//}

client.login(token);