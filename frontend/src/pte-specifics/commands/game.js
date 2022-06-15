import { ManifestBuilder } from 'pte-sdk';
import { signTransaction } from 'pte-browser-extension-sdk';
import mappings from '../address-mappings';

const game = {

    create: async () => {

        const manifest = new ManifestBuilder()
            .createProofFromAccountByAmount(mappings.userAccount.address, '1', mappings.player_badge)
            .popFromAuthZone('proof1')
            .callMethod(mappings.component, 'start_game', ['Proof("proof1")', '1300u64'])
            .build()
            .toString();

        console.log(manifest)

        const receipt = await signTransaction(manifest);

        console.log(JSON.stringify(receipt, null, 2));

    }

};

export default game;