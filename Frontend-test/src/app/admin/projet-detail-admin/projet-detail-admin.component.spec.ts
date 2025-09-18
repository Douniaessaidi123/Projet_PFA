import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjetDetailAdminComponent } from './projet-detail-admin.component';

describe('ProjetDetailAdminComponent', () => {
  let component: ProjetDetailAdminComponent;
  let fixture: ComponentFixture<ProjetDetailAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProjetDetailAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjetDetailAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
