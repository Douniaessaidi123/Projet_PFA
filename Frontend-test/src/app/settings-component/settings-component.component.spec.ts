import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsComponentComponent } from './settings-component.component';

describe('SettingsComponentComponent', () => {
  let component: SettingsComponentComponent;
  let fixture: ComponentFixture<SettingsComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsComponentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SettingsComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
