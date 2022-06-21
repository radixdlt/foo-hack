import { DefaultApi, ManifestBuilder } from 'pte-sdk';
import { getAccountAddress, signTransaction } from 'pte-browser-extension-sdk';
import mappings from '../address-mappings';
import { getBadgeFromResources, parsePlayerId } from '../helpers/badge.helpers';

const api = new DefaultApi();

const account = {

    fetch: async () => {

        const accountAddress = await getAccountAddress();

        if (!accountAddress) {
            return null;
        }

        const accountResources = await account.getBalance(accountAddress);

        if (!accountResources) {
            return null;
        }

        const badge = getBadgeFromResources({
            accountResources: accountResources?.ownedResources,
            badgeMapping: mappings?.player_badge
        });

        if (!badge) {
            return null;
        }

        return {
            address: accountAddress,
            balances: accountResources,
            player_id: parsePlayerId({ badge })
        };

    },

    getBalance: async (accountAddress) => {

        try {

            return await api.getComponent({
                address: accountAddress
            });

        } catch {

            return null;

        }

    },

    createBadge: async ({ accountAddress, nickname }) => {

        try {

            const manifest = new ManifestBuilder()
                .callMethod(mappings.component, 'register_player', [`"${nickname}"`, 'Decimal("1300")'])
                .callMethodWithAllResources(accountAddress, 'deposit_batch')
                .build()
                .toString();

            return await signTransaction(manifest);

        } catch {

            return null;

        }

    }

};

export default account;