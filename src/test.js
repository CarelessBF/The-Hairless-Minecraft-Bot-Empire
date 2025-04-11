const dotenv = require("dotenv").config();
const mineflayer = require("mineflayer");
const chalk = require("chalk");
const fs = require("fs");
const colors = require("./colors.js");
const color = colors.color;
const readline = require("readline");
const { exit } = require("process");
const trustedOperatorsArray = process.env.TRUSTED_OPERATORS;

