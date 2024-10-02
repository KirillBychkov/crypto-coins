import ccxt from "ccxt";
import { taskController } from "../taskRunner/taskController.js";
import { collectVolume } from "./calc.js";
import { minVolume, prices } from "../index.js";

export class Connector {
    constructor(type) {
        this.type = type;
        this.stopList = [];
        this.cex = new ccxt.pro[type]();
    }

    async subscribeOnTicker({ chainName, ticker, target, ...rest }) {
        const key = chainName + '__' + ticker + '__' + target;

        if(!this.stopList.includes(key)) {
            this.stopList.push(key);

            taskController.start(key, async () => {
                if(!taskController.taskRunners.has(key)) {
                    return Promise.resolve({ continueRunning: false });
                }

                try {
                    const orderbook = await this.cex.fetchOrderBook(ticker);
                    prices[key] = {
                        time: new Date(),
                        asks: collectVolume(orderbook.asks),
                        bids: collectVolume(orderbook.bids),
                        minVolume: minVolume,
                    };
                    // console.info(key);
                } catch (e) {
                    console.info('ERROR WATCHER ', e, {
                        ...rest
                    });
                }

                return Promise.resolve({ continueRunning: true });
            });
        }
    }

    unsubscribeFromAllTickers() {
        this.stopList.forEach(key => taskController.stop(key));
        this.stopList.forEach(key => taskController.stop(key));
        this.stopList = [];
    }
}
