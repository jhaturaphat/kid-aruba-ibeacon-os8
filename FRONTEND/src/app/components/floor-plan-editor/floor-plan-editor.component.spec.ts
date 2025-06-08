import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloorPlanEditor } from './floor-plan-editor.component';

describe('FloorPlanEditor', () => {
  let component: FloorPlanEditor;
  let fixture: ComponentFixture<FloorPlanEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloorPlanEditor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloorPlanEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
