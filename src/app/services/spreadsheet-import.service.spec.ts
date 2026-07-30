import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import {
  SpreadsheetImportResponse,
  SpreadsheetImportService,
} from './spreadsheet-import.service';

describe('SpreadsheetImportService', () => {
  let service: SpreadsheetImportService;
  let http: HttpTestingController;

  const response: SpreadsheetImportResponse = {
    valid: true,
    imported: false,
    fixturesRead: 1,
    statisticsRead: 0,
    sourcesRead: 1,
    fixturesInserted: 0,
    fixturesUpdated: 0,
    leaguesInserted: 0,
    teamsInserted: 0,
    statisticsUpserted: 0,
    sourcesInserted: 0,
    issues: [],
    fixtures: [],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SpreadsheetImportService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(SpreadsheetImportService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('envia a planilha para validação como multipart', () => {
    const file = new File(['xlsx'], 'dados.xlsx');

    service.validate(file).subscribe(result => expect(result.valid).toBe(true));

    const request = http.expectOne(
      'http://localhost:8080/api/importacoes/planilha/validar'
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body instanceof FormData).toBe(true);
    expect(request.request.body.get('file')).toBe(file);
    request.flush(response);
  });

  it('envia a planilha confirmada para importação', () => {
    const file = new File(['xlsx'], 'dados.xlsx');

    service.importWorkbook(file).subscribe();

    const request = http.expectOne(
      'http://localhost:8080/api/importacoes/planilha/importar'
    );
    expect(request.request.method).toBe('POST');
    request.flush({ ...response, imported: true });
  });

  it('baixa o modelo oficial', () => {
    service.downloadModel().subscribe(result => expect(result).toBeInstanceOf(Blob));

    const request = http.expectOne(
      'http://localhost:8080/api/importacoes/planilha/modelo'
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.responseType).toBe('blob');
    request.flush(new Blob(['modelo']));
  });
});
