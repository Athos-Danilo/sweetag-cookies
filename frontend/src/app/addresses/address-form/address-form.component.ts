import { Component, EventEmitter, Input, OnInit, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Address } from '../../core/services/address.service';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './address-form.component.html',
  styleUrl: './address-form.component.scss'
})
export class AddressFormComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);

  @Input() address: Address | null = null;
  @Input() errorMessage: string = '';

  @Output() save = new EventEmitter<Address>();
  @Output() cancel = new EventEmitter<void>();

  addressForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.updateFormValues();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['address'] && this.addressForm) {
      this.updateFormValues();
    }
  }

  private initForm() {
    this.addressForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(50)]],
      department: [''],
      block: [''],
      room: [''],
      neighborhood: [''], // Ponto de referência
      is_default: [false]
    });
  }

  private updateFormValues() {
    if (this.address) {
      this.addressForm.patchValue({
        title: this.address.title,
        department: this.address.department || '',
        block: this.address.block || '',
        room: this.address.room || '',
        neighborhood: this.address.neighborhood || '',
        is_default: this.address.is_default
      });
    } else {
      this.addressForm.reset({
        title: '',
        department: '',
        block: '',
        room: '',
        neighborhood: '',
        is_default: false
      });
    }
  }

  onSubmit() {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    const formValue = this.addressForm.value;
    const addressData: Address = {
      title: formValue.title,
      department: formValue.department || undefined,
      block: formValue.block || undefined,
      room: formValue.room || undefined,
      neighborhood: formValue.neighborhood || undefined,
      is_default: formValue.is_default
    };

    this.save.emit(addressData);
  }

  onCancel() {
    this.cancel.emit();
  }
}
