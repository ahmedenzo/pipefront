import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Client, Message } from '@stomp/stompjs';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  private apiUrl = 'http://localhost:8080/api/otp'; 
  private apiUrl1 = 'http://localhost:8080/api/cardholders'; // For verifyCardholder
  private stompClient: Client;
  private verificationStatusSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {
    // Create STOMP client for WebSocket communication
    this.stompClient = new Client({
      brokerURL: 'ws://localhost:8080/ws', // WebSocket URL
      reconnectDelay: 5000, // Automatically attempt reconnect
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        // Subscribe to the topic once connected
        this.stompClient.subscribe('/topic/verification-status', (message: Message) => {
          const response = JSON.parse(message.body);
          this.verificationStatusSubject.next(response);
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      }
    });

    // Activate the STOMP client for WebSocket connection
    this.stompClient.activate();
  }

  /**
   * Verifies cardholder details and sends OTP.
   * This method only sends the request to initiate verification and waits for WebSocket updates for the actual status.
   *
   * @param cardNumber The card number of the user
   * @param nationalId The national ID of the user
   * @param gsm The phone number of the user
   * @param finalDate The expiration date of the card (MM/YY)
   * @returns Observable<any> - Response from the backend
   */
  verifyCardholder(cardNumber: string, nationalId: string, gsm: string, finalDate: string): Observable<any> {
    const url = `${this.apiUrl1}/verify`;
    const body = { cardNumber, nationalId, gsm, finalDate };

    // Send HTTP request to initiate cardholder verification
    return this.http.post(url, body, { responseType: 'text' })
      .pipe(
        catchError(this.handleError<any>('verifyCardholder'))
      );
  }

  /**
   * Get real-time verification status updates via WebSocket.
   * 
   * @returns Observable<any> - Real-time verification status updates
   */
  getVerificationStatusUpdates(): Observable<any> {
    return this.verificationStatusSubject.asObservable();
  }


  // Error handling (optional)

  /**
   * Validates the OTP entered by the user.
   *
   * @param phoneNumber The phone number of the user
   * @param otp The OTP entered by the user
   * @returns Observable<any> - Response from the backend
   */
  validateOtp(phoneNumber: string, otp: string): Observable<any> {
    const url = `${this.apiUrl}/validate`;
    const body = { phoneNumber, otp };

    return this.http.post(url, body, { responseType: 'text' })
      .pipe(
        catchError(this.handleError<any>('validateOtp'))
      );
  }

  /**
   * Handles HTTP operation errors.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */




private handleError<T>(operation = 'operation', result?: T) {
  return (error: any): Observable<T> => {
    console.error(`${operation} failed:`, error);
    return of(result as T);
  };
}
}