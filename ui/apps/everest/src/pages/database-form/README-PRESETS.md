# Instance Presets UI Implementation (Phase 1)

## Overview

This directory contains the Phase 1 implementation of Instance Presets UI for OpenEverest. Presets allow users to quickly deploy database instances with pre-configured settings.

## Phase 1 Features

✅ **Implemented:**
- Preset selection in database creation form
- Fetching presets by provider
- Resolving presets with namespace defaults
- Pre-filling form fields with preset values
- Adding `openeverest.io/instance-preset` annotation to created instances
- Read-only form preview when using presets (Phase 1 requirement)

## Architecture

### API Hooks (`hooks/api/instance-presets/`)

- **`useInstancePresets(provider?)`** - Lists all presets, optionally filtered by provider
- **`useInstancePreset(name)`** - Fetches a specific preset
- **`useResolvedInstancePreset(name, namespace)`** - Fetches preset with namespace defaults pre-filled

### Components

- **`PresetSelector`** (`database-form-body/steps/base-step/preset-selector.tsx`)
  - Autocomplete component for selecting presets
  - Displays in the first step of database form
  - Filters presets by selected provider

### Hooks

- **`usePresetLoader`** (`hooks/use-preset-loader.ts`)
  - Loads selected preset and populates form fields
  - Handles namespace default resolution
  - Maps preset spec to form structure

### API Integration

API endpoints used:
```
GET /clusters/{cluster}/instance-presets?provider={provider}
GET /clusters/{cluster}/instance-presets/{name}/resolve?namespace={namespace}
```

### Instance Creation

When creating an instance from a preset:
1. User selects preset in first step
2. Preset is resolved with namespace defaults
3. Form is populated with preset values
4. On submit, `openeverest.io/instance-preset` annotation is added to Instance CR

## Usage

### Selecting a Preset

1. Navigate to Create Database
2. Select namespace
3. Select a preset from the dropdown (optional)
4. Form pre-fills with preset values
5. Review configuration (read-only in Phase 1)
6. Click Create

### Form Behavior

**With Preset:**
- Form fields are pre-filled from preset
- Form is read-only (Phase 1)
- Annotation is added to created Instance

**Without Preset:**
- Form behaves normally
- All fields are editable
- No annotation is added

## Future Phases

**Phase 2 (Planned):**
- Editable form fields when using presets
- Preset management UI (create, edit, delete presets)
- "Create preset from instance" functionality
- RBAC for preset management

## Type Definitions

### InstancePreset

```typescript
export type InstancePreset = CrdsGen.components['schemas']['InstancePreset'];
export type GetInstancePresetsPayload = CrdsGen.components['schemas']['InstancePresetList'];
```

Added to `shared-types/api.types.ts`

### Form Field

Added `instancePreset` to `DbWizardFormFields`:
```typescript
export enum DbWizardForm {
  // ...existing fields
  instancePreset = 'instancePreset',
}
```

## Constants

```typescript
export const INSTANCE_PRESET_ANNOTATION = 'openeverest.io/instance-preset';
```

## Testing

To test the preset functionality:

1. Ensure presets exist in the cluster:
   ```bash
   kubectl get instancepresets
   ```

2. Create a test preset:
   ```yaml
   apiVersion: core.openeverest.io/v1alpha1
   kind: InstancePreset
   metadata:
     name: test-preset
   spec:
     provider: percona-server-mongodb
     # ...preset configuration
   ```

3. Navigate to Create Database and select the preset

4. Verify:
   - Preset appears in dropdown
   - Form populates with preset values
   - Instance is created with annotation

## Related Files

- `api/openapi/http-api.yaml` - API spec (already implemented server-side)
- `api/openapi/crds.gen.yaml` - CRD schemas
- `api/instanceApi.ts` - Instance API functions
- `hooks/api/db-instances/useCreateDbInstance.ts` - Instance creation hook
