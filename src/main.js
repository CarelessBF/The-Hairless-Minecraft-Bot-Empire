const dotenv = require("dotenv").config();
const mineflayer = require("mineflayer");
const { goals, Movements } = require('mineflayer-pathfinder');
const chalk = require("chalk");
const fs = require("fs");
const colors = require("./colors.js");
const color = colors.color;
const { app, BrowserWindow, ipcMain, protocol, nativeTheme } = require("electron")
const { exit } = require("process");
const url = require("url");
const path = require("path");
const trustedOperatorsArray = process.env.TRUSTED_OPERATORS;

//Create a container of all Bot instances
let bots = [];

let mainLog = [
	//[color.bgBlack + "Initializing Display HUD" + color.reset]
];

function addMainLog(text) {
	mainLog.push([text + color.reset]);
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
			//console.log(`-[${this.username}]-: has spawned in!`);
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

		this.bot.on("whisper", async (username, jsonMsg) => {
			if (!this.trustedOperators.includes(username)) {
				return
			}
			else {
				this.chatLog(username, jsonMsg);
				if (jsonMsg == `dc` || `bot disconnect`) {
					this.bot.quit("disconnect.quiting");
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
	
	let win;

	function createWindow() {

		win = new BrowserWindow({
		  width: 1600,
		  height: 900,
		  autoHideMenuBar: true,
		  webPreferences: {
			nodeIntegration: true,
			preload: path.join(__dirname, "./Display/preload.js")
		  }
		});

		win.loadURL(url.format({
			pathname: path.join(__dirname, "./Display/index.html"),
			protocol: "file",
			slashes: true
		}));

		win.on("ready-to-show", () => win.show());

		win.webContents.openDevTools();

		win.on("closed", () => {
			win = null;
		});
	};

	ipcMain.handle('dark-mode:toggle', () => {
		if (nativeTheme.shouldUseDarkColors) {
		  nativeTheme.themeSource = 'light'
		} else {
		  nativeTheme.themeSource = 'dark'
		}
		return nativeTheme.shouldUseDarkColors
	});
	  
	ipcMain.handle('dark-mode:system', () => {
		nativeTheme.themeSource = 'system'
	});

	ipcMain.handle('get-botUsername', async () => {
		let botUsername = "RepairbotTest";
		return botUsername
	});

	app.on('ready', () => {
		createWindow();
	  
		app.on('activate', () => {
		  if (BrowserWindow.getAllWindows().length === 0) 
			createWindow();
		})
	});
	

	app.on('window-all-closed', () => {
		if (process.platform !== 'darwin') {
			app.quit()
			win = null;
		} 
	});

	//Define the maximum number of Bots to be created
	// let maxNumOfBots = 1;
	
	//Create a single Bot using the MinecraftBot template class and push it into Bot Container and Names list
	//let currBot = "Repairbot";
	//bots.push(new MinecraftBot(currBot));
	//botNames.push(currBot);
	
	//Creates multiple Bots equal to the number of maximum Bots variable
	/*for(var i = 0; i < maxNumOfBots; i++) {
		bots.push(new MinecraftBot("Repairbot"))
	}*/
	
	
}

main()