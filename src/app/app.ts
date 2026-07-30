import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "../components/navbar/navbar";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule ],
  templateUrl: './app.html'
})
export class App {
  modalVisible = false;
  modalMessage = "";
  modalIcon: "success" | "warning" | "error" = "success";

  showModal(msg: string, icon: "success" | "warning" | "error" = "success") {
    this.modalVisible = true;
    this.modalMessage = msg;
    this.modalIcon = icon;
  }

  closeModal() {
    this.modalVisible = false;
  }
}
