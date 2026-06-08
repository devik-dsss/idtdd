import { cx } from "@/utils/cx";
import type { MealType } from "@/lib/supabase/types";

interface MealBadgeProps {
    mealType: MealType;
    size?: "sm" | "md";
}

const mealColors: Record<MealType, string> = {
    breakfast: "bg-warning-50 text-warning-700",
    lunch: "bg-brand-50 text-brand-700",
    dinner: "bg-error-50 text-error-700",
    snacks: "bg-gray-100 text-gray-700",
};

const mealLabels: Record<MealType, string> = {
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snacks: "Snacks",
};

export function MealBadge({ mealType, size = "sm" }: MealBadgeProps) {
    return (
        <span
            className={cx(
                "inline-flex items-center rounded-full font-medium capitalize",
                mealColors[mealType],
                size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"
            )}
        >
            {mealLabels[mealType]}
        </span>
    );
}
