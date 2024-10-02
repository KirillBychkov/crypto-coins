import ccxt from "ccxt";
import { collectVolume } from "./calc.js";
import { minVolume, prices } from "../index.js";

export class Connector {
    constructor(type) {
        this.type = type;
        this.stopList = {};
        this.cex = new ccxt.pro[type]();
    }

    async subscribeOnTicker({ chainName, ticker, target, ...rest }) {
        const key = chainName + '__' + ticker + '__' + target;

        if(!this.stopList[key]) {
            this.stopList[key] = setInterval(async () => {
                try {
                    const orderbook = await this.cex.fetchOrderBook(ticker);
                    prices[key] = {
                        time: new Date(),
                        asks: collectVolume(orderbook.asks),
                        bids: collectVolume(orderbook.bids),
                        minVolume: minVolume,
                    };
                    console.info(key);
                } catch (e) {
                    console.info('ERROR WATCHER ', e, {
                        ...rest
                    });
                }
            }, 30000);
        }
    }

    unsubscribeFromAllTickers() {
        Object.keys(this.stopList).forEach(key => {
            clearInterval(this.stopList[key]);
        });
    }
}
