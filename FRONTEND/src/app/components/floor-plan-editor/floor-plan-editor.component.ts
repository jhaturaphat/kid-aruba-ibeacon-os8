import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// --- Interfaces ใหม่/ปรับปรุง ---
interface WifiSymbol { // อันนี้คือสัญลักษณ์ Wifi เดิม อาจจะเปลี่ยนชื่อเป็น SensorSymbol หรือ DeviceSymbol
  id: number;
  x: number;
  y: number;
  name?: string;
  strength?: number;
  description?: string;
  type: 'wifi' | 'ap'; // <--- เพิ่ม type เพื่อแยกประเภทสัญลักษณ์
  ap_mac:string;
}

interface AccessPoint extends WifiSymbol { // APs จะมีคุณสมบัติเพิ่มเติม
  ap_mac: string; // MAC Address ของ Access Point
}

interface BeaconReading { // ข้อมูล Beacon ที่ได้รับจากฐานข้อมูล
  beacon: string; // ชื่อ Beacon เช่น iBeacon-A
  ap_mac: string; // MAC Address ของ Access Point ที่รับสัญญาณ
  pw: number;     // Power (อาจจะเป็นค่า TxPower หรืออื่นๆ ที่ใช้ในการคำนวณระยะห่าง)
  rssi: number;   // RSSI (ยิ่งใกล้ 0 ยิ่งดี)
}

// --- Component หลัก ---
@Component({
  selector: 'app-floor-plan-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './floor-plan-editor.component.html',
  styleUrls: ['./floor-plan-editor.component.css']
})
export class FloorPlanEditorComponent implements OnInit, OnDestroy {
  @ViewChild('floorPlanContainer', { static: false }) floorPlanContainer!: ElementRef;

  floorPlanImage: string | ArrayBuffer | null = null;
  symbols: WifiSymbol[] = []; // <--- เปลี่ยนชื่อเป็น symbols เพื่อเก็บทั้ง Wifi และ AP
  accessPoints: AccessPoint[] = []; // <--- เก็บเฉพาะ Access Point ที่ผู้ใช้วางไว้
  beaconsOnMap: { beaconName: string; x: number; y: number; ap_mac: string; rssi: number; }[] = []; // <--- Beacon ที่จะแสดงบนแผนที่

  nextSymbolId: number = 1; // ใช้สำหรับ ID ของสัญลักษณ์ทั้งหมด

  isDragging: boolean = false;
  draggingSymbolIndex: number | null = null;
  offsetX: number = 0;
  offsetY: number = 0;

  showEditModal: boolean = false;
  currentEditingSymbol: WifiSymbol = { id: 0, x: 0, y: 0, type: 'wifi', ap_mac:'' }; // สัญลักษณ์ที่กำลังถูกแก้ไข
  currentEditingSymbolIndex: number | null = null;

  // --- ข้อมูล Beacon Readings (สมมุติว่าเป็นข้อมูลจากฐานข้อมูล) ---
  beaconReadings: BeaconReading[] = [
    { beacon: 'iBeacon-A', ap_mac: 'AP-MAC-1', pw: 20, rssi: -50 },
    { beacon: 'iBeacon-A', ap_mac: 'AP-MAC-2', pw: 20, rssi: -80 },
    { beacon: 'iBeacon-B', ap_mac: 'AP-MAC-1', pw: 40, rssi: -80 },
    { beacon: 'iBeacon-B', ap_mac: 'AP-MAC-2', pw: 60, rssi: -55 }, // ให้ B ใกล้ AP-MAC-2 มากกว่า
    { beacon: 'iBeacon-C', ap_mac: 'AP-MAC-1', pw: 30, rssi: -60 },
    { beacon: 'iBeacon-C', ap_mac: 'AP-MAC-3', pw: 30, rssi: -50 } // AP-MAC-3 ยังไม่มีบนแผนที่
  ];


  constructor() { }
  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    this.loadFloorPlanAndSymbols();
    this.updateBeaconsOnMap(); // อัปเดตตำแหน่ง Beacon เมื่อโหลดหน้า
  }

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


  // --- ฟังก์ชันใหม่: อัปเดตตำแหน่ง Beacon บนแผนที่ ---
  updateBeaconsOnMap(): void {
    this.beaconsOnMap = []; // ล้างข้อมูล Beacon เดิม

    // Group beacon readings by beacon name
    const groupedBeacons = new Map<string, BeaconReading[]>();
    for (const reading of this.beaconReadings) {
      if (!groupedBeacons.has(reading.beacon)) {
        groupedBeacons.set(reading.beacon, []);
      }
      groupedBeacons.get(reading.beacon)?.push(reading);
    }

    groupedBeacons.forEach((readings, beaconName) => {
      let closestAP: AccessPoint | null = null;
      let highestRssi: number = -Infinity; // RSSI ที่ดีที่สุด (ใกล้ 0 ที่สุด)

      for (const reading of readings) {
        // หา AP ที่ตรงกับ ap_mac ใน reading
        const foundAp = this.accessPoints.find(ap => ap.ap_mac === reading.ap_mac);

        if (foundAp) {
          // ถ้า RSSI ของ reading นี้ดีกว่า (น้อยกว่าในค่าลบ หรือเป็นบวกมากกว่า)
          if (reading.rssi > highestRssi) {
            highestRssi = reading.rssi;
            closestAP = foundAp;
          }
        }
      }

      // ถ้าเจอ AP ที่ใกล้ที่สุดสำหรับ Beacon นี้ ให้แสดงบนแผนที่
      if (closestAP) {
        this.beaconsOnMap.push({
          beaconName: beaconName,
          x: closestAP.x,
          y: closestAP.y,
          ap_mac: closestAP.ap_mac,
          rssi: highestRssi
        });
      } else {
        console.warn(`Beacon ${beaconName} ไม่พบ AP ที่วางบนแผนที่`);
        // อาจจะแสดงเป็นสัญลักษณ์ 'Beacon ไม่ระบุตำแหน่ง' ที่มุมใดมุมหนึ่ง หรือแจ้งเตือน
      }
    });
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