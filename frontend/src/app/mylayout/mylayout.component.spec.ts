import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MylayoutComponent } from './mylayout.component';

describe('MylayoutComponent', () => {
  let component: MylayoutComponent;
  let fixture: ComponentFixture<MylayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MylayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MylayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
