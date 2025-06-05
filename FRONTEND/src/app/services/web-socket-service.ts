import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$: WebSocketSubject<any>;

  constructor() {
    this.socket$ = webSocket('ws://your-server-address');
  }

  // ต้อง return เป็น Observable
  getMessages(): Observable<any> {
    return this.socket$.asObservable();
  }

  sendMessage(msg: any): void {
    this.socket$.next(msg);
  }
}