import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetDetailStagiaireComponent } from './projet-detail-stagiaire.component';

describe('ProjetDetailStagiaireComponent', () => {
  let component: ProjetDetailStagiaireComponent;
  let fixture: ComponentFixture<ProjetDetailStagiaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjetDetailStagiaireComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjetDetailStagiaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
