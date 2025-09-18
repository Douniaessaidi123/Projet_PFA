import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetsAdminComponent } from './projets-admin.component';

describe('ProjetsAdminComponent', () => {
  let component: ProjetsAdminComponent;
  let fixture: ComponentFixture<ProjetsAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjetsAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjetsAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
