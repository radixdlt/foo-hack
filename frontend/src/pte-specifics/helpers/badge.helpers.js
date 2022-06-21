function parsePlayerId({ badge }) {

    return badge?.nonFungibleIds?.[0] ?? null;

}

function getBadgeFromResources({ accountResources, badgeMapping }) {

    if(!accountResources || !badgeMapping) {
        return null;
    }

    const badge = accountResources.find(accountResource => {
        return accountResource.resourceAddress === badgeMapping;
    });

    return badge ?? null;

}

export { parsePlayerId, getBadgeFromResources };