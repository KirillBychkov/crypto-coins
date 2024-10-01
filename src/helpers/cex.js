import { Connector } from './connector.js';
import got from 'got';

const cexNamesOnCCXT = {
    binance: "binance",
    bingx: "bingx",
    bitget: "bitget",
    bybit: "bybit",

    kraken: "kraken",
    kucoin: "kucoin",
    mexc: "mexc",
    okx: "okx",

    cryptocom: "cryptocom",
    gate: "gate",
    bitrue: "bitrue",
    whitebit: "whitebit",

    bitstamp: "bitstamp",
    upbit: "upbit",
    bitfinex: "bitfinex",
    bitmart: "bitmart",
};

const cexCoinMarketCapNames = {
    "binance": "binance",
    "bingx": "bingx",
    "bitget": "bitget",
    "bybit": "bybit",

    "kraken": "kraken",
    "kucoin": "kucoin",
    "mexc": "mexc",
    "okx": "okx",

    "crypto-com-exchange": "cryptocom",
    "gate-io": "gate",
    "bitrue": "bitrue",
    "whitebit": "whitebit",

    "bitstamp": "bitstamp",
    "upbit": "upbit",
    "bitfinex": "bitfinex",
    "bitmart": "bitmart",
};

const binance = new Connector(cexNamesOnCCXT.binance);
const bingx = new Connector(cexNamesOnCCXT.bingx);
const bitget = new Connector(cexNamesOnCCXT.bitget);
const bybit = new Connector(cexNamesOnCCXT.bybit);

const kraken = new Connector(cexNamesOnCCXT.kraken);
const kucoin = new Connector(cexNamesOnCCXT.kucoin);
const mexc = new Connector(cexNamesOnCCXT.mexc);
const okx = new Connector(cexNamesOnCCXT.okx);

const cryptocom = new Connector(cexNamesOnCCXT.cryptocom);
const gate = new Connector(cexNamesOnCCXT.gate);
const bitrue = new Connector(cexNamesOnCCXT.bitrue);
const whitebit = new Connector(cexNamesOnCCXT.whitebit);

const bitstamp = new Connector(cexNamesOnCCXT.bitstamp);
const upbit = new Connector(cexNamesOnCCXT.upbit);
const bitfinex = new Connector(cexNamesOnCCXT.bitfinex);
const bitmart = new Connector(cexNamesOnCCXT.bitmart);

export async function fetchAllCoins(coinsListSet) {
    const url = 'http://209.38.199.247:3000/coins?slugs=' + coinsListSet.join(',');

    const response = await got.get(url);
    return JSON.parse(response.body);
}

export default {
    binance,
    bingx,
    bitget,
    bybit,

    kraken,
    kucoin,
    mexc,
    okx,

    cryptocom,
    gate,
    bitrue,
    whitebit,

    bitstamp,
    upbit,
    bitfinex,
    bitmart,

    cexNamesOnCCXT,
    cexCoinMarketCapNames,
};
