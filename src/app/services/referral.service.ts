import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from "rxjs";
import { ApiResponse, ReferralData } from "./types/types";

@Injectable({
    providedIn: 'root'
})
export class ReferralService {
    public constructor(private readonly http: HttpClient) {
    }

    public async getReferredAddress(address: string): Promise<ReferralData | undefined> {
        const results: ApiResponse<ReferralData> = await lastValueFrom(this.http.get<ApiResponse<ReferralData>>(`https://api.alphahuntsman.com/token/referral?address=${address}`));
        if (results && results.data.length > 0) {
            return results.data[0];
        }

        return undefined;
    }

    public async saveReferAddress(address: string, referredAddress: string): Promise<void> {
        await lastValueFrom(this.http.post('https://api.alphahuntsman.com/token/referral', {address, referredAddress}));
    }

    public async updateReferralAddress(data: ReferralData): Promise<void> {
        await lastValueFrom(this.http.put('https://api.alphahuntsman.com/token/referral', { data }));
    }

    // private parseQueryParam(data: string[]): string {
    //     const encodedArray: string[] = data.map(value => encodeURI(value));
    // }
}
