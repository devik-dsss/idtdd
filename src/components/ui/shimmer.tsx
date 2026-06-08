"use client";

import { cx } from "@/utils/cx";

interface ShimmerProps {
    className?: string;
}

export function Shimmer({ className }: ShimmerProps) {
    return (
        <div
            className={cx(
                "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]",
                className
            )}
        />
    );
}

export function MenuItemSkeleton() {
    return (
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            <Shimmer className="size-16 flex-shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                    <Shimmer className="size-4 rounded-full" />
                    <Shimmer className="h-5 w-32 rounded" />
                </div>
                <Shimmer className="mt-2 h-4 w-48 rounded" />
                <Shimmer className="mt-2 h-3 w-20 rounded" />
            </div>
            <Shimmer className="size-5 rounded" />
        </div>
    );
}

export function ReviewCardSkeleton() {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex gap-3">
                <Shimmer className="size-16 flex-shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <Shimmer className="size-4 rounded-full" />
                        <Shimmer className="h-5 w-28 rounded" />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                        <Shimmer className="h-4 w-24 rounded" />
                        <Shimmer className="h-4 w-8 rounded" />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                        <Shimmer className="h-5 w-16 rounded-full" />
                        <Shimmer className="h-4 w-20 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function AdminReviewSkeleton() {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex gap-3">
                <Shimmer className="size-16 flex-shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <Shimmer className="h-5 w-28 rounded" />
                                <Shimmer className="size-4 rounded-full" />
                            </div>
                            <Shimmer className="mt-2 h-5 w-20 rounded-full" />
                        </div>
                        <div className="flex items-center gap-1">
                            <Shimmer className="size-5 rounded" />
                            <Shimmer className="h-6 w-6 rounded" />
                        </div>
                    </div>
                    <Shimmer className="mt-3 h-4 w-full rounded" />
                    <div className="mt-3 flex items-center justify-between">
                        <Shimmer className="h-4 w-24 rounded" />
                        <Shimmer className="size-7 rounded-full" />
                    </div>
                </div>
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
                <Shimmer className="size-6 rounded-full" />
                <Shimmer className="h-4 w-24 rounded" />
                <Shimmer className="h-3 w-16 rounded" />
            </div>
        </div>
    );
}

export function MealSectionSkeleton() {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                    <Shimmer className="size-8 rounded-full" />
                    <div>
                        <Shimmer className="h-5 w-20 rounded" />
                        <Shimmer className="mt-1 h-3 w-28 rounded" />
                    </div>
                </div>
                <Shimmer className="size-5 rounded" />
            </div>
            <div className="divide-y divide-gray-100 bg-white">
                {[1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-2">
                            <Shimmer className="size-4 rounded-full" />
                            <div>
                                <Shimmer className="h-4 w-28 rounded" />
                                <Shimmer className="mt-1 h-3 w-40 rounded" />
                            </div>
                        </div>
                        <Shimmer className="h-4 w-10 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ProfileStatsSkeleton() {
    return (
        <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
                    <Shimmer className="mx-auto size-10 rounded-full" />
                    <Shimmer className="mx-auto mt-2 h-6 w-10 rounded" />
                    <Shimmer className="mx-auto mt-1 h-3 w-14 rounded" />
                </div>
            ))}
        </div>
    );
}

export function ReviewDetailSkeleton() {
    return (
        <div className="p-4">
            <div className="flex items-center gap-2">
                <Shimmer className="size-5 rounded-full" />
                <Shimmer className="h-7 w-40 rounded" />
            </div>
            <div className="mt-2 flex items-center gap-2">
                <Shimmer className="h-6 w-20 rounded-full" />
                <Shimmer className="h-4 w-28 rounded" />
            </div>
            <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col items-center">
                    <Shimmer className="size-16 rounded-full" />
                    <Shimmer className="mt-2 h-6 w-24 rounded" />
                    <Shimmer className="mt-2 h-6 w-32 rounded" />
                </div>
            </div>
            <div className="mt-4">
                <Shimmer className="h-4 w-24 rounded" />
                <div className="mt-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <Shimmer className="h-4 w-full rounded" />
                    <Shimmer className="mt-2 h-4 w-3/4 rounded" />
                </div>
            </div>
        </div>
    );
}
