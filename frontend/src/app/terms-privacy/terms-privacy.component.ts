import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terms-privacy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './terms-privacy.component.html',
  styleUrl: './terms-privacy.component.scss',
})
export class TermsPrivacy {
  sections = [
    {
      title: 'Termos de Serviço',
      icon: 'document-text',
      content: 'Bem-vindo à Sweetag! Ao utilizar nosso aplicativo para realizar seus pedidos de cookies e doces, você concorda com nossos termos de serviço. A venda e entrega dos nossos produtos estão sujeitas à disponibilidade de estoque e área de entrega. Garantimos o preparo com muito amor, mas pedimos que verifique os dados do pedido antes de confirmar.',
      open: true
    },
    {
      title: 'Coleta de Dados',
      icon: 'shield-check',
      content: 'Levamos sua privacidade a sério. Coletamos apenas as informações necessárias para processar e entregar seu pedido: nome, endereço, e-mail e telefone de contato. Seus dados de pagamento são processados de forma segura e não armazenamos o número completo do seu cartão de crédito em nossos servidores.',
      open: false
    },
    {
      title: 'Uso das Informações',
      icon: 'user',
      content: 'Suas informações são utilizadas exclusivamente para a prestação do serviço (entregas, confirmação de pedidos e suporte). Ocasionalmente, podemos enviar promoções e novidades sobre novos sabores de cookies, mas você pode optar por não receber essas comunicações a qualquer momento nas configurações do seu perfil.',
      open: false
    },
    {
      title: 'Compartilhamento',
      icon: 'share',
      content: 'Nós não vendemos ou compartilhamos seus dados pessoais com terceiros para fins de marketing. Os dados podem ser compartilhados estritamente com parceiros logísticos apenas para a viabilização da entrega do seu pedido na sua casa.',
      open: false
    }
  ];

  toggleSection(index: number) {
    this.sections[index].open = !this.sections[index].open;
  }
}
