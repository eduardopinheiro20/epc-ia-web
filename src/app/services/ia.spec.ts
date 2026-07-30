import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { IaService } from './ia.service';

describe('Ia', () => {
  let service: IaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(IaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
