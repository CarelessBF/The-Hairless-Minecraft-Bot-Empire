const dotenv = require("dotenv").config();
const mineflayer = require("mineflayer");
const { goals, Movements, pathfinder } = require("mineflayer-pathfinder");
const mineflayerViewer = require("prismarine-viewer").mineflayer
const chalk = require("chalk");
const fs = require("fs");
const { app, BrowserWindow, ipcMain, protocol, nativeTheme } = require("electron")
const { exit } = require("process");
const url = require("url");
const path = require("path");
const trustedOperatorsArray = process.env.TRUSTED_OPERATORS;

//Create a container of all Bot instances
let bots = [];

let mainLog = [];

function addMainLog(text) {
	mainLog.push([text]);
};

//Create a list of current Bots' names for easy access
let botNames = [];

//Minecraft Bot template (class)
class MinecraftBot {

	//Constructing Information of the Bot, then begins to Initialize the Bot's Instance
	constructor(username) {

		//Parameters of Bot
		this.username = username;
		this.host = process.env.HOST;
		this.port = process.env.PORT;
		this.version = process.env.VERSION;
		this.trustedOperators = trustedOperatorsArray;
		this.botLogs = this.botLogs

		//Calls for Bot Instance Initialization
		this.initBot()
	}

	botLogs = []; 

	startTreeFarm() {
		let pos = this.bot.entity.position.clone()
		let targetBlocksList = ["minecraft:oak_logs"]
		let findTreeOptions = {matching: targetBlocksList, point: pos, maxDistance: 16}
		let treeCoords = this.bot.findBlocks(findTreeOptions)
		const RANGE_GOAL = 2 // get within this radius of the player
		const defaultMove = new Movements(this.bot)
		const target = treeCoords[0]
		if (!target) {
			this.bot.whisper("CarelessBF", "No more trees to chop!");
			return
		}
		let { x: treeX, y: treeY, z: treeZ } = target.position
	
		this.bot.pathfinder.setMovements(defaultMove)
		this.bot.pathfinder.setGoal(new GoalNear(treeX, treeY, treeZ, RANGE_GOAL))
	}

	//Initialize Bot Instance
	initBot() {

		//Creates Bot with given parameters
		this.bot = mineflayer.createBot({
			"username": this.username,
			"host": this.host,
			"port": this.port,
			"version": this.version
		});

		//Calls for Initialization of Bot Event Listeners
		this.bot.loadPlugin(pathfinder)
		this.initEvents();
	};

	chatLog(username, ...msg) {
		if (!botNames.includes(username)) {
			addMainLog(`<${username}>: `, ...msg)
			//console.log(`<${username}>: `, ...msg);
		}
	};

	//Initialize Bot Event Listeners
	initEvents() {

		//On Login Event
		this.bot.on("login", () => {
			let botSocket = this.bot._client.socket;
			addMainLog(`-[${this.username}]-: Logged in to ${botSocket.server ? botSocket.server : botSocket._host}`);
			//console.log(`-[${this.username}]-: Logged in to ${botSocket.server ? botSocket.server : botSocket._host}`);
		});

		//On End (Disconnect) Event, attempt to reconnect if disconnect was unexpected 
		this.bot.on("end", (reason) => {
			addMainLog(`-[${this.username}]-: Disconnected from ${this.host}:${this.port}: ${reason}`);
			//console.log(`-[${this.username}]-: Disconnected from ${this.host}:${this.port}: ${reason}`);

			if (reason == "disconnect.quiting") {
				let botIndex = botNames.indexOf(this.bot.username)
				bots.splice(botIndex, 1)
				botNames.splice(botIndex, 1)
				if (bots.length === 0) {
					exit(1)
				}
				return
			}

			setTimeout(() => this.initBot(), 5000);
		});



		//On Spawn Event
		this.bot.on("spawn", () => {
			addMainLog(`-[${this.username}]-: has spawned in!`)		
			//mineflayerViewer(this.bot, { firstPerson: true, port: 3000, viewDistance: 3 })
		});

		//On Chat Event, console chat messages not made by a Bot instance
		this.bot.on("chat", async (username, jsonMsg) => {
			if (!this.trustedOperators.includes(username)) {
				return
			}
			else {
				return
			}
		});

		this.bot.on("whisper", async (username, message, jsonMsg) => {
			if (!this.trustedOperators.includes(username)) {
				return
			}
			else {
				this.chatLog(username, message, jsonMsg);
				if (message === "dc" || message === "bot disconnect") {
					this.bot.quit("disconnect.quiting");
				}
				if (message === "come" || message === "bot come" || message === "come to me" || message === "bot come to me") {
					const RANGE_GOAL = 2 // get within this radius of the player
					const defaultMove = new Movements(this.bot)
					const target = this.bot.players[username]?.entity
					if (!target) {
						this.bot.whisper(username, `I don't see you ${username}!`);
						return
					}
					const { x: playerX, y: playerY, z: playerZ } = target.position

					this.bot.pathfinder.setMovements(defaultMove)
					this.bot.pathfinder.setGoal(new GoalNear(playerX, playerY, playerZ, RANGE_GOAL))
				}
				if (message === "treefarm") {
					this.startTreeFarm()
				}
			}
		});

		/*this.bot.on("health", () =>{
			return
		});*/

		//On Error Event, handle error by sending console log for debugging
		this.bot.on("error", (err) => {
			if (err.code === "ECONNREFUSED") {
				addMainLog(`-[${this.username}]-: Failed to connect to ${err.address}:${err.port}`)
				//console.log(`-[${this.username}]-: Failed to connect to ${err.address}:${err.port}`);
			}
			else {
				addMainLog(`-[${this.username}]-: Unhandled error: ${err}`);
				//console.log(`-[${this.username}]-: Unhandled error: ${err}`);
			}
		});

	};
};


function main() {
	
	// let serverConnectInfo = {};
	// let win;

	// function createWindow() {

	// 	win = new BrowserWindow({
	// 	  width: 1600,
	// 	  height: 900,
	// 	  autoHideMenuBar: true,
	// 	  webPreferences: {
	// 		nodeIntegration: true,
	// 		contextIsolation: true,
	// 		preload: path.join(__dirname, "./Display/preload.js")
	// 	  }
	// 	});

	// 	win.loadURL(url.format({
	// 		pathname: path.join(__dirname, "./Display/index.html"),
	// 		protocol: "file",
	// 		slashes: true
	// 	}));

	// 	win.on("ready-to-show", () => win.show());

	// 	win.webContents.openDevTools();

	// 	win.on("closed", () => {
	// 		win = null;
	// 	});
	// };

	// ipcMain.handle('dark-mode:toggle', () => {
	// 	if (nativeTheme.shouldUseDarkColors) {
	// 	  nativeTheme.themeSource = 'light'
	// 	} else {
	// 	  nativeTheme.themeSource = 'dark'
	// 	}
	// 	return nativeTheme.shouldUseDarkColors
	// });
	  
	// ipcMain.handle('dark-mode:system', () => {
	// 	nativeTheme.themeSource = 'system'
	// });

	// ipcMain.handle("set-botusername", async (_event, value) => {
	// 	let botUsername = value;
	// 	serverConnectInfo["username"] = value
	// 	console.log(serverConnectInfo)
	// 	return botUsername
	// });

	// ipcMain.handle("set-bothost", async (_event, value) => {
	// 	let botHostname = value;
	// 	serverConnectInfo["host"] = value
	// 	console.log(serverConnectInfo)
	// 	return botHostname
	// });

	// ipcMain.handle("set-botport", async (_event, value) => {
	// 	let botPort = value;
	// 	serverConnectInfo["port"] = value
	// 	console.log(serverConnectInfo)
	// 	return botPort
	// });
	
	// ipcMain.on("quit-App-Main", () => {
	// 	console.log("Closing Application!")
	// 	app.quit();

	// 	win = null;
	// })

	// ipcMain.on("restart-App-Main", () => {
	// 	console.log("Restarting Application!")
	// 	app.relaunch()
	// 	app.quit()
	// })

	// app.on('ready', () => {
	// 	createWindow();
	  
	// 	app.on('activate', () => {
	// 	  if (BrowserWindow.getAllWindows().length === 0) 
	// 		createWindow();
	// 	})
	// });
	

	// app.on('window-all-closed', () => {
	// 	if (process.platform !== 'darwin') {
	// 		app.quit()
	// 		win = null;
	// 	} 
	// });

	//Define the maximum number of Bots to be created
	// let maxNumOfBots = 1;
	
	//Create a single Bot using the MinecraftBot template class and push it into Bot Container and Names list
	let currBot = "Repairbot";
	bots.push(new MinecraftBot(currBot));
	botNames.push(currBot);
	
	//Creates multiple Bots equal to the number of maximum Bots variable
	/*for(var i = 0; i < maxNumOfBots; i++) {
		bots.push(new MinecraftBot("Repairbot"))
	}*/
	
	
}

main()