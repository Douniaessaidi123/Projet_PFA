import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccueilStagiaireComponent } from './accueil-stagiaire.component';

describe('AccueilStagiaireComponent', () => {
  let component: AccueilStagiaireComponent;
  let fixture: ComponentFixture<AccueilStagiaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccueilStagiaireComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccueilStagiaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
