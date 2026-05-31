# autoinspectai Inspection App - Project Context

This file is the single source of truth for the inspection app, media capture behavior, and the fixes that were documented in the deleted markdown files.

## Catalog-Driven UI Rules

All inspection step screens are rendered from the catalog API:
`GET /api/v1/forms/inspection-report/catalog?view=tree`

### API Schema

Each catalog node contains:
- `type`: `group` or `field`
- `key`: shared identifier, merged by key when siblings repeat
- `label`: display label, sometimes with `/` separators
- `path`: storage path such as `vehicleDetails.chassisEmbossing`
- `inputs[]`: array of `{ inputType, dataType, allowsMultiple, options[] }`
- `children[]`: nested nodes

### Rendering Rules

- Depth 0 groups render inline as the step sections themselves.
- Nested groups render as tappable `GroupPhotoCard` entries.
- For file uploads, `field` nodes render `PhotoCapture` or `VideoCapture` directly.
- For nested `group` nodes, use `GroupPhotoCard` and open `InspectionImageDetailPanel`.
- `select` + `BOOLEAN` uses `ChipSelector` with Yes/No labels.
- `select` + `STRING` uses `ChipSelector` with option labels.
- `multi-select` uses `MultiSelectChips`.
- `text` or `number` with options renders one input per option.
- `text` or `number` without options renders a single `AppInput`.

### File Upload Label Rules

- If the option label is `image`, render `PhotoCapture` using the node label.
- If the option label is `video`, render `VideoCapture` using the node label.
- Otherwise, use the option label itself such as `RC Front` or `Front Main`.

### Conditional Sub-Options

- Some `select` options carry `subOptions1`.
- When the option is selected, render its sub-options beneath the chip selector.
- `file-upload` sub-options use `PhotoCapture` or `VideoCapture` based on the sub-option label.
- The storage path becomes `${nodePath}.${sub.value}`.
- `multi-select` sub-options use `MultiSelectChips` with `subOptions2` choices.
- This is used for conditional media capture, such as sunroof or music system follow-up uploads.

### Same-Key Merging

- Nodes with the same `key` at the same level are merged.
- At depth 0, merged nodes render inline under one tab.
- At depth 1 or deeper, merged nodes render as one `GroupPhotoCard`.

### Tab Bar

- Top-level groups become horizontal tabs.
- The tab bar appears only when there are at least two top-level sections.
- Each tab shows a badge for filled fields.

### Section to Step Mapping

| Step | File | Section key | `InspectionStepId` |
|------|------|-------------|-------------------|
| 1 | `Step1_BasicVerification.tsx` | `vehicle` | `BasicVerification` |
| 2 | `Step4_Engine.tsx` | `engineTransmission` | `Engine` |
| 3 | `Step2_AirConditioning.tsx` | `airConditioning` | `Exterior` |
| 4 | `Step3_Interior.tsx` | `steeringBrakes` | `Interior` |
| 5 | `Step5_ElectricalsInteriors.tsx` | `electricalInteriors` | `Documents` |
| 6 | `Step6_Media.tsx` | `exterior` | `Media` |

### Adding a new section

**Note:** With the fully dynamic catalog approach, sections are automatically added when the backend includes them in the catalog API response. No frontend code changes needed!

If you need to add section-specific logic:
1. Backend adds new section to catalog API
2. Frontend automatically renders it via `DynamicInspectionStep`
3. No code changes required - fully dynamic!

### Catalog service location
`autoinspectai/src/services/api/catalogService.ts`

### ViewModel location
`autoinspectai/src/viewmodels/catalogViewModel.ts`

### Shared rendering helpers
The following pure functions are duplicated across step screens (Step1, Step2, Step3, Step4).
They are intentionally kept local to each screen to avoid cross-screen coupling:
- `renderNodes(nodes, handlers, depth)` — recursive node renderer
- `renderSingleNode(node, handlers, keyPrefix, depth)` — single node dispatcher
- `renderInput(input, nodePath, nodeLabel, issueOptions, handlers)` — input type dispatcher
- `mergeByKey(nodes)` — merges same-key siblings
- `collectIssueOptions(children)` — extracts multi-select options from children for photo panels
- `getInputs(node)` — extracts inputs array (handles both new and legacy schema)
- `getChildren(node)` — extracts children array

### Navigation
- Login screen is bypassed for debugging — `RootNavigator` starts at `MainTabs`
- To re-enable login: add `<Stack.Screen name="Login" component={LoginScreen} />` and set `initialRouteName="Login"`

### Data storage
- Form data stored in `InspectionStore` via `updateFormData(stepId, { [path]: value })`
- Photo details stored in `media.documentPhotoDetails` keyed by slot path (e.g. `carImages.frontMain`)
- Direct captures (field file-upload) stored as `{ photos: [uri], status: 'good' }`

---

## Firebase Authentication & Google Sign-In

### Overview
Production-ready Google Sign-In with Firebase Authentication, session persistence, and TypeScript support.

### Configuration Status ✅

#### Android Build Configuration
- **Kotlin Version:** 2.0.21 (compatible with Firebase Auth)
- **Kotlin Metadata Fix:** Added `-Xskip-metadata-version-check` flag
- **Files Modified:** 
  - `android/build.gradle` — updated `kotlinVersion`
  - `android/app/build.gradle` — added Kotlin compiler configuration

#### Firebase Setup
- Firebase Project Created
- Android App Added with google-services.json
- Firebase Auth Enabled
- Google Sign-In Provider Enabled
- SHA1 & SHA256 Fingerprints Added to Firebase Console
- Web Client ID: `1082830632125-8hdstm7u2jcvgfato0itn34su78l1fb0.apps.googleusercontent.com`

#### Packages Installed
```json
{
  "@react-native-firebase/app": "^24.0.0",
  "@react-native-firebase/auth": "^24.0.0",
  "@react-native-google-signin/google-signin": "^13.2.0"
}
```

### Architecture

#### File Structure
```
src/
├── services/auth/
│   ├── index.ts                    # Exports
│   ├── types.ts                    # TypeScript interfaces
│   └── firebaseAuthService.ts      # Core auth logic
├── context/
│   └── AuthContext.tsx             # Auth context provider
├── features/auth/screens/
│   └── LoginScreen.tsx             # Google Sign-In UI
└── navigation/
    ├── RootNavigator.tsx           # Protected navigation logic
    └── MainTabNavigator.tsx        # Dashboard + Profile tabs
```

#### Core Components

**firebaseAuthService** (`src/services/auth/firebaseAuthService.ts`)
- `configureGoogleSignIn()` — Configures Google Sign-In with Web Client ID, offline access, and refresh token
- `loginWithGoogle()` — Signs in via Google, exchanges ID token for Firebase credential
- `logout()` — Signs out from Google and Firebase
- `getCurrentUser()` — Returns current AuthUser or null
- `onAuthStateChanged(callback)` — Listens to auth state changes for session persistence

**AuthContext** (`src/context/AuthContext.tsx`)
- Provides: `user`, `loading`, `error`, `login()`, `logout()`, `clearError()`
- Registers Firebase auth state listener on mount
- Handles session persistence via `onAuthStateChanged`
- Manages error states and loading indicators

**RootNavigator** (`src/navigation/RootNavigator.tsx`)
- Protected navigation: shows LoginScreen if no user, MainTabs if authenticated
- Shows loading indicator during auth state check
- Prevents flickering between screens

**LoginScreen** (`src/features/auth/screens/LoginScreen.tsx`)
- Google Sign-In button with loading state
- Error message display
- Professional UI with logo, welcome message, terms

**Dashboard & Profile** (`src/navigation/MainTabNavigator.tsx`)
- Dashboard: displays user greeting and name from Firebase
- Profile: shows user details (email, ID, status), includes Sign Out button
- Both include logout with confirmation dialog

### Sign-In Flow

1. App mounts → `AuthProvider` sets up Firebase listener
2. `onAuthStateChanged` checks for existing session
3. If no session → `RootNavigator` shows `LoginScreen`
4. User taps "Continue with Google"
5. Google account selector appears
6. On success → Google returns idToken
7. Firebase credential created from idToken
8. Firebase signs in user
9. AuthContext updates with user data
10. RootNavigator automatically shows MainTabs
11. Session persists on app restart via Firebase stored token

### Session Persistence

- Firebase SDK stores auth token securely on device
- `onAuthStateChanged` listener checks token on app startup
- If valid → user automatically signed in
- If invalid/expired → user sent to LoginScreen
- No manual token handling required

### Sign-Out Flow

1. User taps "Sign Out" on Dashboard or Profile
2. Confirmation dialog appears
3. `logout()` called
   - Calls `GoogleSignin.signOut()` — clears Google session
   - Calls `auth().signOut()` — clears Firebase session
4. AuthContext sets user to null
5. RootNavigator shows LoginScreen
6. Session cleared

### Error Handling

**Handled Errors:**
- `SIGN_IN_CANCELLED` — user cancelled Google sign-in
- `IN_PROGRESS` — sign-in already in progress
- `PLAY_SERVICES_NOT_AVAILABLE` — Google Play Services not available
- Network errors → descriptive error messages
- Firebase auth failures → error alerts

**UX Feedback:**
- Loading indicators during async operations
- Error messages displayed on LoginScreen
- Alert dialogs for errors
- Try-catch blocks in all async methods

### TypeScript Types

**AuthUser** — User data after authentication
```typescript
interface AuthUser {
  uid: string;           // Firebase unique ID
  email: string | null;  // Google account email
  displayName: string | null;  // Google account name
  photoURL: string | null;     // Google profile picture
}
```

**AuthContextValue** — Context API shape
```typescript
interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}
```

### Usage Example

```typescript
// In any component
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, loading, error, login, logout } = useAuth();

  // Access user data
  console.log(user?.displayName);
  console.log(user?.email);

  // Sign in
  const handleSignIn = async () => {
    try {
      await login();
      // Navigation happens automatically
    } catch (err) {
      console.error('Login failed:', err.message);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await logout();
      // User sent to LoginScreen automatically
    } catch (err) {
      console.error('Logout failed:', err.message);
    }
  };

  if (loading) return <LoadingIndicator />;

  return (
    <>
      {error && <ErrorMessage message={error} />}
      <Text>Welcome, {user?.displayName}</Text>
      <Button title="Sign Out" onPress={handleSignOut} />
    </>
  );
}
```

### Important Notes

1. **Web Client ID Required** — Must be from Firebase Console, not Android Client ID
2. **google-services.json Required** — Must be in `android/app/` directory
3. **SHA Fingerprints Required** — Must match Firebase Console configuration
4. **Google Play Services** — Device must have Google Play Services installed
5. **Session Auto-Persists** — Users stay logged in across app restarts by default
6. **Kotlin Compatibility** — Kotlin 2.0.21+ required for Firebase Auth compatibility
