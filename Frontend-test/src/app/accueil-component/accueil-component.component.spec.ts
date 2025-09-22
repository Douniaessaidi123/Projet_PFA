import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccueilComponentComponent } from './accueil-component.component';

describe('AccueilComponentComponent', () => {
  let component: AccueilComponentComponent;
  let fixture: ComponentFixture<AccueilComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccueilComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccueilComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
