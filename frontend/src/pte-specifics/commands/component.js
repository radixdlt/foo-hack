import { ManifestBuilder } from 'pte-sdk';
import { signTransaction } from 'pte-browser-extension-sdk';

const component = {

    instantiate: async (address) => {

        const manifest = new ManifestBuilder()
            .callFunction(address, 'RadiChess', 'create', [])
            .build()
            .toString();

        // Send manifest to extension for signing
        const receipt = await signTransaction(manifest);

        return {

            component: receipt.newComponents[0],
            resources: {
                chess: receipt.newResources[0],
                player_badge: receipt.newResources[1]
            }

        };

    }

};

export default component;