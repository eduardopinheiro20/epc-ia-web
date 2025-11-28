import { TestBed } from '@angular/core/testing';

import { IaService } from './ia.service';

describe('Ia', () => {
  let service: IaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
