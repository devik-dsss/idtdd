import { cx } from "@/utils/cx";

interface VegIndicatorProps {
    isVeg: boolean;
    size?: "sm" | "md";
}

export function VegIndicator({ isVeg, size = "sm" }: VegIndicatorProps) {
    return (
        <span
            className={cx(
                "inline-flex items-center justify-center rounded-sm border-2",
                isVeg ? "border-success-500" : "border-error-500",
                size === "sm" ? "size-4" : "size-5"
            )}
        >
            <span className={cx("rounded-full", isVeg ? "bg-success-500" : "bg-error-500", size === "sm" ? "size-2" : "size-2.5")} />
        </span>
    );
}
