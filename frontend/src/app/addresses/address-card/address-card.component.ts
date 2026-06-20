import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Address } from '../../core/services/address.service';

@Component({
  selector: 'app-address-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './address-card.component.html',
  styleUrl: './address-card.component.scss'
})
export class AddressCardComponent {
  @Input({ required: true }) address!: Address;
  
  @Output() edit = new EventEmitter<Address>();
  @Output() delete = new EventEmitter<number>();
  @Output() setDefault = new EventEmitter<number>();

  onEdit() {
    this.edit.emit(this.address);
  }

  onDelete(event: Event) {
    event.stopPropagation();
    if (this.address.id) {
      this.delete.emit(this.address.id);
    }
  }

  onSetDefault(event: Event) {
    event.stopPropagation();
    if (this.address.id) {
      this.setDefault.emit(this.address.id);
    }
  }
}
