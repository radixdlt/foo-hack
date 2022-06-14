import { ManifestBuilder } from 'pte-sdk';
import { signTransaction } from 'pte-browser-extension-sdk';
import config from '../config';

export default {

    component: {

        publish: async () => {

            // Load the wasm
            const response = await fetch(config.wasm_path);
            const wasm = new Uint8Array(await response.arrayBuffer());

            // Construct manifest
            const manifest = new ManifestBuilder()
                .publishPackage(wasm)
                .build()
                .toString();

            // Send manifest to extension for signing
            const receipt = await signTransaction(manifest);

            return {
                addresses: {
                    package: receipt.newPackages[0]
                }
            }

        },

        instantiate: async (address: string) => {

            const manifest = new ManifestBuilder()
                .callFunction(address, 'RadiChess', 'instantiate_radichess', ['Decimal("1.0")'])
                .build()
                .toString();

            // Send manifest to extension for signing
            const receipt = await signTransaction(manifest);

            return {
                addresses: {
                    component: receipt.newComponents[0],
                    resource: receipt.newResources[0]
                }
            };

        }

    }

};