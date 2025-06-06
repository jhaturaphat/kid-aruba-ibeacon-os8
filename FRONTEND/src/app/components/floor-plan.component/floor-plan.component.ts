import { Component } from '@angular/core';
import { CdkDragEnd, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-floor-plan.component',
  imports: [CommonModule, DragDropModule ],
  templateUrl: './floor-plan.component.html',
  styleUrl: './floor-plan.component.css'
})
export class FloorPlanComponent {
  floorPlanImage: string | ArrayBuffer | null = 'default-placeholder.png';
  accessPoints: any[] = []; // ควรสร้าง Interface สำหรับ AP จะดีมาก

  onFileSelected(event: any):void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.floorPlanImage = reader.result;
      };
    }
  }

  addAp(): void {
    // อาจจะมี popup ให้ใส่ MAC Address หรือชื่อ AP
    const newAp = { name: 'AP-' + (this.accessPoints.length + 1), x: 0, y: 0 };
    this.accessPoints.push(newAp);
  }

  onDragEnded(event: CdkDragEnd, index: number): void {
    const position = event.source.getFreeDragPosition(); // ได้ตำแหน่ง {x, y}
    this.accessPoints[index].x = position.x;
    this.accessPoints[index].y = position.y;
    console.log(`AP ${this.accessPoints[index].name} ถูกวางที่`, position);
  }
}
