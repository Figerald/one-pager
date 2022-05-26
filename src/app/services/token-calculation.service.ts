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

    public async getTokenPricingData(): Promise<ApiResponse<TokenPricingData>> {
        return await lastValueFrom(this.http.get<ApiResponse<TokenPricingData>>('https://api.alphahuntsman.com/token/pricing'));
    }

    public async calculatePrice(bnbAmount: number): Promise<number> {
        const pricing: TokenPricingData = await this.getTokenPricingData().then(result => result.data[0]);
        const priceToCalc: number = pricing.priceStart + (pricing.priceEnd - pricing.priceStart) * ((pricing.amountRaised + bnbAmount) / pricing.amountEnd);

        return priceToCalc;
    }

    public async updateTokenPrice(priceStart: number, amountRaised: number): Promise<void> {
        await lastValueFrom(this.http.put<ApiResponse<TokenPricingData>>('https://api.alphahuntsman.com/token/pricing', { priceStart, amountRaised }));
    }
}
