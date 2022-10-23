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

    public async calculatePrice(): Promise<number> {
        const pricing: TokenPricingData = await this.getTokenPricingData().then(result => result.data[0]);
        const priceToCalc: number = Math
            .round((pricing.priceStart + (pricing.priceEnd - pricing.priceStart) * ((pricing.amountRaised - pricing.amountStart) / (pricing.amountEnd - pricing.amountStart))) * 100) / 100;

        return priceToCalc;
    }

    public async calculateProgress(alphaTokenAmount: number): Promise<number> {
        const pricing: TokenPricingData = await this.getTokenPricingData().then(result => result.data[0]);
        const amountRaised: number = alphaTokenAmount + pricing.amountRaised;
        const progressToCalc: number = pricing.progressStart + ((pricing.progressEnd - pricing.progressStart) * ((amountRaised - pricing.amountStart) / (pricing.amountEnd - pricing.amountStart)));

        return progressToCalc;
    }

    // public async updateTokenPrice(progressRaised: number, amountRaised: number): Promise<void> {
    //     await lastValueFrom(this.http.put<ApiResponse<TokenPricingData>>('https://api.alphahuntsman.com/token/pricing', { progressRaised, amountRaised }));
    // }

    public async updateTokenPrice(amountRaised: number): Promise<void> {
        await lastValueFrom(this.http.put<ApiResponse<TokenPricingData>>('https://api.alphahuntsman.com/token/pricing', { amountRaised }));
    }

    private async getTokenPricingData(): Promise<ApiResponse<TokenPricingData>> {
        return await lastValueFrom(this.http.get<ApiResponse<TokenPricingData>>('https://api.alphahuntsman.com/token/pricing'));
    }
}
