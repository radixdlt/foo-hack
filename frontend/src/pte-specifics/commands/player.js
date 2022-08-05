import { ManifestBuilder, DefaultApi } from "pte-sdk";

import { CHESS } from "../address-mappings";

const api = new DefaultApi();

const player = {

    listPlayers: async () => {

        try {

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

        } catch {

            return null;

        }

    }

}

export default player;