import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, lastValueFrom, Observable } from "rxjs";
import { ApiResponse, ReferralData } from "./types/types";

@Injectable({
    providedIn: 'root'
})
export class ReferralService {
    private referredAddresses: BehaviorSubject<{ referredAddress: string }[]> = new BehaviorSubject([] as { referredAddress: string }[]);
    public readonly getReferredAddresses: Observable<{ referredAddress: string }[]> = this.referredAddresses.asObservable();

    public constructor(private readonly http: HttpClient) {
    }

    public async getReferredAccountData(referredAddress: string): Promise<ReferralData | undefined> {
        const results: ApiResponse<ReferralData> = await lastValueFrom(this.http.get<ApiResponse<ReferralData>>(`https://api.alphahuntsman.com/token/referral?referredAddress=${referredAddress}`));
        if (results && results.data.length > 0) {
            return results.data[0];
        }

        return undefined;
    }

    // Return all referred addresses for account
    public async getReferredAddressesData(accountAddress: string): Promise<void> {
        const result: ApiResponse<{ referredAddress: string }> = await lastValueFrom(this.http.get<ApiResponse<{ referredAddress: string }>>(`https://api.alphahuntsman.com/token/referral?address=${accountAddress}`));
        if (result && result.data.length > 0) {
            return this.referredAddresses.next(result.data);
        }

        return this.referredAddresses.next([]);
    }

    public async saveReferAddress(data: ReferralData): Promise<void> {
        await lastValueFrom(this.http.post('https://api.alphahuntsman.com/token/referral', { data }));
    }

    public async updateReferData(data: ReferralData): Promise<void> {
        await lastValueFrom(this.http.put('https://api.alphahuntsman.com/token/referral', { data }));
    }
}
