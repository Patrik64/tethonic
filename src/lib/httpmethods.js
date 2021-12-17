function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getBitcoinPriceAtTime(uxtime, cnt) {
  const rem = Math.floor(cnt / 10);
  const waittime = Math.floor(rem * 5000);
  await timeout(waittime);

  const ret = {};
  ret.pricesAfter = [];
  ret.timesAfter = [];

  const ttime = `${uxtime}000`;
  const nStartTime = parseInt(ttime, 10) - 60000;
  // const nEndTime = nStartTime + 120000;
  const nEndTime = nStartTime + 360000;
  const strStartTime = nStartTime.toString();
  const strEndTime = nEndTime.toString();
  const url = `https://api.coincap.io/v2/assets/bitcoin/history?interval=m1&start=${strStartTime}&end=${strEndTime}`;
  let btcPrice = 0;
  try {
    const btcpResponse = await fetch(url);
    btcPrice = await btcpResponse.json();
  } catch (err) {
    console.log('fetch btc price failed -> ', err);
  }

  if (btcPrice.data) {
    ret.inputTime = uxtime;
    ret.priceBefore = btcPrice.data[0].priceUsd;
    const tempBefore = btcPrice.data[0].time;
    ret.timeBefore = (tempBefore - (tempBefore % 1000)) / 1000;

    for (let i = 1; i < 6; i += 1) {
      ret.pricesAfter.push(btcPrice.data[i].priceUsd);
      const tempAfter = btcPrice.data[i].time;
      ret.timesAfter.push((tempAfter - (tempAfter % 1000)) / 1000);
    }
  }
  return ret;
}

function sumAllTetherTransactions(block) {
  let sum = 0;
  block.tether_transactions.forEach((tr) => {
    sum += tr.nValue;
  });
  return sum;
}

function processTransaction(tr) {
  const transaction = {};
  tr.out.forEach((out) => {
    if (out.script) {
      const omniIdentifier = out.script.substring(4, 12);
      const tetherIdentifier = out.script.substring(26, 28);
      if (omniIdentifier === '6f6d6e69' && tetherIdentifier === '1f') {
        transaction.script = out.script;
        const strValue = out.script.substring(28, 44);
        if (strValue) {
          const nValue = parseInt(strValue, 16);
          transaction.nValue = nValue / 100000000;
        }
      }
    }
  });
  if (transaction.nValue) {
    return transaction;
  }
  return null;
}

export async function getBlockDataFromHeight(height) {
  let hash = '';
  try {
    const hashResponse = await fetch(`https://api.smartbit.com.au/v1/blockchain/block/${height}`);
    const hashObj = await hashResponse.json();
    // eslint-disable-next-line prefer-destructuring
    hash = hashObj.block.hash;
  } catch (err) {
    console.log('fetch smartbit fail ->', err);
  }

  let blockJson = null;
  try {
    const blockResponse = await fetch(`https://blockchain.info/rawblock/${hash}?cors=true`);
    blockJson = await blockResponse.json();
  } catch (err) {
    console.log('fetch for rawblock failed -> ', err);
  }


  const block = {
    hash: null,
    n_tx: null,
    height: null,
    sum: null,
    n_tethers: null,
    time: null,
    tether_transactions: [],
  };

  block.hash = hash;
  block.n_tx = blockJson.n_tx;
  block.height = blockJson.height;
  block.time = blockJson.time;

  const obj = await getBitcoinPriceAtTime(block.time, 0);
  block.btcPriceBefore = obj.priceBefore;
  block.btcTimeBefore = obj.timeBefore;
  block.btcPricesAfter = [...obj.pricesAfter];
  block.btcTimesAfter = [...obj.timesAfter];

  let i = 0;
  blockJson.tx.forEach((tr) => {
    const tether = processTransaction(tr);
    if (tether) {
      tether.ntx = i;
      tether.time = tr.time;
      block.tether_transactions.push(tether);
    }
    i += 1;
  });


  const setTimes = new Set();
  for (let k = 0; k < block.tether_transactions.length; k += 1) {
    const uxtime = block.tether_transactions[k].time;
    setTimes.add(uxtime);
  }

  const arrBTCPricePromises = [];
  let cnt = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const uxtime of setTimes) {
    const promiseBTC = getBitcoinPriceAtTime(uxtime, cnt);
    arrBTCPricePromises.push(promiseBTC);
    cnt += 1;
  }

  const btcPrices = await Promise.all(arrBTCPricePromises);

  for (let v = 0; v < block.tether_transactions.length; v += 1) {
    // eslint-disable-next-line max-len
    const found = btcPrices.find(element => element.inputTime === block.tether_transactions[v].time);
    if (found) {
      block.tether_transactions[v].btcPriceBefore = found.priceBefore;
      block.tether_transactions[v].btcTimeBefore = found.timeBefore;

      block.tether_transactions[v].btcPricesAfter = [...found.pricesAfter];
      block.tether_transactions[v].btcTimesAfter = [...found.timesAfter];
    } else {
      console.log('problem --> ', found);
      return null;
    }
  }
  block.sum = sumAllTetherTransactions(block);
  block.n_tethers = block.tether_transactions.length;

  // sort by time
  block.tether_transactions.sort((a, b) => {
    if (a.time < b.time) {
      return -1;
    }
    if (a.time > b.time) {
      return 1;
    }
    return 0;
  });

  return block;
}

export async function getBlockDataFromHash(hash) {
  const blockResponse = await fetch(`https://blockchain.info/rawblock/${hash}?cors=true`);
  const block = await blockResponse.json();
  return block;
}

export async function getLastBlockHeight() {
  const lastHeightResponse = await fetch('https://blockchain.info/q/getblockcount');
  const lastHeight = await lastHeightResponse.text();
  return lastHeight;
}

export async function getLastBlockData() {
  const lastHashResponse = await fetch('https://blockchain.info/q/latesthash');
  const lastHash = await lastHashResponse.text();

  const lastBlockResponse = await fetch(`https://blockchain.info/rawblock/${lastHash}?cors=true`);
  const lastBlock = await lastBlockResponse.json();

  return lastBlock;
}

export async function getBlockHashFromHeight(height) {
  const response = await fetch(`https://api.smartbit.com.au/v1/blockchain/block/${height}`);
  const hash = await response.json();
  return hash;
}
