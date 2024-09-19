import { Injectable } from '@angular/core';
import CryptoJS from 'crypto-js';

@Injectable({

  providedIn: 'root'

})

export class EncryptionService {

    private key = "ForemeroCoditionalSecutity";

  encryptData(data: string): string {

    const encrypted = CryptoJS.AES.encrypt(data, this.key).toString();
    return this.urlSafeBase64Encode(encrypted);

  }

  decryptData(data: string): string {

    const decodedData = this.urlSafeBase64Decode(data);
    const bytes = CryptoJS.AES.decrypt(decodedData, this.key);
    return bytes.toString(CryptoJS.enc.Utf8);

  }

  private urlSafeBase64Encode(data: string): string {
    return data.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  private urlSafeBase64Decode(data: string): string {
    let encoded = data.replace(/-/g, '+').replace(/_/g, '/');
    while (encoded.length % 4) {
      encoded += '=';
    }
    return encoded;
  }

}
