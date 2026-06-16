---
name: android-material-you
description: Enforce ShareShelf Material 3 design standards on Android — emerald/stone color scheme, component patterns, and mobile UX best practices.
---

# Android Material You

## Purpose
Enforce premium Material 3 design standards on the ShareShelf Android app, ensuring visual consistency with the web app's emerald/stone palette while following Android-native UX patterns.

## Instructions
Apply these design rules to every Android UI you build:

### Color Scheme (Material 3)
Match the web app's emerald + stone palette with Material 3 tokens:

```kotlin
// Theme.kt
private val LightColorScheme = lightColorScheme(
    primary = Color(0xFF059669),           // emerald-600
    onPrimary = Color(0xFFFFFFFF),
    primaryContainer = Color(0xFFA7F3D0),  // emerald-200
    onPrimaryContainer = Color(0xFF064E3B), // emerald-900
    secondary = Color(0xFF78716C),         // stone-500
    onSecondary = Color(0xFFFFFFFF),
    secondaryContainer = Color(0xFFE7E5E4), // stone-200
    onSecondaryContainer = Color(0xFF292524), // stone-800
    surface = Color(0xFFFFFFFF),
    onSurface = Color(0xFF292524),          // stone-800
    surfaceVariant = Color(0xFFF5F5F4),    // stone-100
    onSurfaceVariant = Color(0xFF57534E),   // stone-600
    background = Color(0xFFFAFAF9),        // stone-50
    onBackground = Color(0xFF292524),       // stone-800
    error = Color(0xFFDC2626),             // red-600
    onError = Color(0xFFFFFFFF),
    outline = Color(0xFFD6D3D1),           // stone-300
    outlineVariant = Color(0xFFE7E5E4),    // stone-200
)
```

Never introduce new color families — keep all colors within emerald (primary), stone (neutral), and red (error only).

### Typography
Use Material 3 type scale with system fonts:
- `displayLarge` — screen titles (Home, Profile)
- `headlineMedium` — section headers
- `titleLarge` — card titles, dialog titles
- `titleMedium` — list item primary text
- `bodyLarge` — body text, descriptions, form labels
- `bodyMedium` — secondary info (dates, prices, metadata)
- `labelLarge` — buttons, chips, badges
- `labelSmall` — captions, helper text

No custom fonts unless explicitly added to the project.

### Component Patterns

#### Cards (ItemCard, BorrowCard, ReviewCard)
```kotlin
Card(
    modifier = Modifier.fillMaxWidth(),
    shape = RoundedCornerShape(16.dp),
    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
) {
    Column(modifier = Modifier.padding(16.dp)) {
        // Content with 12dp spacing
    }
}
```
- 16dp rounded corners
- 2dp elevation (subtle, not shadow-heavy)
- 16dp internal padding
- 12dp vertical spacing between card elements

#### Buttons
- **Primary action** (login, submit, request borrow): `Button` filled, emerald-600
- **Secondary action** (cancel, back): `OutlinedButton`, stone outline
- **Destructive action** (delete, reject): `Button` with error color or `OutlinedButton` with red
- **Size**: `ButtonDefaults` medium for forms, large for primary CTAs
- **Full-width** for form submit buttons (`Modifier.fillMaxWidth()`)

#### Status Badges
Color-coded chips for borrow status:
```kotlin
@Composable
fun StatusBadge(status: BorrowStatus) {
    val (text, containerColor, contentColor) = when (status) {
        BorrowStatus.PENDING -> Triple("Pending", Color(0xFFFEF3C7), Color(0xFF92400E))     // amber
        BorrowStatus.APPROVED -> Triple("Approved", Color(0xFFA7F3D0), Color(0xFF065F46))   // emerald
        BorrowStatus.REJECTED -> Triple("Rejected", Color(0xFFFEE2E2), Color(0xFF991B1B))   // red
        BorrowStatus.RETURNED -> Triple("Returned", Color(0xFFE7E5E4), Color(0xFF57534E))   // stone
    }
    AssistChip(
        onClick = {},
        label = { Text(text, style = MaterialTheme.typography.labelSmall) },
        colors = AssistChipDefaults.assistChipColors(
            containerColor = containerColor,
            labelColor = contentColor
        )
    )
}
```

#### Trust Score Display
```kotlin
@Composable
fun TrustScoreBadge(score: Double) {
    val color = when {
        score >= 4.0 -> Color(0xFF059669)   // emerald — trusted
        score >= 3.0 -> Color(0xFFD97706)   // amber — neutral
        else -> Color(0xFFDC2626)           // red — caution
    }
    Surface(
        shape = CircleShape,
        color = color.copy(alpha = 0.1f)
    ) {
        Text(
            text = String.format("%.1f", score),
            color = color,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
            style = MaterialTheme.typography.titleLarge
        )
    }
}
```

#### Loading States
- **Full screen**: Centered `CircularProgressIndicator` with emerald color
- **Button loading**: Replace text with small `CircularProgressIndicator(modifier = Modifier.size(20.dp))` inside button
- **Pull-to-refresh**: Built-in `pullToRefresh` modifier

#### Error States
- **Transient errors**: `Snackbar` from `SnackbarHost` in Scaffold
- **Load failures**: Centered error icon + message + "Retry" `OutlinedButton`
- **Network errors**: Generic "Could not connect. Check your internet." message

#### Empty States
- Icon or illustration (48dp, stone-400 color)
- Title: "No items yet" / "No borrow requests" / "No reviews"
- Subtitle: Actionable hint — "Tap + to list your first tool"
- Optional action button

### Screen Layout Rules
- **Scaffold on every screen** — TopAppBar + content + optional FAB + SnackbarHost
- **TopAppBar**: title (center-aligned), optional back arrow, optional action icons
- **Bottom nav**: 4 tabs — Browse (home icon), My Items (box icon), Borrows (swap icon), Profile (person icon)
- **FAB**: Only on list screens (Items, Borrows) for primary create action
- **Forms**: Single column, full-width fields, labels above inputs, validation errors below inputs in red
- **Content padding**: `Modifier.padding(16.dp)` on content, horizontal safe area respected
- **Scrollable forms**: `Column(verticalScroll = rememberScrollState())`

### Micro-Animations
- Button press: `animateScale` — scale to 0.97 on press, spring back
- Screen transitions: default Compose Navigation transitions (fade + slide)
- Item appearing: `AnimatedVisibility` with `fadeIn + slideInVertically` for list items
- Status change: `animateColorAsState` for score/status transitions
- Pull-to-refresh: built-in indicator

### Accessibility (a11y)
- Every clickable element has `contentDescription`
- Images: meaningful descriptions or `null` if decorative
- Color not the only indicator — status badges include text labels
- Minimum touch target: 48dp × 48dp
- Testing: all screens navigable via TalkBack

### Responsive Rules
- **Phone (compact)**: Single column, bottom nav
- **Tablet (medium/expanded)**: List-detail layout (items on left, detail on right), navigation rail instead of bottom nav
- Use `WindowSizeClass` from `material3-adaptive` to detect

### Do NOT
- Hardcode colors — always use `MaterialTheme.colorScheme.*`
- Use arbitrary padding/margin values — stick to 4, 8, 12, 16, 24, 32, 48
- Create custom button or card styles outside the Material 3 component API
- Add new color families (no blue, orange, purple, etc.)
- Use XML layouts — everything is Compose
- Skip loading/error/empty states on any screen
