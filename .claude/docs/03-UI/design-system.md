# Design System

## Objetivo

La aplicación debe transmitir una sensación de producto premium, moderno y enfocado en entrenamiento físico.

La experiencia visual debe sentirse cercana a:

* Apple Fitness
* Whoop
* Oura
* Nike Training Club
* Strava Premium

La interfaz debe ser elegante, minimalista y centrada en la ejecución de entrenamientos.

---

# Idioma

Toda la interfaz debe mostrarse en español.

Ejemplos:

* Entrenamiento
* Sesión
* Actividad
* Perfil
* Ranking
* Amigos

No utilizar textos visibles en inglés dentro de la aplicación.

---

# Filosofía Visual

La interfaz debe priorizar:

* Simplicidad
* Espacios amplios
* Jerarquía visual clara
* Sensación premium
* Experiencia inmersiva
* Contenido visual

Evitar:

* Interfaces sobrecargadas
* Bordes agresivos
* Tablas complejas
* Formularios extensos
* Estética corporativa tradicional

---

# Temas

La aplicación debe soportar múltiples temas visuales.

El usuario podrá seleccionar el tema desde la configuración.

Todos los componentes deben utilizar colores provenientes del sistema de temas.

Nunca utilizar colores hardcodeados dentro de componentes.

Ejemplo:

```typescript
theme.colors.background
theme.colors.surface
theme.colors.primary
theme.colors.accent
theme.colors.textPrimary
theme.colors.textSecondary
```

---

# Tema Predeterminado

## Wolf

Inspirado en una estética elegante y minimalista basada en tonos grises, plata y azul frío.

Representa:

* Disciplina
* Constancia
* Profesionalismo
* Elegancia

### Paleta

```css
Background:      #0B0D10
Surface:         #1B1F24
Surface Light:   #2A3038

Primary:         #B4BAC1
Primary Light:   #DCE0E5

Accent:          #7088A0
Accent Light:    #9AB2CA

Text Primary:    #F4F6F8
Text Secondary:  #A3ABB3

Success:         #54C58D
Warning:         #F2BA62
Error:           #DF6A6A
```

---

# Tema Alternativo

## Fox

Inspirado en tonos cálidos y energéticos.

Representa:

* Actividad
* Movimiento
* Motivación
* Deporte

### Paleta

```css
Background:      #141112
Surface:         #241E20
Surface Light:   #342A2D

Primary:         #D36D3D
Primary Light:   #F29A65

Accent:          #37A8D9
Accent Light:    #7ED3FF

Text Primary:    #F7F4F2
Text Secondary:  #C8BEB8

Success:         #58C977
Warning:         #F5B348
Error:           #E45C5C
```

---

# Tema Alternativo

## Crimson Night

Inspirado en tonos rojos intensos y estética competitiva.

Representa:

* Competencia
* Desafío
* Progreso
* Superación

### Paleta

```css
Background:      #120B0D
Surface:         #221519
Surface Light:   #352126

Primary:         #D84C5B
Primary Light:   #FF7683

Accent:          #8BD6FF
Accent Light:    #C4EEFF

Text Primary:    #FFF8F8
Text Secondary:  #D2C4C6

Success:         #54C58D
Warning:         #F4B452
Error:           #FF5F73
```

---

# Fondos

La aplicación debe utilizar fondos oscuros.

El fondo principal debe ocupar toda la pantalla.

Evitar fondos blancos.

Evitar degradados excesivos.

---

# Contenedores

## Apariencia

Los contenedores deben sentirse flotantes.

Inspiración:

* Whoop
* Oura
* Apple Fitness

Características:

* Fondo ligeramente más claro que el fondo.
* Bordes casi invisibles.
* Sombras suaves.
* Mucho espacio visual.

---

## Bordes

No utilizar bordes marcados.

Preferir:

```css
rgba(255,255,255,0.05)
```

o su equivalente según el tema.

---

## Radio de Bordes

Tarjetas:

```css
24px
```

Botones:

```css
16px
```

Modales:

```css
28px
```

Inputs:

```css
16px
```

---

# Espaciado

Mantener sensación de aire visual.

Escala recomendada:

```css
4px
8px
16px
24px
32px
48px
```

Evitar elementos demasiado juntos.

---

# Tipografía

## Fuente Principal

Preferencia:

* Inter

Alternativas:

* SF Pro
* Geist

---

# Jerarquía Tipográfica

## Título Principal

```css
32px
font-weight: 700
```

---

## Título de Pantalla

```css
24px
font-weight: 600
```

---

## Título de Tarjeta

```css
18px
font-weight: 600
```

---

## Texto Normal

```css
16px
font-weight: 400
```

---

## Texto Secundario

```css
14px
font-weight: 400
```

---

# Botones

## Primario

Acción principal de la pantalla.

Características:

* Grande
* Visible
* Fácil de presionar

Altura recomendada:

```css
56px
```

---

## Secundario

Acciones complementarias.

Menor protagonismo visual.

---

## Floating Action Button

Utilizado para:

* Crear entrenamiento
* Crear sesión

Debe permanecer visible cuando corresponda.

---

# Tarjetas

Las tarjetas deben ser el componente visual principal de la aplicación.

Cada tarjeta puede contener:

* Imagen
* Título
* Descripción
* Estado
* Acción principal

---

# Iconografía

Utilizar:

* Lucide Icons

o

* Expo Vector Icons

Mantener consistencia en toda la aplicación.

---

# Indicadores

Utilizar:

* Anillos de progreso
* Barras de progreso
* Estadísticas visuales
* Tarjetas resumidas

Evitar tablas siempre que sea posible.

---

# Pantalla de Entrenamiento

La pantalla de entrenamiento es una de las pantallas principales.

Las sesiones deben mostrarse como tarjetas grandes.

Cada tarjeta debe contener:

* Imagen de fondo
* Nombre
* Estado
* Botón Play

Estados:

* Pendiente
* Atrasada
* Realizada

---

# Pantalla de Sesión

Las actividades deben mostrarse en lista.

Cada actividad debe mostrar:

* Nombre
* Estado
* Progreso

Estados:

* Pendiente
* Realizada
* Cancelada

---

# Pantalla de Actividad

Es la pantalla más importante de toda la aplicación.

Inspiración:

* TikTok
* Reels
* Shorts

---

## Layout

El video debe ocupar la mayor parte de la pantalla.

La información debe mantenerse al mínimo.

Elementos visibles:

* Video
* Nombre
* Serie actual
* Temporizador
* Descanso
* Progreso

---

## Prioridad Visual

1. Video
2. Temporizador
3. Serie actual
4. Descanso
5. Progreso

---

# Pantalla de Perfil

Debe ser altamente visual.

Componentes:

* Avatar
* Nombre
* Nivel
* Estadísticas
* Calendario
* Logros
* Racha

---

## Estadísticas Principales

Mostrar:

* Horas entrenadas
* Peso acumulado levantado
* Kilómetros recorridos
* Sesiones realizadas

---

## Calendario

Debe mostrar:

* Actividades programadas
* Actividades realizadas
* Actividades omitidas

Cada estado debe tener un indicador visual diferente.

---

# Rankings

Deben mostrarse mediante:

* Tarjetas
* Podios
* Listas visuales

Evitar tablas tradicionales.

---

# Animaciones

Las animaciones deben ser:

* Cortas
* Fluidas
* Funcionales

Duración recomendada:

```css
200ms - 400ms
```

---

# Accesibilidad

Todos los botones deben poseer un área mínima de interacción:

```css
44px x 44px
```

La aplicación debe soportar:

* Fuentes ampliadas
* Lectores de pantalla
* Contraste adecuado

---

# Responsividad

La aplicación debe funcionar correctamente en:

* Android
* iPhone
* Tablets Android
* iPad

---

# Regla General

Ante cualquier duda de diseño:

Elegir siempre la alternativa más simple, más limpia, más moderna y más premium.
