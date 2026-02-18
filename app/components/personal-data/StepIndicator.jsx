"use client";

import { FORM_COLORS, STEP_COUNT } from "./constants";

export default function StepIndicator({ currentStep = 1 }) {
  const steps = Array.from({ length: STEP_COUNT }, (_, i) => i + 1);

  return (
    <div className="relative w-full mb-4">
      {/* Connecting Line */}
      <div
        className="absolute top-1/2 left-[51px] right-[51px] h-[3px] -translate-y-1/2"
        style={{ backgroundColor: FORM_COLORS.primary }}
      />

      {/* Step Numbers */}
      <div className="relative flex justify-between items-center px-[48px]">
        {steps.map((step) => (
          <div
            key={step}
            className="rounded-full w-6 h-6 flex items-center justify-center z-10"
            style={{
              backgroundColor: FORM_COLORS.primary,
              opacity: step <= currentStep ? 1 : 0.5,
            }}
          >
            <span
              className="text-sm font-medium"
              style={{
                fontFamily: "Inter, sans-serif",
                color: FORM_COLORS.textButton,
              }}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
