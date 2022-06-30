export type ResultTypes = 
    undefined |
    'METAMASK-MISSING' |
    'METAMASK-NOT-CONNECTED' |
    'NOT-BINANCE-NETWORK' |
    'TRANSACTION-FAILED' |
    'TRANSACTION-COMPLETED' |
    'METAMASK-PENDING-CONNECTION' |
    'ETHEREUM-NOT-FOUND' |
    'USER-REFUSED-CONNECTION' |
    'ACCOUNT-CHANGED' |
    'error' |
    'success';
    
export type ApiResponse<T> = {
    status: string,
    data: T[]
};

export type TokenPricingData = {
    name: string,
    amountRaised: number,
    amountEnd: number,
    priceStart: number,
    priceEnd: number,
    progressStart: number,
    progressEnd: number,
    progressRaised: number
};

export type ReferralData = {
    address: string,
    referredAddress: string,
    isReferComplete: boolean
}

export type WalletInformation = {
    alphaToken: number,
    price: number,
    referredAddress: string,
    created_at: Date
}
