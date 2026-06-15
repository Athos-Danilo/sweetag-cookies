import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { CartService } from '../../../core/services/cart.service';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockCartService: any;
  let cartItemsSubject: BehaviorSubject<any[]>;

  beforeEach(async () => {
    cartItemsSubject = new BehaviorSubject<any[]>([]);
    mockCartService = {
      cartItems$: cartItemsSubject.asObservable(),
      getItemCount: vi.fn().mockReturnValue(0)
    };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: CartService, useValue: mockCartService },
        provideRouter([])
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should update bgOpacity and scrolled signal on window scroll', () => {
    fixture.detectChanges();
    
    // Simula scroll inicial (topo da página)
    expect(component['scrolled']()).toBe(false);
    expect(component['bgOpacity']()).toBe(0.85);

    // Mock do scrollY e disparar o evento
    Object.defineProperty(window, 'scrollY', { value: 50, writable: true });
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(component['scrolled']()).toBe(true);
    // Em 50px de scroll, opacidade diminui linearmente:
    // 0.85 - (50/120) * (0.85 - 0.55) = 0.85 - 0.416 * 0.3 = 0.85 - 0.125 = 0.725
    expect(component['bgOpacity']()).toBeCloseTo(0.725, 2);

    // Scroll alto (passa de 120px)
    Object.defineProperty(window, 'scrollY', { value: 150, writable: true });
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(component['scrolled']()).toBe(true);
    expect(component['bgOpacity']()).toBe(0.55); // Atinge o mínimo definido
  });

  it('should update itemCount and trigger cart animating when items are added', () => {
    fixture.detectChanges();
    
    expect(component['itemCount']).toBe(0);
    expect(component['cartAnimating']()).toBe(false);

    // Simula a adição de um item no carrinho
    mockCartService.getItemCount.mockReturnValue(1);
    cartItemsSubject.next([{ id: 1, name: 'Cookie Terracota', quantity: 1 }]);
    fixture.detectChanges();

    expect(component['itemCount']).toBe(1);
    expect(component['cartAnimating']()).toBe(true);
  });

  it('should scroll to top and navigate to home if not on home route when scrollToTop is called', () => {
    fixture.detectChanges();
    
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const navigateSpy = vi.spyOn(component['router'], 'navigate');
    const eventMock = { preventDefault: vi.fn() } as any;

    // Cenário 1: Já está na home
    Object.defineProperty(component['router'], 'url', { value: '/', configurable: true });
    component['scrollToTop'](eventMock);
    
    expect(eventMock.preventDefault).toHaveBeenCalled();
    expect(scrollToSpy).toHaveBeenCalled();
    expect(scrollToSpy.mock.calls[0][0] as any).toEqual({ top: 0, behavior: 'smooth' });
    expect(navigateSpy).not.toHaveBeenCalled();

    // Cenário 2: Está em outra rota (/cart)
    Object.defineProperty(component['router'], 'url', { value: '/cart', configurable: true });
    component['scrollToTop'](eventMock);
    
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
    
    scrollToSpy.mockRestore();
  });
});
