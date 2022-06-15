import { getAccountAddress } from 'pte-browser-extension-sdk';

const account = {

    fetch: async () => {

        const accountAddress = await getAccountAddress();

        return {
            address: accountAddress
        };

    }

};

export default account;