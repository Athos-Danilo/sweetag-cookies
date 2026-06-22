import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../core/services/cart.service';
import { CartItem } from '../core/models/cart.model';
import { AddressService } from '../core/services/address.service';
import { OrderService } from '../core/services/order.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  checkoutForm: FormGroup;
  total: number = 0;
  currentStep: 'cart' | 'delivery' = 'cart';
  errorMessage: string = '';
  isSubmitting: boolean = false;

  constructor(
    public cartService: CartService,
    private fb: FormBuilder,
    private router: Router,
    private addressService: AddressService,
    private orderService: OrderService
  ) {
    this.checkoutForm = this.fb.group({
      department: ['', Validators.required],
      block: ['', Validators.required],
      room: ['', Validators.required],
      reference: [''],
      paymentMethod: ['PIX', Validators.required],
      needsChange: [false],
      changeFor: ['']
    });
  }

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.total = this.cartService.getTotal();
    });
  }

  increaseQuantity(item: CartItem) {
    this.cartService.updateQuantity(item.product.id, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem) {
    this.cartService.updateQuantity(item.product.id, item.quantity - 1);
  }

  removeItem(productId: string) {
    this.cartService.removeFromCart(productId);
  }

  goToDelivery() {
    if (this.cartItems.length > 0) {
      this.currentStep = 'delivery';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToCart() {
    this.currentStep = 'cart';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSubmitCheckout() {
    if (this.checkoutForm.valid && this.cartItems.length > 0) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const addressPayload = {
        title: 'Entrega do Pedido',
        department: this.checkoutForm.value.department,
        block: this.checkoutForm.value.block,
        room: this.checkoutForm.value.room,
        street: this.checkoutForm.value.reference || '',
        is_default: true
      };

      // 1. Cadastra o endereço no backend
      this.addressService.createAddress(addressPayload).subscribe({
        next: (address) => {
          const orderItems = this.cartItems.map(item => {
            const numId = Number(item.product.id);
            return {
              product_id: isNaN(numId) ? undefined : numId,
              name: item.product.name,
              quantity: item.quantity,
              price: item.product.price
            };
          });

          const orderPayload = {
            address_id: address.id!,
            total: this.total,
            payment_method: this.checkoutForm.value.paymentMethod,
            items: orderItems
          };

          // 2. Cria o pedido no backend
          this.orderService.createOrder(orderPayload).subscribe({
            next: (order) => {
              this.isSubmitting = false;
              this.cartService.clearCart();
              this.checkoutForm.reset({ paymentMethod: 'PIX', needsChange: false });
              
              // Redireciona para listagem de pedidos
              this.router.navigate(['/orders']);
            },
            error: (orderErr) => {
              this.isSubmitting = false;
              this.errorMessage = orderErr.error?.detail || 'Erro ao processar o pedido. Tente novamente.';
              alert(this.errorMessage);
            }
          });
        },
        error: (addrErr) => {
          this.isSubmitting = false;
          this.errorMessage = 'Erro ao registrar o endereço de entrega.';
          alert(this.errorMessage);
        }
      });
    } else {
      this.checkoutForm.markAllAsTouched();
    }
  }

  goBack() {
    if (this.currentStep === 'delivery') {
      this.goToCart();
    } else {
      this.router.navigate(['/']);
    }
  }
}
