async function test() {
  const res = await fetch(`https://financialmodelingprep.com/stable/batch-crypto-quotes?apikey=test`);
  console.log(res.status, await res.text());
}
test();
