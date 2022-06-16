import { ManifestBuilder, DefaultApi } from 'pte-sdk';
import { signTransaction } from 'pte-browser-extension-sdk';
import mappings from '../address-mappings';

const api = new DefaultApi();

const game = {

    create: async () => {

        const manifest = new ManifestBuilder()
            .createProofFromAccountByAmount(mappings.userAccount.address, '1', mappings.player_badge)
            .popFromAuthZone('proof1')
            .callMethod(mappings.component, 'start_game', ['Proof("proof1")', '1300u64'])
            .build()
            .toString();

        const receipt = await signTransaction(manifest);

    },

    viewGames: async () => {

        const manifest = new ManifestBuilder()
            .callMethod(mappings.component, 'list_games', [])
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

    },

    getGameInfo: async (gameAddress) => {

        const manifest = new ManifestBuilder()
            .callMethod(gameAddress, 'get_game_info', [])
            .build()
            .toString();

        const results = await api.submitTransaction({
            transaction: {
                manifest: manifest,
                nonce: {
                    value: Math.round(Math.random()*1000000)
                },
                signatures: []
            }
        });

        console.log(results)

        return JSON.parse(results.outputs[0]).value;

    },

    joinGame: async (gameAddress) => {

        const manifest = new ManifestBuilder()
            .createProofFromAccountByAmount(mappings.userAccount.address, '1', mappings.player_badge)
            .popFromAuthZone('proof1')
            .callMethod(gameAddress, 'join', ['Proof("proof1")'])
            .build()
            .toString();

        const receipt = await signTransaction(manifest);

    }

};

export default game;