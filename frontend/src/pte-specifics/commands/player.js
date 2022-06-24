import { ManifestBuilder, DefaultApi } from 'pte-sdk';
import { CHESS } from '../address-mappings';

const api = new DefaultApi();

const player = {

    listPlayers: async () => {

        const manifest = new ManifestBuilder()
            .callMethod(CHESS.component, 'list_players', [])
            .build()
            .toString();

        const results = await api.submitTransaction({
            transaction: {
                manifest: manifest,
                nonce: {
                    value: Math.round(Math.random() * 100000)
                },
                signatures: []
            }
        });

        return JSON.parse(JSON.parse(results.outputs[0]).value);

    },

    getBadge: async (callback = false) => {

        const account = await account.fetch();

        // Todo - if account is undefined, ask the use to create an account via the extension

        console.log('User Account ↴');
        console.log(account);

        if (callback) {
            callback(account.player_badge);
        }

        return account.player_badge;

    }

}

export default player;