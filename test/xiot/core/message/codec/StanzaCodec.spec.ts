import { expect } from 'chai';
import {diff} from 'yajsondiff';
import 'mocha';
import * as fs from 'async-file';
import {StanzaCodec} from '../../../../../src/xiot/core/stanza/codec/StanzaCodec';


describe('StanzaCodec', async () => {

    const folder = './resources/stanza/';
    const dir = await fs.readdir(folder);

    it('reading stanza, folder: ' + folder, () => {
        expect(true).to.equal(true);
    });

    const codec: StanzaCodec = new StanzaCodec();

    for (const file of dir) {
        it('  check: ' + file, async () => {

            const a = await fs.readFile(folder + file);
            const oldJson = JSON.parse(a.toString());
            const message = codec.decode(a.toString());

            if (message == null) {
                console.log('message invalid: ', a.toString());
                expect(JSON.stringify(oldJson)).to.equal('null');
                return;
            }

            const newJson = codec.encode(message);
            const differences = diff(oldJson, newJson);
            if (differences == null) {
                expect(true).to.equal(true);
            } else {
                console.log('differences: ', differences);
                expect(JSON.stringify(oldJson)).to.equal(JSON.stringify(newJson));
            }
        });
    }
});
