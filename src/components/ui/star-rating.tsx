"use client";

import { Star01 } from "@untitledui/icons";
import { cx } from "@/utils/cx";

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: "sm" | "md" | "lg";
    interactive?: boolean;
    onChange?: (rating: number) => void;
    showValue?: boolean;
}

const sizes = {
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
};

export function StarRating({ rating, maxRating = 5, size = "md", interactive = false, onChange, showValue = false }: StarRatingProps) {
    const handleClick = (index: number) => {
        if (interactive && onChange) {
            onChange(index + 1);
        }
    };

    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
                {Array.from({ length: maxRating }).map((_, index) => {
                    const filled = index < Math.floor(rating);
                    const partial = index === Math.floor(rating) && rating % 1 > 0;

                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleClick(index)}
                            disabled={!interactive}
                            className={cx("relative", interactive ? "cursor-pointer" : "cursor-default", sizes[size])}
                        >
                            <Star01
                                className={cx("size-full", filled || partial ? "fill-warning-400 text-warning-400" : "fill-none text-gray-300")}
                                strokeWidth={2}
                            />
                        </button>
                    );
                })}
            </div>
            {showValue && <span className="ml-1 text-sm font-semibold text-secondary">{rating.toFixed(1)}</span>}
        </div>
    );
}
