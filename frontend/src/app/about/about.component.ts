import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  developers = [
    {
      name: 'Athos Inácio',
      role: 'Desenvolvedor Frontend',
      github: 'https://github.com/Athos-Danilo',
      linkedin: 'https://www.linkedin.com/in/athos-danilo-m-in%C3%A1cio-885238191/',
      avatar: '👨🏽‍💻'
    },
    {
      name: 'Cauã Herculano',
      role: 'Desenvolvedor Backend',
      github: 'https://github.com/cauahp',
      linkedin: '#', // Placeholder
      avatar: '👨🏻‍💻'
    }
  ];
}
// Trigger rebuild
