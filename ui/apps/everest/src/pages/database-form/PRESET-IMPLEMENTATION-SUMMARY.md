# Instance Presets UI - Phase 1 Implementation Summary

## ✅ Completed Implementation

### 1. API Integration (`hooks/api/instance-presets/`)

**Files Created:**
- `api.ts` - API client functions for preset endpoints
- `useInstancePresets.ts` - Hook to list presets (with optional provider filter)
- `useInstancePreset.ts` - Hook to fetch a single preset
- `useResolvedInstancePreset.ts` - Hook to fetch preset with namespace defaults
- `index.ts` - Exports for all hooks

**Endpoints Used:**
```typescript
GET /clusters/{cluster}/instance-presets?provider={provider}
GET /clusters/{cluster}/instance-presets/{name}
GET /clusters/{cluster}/instance-presets/{name}/resolve?namespace={namespace}
```

### 2. Type Definitions (`shared-types/api.types.ts`)

Added types:
```typescript
export type InstancePreset = CrdsGen.components['schemas']['InstancePreset'];
export type GetInstancePresetsPayload = CrdsGen.components['schemas']['InstancePresetList'];
```

### 3. Form Schema Updates

**`consts.ts`:**
- Added `instancePreset` to `DbWizardForm` enum
- Added `INSTANCE_PRESET_ANNOTATION` constant

**`utils/get-default-values.ts`:**
- Added `instancePreset: null` to default form values

### 4. UI Components

**`database-form-body/steps/base-step/preset-selector.tsx`:**
- Autocomplete component for selecting presets
- Filters presets by selected provider
- Shows loading state
- Displays "No presets available" message when empty

**`database-form-body/steps/base-step/base-step.tsx`:**
- Integrated PresetSelector into first step
- Positioned after namespace selection, before instance name
- Disabled in restore mode

### 5. Form Logic Hooks

**`hooks/use-preset-loader.ts`:**
- Fetches resolved preset when preset + namespace are selected
- Pre-fills form fields with preset values
- Maps preset spec to form structure
- Handles topology, version, components, and global config

**`hooks/use-is-preset-mode.ts`:**
- Determines if form is in preset mode
- Returns true when preset is selected (Phase 1: read-only)
- Ready for Phase 2: will allow editing with overrides

### 6. Instance Creation with Annotation

**`api/instanceApi.ts`:**
```typescript
export const createDbInstanceFn = async (
  // ...
  presetName?: string  // NEW parameter
) => {
  const annotations = presetName
    ? { [INSTANCE_PRESET_ANNOTATION]: presetName }
    : undefined;
  // Adds annotation to instance metadata
}
```

**`hooks/api/db-instances/useCreateDbInstance.ts`:**
- Extracts preset name from form
- Passes preset name to `createDbInstanceFn`
- Handles both object and string preset formats

### 7. Export Configuration

**`hooks/api/index.ts`:**
- Added `export * from './instance-presets'`
- Makes preset hooks available throughout the app

## 🎯 Phase 1 Requirements Met

✅ **One-click deployment** - User can select a preset and create instance with pre-filled values  
✅ **Preset selection** - Dropdown shows available presets for selected provider  
✅ **Namespace defaults** - Presets are resolved with namespace-scoped defaults  
✅ **Form pre-fill** - Selected preset populates form fields automatically  
✅ **Read-only preview** - Form is in read-only mode when using preset (via `useIsPresetMode`)  
✅ **Annotation tracking** - `openeverest.io/instance-preset` annotation added to instances  

## 📋 Usage Flow

1. User navigates to "Create Database"
2. User selects namespace
3. User selects preset (optional)
   - Presets dropdown filters by provider
   - Shows only presets for selected provider
4. Form automatically populates with preset values
   - Topology, version, components, etc.
   - Namespace-scoped defaults are resolved
5. User reviews configuration (read-only in Phase 1)
6. User clicks "Create"
7. Instance is created with annotation

## 🔧 Key Implementation Details

### Preset Name Handling

The implementation handles preset names in both formats:
```typescript
// Object format (from AutoComplete)
{ label: "preset-name", value: "preset-name" }

// String format
"preset-name"
```

### Namespace Default Resolution

When a preset is selected:
1. UI fetches preset with `/resolve?namespace={ns}` endpoint
2. Server pre-fills namespace-scoped fields:
   - MonitoringConfig names
   - Secret references
   - Other namespace-scoped resources
3. UI receives fully-resolved preset ready for form population

### Form Field Mapping

The `usePresetLoader` hook maps preset spec to form fields:
```typescript
spec.topology.type → form.topology
spec.version → form.version
spec.components.* → form.components.*
spec.global → form.global
```

## 📝 Files Modified/Created

### Created (New Files):
1. `hooks/api/instance-presets/api.ts`
2. `hooks/api/instance-presets/useInstancePresets.ts`
3. `hooks/api/instance-presets/useInstancePreset.ts`
4. `hooks/api/instance-presets/useResolvedInstancePreset.ts`
5. `hooks/api/instance-presets/index.ts`
6. `database-form-body/steps/base-step/preset-selector.tsx`
7. `hooks/use-preset-loader.ts`
8. `hooks/use-is-preset-mode.ts`
9. `README-PRESETS.md` (this file)
10. `PRESET-IMPLEMENTATION-SUMMARY.md`

### Modified (Updated Files):
1. `shared-types/api.types.ts` - Added InstancePreset types
2. `consts.ts` - Added instancePreset field and annotation constant
3. `utils/get-default-values.ts` - Added preset to defaults
4. `database-form-body/steps/base-step/base-step.tsx` - Added PresetSelector
5. `api/instanceApi.ts` - Added preset annotation support
6. `hooks/api/db-instances/useCreateDbInstance.ts` - Pass preset to API
7. `hooks/api/index.ts` - Export preset hooks

## 🚀 Testing

### Manual Testing Checklist:

- [ ] Presets dropdown appears in database creation form
- [ ] Presets are filtered by selected provider
- [ ] Selecting a preset pre-fills form fields
- [ ] Namespace defaults are resolved correctly
- [ ] Instance is created with annotation
- [ ] Instance creation works without preset (backward compatible)
- [ ] Form behaves normally in edit/restore modes

### Test Preset:

```yaml
apiVersion: core.openeverest.io/v1alpha1
kind: InstancePreset
metadata:
  name: mongodb-test-preset
spec:
  provider: percona-server-mongodb
  topology:
    type: replicaSet
  version: "8.0.12"
  components:
    engine:
      type: mongod
      replicas: 3
      resources:
        limits:
          cpu: "1"
          memory: 4Gi
      storage:
        size: 25Gi
```

## 🔮 Phase 2 Preparation

The implementation is structured for easy Phase 2 enhancements:

1. **`useIsPresetMode` hook** - Can be updated to return false or add override tracking
2. **Form fields** - Already structured for preset overrides
3. **API hooks** - Ready for CRUD operations (POST, PUT, DELETE presets)
4. **Annotation** - Already tracking which preset was used

Phase 2 will add:
- Editable form fields with preset overrides
- Preset management UI (create/edit/delete)
- "Create preset from instance" functionality
- RBAC for `deploy` vs `create` permissions

## 📚 References

- **Specification**: See preset spec provided by user
- **API Endpoints**: `/clusters/{cluster}/instance-presets/*`
- **CRD**: `InstancePreset` (core.openeverest.io/v1alpha1)
- **Annotation**: `openeverest.io/instance-preset`

## ✨ Summary

Phase 1 of the Instance Presets UI is **complete**. Users can now:
- Select presets during database creation
- View pre-filled configuration from presets
- Create instances with preset tracking via annotations
- Benefit from one-click deployment with sensible defaults

The implementation is server-side compatible, type-safe, and ready for Phase 2 enhancements.
