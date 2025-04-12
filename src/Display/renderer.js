document.getElementById('toggle-dark-mode').addEventListener('click', async () => {
	const isDarkMode = await window.darkMode.toggle()
	document.getElementById('theme-source').innerHTML = isDarkMode ? 'Dark' : 'Light'
})

async function handleUserInputSetBotUsername({ target: { value } }) {
	let botUsername = document.getElementById('botUsernameId');
 	let newBotUsername = await getBotInfo.setBotUsername(value);
 	botUsername.innerText = `${newBotUsername}`;
}

async function handleUserInputSetBotHost({ target: { value } }) {
	let botHost = document.getElementById('botHostId');
 	let newBotHost = await getBotInfo.setBotHost(value);
 	botHost.innerText = `${newBotHost}`;
}

async function handleUserInputSetBotPort({ target: { value } }) {
	let botPort = document.getElementById('botPortId');
 	let newBotPort = await getBotInfo.setBotPort(value);
 	botPort.innerText = `${newBotPort}`;
}

document.getElementById("userInputSetBotUsername").addEventListener("change", handleUserInputSetBotUsername)
document.getElementById("userInputSetBotHost").addEventListener("change", handleUserInputSetBotHost)
document.getElementById("userInputSetBotPort").addEventListener("change", handleUserInputSetBotPort)

document.getElementById("quit-app").addEventListener("click", () => {
	appControl.quitApp()
})

document.getElementById("restart-app").addEventListener("click", () => {
	appControl.restartApp()
})