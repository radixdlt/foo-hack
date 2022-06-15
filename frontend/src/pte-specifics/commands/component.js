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
            addresses: {
                component: receipt.newComponents[0],
                resource: receipt.newResources[0],
                player_badge_resource: receipt.newResources[1]
            }
        };

    }



};

export default component;