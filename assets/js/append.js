import { readFileSync } from "fs";
let usersjson = readFileSync("../config.json","utf-8");
console.log( JSON.stringify(usersjson) );