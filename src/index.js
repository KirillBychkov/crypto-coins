import cors from "cors";
import express, { json } from "express";
import CEX, { fetchAllCoins } from "./helpers/cex.js";
import { taskController } from "./taskRunner/taskController.js";
import bigDecimal from "js-big-decimal";

process.setMaxListeners(0);
process.on('uncaughtException', () => {});

export let prices = {};
export let coinsListSet = [];
export const allowedPairs = ["USDT", "FDUSD", "USDC"];
export const minVolume = 10000;

const app = express();
app.use(json());
app.use(cors());

app.get('/stop', (req, res) => {
    coinsListSet = [];
    prices = {};
    Object.keys(CEX.cexNamesOnCCXT).forEach(e => CEX[e].unsubscribeFromAllTickers());

    res.status(200).json({
        request: {
            coins: coinsListSet,
            cex: Object.keys(CEX.cexNamesOnCCXT),
            pairs: allowedPairs,
            workers: taskController.getRunnerSize(),
            filled: Object.keys(prices).length,
        },
        response: prices
    });
});

app.post('/start', async (req, res) => {
    if(!req.body.slugs || !req.body.slugs.length) {
        return res.status(400).json({ message: "Field 'slugs' is required and must be an array of slugs" })
    }

    const coins = await fetchAllCoins(req.body.slugs);
    if(coins.message || !coins[req.body.slugs[0]]) {
        return res.status(400).json({ message: "Field 'slugs' is required and must be an array of existing slugs" })
    }

    coinsListSet = req.body.slugs;
    req.body.slugs.forEach((chainName) => {
        const markets = coins[chainName].markets.filter(e =>
            e.type === "cex" && CEX.cexCoinMarketCapNames[e.exchangeSlug] && allowedPairs.includes(e.quoteSymbol),
        );

        markets.forEach(e => {
            try {
                CEX[CEX.cexCoinMarketCapNames[e.exchangeSlug]].subscribeOnTicker({
                    ...e,
                    chainName: chainName,
                    ticker: e.marketPair,
                    target: CEX.cexCoinMarketCapNames[e.exchangeSlug]
                });
            } catch(e) {
                console.log('cannot sub to ticker', e);
            }
        });
    });

    res.status(200).json({ message: "Successfully started. Please wait for a minute..." });
});

app.get('/status', async (req, res) => {
    const pricesKeys = Object.keys(prices);
    pricesKeys.sort();
    const percentage = [];
    const response = pricesKeys.reduce((state, key, i) => {
        const [chain, ticker, exchange] = key.split('__');
        const next = pricesKeys[i + 1]?.split('__');

        if(!state[chain]) {
            state[chain] = {
                buy: { chain, ticker, exchange, ...prices[key] },
                sell: { chain, ticker, exchange, ...prices[key] }
            };
        }

        if(!next || next[0] !== chain) {
            const sellPrice = new bigDecimal.default(state[chain].sell.bids.price);
            const buyPrice = new bigDecimal.default(state[chain].buy.asks.price);
            const hundred = new bigDecimal.default(100.00);
            const difference = sellPrice.subtract(buyPrice);

            state[chain].percentage = difference.multiply(hundred).divide(sellPrice).getValue();
            percentage.push({ value: state[chain].percentage, chain });
        }

        if(+prices[key].asks.price < +state[chain].buy.asks.price)
            state[chain].buy = { chain, ticker, exchange, ...prices[key] }
        else if(+prices[key].bids.price > +state[chain].sell.bids.price)
            state[chain].sell = { chain, ticker, exchange, ...prices[key] }

        return state;
    }, {});

    res.status(200).json({
        percentage: percentage.filter(e => +e.value > 0).toSorted((a,b) => b.value - a.value),
        request: {
            pairs: allowedPairs,
            coins: coinsListSet,
            cex: Object.keys(CEX.cexNamesOnCCXT),
            workers: taskController.getRunnerSize(),
            filled: Object.keys(prices).length,
        },
        response,
    });
});

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// http://209.38.199.247:3000/slugs?limit=100&skip=0&sorted=rank:1
// http://209.38.199.247:3000/coins?slugs=near-protocol,bnb
