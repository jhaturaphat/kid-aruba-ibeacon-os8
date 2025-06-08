import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FloorPlanEditorComponent } from './components/floor-plan-editor/floor-plan-editor.component';

@Component({
  selector: 'app-root',  
  templateUrl: './app.html',
  styleUrl: './app.css',  
  imports: [RouterOutlet, FloorPlanEditorComponent ],
})
export class App {
  protected title = 'FRONTEND';
}
