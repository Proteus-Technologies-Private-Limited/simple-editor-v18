import { TestBed } from '@angular/core/testing';

import { BbPluginLoaderService } from './bb-plugin-loader.service';

describe('BbPluginLoaderService', () => {
  let service: BbPluginLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BbPluginLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
