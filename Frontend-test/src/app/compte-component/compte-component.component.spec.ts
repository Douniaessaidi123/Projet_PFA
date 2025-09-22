import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompteComponentComponent } from './compte-component.component';

describe('CompteComponentComponent', () => {
  let component: CompteComponentComponent;
  let fixture: ComponentFixture<CompteComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompteComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CompteComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
