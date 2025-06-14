import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebSocketService } from '../../services/websocket.service';
import { iBeacon } from '../../interfaces/beacon.interface';

// --- Interfaces (เหมือนเดิม) ---
interface BaseSymbol {
  id: number;
  x: number;
  y: number;
  name?: string;
  type: 'wifi' | 'ap';
}

interface WifiSymbol extends BaseSymbol {
  strength?: number;
  description?: string;
}

interface AccessPoint extends BaseSymbol {
  ap_mac: string;
}

interface EditableSymbol extends BaseSymbol {
  strength?: number;
  description?: string;
  ap_mac?: string;
}

interface BeaconReading {
  beacon: string;
  ap_mac: string;
  pw: number;
  rssi: number;
}

// Interface สำหรับข้อมูล Beacon ที่แสดงบนแผนที่
interface BeaconOnMapDisplay {
  beaconName: string;
  x: number;
  y: number;
  ap_mac: string;
  rssi: number;
  offsetId: number;
  // เพิ่มคุณสมบัติอื่น ๆ ของ Beacon ที่ต้องการแสดงใน popup
}

@Component({
  selector: 'app-floor-plan-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './floor-plan-editor3.component.html',
  styleUrls: ['./floor-plan-editor3.component.css']
})
export class FloorPlanEditor3Component implements OnInit, OnDestroy {
  @ViewChild('floorPlanContainer', { static: false }) floorPlanContainer!: ElementRef;

  floorPlanImage: string | ArrayBuffer | null = null;
  symbols: BaseSymbol[] = [];
  accessPoints: AccessPoint[] = [];
  beaconsOnMap: { beaconName: string; x: number; y: number; ap_mac: string; rssi: number; offsetId: number; }[] = []; // <--- เพิ่ม offsetId

  nextSymbolId: number = 1;

  isDragging: boolean = false;
  draggingSymbolIndex: number | null = null;
  offsetX: number = 0;
  offsetY: number = 0;

  showEditModal: boolean = false;
  currentEditingSymbol: EditableSymbol = { id: 0, x: 0, y: 0, type: 'wifi' };
  currentEditingSymbolIndex: number | null = null;

  beaconReadings: iBeacon[] = []

  // --- เพิ่มตัวแปรสำหรับ Beacon Popup ---
  showBeaconPopup: boolean = false;
  hoveredBeaconInfo: BeaconOnMapDisplay | null = null; // ข้อมูล Beacon ที่กำลังถูก Hover
  popupX: number = 0; // ตำแหน่ง X ของ Popup
  popupY: number = 0; // ตำแหน่ง Y ของ Popup

  // เพิ่ม URL ของ WebSocket Backend ของคุณ
  private WEBSOCKET_URL:string = 'ws://localhost:80/aruba'; 

  constructor(private webSocketService: WebSocketService) { }
  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    this.loadFloorPlanAndSymbols();
    // this.updateBeaconsOnMap();
    // --- เชื่อมต่อ WebSocket และ Subscribe เพื่อรับข้อมูล ---
    this.webSocketService.connect(this.WEBSOCKET_URL);
  }

  // --- (เมธอด onFileSelected, addSymbol, deleteSymbol, onDragStart, onDrag, onDragEnd, onDropSymbol, onMouseLeave, editSymbol, saveSymbolProperties, cancelEdit เหมือนเดิม) ---
  // --- การจัดการไฟล์รูปภาพ Floor Plan (เหมือนเดิม) ---
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        this.floorPlanImage = e.target?.result as string;
        this.saveFloorPlanAndSymbols();
        this.symbols = []; // ล้างสัญลักษณ์ทั้งหมดเมื่อเปลี่ยน Floor Plan ใหม่
        this.accessPoints = []; // ล้าง APs ด้วย
        this.beaconsOnMap = []; // ล้าง Beacon ด้วย
        this.nextSymbolId = 1;
      };

      reader.readAsDataURL(file);
    }
  }

  // --- การเพิ่มสัญลักษณ์ (ปรับปรุง) ---
  addSymbol(type: 'wifi' | 'ap'): void {
    if (!this.floorPlanImage) {
      alert('กรุณาเลือกรูป Floor Plan ก่อนเพิ่มสัญลักษณ์');
      return;
    }

    let newSymbol: WifiSymbol | AccessPoint;

    if (type === 'wifi') {
      newSymbol = {
        id: this.nextSymbolId++,
        x: 50,
        y: 50,
        name: 'Wifi ' + this.nextSymbolId,
        strength: 50,
        description: '',
        type: 'wifi',
        ap_mac: ''
      };
    } else { // type === 'ap'
      const apMac = prompt('โปรดป้อน MAC Address สำหรับ Access Point นี้:');
      if (!apMac) {
        return; // ผู้ใช้ยกเลิก
      }
      newSymbol = {
        id: this.nextSymbolId++,
        x: 100,
        y: 100,
        name: 'AP ' + apMac,
        ap_mac: apMac,
        type: 'ap'
      };
      this.accessPoints.push(newSymbol as AccessPoint); // เพิ่มเข้า array accessPoints
    }

    this.symbols.push(newSymbol);
    this.saveFloorPlanAndSymbols();
    this.updateBeaconsOnMap(); // อัปเดตตำแหน่ง Beacon เมื่อเพิ่ม AP ใหม่
  }

  
    // --- การลบสัญลักษณ์ (ปรับปรุง) ---
    deleteSymbol(index: number): void {
      if (confirm('คุณแน่ใจหรือไม่ที่จะลบสัญลักษณ์นี้?')) {
        const symbolToDelete = this.symbols[index];
        this.symbols.splice(index, 1); // ลบออกจาก array หลัก
  
        // ถ้าเป็น AP ให้ลบออกจาก accessPoints ด้วย
        if (symbolToDelete.type === 'ap') {
          this.accessPoints = this.accessPoints.filter(ap => ap.id !== symbolToDelete.id);
        }
  
        this.saveFloorPlanAndSymbols();
        this.updateBeaconsOnMap(); // อัปเดตตำแหน่ง Beacon เมื่อลบ AP
      }
    }
  
    // --- การลากสัญลักษณ์ (ปรับปรุง) ---
    onDragStart(index: number, event: MouseEvent): void {
      if (!this.floorPlanImage) return;
  
      const target = event.target as HTMLElement;
      if (target.closest('.delete-symbol-button') || target.closest('.symbol-icon')) { // เปลี่ยนชื่อ class
        return;
      }
  
      this.isDragging = true;
      this.draggingSymbolIndex = index;
  
      const symbolElement = (event.target as HTMLElement).closest('.symbol'); // เปลี่ยนชื่อ class
      if (symbolElement) {
        const rect = symbolElement.getBoundingClientRect();
        this.offsetX = event.clientX - rect.left;
        this.offsetY = event.clientY - rect.top;
      }
      event.preventDefault();
    }
  
    @HostListener('document:mousemove', ['$event'])
    onDrag(event: MouseEvent): void {
      if (!this.isDragging || this.draggingSymbolIndex === null || !this.floorPlanImage) {
        return;
      }
      if (!this.floorPlanContainer || !this.floorPlanContainer.nativeElement) {
        return;
      }
  
      const containerRect = this.floorPlanContainer.nativeElement.getBoundingClientRect();
      const currentSymbol = this.symbols[this.draggingSymbolIndex];
  
      let newX = event.clientX - containerRect.left - this.offsetX;
      let newY = event.clientY - containerRect.top - this.offsetY;
  
      const symbolWidth = 30;
      const symbolHeight = 30;
  
      newX = Math.max(0, Math.min(newX, containerRect.width - symbolWidth));
      newY = Math.max(0, Math.min(newY, containerRect.height - symbolHeight));
  
      currentSymbol.x = newX;
      currentSymbol.y = newY;
    }
  
    @HostListener('document:mouseup')
    onDragEnd(): void {
      if (this.isDragging) {
        this.isDragging = false;
        this.draggingSymbolIndex = null;
        this.saveFloorPlanAndSymbols();
        this.updateBeaconsOnMap(); // อัปเดตตำแหน่ง Beacon เมื่อย้าย AP
      }
    }
  
    onDropSymbol(event: MouseEvent): void {
      // Logic onDragEnd จะจัดการตรงนี้
    }
  
    onMouseLeave(): void {
      this.onDragEnd();
    }
  
    // --- การแก้ไขคุณสมบัติสัญลักษณ์ (ปรับปรุง) ---
    editSymbol(index: number, event: MouseEvent): void {
      if (this.isDragging || (event.target as HTMLElement).closest('.delete-symbol-button')) {
        return;
      }
  
      this.currentEditingSymbolIndex = index;
      this.currentEditingSymbol = { ...this.symbols[index] };
      this.showEditModal = true;
    }
  
    saveSymbolProperties(): void {
      if (this.currentEditingSymbolIndex !== null) {
        const updatedSymbol = { ...this.currentEditingSymbol };
        this.symbols[this.currentEditingSymbolIndex] = updatedSymbol;
  
        // ถ้าเป็น AP ให้อัปเดตใน accessPoints ด้วย
        if (updatedSymbol.type === 'ap') {
          const apIndex = this.accessPoints.findIndex(ap => ap.id === updatedSymbol.id);
          if (apIndex !== -1) {
            this.accessPoints[apIndex] = updatedSymbol as AccessPoint;
          }
        }
  
        this.saveFloorPlanAndSymbols();
        this.showEditModal = false;
        this.currentEditingSymbolIndex = null;
        this.updateBeaconsOnMap(); // อัปเดตตำแหน่ง Beacon หากมีการเปลี่ยน AP name/mac
      }
    }
  
    cancelEdit(): void {
      this.showEditModal = false;
      this.currentEditingSymbolIndex = null;
      this.currentEditingSymbol = { id: 0, x: 0, y: 0, type: 'wifi', ap_mac:'' };
    }
  
  // --- การบันทึกและโหลดข้อมูลทั้งหมด (Floor Plan และ Symbols) ---
  saveFloorPlanAndSymbols(): void {
    const dataToSave = {
      floorPlanImage: this.floorPlanImage,
      symbols: this.symbols // บันทึก symbols ทั้งหมด
    };
    localStorage.setItem('floorPlanData', JSON.stringify(dataToSave));
    console.log('Floor Plan Data saved:', dataToSave);
  }

  // --- เมธอดสำหรับจัดการ Beacon Hover/Popup ---
  onBeaconMouseEnter(beacon: BeaconOnMapDisplay, event: MouseEvent): void {
    this.showBeaconPopup = true;
    this.hoveredBeaconInfo = beacon; // เก็บข้อมูล Beacon ที่ถูก Hover
    
    // คำนวณตำแหน่ง Popup โดยอิงจากตำแหน่ง Beacon และเพิ่ม Offset
    // คุณอาจจะต้องปรับค่า offset เพื่อให้ popup อยู่ในตำแหน่งที่เหมาะสม
    this.popupX = beacon.x + 40; // ขยับไปทางขวา 40px
    this.popupY = beacon.y;     // ตำแหน่ง Y เดียวกับ Beacon

    // Optional: ถ้าอยากให้ popup ติดตามเมาส์
    // this.popupX = event.clientX - this.floorPlanContainer.nativeElement.getBoundingClientRect().left + 15;
    // this.popupY = event.clientY - this.floorPlanContainer.nativeElement.getBoundingClientRect().top + 15;
  }

  onBeaconMouseLeave(): void {
    this.showBeaconPopup = false;
    this.hoveredBeaconInfo = null; // ล้างข้อมูล
  }

  // --- ฟังก์ชันใหม่: อัปเดตตำแหน่ง Beacon บนแผนที่ (ปรับปรุง) ---
    // --- ฟังก์ชัน updateBeaconsOnMap (เหมือนเดิม แต่ใช้ BeaconOnMapDisplay Interface) ---
    updateBeaconsOnMap(): void {
      this.beaconsOnMap = [];
  
      const groupedBeacons = new Map<string, BeaconReading[]>();
      for (const reading of this.beaconReadings) {
        if (!groupedBeacons.has(reading.beacon)) {
          groupedBeacons.set(reading.beacon, []);
        }
        groupedBeacons.get(reading.beacon)?.push(reading);
      }
  
      const apBeaconCount = new Map<number, number>();
  
      groupedBeacons.forEach((readings, beaconName) => {
        let closestAP: AccessPoint | null = null;
        let highestRssi: number = -Infinity;
  
        for (const reading of readings) {
          const foundAp = this.accessPoints.find(ap => ap.ap_mac === reading.ap_mac);
  
          if (foundAp) {
            if (reading.rssi > highestRssi) {
              highestRssi = reading.rssi;
              closestAP = foundAp;
            }
          }
        }
  
        if (closestAP) {
          const currentCount = apBeaconCount.get(closestAP.id) || 0;
          apBeaconCount.set(closestAP.id, currentCount + 1);
  
          const offsetRadius = 30;
          const angleIncrement = (2 * Math.PI) / 8;
          const offsetIndex = currentCount;
          const angle = offsetIndex * angleIncrement;
  
          const offsetX = offsetRadius * Math.cos(angle);
          const offsetY = offsetRadius * Math.sin(angle);
  
          this.beaconsOnMap.push({
            beaconName: beaconName,
            x: closestAP.x + offsetX,
            y: closestAP.y + offsetY,
            ap_mac: closestAP.ap_mac,
            rssi: highestRssi,
            offsetId: currentCount
          });
        } else {
          console.warn(`Beacon ${beaconName} ไม่พบ AP ที่วางบนแผนที่`);
        }
      });
    }

  // --- (เมธอด saveFloorPlanAndSymbols, loadFloorPlanAndSymbols เหมือนเดิม) ---
  loadFloorPlanAndSymbols(): void {
    const storedData = localStorage.getItem('floorPlanData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      this.floorPlanImage = parsedData.floorPlanImage;
      this.symbols = parsedData.symbols || [];
      // แยก Access Points ออกมา
      this.accessPoints = this.symbols.filter(s => s.type === 'ap') as AccessPoint[];

      this.nextSymbolId = this.symbols.length > 0
        ? Math.max(...this.symbols.map(s => s.id)) + 1
        : 1;
    }
  }
}