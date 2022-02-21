import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SubscriberService {
    public constructor(private readonly http: HttpClient) {
    }

    public async postSubscriber(email: string): Promise<{status: string}> {
        const postObservable$: Observable<{status: string}> = this.http.post<{status: string}>('https://api.alphahuntsman.com/subscribers', {email});

        return await firstValueFrom(postObservable$);
    }
}
