import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../core/services/cart.service';
import { CartItem } from '../core/models/cart.model';
import { AddressService } from '../core/services/address.service';
import { OrderService } from '../core/services/order.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  checkoutForm: FormGroup;
  total: number = 0;
  currentStep: 'cart' | 'schedule' | 'delivery' | 'payment' = 'cart';
  errorMessage: string = '';
  isSubmitting: boolean = false;

  // Lógica de Cupom
  couponCode: string = '';
  couponError: string = '';
  isApplyingCoupon: boolean = false;

  // Lógica de Agendamento
  deliveryType: 'immediate' | 'scheduled' = 'immediate';
  scheduledDate: string = '';
  scheduledTime: string = '';
  currentMonthYear: string = '';
  availableDates: string[] = [];
  availableTimes: string[] = ['08:30', '10:00', '13:30', '15:00', '16:30', '18:00'];

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

    this.generateAvailableDates();
  }

  generateAvailableDates() {
    const dates: string[] = [];
    const today = new Date();
    let count = 0;
    
    // Gera as próximas 5 datas úteis (evitando finais de semana)
    while (count < 5) {
      today.setDate(today.getDate() + 1);
      const dayOfWeek = today.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Domingo, 6 = Sábado
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const weekday = today.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
        dates.push(`${weekday}, ${day}/${month}`);
        count++;
      }
    }
    this.availableDates = dates;
    if (dates.length > 0) {
      this.scheduledDate = dates[0];
    }
    this.scheduledTime = this.availableTimes[0];

    // Formata o mês/ano atual capitalizado
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    const rawMonthYear = new Date().toLocaleDateString('pt-BR', options);
    this.currentMonthYear = rawMonthYear.charAt(0).toUpperCase() + rawMonthYear.slice(1);
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

  goToCart() {
    this.currentStep = 'cart';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToSchedule() {
    if (this.cartItems.length > 0) {
      this.currentStep = 'schedule';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToDelivery() {
    this.currentStep = 'delivery';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  isAddressValid(): boolean {
    const addressControls = ['department', 'block', 'room'];
    let isValid = true;
    
    addressControls.forEach(ctrlName => {
      const ctrl = this.checkoutForm.get(ctrlName);
      if (ctrl) {
        ctrl.updateValueAndValidity();
        if (ctrl.invalid) {
          ctrl.markAsTouched();
          isValid = false;
        }
      }
    });

    return isValid;
  }

  goToPayment() {
    if (this.isAddressValid()) {
      this.currentStep = 'payment';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  selectDeliveryType(type: 'immediate' | 'scheduled') {
    this.deliveryType = type;
  }

  selectScheduledDate(date: string) {
    this.scheduledDate = date;
  }

  selectScheduledTime(time: string) {
    this.scheduledTime = time;
  }

  applyCoupon(code: string) {
    if (!code || code.trim() === '') {
      this.couponError = 'Por favor, digite um código de cupom.';
      return;
    }

    this.isApplyingCoupon = true;
    this.couponError = '';

    // Simula uma requisição de validação que retorna inválido
    setTimeout(() => {
      this.isApplyingCoupon = false;
      this.couponError = `O cupom "${code.toUpperCase()}" é inválido ou expirou.`;
    }, 800);
  }

  onSubmitCheckout() {
    // Validar tudo antes de enviar
    const addressValid = this.isAddressValid();
    const paymentValid = this.checkoutForm.get('paymentMethod')?.valid;

    if (addressValid && paymentValid && this.cartItems.length > 0) {
      this.isSubmitting = true;
      this.errorMessage = '';

      // Adiciona detalhe de agendamento no ponto de referência se houver
      let referenceText = this.checkoutForm.value.reference || '';
      if (this.deliveryType === 'scheduled') {
        const agendamentoInfo = `[AGENDADO para ${this.scheduledDate} às ${this.scheduledTime}]`;
        referenceText = referenceText ? `${agendamentoInfo} - Ref: ${referenceText}` : agendamentoInfo;
      }

      const addressPayload = {
        title: this.deliveryType === 'scheduled' ? 'Entrega Agendada' : 'Entrega Imediata',
        department: this.checkoutForm.value.department,
        block: this.checkoutForm.value.block,
        room: this.checkoutForm.value.room,
        street: referenceText,
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
    if (this.currentStep === 'payment') {
      this.currentStep = 'delivery';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (this.currentStep === 'delivery') {
      this.currentStep = 'schedule';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (this.currentStep === 'schedule') {
      this.goToCart();
    } else {
      this.router.navigate(['/']);
    }
  }
}
