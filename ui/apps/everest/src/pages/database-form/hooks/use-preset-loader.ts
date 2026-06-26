// Copyright (C) 2026 The OpenEverest Contributors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { DbWizardFormFields } from 'consts';
import { useResolvedInstancePreset } from 'hooks/api/instance-presets/useResolvedInstancePreset';

/**
 * Hook to load a preset and populate form fields when a preset is selected.
 * For Phase 1, this pre-fills the form with preset values.
 * The form will be made read-only when using a preset (Phase 1 requirement).
 */
export const usePresetLoader = () => {
  const { watch, reset, getValues } = useFormContext();
  const lastLoadedPresetRef = useRef<string | null>(null);

  const selectedPreset = watch(DbWizardFormFields.instancePreset);
  const namespace = watch(DbWizardFormFields.k8sNamespace);

  // Get preset name - handle both object and string formats
  const presetName =
    typeof selectedPreset === 'object' && selectedPreset !== null
      ? selectedPreset.value
      : selectedPreset;

  const { data: resolvedPreset, isLoading } = useResolvedInstancePreset(
    presetName,
    namespace
  );

  useEffect(() => {
    // If preset is cleared/unselected, reset the ref
    if (!presetName) {
      lastLoadedPresetRef.current = null;
      return;
    }

    // Only load preset if:
    // 1. We have the resolved preset data
    // 2. We have both preset name and namespace
    // 3. This preset is different from the last loaded one (allow changing presets)
    if (
      !resolvedPreset?.spec ||
      !presetName ||
      !namespace
    ) {
      return;
    }

    // Skip if this exact preset was already loaded (prevent re-loading on re-render)
    if (lastLoadedPresetRef.current === presetName) {
      return;
    }

    // Mark this preset as loaded
    lastLoadedPresetRef.current = presetName;

    // Get current form values to preserve base fields
    const currentValues = getValues();
    
    // Populate form with preset values
    const spec = resolvedPreset.spec;

    // Build the new form state by merging preset spec with current base values
    const newValues = {
      ...currentValues,
      // Preserve base fields
      [DbWizardFormFields.provider]: currentValues[DbWizardFormFields.provider],
      [DbWizardFormFields.dbName]: currentValues[DbWizardFormFields.dbName],
      [DbWizardFormFields.k8sNamespace]: namespace,
      [DbWizardFormFields.instancePreset]: selectedPreset,
      // Apply preset spec - this merges directly into the form as the Instance spec
      ...spec,
    };

    // Reset form with new values
    reset(newValues, { keepDefaultValues: false });
  }, [resolvedPreset, presetName, namespace, reset, getValues, selectedPreset]);

  return {
    isLoadingPreset: isLoading,
    hasPreset: !!presetName,
    resolvedPreset,
  };
};
