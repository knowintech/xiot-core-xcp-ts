export function StringToUint8Array(s: string): Uint8Array {
    const array = new Uint8Array(s.length);

    for (let i = 0; i < s.length; ++i) {
        array[i] = s.charCodeAt(i);
    }

    return array;
}

export  function Unit8ArrayToString(fileData: Uint8Array): string {
    let dataString = '';
    for (let i = 0; i < fileData.length; i++) {
        dataString += String.fromCharCode(fileData[i]);
    }

    return dataString;
}

/**
 * copy from mipher
 */
export function Bin2Base64(bin: Uint8Array, url?: boolean): string {
    // btoa not available
    let base64 = '';
    const encodingTable = url ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_' :
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    for (let i = 0, len = bin.length; i < len;) {
        const octet_a = i < bin.length ? bin[i] : 0;
        i++;
        const octet_b = i < bin.length ? bin[i] : 0;
        i++;
        const octet_c = i < bin.length ? bin[i] : 0;
        i++;

        // tslint:disable-next-line:no-bitwise
        const triple = (octet_a << 0x10) + (octet_b << 0x08) + octet_c;

        // tslint:disable-next-line:no-bitwise
        base64 += encodingTable.charAt((triple >>> 18) & 0x3F);

        // tslint:disable-next-line:no-bitwise
        base64 += encodingTable.charAt((triple >>> 12) & 0x3F);

        // tslint:disable-next-line:no-bitwise
        base64 += (i < bin.length + 2) ? encodingTable.charAt((triple >>> 6) & 0x3F) : (url ? '%3d' : '=');

        // tslint:disable-next-line:no-bitwise
        base64 += (i < bin.length + 1) ? encodingTable.charAt((triple >>> 0) & 0x3F) : (url ? '%3d' : '=');
    }

    return base64;
}

/**
 * copy from mipher
 */
export function Base642Bin(base64: string): Uint8Array {
    // remove base64url encoding
    base64 = base64.replace(/-/g, '+').replace(/_/g, '/').replace(/%3d/g, '=');

    // length must be multiple of 4
    if (base64.length % 4 !== 0) {
        return new Uint8Array(0);
    }

    let strlen = base64.length / 4 * 3;
    if (base64.charAt(base64.length - 1) === '=') {
        strlen--;
    }

    if (base64.charAt(base64.length - 2) === '=') {
        strlen--;
    }

    if (typeof atob !== 'undefined') {
        return new Uint8Array(atob(base64).split('').map(function (c) {
            return c.charCodeAt(0);
        }));
    } else {
        // atob not available
        const decodingTable = new Int8Array([
            -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, 62, -1, 62, -1, 63,
            52, 53, 54, 55, 56, 57, 58, 59,
            60, 61, -1, -1, -1, -2, -1, -1,
            -1, 0, 1, 2, 3, 4, 5, 6,
            7, 8, 9, 10, 11, 12, 13, 14,
            15, 16, 17, 18, 19, 20, 21, 22,
            23, 24, 25, -1, -1, -1, -1, 63,
            -1, 26, 27, 28, 29, 30, 31, 32,
            33, 34, 35, 36, 37, 38, 39, 40,
            41, 42, 43, 44, 45, 46, 47, 48,
            49, 50, 51, -1, -1, -1, -1, -1 // x y z .  . . . .
        ]);

        let p = 0;
        const bin = new Uint8Array(strlen);
        for (let i = 0, len = base64.length; i < len;) {
            const sextet_a = base64.charAt(i) === '=' || base64.charCodeAt(i) > 'z'.charCodeAt(0) ? 0 : decodingTable[base64.charCodeAt(i)];
            i++;

            const sextet_b = base64.charAt(i) === '=' || base64.charCodeAt(i) > 'z'.charCodeAt(0) ? 0 : decodingTable[base64.charCodeAt(i)];
            i++;

            const sextet_c = base64.charAt(i) === '=' || base64.charCodeAt(i) > 'z'.charCodeAt(0) ? 0 : decodingTable[base64.charCodeAt(i)];
            i++;

            const sextet_d = base64.charAt(i) === '=' || base64.charCodeAt(i) > 'z'.charCodeAt(0) ? 0 : decodingTable[base64.charCodeAt(i)];
            i++;

            // tslint:disable-next-line:no-bitwise
            const triple = (sextet_a << 18) + (sextet_b << 12) + (sextet_c << 6) + (sextet_d);

            if (base64.charAt(i - 3) !== '=') {
                // tslint:disable-next-line:no-bitwise
                bin[p++] = (triple >>> 16) & 0xff;
            }

            if (base64.charAt(i - 2) !== '=') {
                // tslint:disable-next-line:no-bitwise
                bin[p++] = (triple >>> 8) & 0xff;
            }

            if (base64.charAt(i - 1) !== '=') {
                // tslint:disable-next-line:no-bitwise
                bin[p++] = triple & 0xff;
            }
        }

        return bin;
    }
}

export function BytesJoin(a: Uint8Array, b: Uint8Array): Uint8Array {
    const c = new Uint8Array(a.length + b.length);
    c.set(a);
    c.set(b, a.length);
    return c;
}

export function Utf8ArrayToStr(array: Uint8Array): string {
    const len = array.length;
    let out = '';
    let i = 0;
    let c: number;
    let char2;
    let char3;

    while (i < len) {
        c = array[i++];

        switch (c / 16) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c);
                break;

            case 12:
            case 13:
                // 110x xxxx   10xx xxxx
                char2 = array[i++];

                // tslint:disable-next-line:no-bitwise
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;

            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++];
                char3 = array[i++];

                // tslint:disable-next-line:no-bitwise
                out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
                break;
        }
    }

    return out;
}
