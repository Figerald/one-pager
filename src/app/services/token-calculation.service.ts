import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from "rxjs";
import { ApiResponse, TokenPricingData } from "./types/types";

@Injectable({
    providedIn: 'root'
})
export class TokenCalculationService {
    public constructor(private readonly http: HttpClient) {
    }

    public async getProgressNumber(): Promise<number> {
        const pricing = await this.getTokenPricingData().then(result => result.data[0]);

        return pricing.progressRaised;
    }

    public async calculatePrice(bnbAmount: number): Promise<number> {
        const pricing: TokenPricingData = await this.getTokenPricingData().then(result => result.data[0]);
        const priceToCalc: number = Math.round((pricing.priceStart + (pricing.priceEnd - pricing.priceStart) * ((pricing.amountRaised + bnbAmount) / pricing.amountEnd)) * 10000) / 10000;

        return priceToCalc;
    }

    public async calculateProgress(bnbAmount: number): Promise<number> {
        const pricing: TokenPricingData = await this.getTokenPricingData().then(result => result.data[0]);
        const progressToCalc: number = pricing.progressRaised + (pricing.progressEnd - pricing.progressStart) * ((pricing.amountRaised + bnbAmount) / pricing.amountEnd);

        return progressToCalc;
    }

    public async updateTokenPrice(progressRaised: number, amountRaised: number): Promise<void> {
        await lastValueFrom(this.http.put<ApiResponse<TokenPricingData>>('https://api.alphahuntsman.com/token/pricing', { progressRaised, amountRaised }));
    }

    public async getReferralPrice(address: string, referredAddress: string): Promise<number> {
        const price: ApiResponse<{ price: number }> =
            await lastValueFrom(this.http.get<ApiResponse<{ price: number }>>(`https://api.alphahuntsman.com/token?address=${address}&referredAddress=${referredAddress}`));

        return price.data[0].price;
    }

    private async getTokenPricingData(): Promise<ApiResponse<TokenPricingData>> {
        return await lastValueFrom(this.http.get<ApiResponse<TokenPricingData>>('https://api.alphahuntsman.com/token/pricing'));
    }
}
