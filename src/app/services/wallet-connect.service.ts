import { Injectable } from '@angular/core';
import WalletConnect from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';

@Injectable({
    providedIn: 'root'
})
export class WalletConnectService {
    private connector: WalletConnect = new WalletConnect({
        bridge: 'https://bridge.walletconnect.org',
        qrcodeModal: QRCodeModal
    });

    public async connect(): Promise<void> {
        if (!this.connector.connected) {
            // create new session
            await this.connector.createSession();
        }

        this.connector.on('connect', (error, payload) => {
            if (error) {
                console.log(error.message);

                throw error;
            }

            // Get provided accounts and chainId
            const { accounts, chainId } = payload.params[0];
        });

        this.connector.on('disconnect', (error, payload) => {
            if (error) {
                console.log(error.message);

                throw error;
            }

            this.connector.killSession();
        });
    }
}
