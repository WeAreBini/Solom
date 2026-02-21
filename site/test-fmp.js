const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });

const API_KEY = process.env.FMP_API_KEY;
if (!API_KEY) {
  console.error("No API key found");
  process.exit(1);
}

async function test() {
  try {
    console.log("Testing Crypto...");
    const cryptoRes = await fetch(`https://financialmodelingprep.com/stable/batch-crypto-quotes?apikey=${API_KEY}`);
    const cryptoData = await cryptoRes.json();
    console.log("Crypto type:", Array.isArray(cryptoData) ? "Array" : typeof cryptoData);
    if (!Array.isArray(cryptoData)) console.log("Crypto keys:", Object.keys(cryptoData));
    else console.log("Crypto first item:", cryptoData[0]);
    
    console.log("\nTesting Economic...");
    const econRes = await fetch(`https://financialmodelingprep.com/stable/economic-indicators?name=GDP&apikey=${API_KEY}`);
    const econData = await econRes.json();
    console.log("Econ type:", Array.isArray(econData) ? "Array" : typeof econData);
    if (!Array.isArray(econData)) console.log("Econ keys:", Object.keys(econData));
    else console.log("Econ first item:", econData[0]);

    console.log("\nTesting Insider...");
    const insiderRes = await fetch(`https://financialmodelingprep.com/stable/insider-trading/latest?page=0&limit=100&apikey=${API_KEY}`);
    const insiderData = await insiderRes.json();
    console.log("Insider type:", Array.isArray(insiderData) ? "Array" : typeof insiderData);
    if (!Array.isArray(insiderData)) console.log("Insider keys:", Object.keys(insiderData));
    else console.log("Insider first item:", insiderData[0]);

    console.log("\nTesting 13F...");
    const f13Res = await fetch(`https://financialmodelingprep.com/stable/institutional-ownership/extract?cik=0001067983&year=2023&quarter=4&apikey=${API_KEY}`);
    const f13Data = await f13Res.json();
    console.log("13F type:", Array.isArray(f13Data) ? "Array" : typeof f13Data);
    if (!Array.isArray(f13Data)) console.log("13F keys:", Object.keys(f13Data));
    else console.log("13F first item:", f13Data[0]);
  } catch (e) {
    console.error(e);
  }
}
test();
