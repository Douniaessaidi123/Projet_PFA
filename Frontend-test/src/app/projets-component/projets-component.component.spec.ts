import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetsComponentComponent } from './projets-component.component';

describe('ProjetsComponentComponent', () => {
  let component: ProjetsComponentComponent;
  let fixture: ComponentFixture<ProjetsComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjetsComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjetsComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
