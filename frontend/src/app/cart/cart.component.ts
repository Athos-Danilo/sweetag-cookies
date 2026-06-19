import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../core/services/cart.service';
import { CartItem } from '../core/models/cart.model';

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

  constructor(
    public cartService: CartService,
    private fb: FormBuilder,
    private router: Router
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
      console.log('Dados do pedido:', {
        items: this.cartItems,
        delivery: this.checkoutForm.value,
        total: this.total
      });
      // TODO: Integrar com a API de Orders (Pedidos) no backend
      const { paymentMethod } = this.checkoutForm.value;
      if (paymentMethod === 'PIX') {
        alert('Pedido criado! Redirecionando para acompanhamento...');
      } else {
        alert('Pedido confirmado! Prepare o dinheiro para o entregador.');
      }
      
      // Limpar carrinho e formulário
      this.cartService.clearCart();
      this.checkoutForm.reset({ paymentMethod: 'PIX', needsChange: false });
      
      // Direcionar para a tela de pedidos
      this.router.navigate(['/orders']);
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
