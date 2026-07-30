import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { Router, RouterLink } from "@angular/router";
import { Component, ChangeDetectorRef } from "@angular/core";




@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  error: string | null = null;

  // Toast state (to match bilhete toast UX)
  toastVisible = false;
  toastMessage = '';
  toastType: 'success' | 'warning' | 'error' = 'success';
  private toastTimeout: any;

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  register() {
    // evita múltiplos envios acidentalmente
    if (this.loading) return;

    // Validação local: confirma senha
    if (this.password !== this.confirmPassword) {
      this.showToast('As senhas não coincidem', 'warning');
      return;
    }

    this.loading = true;
    this.error = null;

    this.auth.register({
      name: this.name,
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res: any) => {
        this.loading = false;
        const message = typeof res === 'string' ? res : (res?.message || 'Usuário criado com sucesso');
        this.showToast(message, 'success');

        // Navega para login após breve delay para que o toast seja visto
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2500);
      },
      error: (err: any) => {
        // Extrai mensagem do backend de forma robusta
        const serverPayload = err?.error;
        const msg = (serverPayload && typeof serverPayload === 'object' && serverPayload.message)
          ? serverPayload.message
          : (typeof serverPayload === 'string' ? serverPayload : 'Erro ao criar conta');

        this.showToast(msg, 'warning');
        this.loading = false;
      }
    });
  }

  // Toast helper methods copied/adapted from BilheteComponent
  private showToast(message: string, type: 'success' | 'warning' | 'error') {
    // Limpa timeout anterior
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    // Se já está visível, esconde e reaplica (para animação)
    if (this.toastVisible) {
      this.toastVisible = false;
      setTimeout(() => {
        this.showToastWithMessage(message, type);
      }, 300);
    } else {
      this.showToastWithMessage(message, type);
    }
  }

  private showToastWithMessage(message: string, type: 'success' | 'warning' | 'error') {
    this.toastMessage = message;
    this.toastType = type;

    // Força detecção de mudanças antes de mostrar
    this.cdr.detectChanges();

    setTimeout(() => {
      this.toastVisible = true;
      this.cdr.detectChanges();

      this.toastTimeout = setTimeout(() => {
        this.toastVisible = false;
        this.cdr.detectChanges();
      }, 5000);
    }, 10);
  }
}
