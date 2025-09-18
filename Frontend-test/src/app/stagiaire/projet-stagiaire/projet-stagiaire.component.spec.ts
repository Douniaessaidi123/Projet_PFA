import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetStagiaireComponent } from './projet-stagiaire.component';

describe('ProjetStagiaireComponent', () => {
  let component: ProjetStagiaireComponent;
  let fixture: ComponentFixture<ProjetStagiaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjetStagiaireComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjetStagiaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
