import { Routes } from '@angular/router';
import { FloorPlanComponent } from './components/floor-plan.component/floor-plan.component';
import { FloorPlanEditorComponent } from './components/floor-plan-editor/floor-plan-editor';


export const routes: Routes = [
    {path:'floor-plan', component:FloorPlanComponent},
    {path:'floor-plan-editor', component:FloorPlanEditorComponent}
];
