import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterProjetComponentComponent } from './ajouter-projet-component.component';

describe('AjouterProjetComponentComponent', () => {
  let component: AjouterProjetComponentComponent;
  let fixture: ComponentFixture<AjouterProjetComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AjouterProjetComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AjouterProjetComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
