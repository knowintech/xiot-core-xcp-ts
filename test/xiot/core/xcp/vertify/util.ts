import {Curve25519, Random} from "../../../../../src/xiot/core/xcp/utils/mipher/dist";
import {KeyPair} from "../../../../../src";

export function getKeyPair() : KeyPair {
    const random = new Random();
    const c = new Curve25519();
    const seed = random.get(32);
    // const seed = this.getNum();
    const k = c.generateKeys(seed);
    return new KeyPair(k.pk, k.sk);
}
