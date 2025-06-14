import { Routes } from '@angular/router';
import { FloorPlanComponent } from './components/floor-plan.component/floor-plan.component';
import { FloorPlanEditorComponent } from './components/floor-plan-editor/floor-plan-editor.component';
import { FloorPlanEditor2Component } from './components/floor-plan-editor2.component/floor-plan-editor2.component';
import { FloorPlanEditor3Component } from './components/floor-plan-editor3.component/floor-plan-editor3.component';


export const routes: Routes = [
    {path:'floor-plan', component:FloorPlanComponent},
    {path:'editor', component:FloorPlanEditorComponent},
    {path:'editor2', component:FloorPlanEditor2Component}
    {path:'editor3', component:FloorPlanEditor3Component}
];
