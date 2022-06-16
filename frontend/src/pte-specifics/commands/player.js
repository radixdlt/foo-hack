import { ManifestBuilder, DefaultApi } from 'pte-sdk';
import { signTransaction } from 'pte-browser-extension-sdk';
import mappings from '../address-mappings';

const api = new DefaultApi();

const player = {
    listPlayers: async () => {

        const manifest = new ManifestBuilder()
            .callMethod(mappings.component, 'list_players', [])
            .build()
            .toString();

        const results = await api.submitTransaction({
            transaction: {
                manifest: manifest,
                nonce: {
                    value: Math.round(Math.random()*100000)
                },
                signatures: []
            }
        });

        return JSON.parse(JSON.parse(results.outputs[0]).value);

    }
}

export default player;