"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/contexts/user-context";
import { StarRating } from "@/components/ui/star-rating";
import { MealBadge } from "@/components/ui/meal-badge";
import { VegIndicator } from "@/components/ui/veg-indicator";
import { ReviewCardSkeleton } from "@/components/ui/shimmer";
import { formatRelativeDate } from "@/lib/utils/date";
import { cx } from "@/utils/cx";
import type { MealType, ReviewWithDetails } from "@/lib/supabase/types";

type FilterType = "all" | "breakfast" | "lunch" | "dinner";

const supabase = createClient();

export default function MyReviewsPage() {
    const user = useUser();
    const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterType>("all");
    const [stats, setStats] = useState({ total: 0, avgRating: 0 });

    const fetchReviews = useCallback(async () => {

        setError(null);

        try {
            // Fetch user's reviews with menu item details
            const { data: reviewsData, error: reviewsError } = await supabase
                .from("reviews")
                .select(`
                    *,
                    menu_item:menu_items(*)
                `)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (reviewsError) throw reviewsError;

            const reviewsList = (reviewsData || []) as ReviewWithDetails[];
            setReviews(reviewsList);

            // Calculate stats
            const total = reviewsList.length;
            const avgRating = total > 0
                ? reviewsList.reduce((sum, r) => sum + r.rating, 0) / total
                : 0;
            setStats({ total, avgRating });
        } catch (err) {
            console.error("Reviews fetch error:", err);
            setError("Failed to load reviews. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [user.id]);

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

    const filteredReviews = filter === "all" ? reviews : reviews.filter((r) => r.menu_item?.meal_type === filter);

    const filterCounts = {
        all: reviews.length,
        breakfast: reviews.filter((r) => r.menu_item?.meal_type === "breakfast").length,
        lunch: reviews.filter((r) => r.menu_item?.meal_type === "lunch").length,
        dinner: reviews.filter((r) => r.menu_item?.meal_type === "dinner").length,
    };

    return (
        <div className="flex flex-col bg-gray-50">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white px-4 pb-6 pt-6">
                <h1 className="text-xl font-bold text-gray-900">My Reviews</h1>
                <p className="mt-1 text-sm text-gray-500">Track all your meal ratings and feedback</p>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        <p className="text-xs text-gray-500">Total Reviews</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
                        <p className="text-2xl font-bold text-gray-900">
                            <span className="text-amber-500">★</span> {stats.avgRating.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500">Avg Rating</p>
                    </div>
                </div>
            </header>

            {/* Filters */}
            <div className="border-b border-gray-200 bg-white px-4 py-3">
                <div className="grid grid-cols-4 gap-2">
                    {(["all", "breakfast", "lunch", "dinner"] as FilterType[]).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cx(
                                "flex items-center justify-between rounded-lg px-2 py-2 text-xs font-medium transition-colors",
                                filter === f ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                        >
                            <span className="capitalize">{f}</span>
                            <span className={cx("rounded-full px-1.5 py-0.5 text-[10px]", filter === f ? "bg-white/20" : "bg-gray-200")}>
                                {filterCounts[f]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Reviews List */}
            <section className="p-4">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-medium text-gray-500">All Reviews</h2>
                    <span className="text-sm text-gray-400">{filteredReviews.length} reviews</span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <ReviewCardSkeleton key={i} />
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-sm text-red-500">{error}</p>
                        <button onClick={fetchReviews} className="mt-3 rounded-lg bg-[#f63d68] px-4 py-2 text-sm font-medium text-white hover:bg-[#e02d57]">
                            Retry
                        </button>
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-white py-12 text-center">
                        <p className="text-gray-500">No reviews yet</p>
                        <Link href="/" className="mt-2 inline-block text-sm font-medium text-[#f63d68]">
                            Start reviewing today's menu
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                        {filteredReviews.map((review) => (
                            <Link
                                key={review.id}
                                href={`/reviews/${review.id}`}
                                className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-[#f63d68]/30 hover:shadow-md"
                            >
                                <div className="flex gap-3">
                                    <div className="relative size-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                        {review.menu_item?.image_url ? (
                                            <Image src={review.menu_item.image_url} alt={review.menu_item.name} fill className="object-cover" />
                                        ) : (
                                            <div className="flex size-full items-center justify-center text-2xl">🍽️</div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <VegIndicator isVeg={review.menu_item?.is_veg ?? true} />
                                            <h3 className="font-semibold text-gray-900">{review.menu_item?.name}</h3>
                                        </div>
                                        <div className="mt-1 flex items-center gap-2">
                                            <StarRating rating={review.rating} size="sm" />
                                            <span className="font-semibold text-amber-600">{review.rating.toFixed(1)}</span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                            {review.menu_item?.meal_type && <MealBadge mealType={review.menu_item.meal_type} />}
                                            <span>•</span>
                                            <span>{formatRelativeDate(review.created_at)}</span>
                                        </div>
                                        {review.comment && (
                                            <p className="mt-2 line-clamp-2 text-sm text-gray-600">{review.comment}</p>
                                        )}
                                    </div>

                                    <ChevronRight className="size-5 flex-shrink-0 self-center text-gray-300" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
