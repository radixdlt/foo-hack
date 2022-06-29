import { ManifestBuilder, DefaultApi } from 'pte-sdk';
import { signTransaction } from 'pte-browser-extension-sdk';
import { CHESS, USER } from '../address-mappings';

const api = new DefaultApi();

const game = {

    create: async ({ walletResource }) => {

        if (!walletResource) {
            return null;
        }

        try {

            const manifest = new ManifestBuilder()
                .createProofFromAccountByAmount(walletResource?.address, '1', walletResource?.player?.badge?.resourceAddress)
                .popFromAuthZone('proof1')
                .callMethod(CHESS.component, 'start_game', ['Proof("proof1")', '1300u64'])
                .build()
                .toString();

            return await signTransaction(manifest);

        } catch {

            return null;

        }

    },

    viewGames: async () => {

        const manifest = new ManifestBuilder()
            .callMethod(CHESS.component, 'list_games', [])
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

    getGameInfo: async (gameAddress) => {

        const manifest = new ManifestBuilder()
            .callMethod(gameAddress, 'get_game_info', [])
            .build()
            .toString();

        const results = await api.submitTransaction({
            transaction: {
                manifest: manifest,
                nonce: {
                    value: Math.round(Math.random() * 1000000) // Scrypto Bug Workaround
                },
                signatures: []
            }
        });

        return JSON.parse(JSON.parse(results.outputs[0]).value);

    },

    joinGame: async ({ gameAddress, walletResource }) => {

        try {

            const manifest = new ManifestBuilder()
                .createProofFromAccountByAmount(walletResource?.address, '1', walletResource?.player?.badge?.resourceAddress)
                .popFromAuthZone('proof1')
                .callMethod(gameAddress, 'join', ['Proof("proof1")'])
                .build()
                .toString();

            return await signTransaction(manifest);

        } catch {

            return null;

        }

    },

    movePiece: async (gameAddress, from, to) => {

        const manifest = new ManifestBuilder()
            .createProofFromAccountByAmount(USER.account.address, '1', USER.account.player_badge)
            .popFromAuthZone('proof1')
            .callMethod(gameAddress, 'move_piece', [`"${from}"`, `"${to}"`, 'Proof("proof1")'])
            .build()
            .toString();

        const receipt = await signTransaction(manifest);

    }

};

export default game;
