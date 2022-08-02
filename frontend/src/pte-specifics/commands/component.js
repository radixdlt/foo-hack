import { ManifestBuilder } from "pte-sdk";
import { signTransaction } from "pte-browser-extension-sdk";

const component = {

    instantiate: async (componentName, { chessPackageAddress, auctionPackageAddress }) => {

        if (!chessPackageAddress || !auctionPackageAddress) {

            return null;

        }

        try {
            
            const manifest = new ManifestBuilder()
                .callFunction(chessPackageAddress, componentName, 'create', [`"${auctionPackageAddress}"`])
                .build()
                .toString();

            // Send manifest to extension for signing
            const receipt = await signTransaction(manifest);

            return {

                component: receipt.newComponents[0],
                resources: {
                    chess: receipt.newResources[0],
                    game_badge: receipt.newResources[2],
                    auction: receipt.newResources[3]
                }

            };

        } catch {

            return null;

        }
    }

};

export default component;