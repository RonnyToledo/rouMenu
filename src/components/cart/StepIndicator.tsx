import React, { memo } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Truck } from "lucide-react";

const STEPS = [
  { id: 1, label: "Carrito", icon: ShoppingBag },
  { id: 2, label: "Entrega", icon: Truck },
] as const;

type Props = {
  currentStep: number;
  setCurrentStep: (step: number) => void;
};

const StepIndicator = memo(function StepIndicator({
  currentStep,
  setCurrentStep,
}: Props) {
  return (
    <div className="flex justify-center">
      <div className="relative flex items-center gap-1 bg-secondary border border-border rounded-full p-1">
        {STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isDone = currentStep > step.id;
          const Icon = step.icon;
          return (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className="relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-200"
            >
              {isActive && (
                <motion.div
                  layoutId="step-pill"
                  className="absolute inset-0 bg-foreground rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`relative z-10 flex items-center gap-1.5 ${
                  isActive
                    ? "text-background"
                    : isDone
                      ? "text-foreground"
                      : "text-muted-foreground"
                }`}
              >
                <Icon className="w-3 h-3" />
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default StepIndicator;
