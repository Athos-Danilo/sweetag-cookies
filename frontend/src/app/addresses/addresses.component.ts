import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { AddressService, Address } from '../core/services/address.service';
import { AddressCardComponent } from './address-card/address-card.component';
import { AddressFormComponent } from './address-form/address-form.component';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, RouterLink, AddressCardComponent, AddressFormComponent],
  templateUrl: './addresses.component.html',
  styleUrl: './addresses.component.scss'
})
export class AddressesComponent implements OnInit {
  protected authService = inject(AuthService);
  protected addressService = inject(AddressService);
  protected router = inject(Router);

  protected addresses: Address[] = [];
  protected showForm = false;
  protected editingAddress: Address | null = null;
  protected isLoading = false;
  protected errorMessage = '';

  constructor() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit(): void {
    this.loadAddresses();
  }

  protected loadAddresses() {
    this.isLoading = true;
    this.errorMessage = '';
    this.addressService.getAddresses().subscribe({
      next: (data) => {
        this.addresses = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar endereços:', err);
        this.errorMessage = 'Não foi possível carregar os endereços.';
        this.isLoading = false;
      }
    });
  }

  protected toggleForm(show: boolean, address: Address | null = null) {
    this.showForm = show;
    this.editingAddress = address;
    this.errorMessage = '';
  }

  protected onSave(addressData: Address) {
    this.isLoading = true;
    this.errorMessage = '';

    if (this.editingAddress && this.editingAddress.id) {
      this.addressService.updateAddress(this.editingAddress.id, addressData).subscribe({
        next: () => {
          this.loadAddresses();
          this.toggleForm(false);
        },
        error: (err) => {
          console.error('Erro ao atualizar endereço:', err);
          this.errorMessage = 'Erro ao salvar as alterações. Tente novamente.';
          this.isLoading = false;
        }
      });
    } else {
      this.addressService.createAddress(addressData).subscribe({
        next: () => {
          this.loadAddresses();
          this.toggleForm(false);
        },
        error: (err) => {
          console.error('Erro ao cadastrar endereço:', err);
          this.errorMessage = 'Erro ao criar o novo endereço. Tente novamente.';
          this.isLoading = false;
        }
      });
    }
  }

  protected onDelete(id: number) {
    if (confirm('Tem certeza que deseja excluir este endereço?')) {
      this.isLoading = true;
      this.addressService.deleteAddress(id).subscribe({
        next: () => {
          this.loadAddresses();
        },
        error: (err) => {
          console.error('Erro ao excluir endereço:', err);
          this.errorMessage = 'Erro ao excluir o endereço.';
          this.isLoading = false;
        }
      });
    }
  }

  protected onSetDefault(id: number) {
    this.isLoading = true;
    this.addressService.setDefaultAddress(id).subscribe({
      next: () => {
        this.loadAddresses();
      },
      error: (err) => {
        console.error('Erro ao definir endereço padrão:', err);
        this.errorMessage = 'Erro ao definir endereço padrão.';
        this.isLoading = false;
      }
    });
  }

  protected goBack() {
    if (this.showForm) {
      this.toggleForm(false);
    } else {
      this.router.navigate(['/login']);
    }
  }
}


