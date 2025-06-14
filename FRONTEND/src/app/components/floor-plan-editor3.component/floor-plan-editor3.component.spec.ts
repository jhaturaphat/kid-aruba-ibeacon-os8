import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloorPlanEditor3Component } from './floor-plan-editor3.component';

describe('FloorPlanEditor2Component', () => {
  let component: FloorPlanEditor3Component;
  let fixture: ComponentFixture<FloorPlanEditor3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloorPlanEditor3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloorPlanEditor3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
