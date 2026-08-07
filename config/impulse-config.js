module.exports = function(Config) {
	Config.serverid = 'impulse';
	Config.servertoken = 'd0tACZb+OWNU';
	Config.rawgApiKey = '';
	Config.reportbattles = false;
	Config.noipchecks = true;
	Config.consoleips = ['127.0.0.1', 'musaddiktemkar', 'princesky'];

	const adminIndex = Config.grouplist.findIndex(g => g.symbol === '~');
	if (adminIndex !== -1) {
		Config.grouplist.splice(adminIndex + 1, 0, {
			symbol: '&',
			id: "leader",
			name: "Leader",
			inherit: '@',
			jurisdiction: 'u',
			globalonly: true,
			bypassall: true,
			lockdown: true,
			promote: '~u',
			roomowner: true,
			roombot: true,
			roommod: true,
			roomdriver: true,
			forcewin: true,
			declare: true,
			addhtml: true,
			rangeban: true,
			makeroom: true,
			editroom: true,
			editprivacy: true,
			potd: true,
			disableladder: true,
			gdeclare: true,
			gamemanagement: true,
			exportinputlog: true,
			tournaments: true,
		});
	}
};
