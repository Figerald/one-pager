import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, lastValueFrom, Observable } from 'rxjs';
import { ApiResponse, WalletInformation } from './types/types';

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
        } catch (error) {
            console.log(error);
        }
    }

    public async updateAccountData(address: string): Promise<void> {
        const result: ApiResponse<WalletInformation> =
            await lastValueFrom(this.http.get<ApiResponse<WalletInformation>>(`https://api.alphahuntsman.com/token?address=${address}`));
        if (result && result.data) {
            this.alphaTokenDeposit.next(result.data);
        }
    }

    public async getAccountData(address: string): Promise<WalletInformation[]> {
        const result: ApiResponse<WalletInformation> = await lastValueFrom(this.http.get<ApiResponse<WalletInformation>>(`https://api.alphahuntsman.com/token?address=${address}`));

        return result.data;
    }
}
