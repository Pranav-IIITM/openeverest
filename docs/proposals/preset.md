
# Presets

## Overview

A **Preset** is provider-specific default configuration values. Presets replace the current ad-hoc configuration patterns (split horizon config, load balancer annotations, pod scheduling policy) with a unified mechanism.

Presets are scoped to a single provider and cannot be shared across providers.

## Goals

1. ✅ **One-click deployment** — deploy an Instance with sensible defaults without manually configuring each component.
2. ✅ **Custom values** — users can override preset values during Instance creation.
3. ✅ **Bulk update** — when a preset is updated, all Instances using its defaults (without user overrides) are updated automatically. (possible separate feature)

## User Requirements

### 1. One-Click Deployment

- ✅ As a user, I can deploy an Instance with one click on the Everest UI, and the system applies a preset automatically so I don't need to configure each component manually.
- ❌ As a user, I can deploy an Instance via `kubectl apply` with a minimal manifest.
- ✅ As a user, I can install OpenEverest with preset already configured. Also customize and create in OpenEverst UI (not first phase)
- ✅/❌ As an admin, I can designate which preset is used for one-click deployment when multiple presets exist.

### 2. Custom Values

- ✅ As a user, I can see available presets during Instance creation and select one as a starting point.
- ✅/❌ As a user, I can override individual values from the selected preset during Instance creation (e.g. instead of creating another configuration)
- ✅/❌ As a user, I can create a preset in OpenEverest UI.
- ✅/❌ As a user, I can create a preset in OpenEverest UI based on a running Instance. (Create Preset action in the Instance)
- ✅/❌ As an admin, I can create multiple presets for the same component so different teams use different configurations (e.g., Team Product uses `lb-dev`, Team Platform uses `lb-prod`).
- ✅/❌ As an admin, I can control which presets are visible to which users based on their role (e.g., `lb-prod` is visible to the platform team but not to the product team).

### 3. Bulk Update

- ✅/❌ As an admin, I can update a preset and all Instances using that preset's defaults are updated automatically.
  - ✅/❌ update via Everest UI
  - ✅/❌ update via `kubectl`
  - ✅/❌ update via Helm
- ✅ As a user, my explicit overrides are preserved when a preset is updated — only fields I did not override receive the new defaults.

## Non-Goals

- Sharing presets across different providers.
