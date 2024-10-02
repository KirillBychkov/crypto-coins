import bigDecimal from "js-big-decimal";
import { minVolume } from "../index.js";

export function collectVolume(arr = []) {
    const amount_in_usdt = new bigDecimal.default(minVolume);
    const res =  {
        price: new bigDecimal.default(0),
        volume: new bigDecimal.default(0),
        cost: new bigDecimal.default(0),
        unnecessary_volume: null,
        unnecessary_cost: null,
        depth: 0,
    };

    while(res.cost.compareTo(amount_in_usdt) === -1 && arr[res.depth]) {
        const el = arr[res.depth];
        const price = new bigDecimal.default(el[0]);
        const volume = new bigDecimal.default(el[1]);

        res.volume = res.volume.add(volume);
        res.cost = volume.multiply(price).add(res.cost);
        res.price = res.cost.divide(res.volume);
        res.depth++;

        if(res.cost.compareTo(amount_in_usdt) === 1) {
           res.unnecessary_cost = res.cost.subtract(amount_in_usdt);
           res.unnecessary_volume = res.unnecessary_cost.divide(price);
           res.volume = res.volume.subtract(res.unnecessary_volume);
           res.cost = res.cost.subtract(res.unnecessary_cost);
           res.price = res.cost.divide(res.volume);
        }
    }
    return {
        price: res.price.getValue(),
        volume: res.volume.getValue(),
        cost: res.cost.getValue(),
        depth: res.depth,
    };
}
