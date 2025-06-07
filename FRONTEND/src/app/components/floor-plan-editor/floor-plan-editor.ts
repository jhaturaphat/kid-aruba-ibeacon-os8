import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';


interface WifiSymbol {
  id: number;
  x: number; // ตำแหน่ง x
  y: number; // ตำแหน่ง y
}

@Component({
  selector: 'app-floor-plan-editor',
  standalone: true, 
  imports: [CommonModule],
  templateUrl: './floor-plan-editor.html',
  styleUrls: ['./floor-plan-editor.css']
})
export class FloorPlanEditorComponent implements OnInit, OnDestroy {
  @ViewChild('floorPlanContainer', { static: true }) floorPlanContainer!: ElementRef;

  floorPlanImage: string = 'https://waz.smartdraw.com/floor-plan/img/floorplan.png?bn=15100111939'; // Path ไปยังรูป Floor Plan ของคุณ
  wifiSymbols: WifiSymbol[] = [];
  nextWifiId: number = 1;

  // สำหรับการลาก
  isDragging: boolean = false;
  draggingSymbolIndex: number | null = null;
  offsetX: number = 0; // ตำแหน่งเริ่มต้นของเมาส์สัมพันธ์กับขอบของสัญลักษณ์
  offsetY: number = 0;

  constructor() { }

  ngOnInit(): void {
    // โหลดข้อมูลสัญลักษณ์ Wifi ที่บันทึกไว้ (ถ้ามี)
    this.loadWifiSymbols();
  }

  ngOnDestroy(): void {
    // อาจจะบันทึกข้อมูลเมื่อ Component ถูกทำลาย (กรณีที่ต้องการบันทึกอัตโนมัติ)
    // this.saveWifiSymbols();
  }

  // --- การเพิ่มสัญลักษณ์ Wifi ---
  addWifiSymbol(): void {
    // เพิ่มสัญลักษณ์ Wifi ที่ตำแหน่งเริ่มต้น (เช่น กลางหน้าจอ หรือ 0,0)
    const newSymbol: WifiSymbol = {
      id: this.nextWifiId++,
      x: 50, // ตำแหน่งเริ่มต้น
      y: 50
    };
    this.wifiSymbols.push(newSymbol);
    this.saveWifiSymbols(); // บันทึกข้อมูล
  }

  // --- การลากสัญลักษณ์ Wifi ---
  onDragStart(index: number, event: MouseEvent): void {
    this.isDragging = true;
    this.draggingSymbolIndex = index;

    const symbolElement = (event.target as HTMLElement).closest('.wifi-symbol');
    if (symbolElement) {
      const rect = symbolElement.getBoundingClientRect();
      // คำนวณ offset จากตำแหน่งเมาส์ถึงมุมซ้ายบนของสัญลักษณ์
      this.offsetX = event.clientX - rect.left;
      this.offsetY = event.clientY - rect.top;
    }

    event.preventDefault(); // ป้องกันการเลือกข้อความหรือรูปภาพ
  }

  @HostListener('document:mousemove', ['$event'])
  onDrag(event: MouseEvent): void {
    if (!this.isDragging || this.draggingSymbolIndex === null) {
      return;
    }

    const containerRect = this.floorPlanContainer.nativeElement.getBoundingClientRect();
    const currentSymbol = this.wifiSymbols[this.draggingSymbolIndex];

    let newX = event.clientX - containerRect.left - this.offsetX;
    let newY = event.clientY - containerRect.top - this.offsetY;

    // Optional: จำกัดการลากให้อยู่ภายใน container
    const symbolWidth = 30; // ประมาณขนาดความกว้างของสัญลักษณ์ Wifi
    const symbolHeight = 30; // ประมาณขนาดความสูงของสัญลักษณ์ Wifi

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
      this.saveWifiSymbols(); // บันทึกข้อมูลหลังจากลากเสร็จ
    }
  }

  onDropWifi(event: MouseEvent): void {
    // กรณีที่ลากสัญลักษณ์แล้วปล่อยนอกพื้นที่สัญลักษณ์นั้นๆ แต่ยังอยู่ใน container
    if (this.isDragging && this.draggingSymbolIndex !== null) {
      // Logic onDragEnd จะจัดการตรงนี้
      // ไม่จำเป็นต้องทำอะไรเพิ่มเติม เพราะ onDragEnd จะถูกเรียกเมื่อ mouseup บน document
    }
  }

  onMouseLeave(): void {
    // กรณีที่เมาส์ออกจาก container ในขณะที่กำลังลาก
    this.onDragEnd();
  }

  // --- การบันทึกและโหลดข้อมูล ---
  saveWifiSymbols(): void {
    localStorage.setItem('wifiSymbols', JSON.stringify(this.wifiSymbols));
    console.log('Wifi Symbols saved:', this.wifiSymbols);
  }

  loadWifiSymbols(): void {
    const storedSymbols = localStorage.getItem('wifiSymbols');
    if (storedSymbols) {
      this.wifiSymbols = JSON.parse(storedSymbols);
      // กำหนด nextWifiId ให้ถูกต้องหลังจากโหลด
      this.nextWifiId = this.wifiSymbols.length > 0
        ? Math.max(...this.wifiSymbols.map(s => s.id)) + 1
        : 1;
    }
  }
}