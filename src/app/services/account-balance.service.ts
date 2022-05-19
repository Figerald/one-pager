import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, lastValueFrom, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AccountBalanceService {
    private alphaTokenDeposit: BehaviorSubject<number> = new BehaviorSubject(0);
    public readonly getAlphaTokenDeposit: Observable<number> = this.alphaTokenDeposit.asObservable();
    public constructor(private readonly http: HttpClient) {
    }

    public async saveAccountTokenData(address: string, alphaToken: number): Promise<void> {
        try {
            // Save: account address, BNB transferred amount
            await lastValueFrom(this.http.post<{ status: string }>('https://api.alphahuntsman.com/token', { address, alphaToken }));
            await this.getAccountTokens(address);
        } catch (error) {
            console.log(error);
        }
    }

    public async getAccountTokens(address: string): Promise<number | undefined> {
        const result: { data: any, status: string } = await lastValueFrom(this.http.get<{ data: any, status: string }>(`https://api.alphahuntsman.com/token?address=${address}`));
        if (result && result.data) {
            this.alphaTokenDeposit.next(result.data.alphaToken);
    
            return result.data.alphaToken;
        }

        return;
    }
}
