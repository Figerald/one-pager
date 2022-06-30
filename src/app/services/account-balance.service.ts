import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, lastValueFrom, Observable } from 'rxjs';
import { WalletInformation } from './types/types';

@Injectable({
    providedIn: 'root'
})
export class AccountBalanceService {
    private alphaTokenDeposit: BehaviorSubject<WalletInformation[]> = new BehaviorSubject([] as WalletInformation[]);
    public readonly getAlphaTokenDeposit: Observable<WalletInformation[]> = this.alphaTokenDeposit.asObservable();
    public constructor(private readonly http: HttpClient) {
    }

    public async saveAccountTokenData(address: string, alphaToken: number, price: number, bnbAmount: number, referredAddress?: string): Promise<void> {
        try {
            // Save: account address, BNB transferred amount
            await lastValueFrom(this.http.post<{ status: string }>('https://api.alphahuntsman.com/token', { address, alphaToken, referredAddress, price, bnbAmount }));
            await this.getAccountTokens(address);
        } catch (error) {
            console.log(error);
        }
    }

    // address - friend who referred another
    public async saveReferredBonusTokenData(address: string, referredAddress: string): Promise<void> {
        await lastValueFrom(this.http.post(`https://api.alphahuntsman.com/token?address=${address}&referredAddress=${referredAddress}`, {}));
    }

    public async getAccountTokens(address: string): Promise<void> {
        const result: { data: WalletInformation[], status: string } =
            await lastValueFrom(this.http.get<{ data: WalletInformation[], status: string }>(`https://api.alphahuntsman.com/token?address=${address}`));
        if (result && result.data) {
            this.alphaTokenDeposit.next(result.data);
        }
    }
}
