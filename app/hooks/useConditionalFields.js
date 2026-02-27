import { useState, useCallback } from 'react';

// Hook for managing conditional field visibility and values
// Supports configuration-based field visibility rules
export function useConditionalFields(config) {
  const [visibleFields, setVisibleFields] = useState({});
  const [fieldValues, setFieldValues] = useState({});

  // Update field visibility based on trigger field and value
  // Automatically clears values for hidden fields
  const updateFieldVisibility = useCallback((triggerField, triggerValue) => {
    const conditions = config[triggerField];
    if (!conditions) return;

    const newVisibility = {};
    const fieldsToHide = [];

    conditions.forEach(condition => {
      const isVisible = condition.showWhen.includes(triggerValue);
      newVisibility[condition.field] = isVisible;
      
      // Track fields that need to be hidden
      if (!isVisible) {
        fieldsToHide.push(condition.field);
      }
    });

    // Update visibility state
    setVisibleFields(prev => ({ ...prev, ...newVisibility }));

    // Clear values for hidden fields
    if (fieldsToHide.length > 0) {
      setFieldValues(prev => {
        const updated = { ...prev };
        fieldsToHide.forEach(field => {
          delete updated[field];
        });
        return updated;
      });
    }
  }, [config]);

  return { 
    visibleFields, 
    updateFieldVisibility, 
    fieldValues, 
    setFieldValues 
  };
}
