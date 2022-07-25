import { ManifestBuilder } from "pte-sdk";
import { signTransaction } from "pte-browser-extension-sdk";

const sc_package = {

    publish: async ({ localWasmPath = null }) => {

        if (!localWasmPath) {
            return null;
        }

        try {

            // Load the wasm
            const response = await fetch(localWasmPath);

            const wasm = new Uint8Array(await response.arrayBuffer());

            // Construct manifest
            const manifest = new ManifestBuilder()
                .publishPackage(wasm)
                .build()
                .toString();

            // Send manifest to extension for signing
            const receipt = await signTransaction(manifest);

            return {
                address: receipt.newPackages[0]
            };

        } catch {

            return null;

        }

    }

};

export default sc_package;