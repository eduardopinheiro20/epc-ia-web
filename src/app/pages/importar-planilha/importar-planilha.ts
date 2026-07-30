import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import {
  SpreadsheetImportResponse,
  SpreadsheetImportService,
} from '../../services/spreadsheet-import.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-importar-planilha',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './importar-planilha.html',
  styleUrls: ['./importar-planilha.css'],
})
export class ImportarPlanilhaComponent {

  selectedFile: File | null = null;
  preview: SpreadsheetImportResponse | null = null;
  dragging = false;
  validating = false;
  importing = false;
  downloading = false;
  errorMessage = '';

  constructor(
    private importer: SpreadsheetImportService,
    private changeDetector: ChangeDetectorRef,
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.acceptFile(input.files?.[0] ?? null);
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;
    this.acceptFile(event.dataTransfer?.files?.[0] ?? null);
  }

  validate(): void {
    if (!this.selectedFile || this.validating || this.importing) {
      return;
    }

    this.validating = true;
    this.errorMessage = '';
    this.preview = null;

    this.importer.validate(this.selectedFile)
      .pipe(
        finalize(() => {
          this.validating = false;
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: response => {
          this.preview = response;
        },
        error: error => {
          this.errorMessage = this.readError(error);
        },
      });
  }

  confirmImport(): void {
    if (!this.selectedFile || !this.preview?.valid || this.importing) {
      return;
    }

    this.importing = true;
    this.errorMessage = '';

    this.importer.importWorkbook(this.selectedFile)
      .pipe(
        finalize(() => {
          this.importing = false;
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: response => {
          this.preview = response;
        },
        error: error => {
          if (error?.error?.issues) {
            this.preview = error.error;
          }
          this.errorMessage = this.readError(error);
        },
      });
  }

  downloadModel(): void {
    if (this.downloading) {
      return;
    }
    this.downloading = true;
    this.errorMessage = '';

    this.importer.downloadModel().subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'modelo_importacao_epc_ia.xlsx';
        anchor.click();
        URL.revokeObjectURL(url);
        this.downloading = false;
      },
      error: error => {
        this.errorMessage = this.readError(error);
        this.downloading = false;
      },
    });
  }

  reset(): void {
    this.selectedFile = null;
    this.preview = null;
    this.errorMessage = '';
  }

  get errorsCount(): number {
    return this.preview?.issues?.filter(issue => issue.severity === 'ERROR').length ?? 0;
  }

  get warningsCount(): number {
    return this.preview?.issues?.filter(issue => issue.severity === 'WARNING').length ?? 0;
  }

  score(fixture: any): string {
    if (fixture.homeGoals == null || fixture.awayGoals == null) {
      return '—';
    }
    return `${fixture.homeGoals} × ${fixture.awayGoals}`;
  }

  fileSize(bytes: number): string {
    if (bytes < 1024 * 1024) {
      return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private acceptFile(file: File | null): void {
    this.preview = null;
    this.errorMessage = '';
    if (!file) {
      this.selectedFile = null;
      return;
    }
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      this.selectedFile = null;
      this.errorMessage = 'Selecione um arquivo no formato .xlsx.';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.selectedFile = null;
      this.errorMessage = 'A planilha deve ter no máximo 10 MB.';
      return;
    }
    this.selectedFile = file;
  }

  private readError(error: any): string {
    return error?.error?.message
      || error?.message
      || 'Não foi possível processar a planilha.';
  }
}
