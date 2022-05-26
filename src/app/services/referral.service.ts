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

    public async getReferredAddress(address: string): Promise<ReferralData> {
        const results: ApiResponse<ReferralData> = await lastValueFrom(this.http.get<ApiResponse<ReferralData>>(`https://api.alphahuntsman.com/token/referral?address=${address}`));

        return results.data[0];
    }

    public async saveReferAddress(address: string): Promise<void> {
        await lastValueFrom(this.http.post('https://api.alphahuntsman.com/token/referral', {address}));
    }
}
