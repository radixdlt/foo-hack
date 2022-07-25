import { ManifestBuilder } from "pte-sdk";
import { signTransaction } from "pte-browser-extension-sdk";

const component = {

    instantiate: async ({ address, auctionPackageAddress }) => {

        if (!address || !auctionPackageAddress) {

            return null;

        }

        try {

            const manifest = new ManifestBuilder()
                .callFunction(address, 'RadiChess', 'create', [`"${auctionPackageAddress}"`])
                .build()
                .toString();

            // Send manifest to extension for signing
            const receipt = await signTransaction(manifest);

            return {

                component: receipt.newComponents[0],
                resources: {
                    chess: receipt.newResources[0],
                    game_badge: receipt.newResources[2]
                }

            };

        } catch {

            return null;

        }
    }

};

export default component;