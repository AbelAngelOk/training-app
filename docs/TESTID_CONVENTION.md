# Convención de testIDs

## Propósito

Los `testID` permiten identificar componentes de forma estable para:
- Testing automatizado (React Native Testing Library, Detox, Maestro)
- Debugging en herramientas de inspección
- Análisis por herramientas de IA

---

## Patrón

```
{screen}-{section?}-{component}-{qualifier?}
```

### Reglas

1. **Kebab-case** siempre (sin camelCase, sin espacios, sin puntos)
2. **Estable**: no cambiar cuando cambie el texto visible del componente
3. **Jerárquico**: de pantalla a elemento específico
4. **Semántico**: describir QUÉ es el elemento, no cómo se ve
5. Solo en componentes interactivos o elementos que los tests necesiten seleccionar

### Segmentos

| Segmento | Descripción | Ejemplo |
|---|---|---|
| `screen` | Pantalla o sección principal | `register`, `login`, `training`, `profile-edit` |
| `section` (opcional) | Sub-sección dentro de la pantalla | `friends`, `stats`, `fab` |
| `component` | Tipo de elemento | `input`, `button`, `list`, `card`, `indicator` |
| `qualifier` (opcional) | Diferenciador si hay múltiples del mismo tipo | `email`, `password`, `create-program` |

---

## Referencia completa por pantalla

### Autenticación

#### /register

| testID | Elemento |
|---|---|
| `register-display-name-input` | Campo de nombre |
| `register-email-input` | Campo de email |
| `register-password-input` | Campo de contraseña |
| `register-password-toggle-button` | Botón show/hide contraseña |
| `register-password-confirm-input` | Campo de confirmar contraseña |
| `register-password-confirm-toggle-button` | Botón show/hide confirmación |
| `register-password-strength-indicator` | Barra de fortaleza |
| `register-password-criteria-uppercase` | Criterio mayúscula |
| `register-password-criteria-lowercase` | Criterio minúscula |
| `register-password-criteria-number` | Criterio número |
| `register-password-criteria-special` | Criterio carácter especial |
| `register-password-criteria-length` | Criterio longitud mínima |
| `register-submit-button` | Botón "Crear cuenta" |
| `register-success-message` | Mensaje de éxito post-registro |
| `register-error-message` | Mensaje de error |
| `register-login-link` | Link "Ya tengo cuenta" |

#### /login

| testID | Elemento |
|---|---|
| `login-email-input` | Campo de email |
| `login-password-input` | Campo de contraseña |
| `login-password-toggle-button` | Botón show/hide contraseña |
| `login-submit-button` | Botón "Iniciar sesión" |
| `login-error-message` | Mensaje de error |
| `login-forgot-password-link` | Link "¿Olvidaste tu contraseña?" |
| `login-register-link` | Link "Crear cuenta" |

#### /forgot-password

| testID | Elemento |
|---|---|
| `forgot-password-email-input` | Campo de email |
| `forgot-password-submit-button` | Botón "Enviar link" |
| `forgot-password-success-message` | Mensaje de éxito |

---

### Training

#### /training (index)

| testID | Elemento |
|---|---|
| `training-header-greeting` | Saludo con nombre del usuario |
| `training-active-program-card` | Card del programa activo |
| `training-streak-value` | Valor de racha actual |
| `training-next-session-value` | Próxima sesión |
| `training-week-section` | Sección "Esta semana" |
| `training-week-session-item` | Item de sesión en la lista semanal |
| `training-empty-state` | Estado vacío (sin programa) |
| `training-empty-state-explore-button` | Botón "Ver programas" |
| `training-fab-button` | Botón flotante "+" |
| `training-fab-create-program-option` | Opción "Crear programa" del FAB |
| `training-fab-explore-programs-option` | Opción "Programas preestablecidos" del FAB |

#### /training/program/create

| testID | Elemento |
|---|---|
| `program-create-name-input` | Campo nombre |
| `program-create-description-input` | Campo descripción |
| `program-create-submit-button` | Botón "Crear programa" |
| `program-create-error-message` | Mensaje de error |

---

### Explore

#### /explore (index)

| testID | Elemento |
|---|---|
| `explore-search-input` | Input de búsqueda |
| `explore-program-card` | Card de programa |
| `explore-program-card-name` | Nombre del programa en la card |
| `explore-program-card-assign-button` | Botón "Usar programa" |
| `explore-empty-state` | Estado vacío |

---

### Rankings

#### /rankings (index)

| testID | Elemento |
|---|---|
| `rankings-scope-selector` | Selector de alcance (amigos/ciudad/etc.) |
| `rankings-type-selector` | Selector de tipo (horas/peso) |
| `rankings-list` | Lista de rankings |
| `rankings-list-item` | Item de ranking |
| `rankings-empty-state` | Estado vacío |

---

### Profile

#### /profile (index)

| testID | Elemento |
|---|---|
| `profile-avatar` | Avatar del usuario |
| `profile-display-name` | Nombre visible |
| `profile-tag` | Tag único (@usuario) |
| `profile-subscription-badge` | Badge Free/Premium |
| `profile-stats-hours` | Estadística horas |
| `profile-stats-sessions` | Estadística sesiones |
| `profile-stats-weight` | Estadística peso |
| `profile-stats-streak` | Estadística racha |
| `profile-edit-button` | Opción "Editar perfil" |
| `profile-friends-button` | Opción "Amigos" |
| `profile-achievements-button` | Opción "Logros" |
| `profile-subscription-button` | Opción "Suscripción Premium" |
| `profile-settings-button` | Opción "Configuración" |
| `profile-personalization-button` | Opción "Personalización" |
| `profile-signout-button` | Botón "Cerrar sesión" |

#### /profile/edit

| testID | Elemento |
|---|---|
| `profile-edit-display-name-input` | Campo nombre |
| `profile-edit-tag-input` | Campo tag |
| `profile-edit-tag-availability` | Indicador disponibilidad del tag |
| `profile-edit-bio-input` | Campo descripción |
| `profile-edit-city-input` | Campo ciudad |
| `profile-edit-province-input` | Campo provincia |
| `profile-edit-country-input` | Campo país |
| `profile-edit-save-button` | Botón guardar |
| `profile-edit-error-message` | Mensaje de error |

#### /profile/friends

| testID | Elemento |
|---|---|
| `profile-friends-search-input` | Input de búsqueda |
| `profile-friends-search-result-list` | Lista de resultados |
| `profile-friends-search-result-item` | Item de resultado |
| `profile-friends-send-request-button` | Botón "Agregar" |
| `profile-friends-pending-list` | Lista de solicitudes pendientes |
| `profile-friends-pending-item` | Item de solicitud pendiente |
| `profile-friends-accept-button` | Botón aceptar solicitud |
| `profile-friends-reject-button` | Botón rechazar solicitud |
| `profile-friends-list` | Lista de amigos |
| `profile-friends-item` | Item de amigo |
| `profile-friends-empty-state` | Estado vacío |

#### /profile/achievements

| testID | Elemento |
|---|---|
| `profile-achievements-list` | Grid de logros |
| `profile-achievements-item` | Item de logro |
| `profile-achievements-item-unlocked` | Logro desbloqueado |
| `profile-achievements-item-locked` | Logro bloqueado |

#### /profile/settings

| testID | Elemento |
|---|---|
| `settings-change-email-button` | Opción cambiar email |
| `settings-change-password-button` | Opción cambiar contraseña |
| `settings-new-email-input` | Input nuevo email |
| `settings-current-password-input` | Input contraseña actual |
| `settings-new-password-input` | Input nueva contraseña |
| `settings-confirm-password-input` | Input confirmar contraseña |
| `settings-save-button` | Botón guardar |
| `settings-success-message` | Mensaje de éxito |
| `settings-error-message` | Mensaje de error |

#### /profile/personalization

| testID | Elemento |
|---|---|
| `personalization-theme-wolf` | Opción tema Wolf |
| `personalization-theme-fox` | Opción tema Fox (próximamente) |
| `personalization-theme-crimson` | Opción tema Crimson Night (próximamente) |

---

### Globales

#### /user/[id] — Perfil público

| testID | Elemento |
|---|---|
| `user-profile-avatar` | Avatar |
| `user-profile-display-name` | Nombre |
| `user-profile-tag` | Tag |
| `user-profile-send-request-button` | Botón solicitud de amistad |
| `user-profile-request-sent-label` | Label "Solicitud enviada" |
| `user-profile-friends-label` | Label "Ya son amigos" |

---

## Implementación en código

```tsx
// Uso en componentes
<TextInput
  testID="register-email-input"
  value={email}
  onChangeText={setEmail}
/>

<Pressable testID="register-submit-button" onPress={handleSubmit}>
  <Text>Crear cuenta</Text>
</Pressable>
```

```typescript
// Uso en tests
const emailInput = screen.getByTestId('register-email-input')
const submitButton = screen.getByTestId('register-submit-button')

fireEvent.changeText(emailInput, 'test@example.com')
fireEvent.press(submitButton)
```

---

## Qué NO incluir como testID

- Elementos puramente decorativos (íconos sin función, separadores)
- Texto estático que no el test necesita seleccionar
- Contenedores wrapper sin función interactiva propia
