import cors from "cors";
import express, { json } from "express";
import CEX, { fetchAllCoins } from "./helpers/cex.js";
import { taskController } from "./taskRunner/taskController.js";

let coinsListSet = [];
const allowedPairs = ["USDT", "FDUSD", "USDC"];

const app = express();

app.use(json());
app.use(cors());

app.get('/stop', (req, res) => {
    coinsListSet = [];
    Object.keys(CEX.cexNamesOnCCXT).forEach(e => CEX[e].unsubscribeFromAllTickers());

    res.status(200).json({
        request: {
            coins: coinsListSet,
            cex: Object.keys(CEX.cexNamesOnCCXT),
            pairs: allowedPairs,
            workers: taskController.getRunnerSize(),
            filled: Object.keys(CEX.cexNamesOnCCXT).reduce((s, n) => s + Object.keys(CEX[n].prices).length, 0),
        },
        response: Object.keys(CEX.cexNamesOnCCXT).map(n => ({ ...CEX[n].prices }))
    });
});

app.get('/start', async (req, res) => {
    coinsListSet = ["altlayer", "mask-network", "open-campus", "zetachain", "blast", "illuvium", "biconomy",
        "arkham", "gmx", "space-id", "meme", "basic-attention-token", "celo"];

    const coins = await fetchAllCoins(coinsListSet);
    coinsListSet.forEach((chainName) => {
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
    res.status(200).json({
        request: {
            pairs: allowedPairs,
            coins: coinsListSet,
            cex: Object.keys(CEX.cexNamesOnCCXT),
            workers: taskController.getRunnerSize(),
            filled: Object.keys(CEX.cexNamesOnCCXT).reduce((s, n) => s + Object.keys(CEX[n].prices).length, 0),
        },
        response: Object.keys(CEX.cexNamesOnCCXT).map(n => ({ ...CEX[n].prices })),
    });
});

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


// http://209.38.199.247:3000/slugs?limit=100&skip=0&sorted=rank:1
// http://209.38.199.247:3000/coins?slugs=near-protocol,bnb
