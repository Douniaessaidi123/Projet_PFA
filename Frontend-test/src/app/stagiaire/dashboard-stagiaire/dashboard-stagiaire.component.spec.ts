import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardStagiaireComponent } from './dashboard-stagiaire.component';

describe('DashboardStagiaireComponent', () => {
  let component: DashboardStagiaireComponent;
  let fixture: ComponentFixture<DashboardStagiaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardStagiaireComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardStagiaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
