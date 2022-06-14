import { getAccountAddress } from 'pte-browser-extension-sdk';

export default {

    account: {

        fetch: async () => {

           return await getAccountAddress();

        }

    }

};