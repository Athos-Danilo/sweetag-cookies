import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AdminService, CampaignData } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  adminName = signal<string>('Administrador');
  campaign = signal<CampaignData | null>(null);
  
  // Computed values for dashboard cards
  progressPercent = computed(() => {
    const data = this.campaign();
    if (!data || data.total_goal <= 0) return 0;
    const pct = (data.current_arrecadado / data.total_goal) * 100;
    return Math.min(Math.round(pct), 100);
  });

  // Campaign management form
  campaignForm!: FormGroup;
  showModal = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');

  private authService = inject(AuthService);
  private adminService = inject(AdminService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.adminName.set(user.nome);
    }

    this.campaignForm = this.fb.group({
      total_goal: [0, [Validators.required, Validators.min(0.01)]],
      motivational_text: ['', [Validators.required]]
    });

    this.loadCampaignData();
  }

  loadCampaignData(): void {
    this.adminService.getCampaign().subscribe({
      next: (data) => {
        this.campaign.set(data);
        this.campaignForm.patchValue({
          total_goal: data.total_goal,
          motivational_text: data.motivational_text
        });
      },
      error: (err) => {
        console.error('Erro ao buscar dados da campanha', err);
      }
    });
  }

  openEditModal(): void {
    const currentCampaign = this.campaign();
    if (currentCampaign) {
      this.campaignForm.patchValue({
        total_goal: currentCampaign.total_goal,
        motivational_text: currentCampaign.motivational_text
      });
    }
    this.showModal.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  closeEditModal(): void {
    this.showModal.set(false);
  }

  saveCampaign(): void {
    if (this.campaignForm.invalid) {
      this.campaignForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const formValues = this.campaignForm.value;

    this.adminService.updateCampaign(formValues).subscribe({
      next: (updatedData) => {
        this.campaign.set(updatedData);
        this.successMessage.set('Campanha atualizada com sucesso!');
        this.isSubmitting.set(false);
        setTimeout(() => this.closeEditModal(), 1500);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.detail || 'Erro ao atualizar campanha.');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
