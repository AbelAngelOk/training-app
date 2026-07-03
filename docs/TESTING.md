# Estrategia de Testing

---

## Stack de testing

| Nivel | Herramienta | Propósito |
|---|---|---|
| Unit | Jest | Funciones, utilidades, hooks aislados |
| Componente | React Native Testing Library | Comportamiento de componentes UI |
| Integración | Jest + MSW (futuro) | Flujos que involucran múltiples capas |
| E2E | Detox o Maestro (futuro) | Flujos completos en dispositivo real |

---

## Cobertura por capa

### Utilidades y funciones puras

Todo lo que sea lógica pura sin dependencias externas debe tener tests unitarios.

Ejemplos candidatos:
- Función de cálculo de fortaleza de contraseña
- Función de formato de duración (segundos → "1h 23min")
- Validación de formato de tag (`/^[a-zA-Z0-9_]{3,30}$/`)
- Cálculo de streak (dado un array de fechas)

```typescript
// Ejemplo: src/utils/password-strength.test.ts
describe('getPasswordStrength', () => {
  it('retorna "weak" para contraseñas sin criterios cumplidos', () => {
    expect(getPasswordStrength('abc')).toBe('weak')
  })
  it('retorna "strong" cuando cumple todos los criterios', () => {
    expect(getPasswordStrength('MyP@ss123')).toBe('strong')
  })
})
```

### Componentes UI

Usar React Native Testing Library para verificar comportamiento visible.

Componentes prioritarios:
- `PasswordInput` — verificar toggle show/hide
- `PasswordStrengthIndicator` — verificar criterios según input
- `Button` — verificar estados: loading, disabled, variantes
- `FABMenu` — verificar apertura/cierre y opciones

```typescript
// Ejemplo: src/components/ui/PasswordInput.test.tsx
describe('PasswordInput', () => {
  it('oculta la contraseña por defecto', () => {
    render(<PasswordInput value="secret" onChangeText={jest.fn()} />)
    expect(screen.getByTestId('register-password-input').props.secureTextEntry).toBe(true)
  })
  it('muestra la contraseña al presionar el ícono', () => {
    render(<PasswordInput value="secret" onChangeText={jest.fn()} />)
    fireEvent.press(screen.getByTestId('register-password-toggle-button'))
    expect(screen.getByTestId('register-password-input').props.secureTextEntry).toBe(false)
  })
})
```

### Hooks personalizados

Testear con `renderHook` de React Native Testing Library + mocks de Supabase.

Hooks prioritarios:
- `useIsPremium()` — verificar que devuelve true/false correctamente
- `useActiveWorkout()` — verificar enabled/disabled según auth
- `useUserProfile()` — verificar que no ejecuta query sin userId

```typescript
// Ejemplo: src/hooks/use-subscriptions.test.ts
describe('useIsPremium', () => {
  it('retorna false si no hay suscripción activa', () => {
    mockActiveSubscription(null)
    const { result } = renderHook(() => useIsPremium())
    expect(result.current).toBe(false)
  })
})
```

### Formularios

Verificar validaciones y comportamiento de submit.

Pantallas prioritarias:
- `register.tsx` — validaciones de Zod, mensaje de éxito, error de email en uso
- `login.tsx` — mensaje de error unificado, redirección post-login
- `profile/edit.tsx` — validación de tag, restricción de 7 días

---

## Convención de mocks

### Supabase
Mockear `@/lib/supabase` para tests de componentes y hooks:

```typescript
// __mocks__/supabase.ts
export const supabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  auth: {
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
  }
}
```

### Auth Store
```typescript
jest.mock('@/stores/auth-store', () => ({
  useAuthStore: jest.fn(() => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    session: { access_token: 'test-token' },
  }))
}))
```

---

## Cobertura mínima esperada

| Área | Cobertura objetivo |
|---|---|
| Utilidades puras | 90%+ |
| Componentes UI críticos | 70%+ |
| Hooks de auth y suscripción | 80%+ |
| Pantallas de auth | 60%+ |

---

## Observabilidad

### Logging (futuro)
- Errores de autenticación
- Fallos de Edge Functions
- Errores de suscripción
- Fallos de ranking

### Analytics (futuro)
- Eventos clave: registro, login, inicio de entrenamiento, completar entrenamiento, suscripción
- Pantallas visitadas
- Tiempo en pantalla

### Performance
- Evitar re-renders innecesarios (verificar con React DevTools Profiler)
- Listas largas: usar `FlatList` con `keyExtractor` y `getItemLayout` cuando sea posible
- No cargar imágenes fuera del viewport

---

## Checklist pre-release

Antes de publicar cada versión verificar manualmente:

- [ ] Flujo de registro completo (incluyendo confirmación de email)
- [ ] Flujo de login con credenciales correctas e incorrectas
- [ ] Asignación de programa activo
- [ ] Inicio y finalización de un entrenamiento
- [ ] Estadísticas actualizadas después del entrenamiento
- [ ] Rankings visibles
- [ ] Perfil de usuario editable
- [ ] Búsqueda de amigos
- [ ] Solicitudes de amistad (enviar, aceptar, rechazar)
- [ ] Cambio de contraseña
- [ ] Sin crashes en navegación entre tabs
- [ ] Estados vacíos en todas las pantallas clave
- [ ] Estados de error en todas las pantallas clave
