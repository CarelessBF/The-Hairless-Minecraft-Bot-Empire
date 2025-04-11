//Create a prompt in Terminal to get new Server Connection Info (IP/PORT/Version/Etc)
let serverConnectLogs = [];

const getNewIp = () => {

	const readerIP = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	return new Promise((resolve) => {
		console.clear()
		console.log(`Current Inputs: [IP]:[PORT]`)
		readerIP.setPrompt("Please enter the Target Minecraft Server IP: \n");
		readerIP.prompt();
		readerIP.on("line", (ipInput) => {
			let ip = ipInput.trim();
			if (typeof Number(ip) === "number" && !isNaN(Number(ip)) || ip === "localhost") {
				//process.env.HOST = ip
				serverConnectLogs.push(`IP: ${ip}`)
				readerIP.close()
				console.clear()
				resolve(ip);
			}
			else {
				console.clear()
				console.log(`Current Inputs: [IP]:[PORT]`)
				readerIP.setPrompt("Your IP input must be a number or localhost! \n");
				readerIP.prompt();
			}
		})
	})
}

const getNewPort = () => {
	const readerPort = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	return new Promise((resolve) => {
		console.clear()
		console.log(`Current Inputs: ${serverConnectLogs[0]}:[PORT]`)
		readerPort.setPrompt("Please enter the Target Minecraft Server Port: \n");
		readerPort.prompt();
		readerPort.on("line", (portInput) => {
			let port = portInput.trim();
			if (typeof Number(port) === "number" && !isNaN(Number(port))) {
				//process.env.HOST = ip
				serverConnectLogs.push(`PORT: ${port}`)
				console.clear()
				readerPort.close()
				resolve(port);
			}
			else {
				console.clear()
				readerPort.setPrompt("Your PORT input must be a number! \n");
				console.log(`Current Inputs: ${serverConnectLogs[0]}:[PORT]`)
				readerPort.prompt();
			}
		})
	})
}

const getServerConnectionInfo = async () => {
	console.clear()
	let newIp = await getNewIp()
	let newPort = await getNewPort()
	//console.log(`New Server Info: ${newIp}:${newPort}`)
	return [newIp, newPort]
}

let connectIP, connectPort = await getServerConnectionInfo()
addMainLog(`Server Connection Info Collected: ${connectIP}:${connectPort}`)

function displayCurrBotsOnline() {
	console.log("Current Bots Online:")
	if (botNames.length == 0) {
		console.log("No Bots Online")
	}
	for(i = 0; i = botNames.length; i++) {
		console.log(`-` + botNames[i])
	}
}


function createBar(x) {
	x = Math.round(x);
	return [...new Array(x).fill('■'), ...new Array(20-x).fill('□')].join('');
}

let healthBar = createBar(0);
let foodBar = createBar(0);

function drawBarsSurvival() {
	console.log(color.red, `Health: ${healthBar}`);
	console.log(color.yellow, `Hunger: ${foodBar}`);
}

function displayConstructor() {
	console.clear();
	console.log(color.cyan + `Select a Bot to control!`);

	setInterval(displayCurrBotsOnline, 100)

	readerMain.question(`Select a Bot to control to begin...`, () => {
		readerMain.close();
	})


	if (bots.length > 0 /*&& bots[1].game && bots[1].game.gameMode === "survival"*/) {
		drawBarsSurvival()
	}

	for (line of log) {
		console.log(...line);
	}

	process.stdout.write(readerMain._prompt + readerMain.line);
}


//setInterval(displayConstructor, 100);
	

main()