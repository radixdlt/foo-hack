import { ManifestBuilder } from 'pte-sdk';
import { signTransaction } from 'pte-browser-extension-sdk';
import config from '../config';

const sc_package = {

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

        console.log(receipt)

        return {
            address: receipt.newPackages[0]
        };

    }



};

export default sc_package;