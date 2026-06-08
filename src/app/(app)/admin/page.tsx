"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/contexts/user-context";
import { MealBadge } from "@/components/ui/meal-badge";
import { VegIndicator } from "@/components/ui/veg-indicator";
import { AdminReviewSkeleton } from "@/components/ui/shimmer";
import { formatRelativeDate, getDateString } from "@/lib/utils/date";
import type { ReviewWithDetails } from "@/lib/supabase/types";

const supabase = createClient();

export default function AdminPanelPage() {
    const user = useUser();
    const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({ total: 0, avgRating: 0, today: 0 });

    const fetchReviews = useCallback(async () => {
        setError(null);

        try {
            // Fetch all reviews with menu item details
            const { data: reviewsData, error: reviewsError } = await supabase
                .from("reviews")
                .select(`
                    *,
                    menu_item:menu_items(*)
                `)
                .order("created_at", { ascending: false });

            if (reviewsError) throw reviewsError;

            const reviewsList = (reviewsData || []) as ReviewWithDetails[];
            setReviews(reviewsList);

            // Calculate stats
            const total = reviewsList.length;
            const avgRating = total > 0
                ? reviewsList.reduce((sum, r) => sum + r.rating, 0) / total
                : 0;
            const todayStr = getDateString(new Date());
            const todayCount = reviewsList.filter(r =>
                r.created_at.startsWith(todayStr)
            ).length;

            setStats({ total, avgRating, today: todayCount });
        } catch (err) {
            console.error("Admin fetch error:", err);
            setError("Failed to load data. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    // Refetch on tab visibility change
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                fetchReviews();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [fetchReviews]);

    return (
        <div className="flex flex-col bg-gray-50">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white px-4 pb-6 pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                        <p className="mt-1 text-sm text-gray-500">Food Review Management</p>
                    </div>
                    <Link href="/admin/profile" className="flex size-10 items-center justify-center rounded-full bg-[#f63d68] text-lg font-bold text-white">
                        A
                    </Link>
                </div>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        <p className="text-xs text-gray-500">Total Reviews</p>
                    </div>
                    <div className="border-x border-gray-200 text-center">
                        <p className="text-2xl font-bold text-gray-900">
                            <span className="text-amber-500">★</span> {stats.avgRating.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500">Avg Rating</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
                        <p className="text-xs text-gray-500">Today</p>
                    </div>
                </div>
            </header>

            {/* All Reviews */}
            <section className="p-4">
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-gray-900">All Reviews</h2>
                        <p className="text-xs text-gray-500">Manage and moderate reviews</p>
                    </div>
                    <span className="rounded-full bg-[#f63d68]/10 px-2.5 py-1 text-sm font-medium text-[#f63d68]">{reviews.length}</span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <AdminReviewSkeleton key={i} />
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-sm text-red-500">{error}</p>
                        <button onClick={fetchReviews} className="mt-3 rounded-lg bg-[#f63d68] px-4 py-2 text-sm font-medium text-white hover:bg-[#e02d57]">
                            Retry
                        </button>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-white py-12 text-center">
                        <p className="text-gray-500">No reviews yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 xl:grid-cols-3">
                        {reviews.map((review) => (
                            <Link
                                key={review.id}
                                href={`/admin/reviews/${review.id}`}
                                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-[#f63d68]/30 hover:bg-gray-50"
                            >
                                {/* Food Image */}
                                <div className="relative size-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                    {review.menu_item?.image_url ? (
                                        <Image src={review.menu_item.image_url} alt={review.menu_item.name} fill className="object-cover" />
                                    ) : (
                                        <div className="flex size-full items-center justify-center text-lg">🍽️</div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                        <VegIndicator isVeg={review.menu_item?.is_veg ?? true} />
                                        <h3 className="truncate text-sm font-semibold text-gray-900">{review.menu_item?.name || "Unknown"}</h3>
                                        {review.issue_type && (
                                            <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600">!</span>
                                        )}
                                    </div>
                                    <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                                        {review.menu_item?.meal_type && (
                                            <span className="capitalize">{review.menu_item.meal_type}</span>
                                        )}
                                        <span>•</span>
                                        <span>{formatRelativeDate(review.created_at)}</span>
                                    </div>
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1">
                                    <span className="text-amber-500">★</span>
                                    <span className="text-sm font-bold text-amber-700">{review.rating}</span>
                                </div>

                                <ChevronRight className="size-4 flex-shrink-0 text-gray-300" />
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
