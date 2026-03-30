import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BbmapComponent } from './bb-map.component';

describe('BbmapComponent', () => {
  let component: BbmapComponent<any>;
  let fixture: ComponentFixture<BbmapComponent<any>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BbmapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BbmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
