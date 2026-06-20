import { Component, inject, OnInit, signal } from '@angular/core';
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

  protected addresses = signal<Address[]>([]);
  protected showForm = signal<boolean>(false);
  protected editingAddress = signal<Address | null>(null);
  protected isLoading = signal<boolean>(false);
  protected errorMessage = signal<string>('');

  constructor() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit(): void {
    this.loadAddresses();
  }

  protected loadAddresses() {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.addressService.getAddresses().subscribe({
      next: (data) => {
        this.addresses.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar endereços:', err);
        this.errorMessage.set('Não foi possível carregar os endereços.');
        this.isLoading.set(false);
      }
    });
  }

  protected toggleForm(show: boolean, address: Address | null = null) {
    this.showForm.set(show);
    this.editingAddress.set(address);
    this.errorMessage.set('');
  }

  protected onSave(addressData: Address) {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const currentEditing = this.editingAddress();
    if (currentEditing && currentEditing.id) {
      this.addressService.updateAddress(currentEditing.id, addressData).subscribe({
        next: () => {
          this.loadAddresses();
          this.toggleForm(false);
        },
        error: (err) => {
          console.error('Erro ao atualizar endereço:', err);
          this.errorMessage.set('Erro ao salvar as alterações. Tente novamente.');
          this.isLoading.set(false);
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
          this.errorMessage.set('Erro ao criar o novo endereço. Tente novamente.');
          this.isLoading.set(false);
        }
      });
    }
  }

  protected onDelete(id: number) {
    if (confirm('Tem certeza que deseja excluir este endereço?')) {
      this.isLoading.set(true);
      this.addressService.deleteAddress(id).subscribe({
        next: () => {
          this.loadAddresses();
        },
        error: (err) => {
          console.error('Erro ao excluir endereço:', err);
          this.errorMessage.set('Erro ao excluir o endereço.');
          this.isLoading.set(false);
        }
      });
    }
  }

  protected onSetDefault(id: number) {
    this.isLoading.set(true);
    this.addressService.setDefaultAddress(id).subscribe({
      next: () => {
        this.loadAddresses();
      },
      error: (err) => {
        console.error('Erro ao definir endereço padrão:', err);
        this.errorMessage.set('Erro ao definir endereço padrão.');
        this.isLoading.set(false);
      }
    });
  }

  protected goBack() {
    if (this.showForm()) {
      this.toggleForm(false);
    } else {
      this.router.navigate(['/']);
    }
  }
}


