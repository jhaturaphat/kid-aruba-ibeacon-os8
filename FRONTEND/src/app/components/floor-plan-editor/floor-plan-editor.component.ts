import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface WifiSymbol {
  id: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-floor-plan-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floor-plan-editor.component.html',
  styleUrls: ['./floor-plan-editor.component.css']
})
export class FloorPlanEditorComponent implements OnInit, OnDestroy {
  @ViewChild('floorPlanContainer', { static: false }) floorPlanContainer!: ElementRef; // <--- เปลี่ยน static เป็น false
                                                                                    // เพราะอาจจะยังไม่มี container ในตอนเริ่มต้น

  floorPlanImage: string | ArrayBuffer | null = null; // <--- เปลี่ยน type ให้รองรับ Data URL
  wifiSymbols: WifiSymbol[] = [];
  nextWifiId: number = 1;

  isDragging: boolean = false;
  draggingSymbolIndex: number | null = null;
  offsetX: number = 0;
  offsetY: number = 0;

  constructor() { }
  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
    // อาจจะบันทึกข้อมูลเมื่อ Component ถูกทำลาย (กรณีที่ต้องการบันทึกอัตโนมัติ)
    // this.saveWifiSymbols();
  }

  ngOnInit(): void {
    // โหลดข้อมูลรูปภาพ Floor Plan และสัญลักษณ์ Wifi ที่บันทึกไว้
    this.loadFloorPlanAndWifiSymbols();
  }

  // --- การจัดการไฟล์รูปภาพ Floor Plan ---
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        // เมื่ออ่านไฟล์เสร็จ จะได้ Data URL (base64 encoded string)
        this.floorPlanImage = e.target?.result as string;
        this.saveFloorPlanAndWifiSymbols(); // บันทึกรูปภาพที่เลือก
        this.wifiSymbols = []; // ล้างสัญลักษณ์ Wifi เดิมเมื่อเปลี่ยน Floor Plan ใหม่
        this.nextWifiId = 1; // รีเซ็ต ID
      };

      reader.readAsDataURL(file); // อ่านไฟล์เป็น Data URL
    }
  }

  // --- การเพิ่มสัญลักษณ์ Wifi ---
  addWifiSymbol(): void {
    if (!this.floorPlanImage) {
      alert('กรุณาเลือกรูป Floor Plan ก่อนเพิ่มสัญลักษณ์ Wifi');
      return;
    }

    const newSymbol: WifiSymbol = {
      id: this.nextWifiId++,
      x: 50,
      y: 50
    };
    this.wifiSymbols.push(newSymbol);
    this.saveFloorPlanAndWifiSymbols();
  }

  // --- การลากสัญลักษณ์ Wifi ---
  onDragStart(index: number, event: MouseEvent): void {
    if (!this.floorPlanImage) return; // ไม่ให้ลากถ้าไม่มีรูป

    this.isDragging = true;
    this.draggingSymbolIndex = index;

    const symbolElement = (event.target as HTMLElement).closest('.wifi-symbol');
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

    // ตรวจสอบว่า floorPlanContainer.nativeElement ไม่เป็น undefined
    if (!this.floorPlanContainer || !this.floorPlanContainer.nativeElement) {
      return;
    }

    const containerRect = this.floorPlanContainer.nativeElement.getBoundingClientRect();
    const currentSymbol = this.wifiSymbols[this.draggingSymbolIndex];

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
      this.saveFloorPlanAndWifiSymbols();
    }
  }

  onDropWifi(event: MouseEvent): void {
    // Logic onDragEnd จะจัดการตรงนี้
  }

  onMouseLeave(): void {
    this.onDragEnd();
  }

  // --- การบันทึกและโหลดข้อมูลทั้งหมด (Floor Plan และ Wifi Symbols) ---
  saveFloorPlanAndWifiSymbols(): void {
    const dataToSave = {
      floorPlanImage: this.floorPlanImage,
      wifiSymbols: this.wifiSymbols
    };
    localStorage.setItem('floorPlanData', JSON.stringify(dataToSave));
    console.log('Floor Plan Data saved:', dataToSave);
  }

  loadFloorPlanAndWifiSymbols(): void {
    const storedData = localStorage.getItem('floorPlanData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      this.floorPlanImage = parsedData.floorPlanImage;
      this.wifiSymbols = parsedData.wifiSymbols || [];
      // กำหนด nextWifiId ให้ถูกต้องหลังจากโหลด
      this.nextWifiId = this.wifiSymbols.length > 0
        ? Math.max(...this.wifiSymbols.map(s => s.id)) + 1
        : 1;
    }
  }
}