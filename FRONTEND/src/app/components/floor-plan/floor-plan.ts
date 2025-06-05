import { Component, OnInit } from '@angular/core';
import { WebSocketService } from '../../services/web-socket-service';

interface AccessPoint {
  id: string;
  name: string;
  x: number; // ตำแหน่ง X บน floor plan (พิกเซล)
  y: number; // ตำแหน่ง Y บน floor plan (พิกเซล)
}

interface Asset {
  mac: string;
  name: string;
  rssiValues: {
    [apId: string]: number; // เก็บค่า RSSI จากแต่ละ AP
  };
  x?: number; // ตำแหน่งที่คำนวณได้
  y?: number; // ตำแหน่งที่คำนวณได้
  closestAp?: string; // ID ของ AP ที่ใกล้ที่สุด
}


@Component({
  selector: 'app-floor-plan',
  imports: [],
  templateUrl: './floor-plan.html',
  styleUrl: './floor-plan.css'
})
export class FloorPlan implements OnInit{
  assets: Asset[] = [];
  aps: AccessPoint[] = [
    { id: 'ap1', name: 'AP ทางเดิน 1', x: 100, y: 200 },
    { id: 'ap2', name: 'AP ทางเดิน 2', x: 300, y: 200 },
    { id: 'ap3', name: 'AP ทางเดิน 3', x: 500, y: 200 }
  ];
  floorPlanImage = 'https://harrcreative.com/wp-content/uploads/2020/02/Floor-Plan.jpg';

  constructor(private websocketService: WebSocketService) {}

  ngOnInit() {
    this.websocketService.getMessages().subscribe((data: any) => {
      this.updateAssetPosition(data);
    });
  }

  updateAssetPosition(data: any) {
    // ค้นหา asset ใน array
    let asset = this.assets.find(a => a.mac === data.mac);
    
    if (!asset) {
      asset = {
        mac: data.mac,
        name: data.name || `Asset ${this.assets.length + 1}`,
        rssiValues: {}
      };
      this.assets.push(asset);
    }

    // อัพเดทค่า RSSI
    asset.rssiValues[data.apId] = data.rssi;

    // หา AP ที่มีค่า RSSI สูงสุด
    let maxRssi = -Infinity;
    let closestApId = '';
    
    for (const [apId, rssi] of Object.entries(asset.rssiValues)) {
      if (rssi > maxRssi) {
        maxRssi = rssi as number;
        closestApId = apId;
      }
    }

    if (closestApId) {
      asset.closestAp = closestApId;
      const closestAp = this.aps.find(ap => ap.id === closestApId);
      if (closestAp) {
        // กำหนดให้ asset อยู่ที่ตำแหน่ง AP บวกกับ offset นิดหน่อยเพื่อไม่ให้ทับกัน
        asset.x = closestAp.x + (Math.random() * 40 - 20); // สุ่มตำแหน่งใกล้ๆ AP
        asset.y = closestAp.y + (Math.random() * 40 - 20);
      }
    }
  }
}
