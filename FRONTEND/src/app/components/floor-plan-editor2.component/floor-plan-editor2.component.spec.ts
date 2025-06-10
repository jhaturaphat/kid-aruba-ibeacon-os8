import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloorPlanEditor2Component } from './floor-plan-editor2.component';

describe('FloorPlanEditor2Component', () => {
  let component: FloorPlanEditor2Component;
  let fixture: ComponentFixture<FloorPlanEditor2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloorPlanEditor2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloorPlanEditor2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
