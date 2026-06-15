import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreloaderComponent } from './preloader.component';
import { vi } from 'vitest';

describe('PreloaderComponent', () => {
  let component: PreloaderComponent;
  let fixture: ComponentFixture<PreloaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreloaderComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreloaderComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize with stage 1, isBiting as false, and isFadingOut as false', () => {
    fixture.detectChanges();
    const stageVal = (component as any).stage();
    expect(stageVal).toBe(1);
    expect((component as any).isBiting).toBe(false);
    expect((component as any).isFadingOut).toBe(false);
  });

  it('should run the animation sequence and emit events at correct times using Vitest fake timers', () => {
    vi.useFakeTimers();

    let slideStartEmitted = false;
    let finishedEmitted = false;

    component.slideStart.subscribe(() => slideStartEmitted = true);
    component.finished.subscribe(() => finishedEmitted = true);

    // Inicializa o componente, o que dispara runAnimationSequence() no ngOnInit
    fixture.detectChanges();

    // 1. Antes de 1500ms, o estágio ainda deve ser 1 (cookie inteiro)
    vi.advanceTimersByTime(1400);
    expect((component as any).stage()).toBe(1);
    expect((component as any).isBiting).toBe(false);

    // 2. Aos 1500ms, a primeira mordida ocorre, avançando para o estágio 2
    vi.advanceTimersByTime(100); // tempo total decorrido: 1500ms
    expect((component as any).stage()).toBe(2);
    expect((component as any).isBiting).toBe(true);

    // Aos 120ms depois da mordida, a vibração (isBiting) termina
    vi.advanceTimersByTime(120); // tempo total decorrido: 1620ms
    expect((component as any).isBiting).toBe(false);

    // 3. Segunda mordida em t = 1900ms (1500ms + 400ms)
    vi.advanceTimersByTime(280); // tempo total decorrido: 1900ms
    expect((component as any).stage()).toBe(3);
    expect((component as any).isBiting).toBe(true);
    vi.advanceTimersByTime(120); // tempo total decorrido: 2020ms
    expect((component as any).isBiting).toBe(false);

    // 4. Terceira mordida em t = 2300ms (1900ms + 400ms)
    vi.advanceTimersByTime(280); // tempo total decorrido: 2300ms
    expect((component as any).stage()).toBe(4);
    vi.advanceTimersByTime(400); // tempo total decorrido: 2700ms (Quarta mordida -> Estágio 5)
    expect((component as any).stage()).toBe(5);

    // 5. Última transição em t = 3100ms (2700ms + 400ms). Estágio vira 6 (cookie sumiu)
    vi.advanceTimersByTime(400); // tempo total decorrido: 3100ms
    expect((component as any).stage()).toBe(6);
    expect(slideStartEmitted).toBe(false);

    // 6. Aos 3200ms (3100ms + 100ms), inicia a subida da cortina (slideStart é emitido)
    vi.advanceTimersByTime(100); // tempo total decorrido: 3200ms
    expect((component as any).isFadingOut).toBe(true);
    expect(slideStartEmitted).toBe(true);
    expect(finishedEmitted).toBe(false);

    // 7. Aos 3700ms (3200ms + 500ms), o preloader termina (finished é emitido)
    vi.advanceTimersByTime(500); // tempo total decorrido: 3700ms
    expect(finishedEmitted).toBe(true);
  });
});
