import { DefaultApi, ManifestBuilder } from 'pte-sdk';
import { getAccountAddress, signTransaction } from 'pte-browser-extension-sdk';
import mappings from '../address-mappings';

const api = new DefaultApi();

function getBadgeFromBalances({ accountResources }) {

    const badge = accountResources.find(accountResource => {
        return accountResource.resourceAddress === mappings.player_badge;
    });

    return badge ?? null;

}

const account = {

    fetch: async () => {

        const accountAddress = await getAccountAddress();

        if (!accountAddress) {
            return null;
        }

        const accountBalances = await account.getBalance(accountAddress);
        const badge = getBadgeFromBalances({ accountResources: accountBalances.ownedResources });

        const userAccount = {
            address: accountAddress,
            balances: accountBalances,
            player_badge: badge
        };

        return userAccount;

    },

    getBalance: async (accountAddress) => {

        return await api.getComponent({
            address: accountAddress
        });

    },

    createBadge: async ({ accountAddress, nickname }) => {
   
        const manifest = new ManifestBuilder()
            .callMethod(mappings.component, 'register_player', [`"${nickname}"`, '1300u64'])
            .callMethodWithAllResources(accountAddress, 'deposit_batch')
            .build()
            .toString();

        console.log(manifest)

        const receipt = await signTransaction(manifest);

        console.log(JSON.stringify(receipt, null, 2));

    }

};

export default account;