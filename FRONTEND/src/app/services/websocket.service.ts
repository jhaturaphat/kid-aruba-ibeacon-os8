// src/app/websocket.service.ts
import { Injectable } from '@angular/core';
import { Subject, Observable, Observer } from 'rxjs';
import { map } from 'rxjs/operators';

// Interface สำหรับข้อมูล Beacon ที่รับมาจาก WebSocket
interface BeaconReading {
  beacon: string;
  ap_mac: string;
  pw: number;
  rssi: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket!: WebSocket;
  private messagesSubject: Subject<any>; // Subject สำหรับส่งข้อความขาเข้า
  private connectionStatusSubject: Subject<boolean> = new Subject<boolean>(); // สถานะการเชื่อมต่อ

  public messages$: Observable<any>; // Observable ที่ Component จะ Subscribe
  public isConnected$: Observable<boolean> = this.connectionStatusSubject.asObservable();

  constructor() {
    this.messagesSubject = new Subject<any>();
    this.messages$ = this.messagesSubject.asObservable();
  }

  /**
   * เชื่อมต่อกับ WebSocket Server
   * @param url URL ของ WebSocket Server (เช่น 'ws://localhost:8080/ws')
   */
  public connect(url: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.warn('WebSocket is already connected.');
      return;
    }

    this.socket = new WebSocket(url);

    this.socket.onopen = (event) => {
      console.log('WebSocket connected:', event);
      this.connectionStatusSubject.next(true); // แจ้งว่าเชื่อมต่อแล้ว
      // อาจจะส่งข้อความเริ่มต้นเมื่อเชื่อมต่อสำเร็จ
      // this.sendMessage({ type: 'init', payload: 'get_initial_data' });
    };

    this.socket.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      try {
        const parsedData = JSON.parse(event.data);
        this.messagesSubject.next(parsedData); // ส่งข้อมูลที่ Parse แล้วไปยัง Subscriber
      } catch (e) {
        console.error('Failed to parse WebSocket message as JSON:', e, event.data);
        this.messagesSubject.next(event.data); // ส่งข้อมูลดิบหาก Parse ไม่ได้
      }
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket disconnected:', event);
      this.connectionStatusSubject.next(false); // แจ้งว่าตัดการเชื่อมต่อ
      // Optional: ลองเชื่อมต่อใหม่หลังจากนั้นไม่กี่วินาที
      // setTimeout(() => this.connect(url), 3000);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.connectionStatusSubject.next(false); // แจ้งว่ามีข้อผิดพลาด
      this.messagesSubject.error(error); // ส่ง Error ไปยัง Subscriber
    };
  }

  /**
   * ส่งข้อความไปยัง WebSocket Server
   * @param message ข้อมูลที่จะส่ง (จะถูกแปลงเป็น JSON string)
   */
  public sendMessage(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        const messageString = JSON.stringify(message);
        this.socket.send(messageString);
        console.log('WebSocket message sent:', messageString);
      } catch (e) {
        console.error('Failed to stringify message or send:', e, message);
      }
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  }

  /**
   * ตัดการเชื่อมต่อ WebSocket
   */
  public disconnect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
      console.log('WebSocket connection closed.');
    }
  }

  /**
   * รับข้อมูลที่คาดว่าจะถูกส่งมาจาก Backend
   * สมมุติว่า Backend ส่งเป็น Array ของ BeaconReading
   */
  public getBeaconReadings(): Observable<BeaconReading[]> {
    return this.messages$.pipe(
      map(data => {
        // ตรวจสอบว่าข้อมูลที่ได้รับมาเป็น Array ของ BeaconReading หรือไม่
        if (Array.isArray(data) && data.every(item => 'beacon' in item && 'ap_mac' in item && 'rssi' in item)) {
          return data as BeaconReading[];
        } else {
          console.warn('WebSocket message is not in expected BeaconReading[] format:', data);
          return []; // หรือส่ง Array ว่างไป หรือจัดการตาม logic ของคุณ
        }
      })
    );
  }
}