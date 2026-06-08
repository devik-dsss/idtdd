"use client";

import { useState, useEffect, useCallback, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash01 } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/contexts/user-context";
import { StarRating } from "@/components/ui/star-rating";
import { MealBadge } from "@/components/ui/meal-badge";
import { VegIndicator } from "@/components/ui/veg-indicator";
import { ReviewDetailSkeleton, Shimmer } from "@/components/ui/shimmer";
import type { ReviewWithDetails } from "@/lib/supabase/types";

const ratingLabels: Record<number, string> = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
};

const supabase = createClient();

export default function ReviewDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const user = useUser();
    const [review, setReview] = useState<ReviewWithDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReview = useCallback(async () => {
        setError(null);

        try {
            const { data: reviewData, error: reviewError } = await supabase
                .from("reviews")
                .select(`
                    *,
                    menu_item:menu_items(*)
                `)
                .eq("id", id)
                .single();

            if (reviewError) {
                if (reviewError.code === "PGRST116") {
                    setReview(null);
                    setLoading(false);
                    return;
                }
                throw reviewError;
            }

            setReview(reviewData as unknown as ReviewWithDetails);
        } catch (err) {
            console.error("Review fetch error:", err);
            setError("Failed to load review. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchReview();
    }, [fetchReview]);

    // Refetch on tab visibility change
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                fetchReview();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [fetchReview]);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        try {
            const { error: deleteError } = await supabase
                .from("reviews")
                .delete()
                .eq("id", id);

            if (deleteError) throw deleteError;

            router.push("/reviews");
        } catch (err) {
            console.error("Delete error:", err);
            alert("Failed to delete review. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col bg-gray-50 lg:mx-auto lg:max-w-2xl">
                <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
                    <Shimmer className="size-9 rounded-full" />
                    <Shimmer className="h-5 w-28 rounded" />
                    <Shimmer className="size-9 rounded-full" />
                </header>
                <ReviewDetailSkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
                <p className="text-sm text-red-500">{error}</p>
                <button onClick={fetchReview} className="mt-3 rounded-lg bg-[#f63d68] px-4 py-2 text-sm font-medium text-white hover:bg-[#e02d57]">
                    Retry
                </button>
            </div>
        );
    }

    if (!review) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
                <p className="text-gray-500">Review not found</p>
                <button onClick={() => router.push("/reviews")} className="mt-4 font-medium text-[#f63d68]">
                    Go back to reviews
                </button>
            </div>
        );
    }

    const reviewDate = new Date(review.created_at);

    return (
        <div className="flex flex-col bg-gray-50 lg:mx-auto lg:max-w-2xl">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
                <button onClick={() => router.back()} className="rounded-full p-2 hover:bg-gray-100">
                    <ArrowLeft className="size-5 text-gray-700" />
                </button>
                <h1 className="font-semibold text-gray-900">Review Details</h1>
                <button onClick={handleDelete} className="rounded-full p-2 text-[#f63d68] hover:bg-red-50">
                    <Trash01 className="size-5" />
                </button>
            </header>

            {/* Content */}
            <div className="p-4">
                {/* Food Name */}
                <div className="flex items-center gap-2">
                    <VegIndicator isVeg={review.menu_item?.is_veg ?? true} size="md" />
                    <h2 className="text-xl font-bold text-gray-900">{review.menu_item?.name}</h2>
                </div>

                {/* Meal Badge */}
                {review.menu_item?.meal_type && (
                    <div className="mt-2 flex items-center gap-2">
                        <MealBadge mealType={review.menu_item.meal_type} size="md" />
                    </div>
                )}

                {/* Rating Section */}
                <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col items-center text-center">
                        <div className="flex size-16 items-center justify-center rounded-full bg-amber-50">
                            <span className="text-3xl font-bold text-amber-500">{review.rating}</span>
                        </div>
                        <p className="mt-2 text-lg font-semibold text-gray-900">{ratingLabels[review.rating]}</p>
                        <div className="mt-2">
                            <StarRating rating={review.rating} size="lg" />
                        </div>
                    </div>
                </div>

                {/* Comment Section */}
                {review.comment && (
                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-500">Your Comment</h3>
                        <div className="mt-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="mb-2 text-2xl text-gray-300">"</div>
                            <p className="text-gray-700">{review.comment}</p>
                        </div>
                    </div>
                )}

                {/* Photo Section */}
                {review.photo_url && (
                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-500">Your Photo</h3>
                        <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="relative aspect-video w-full">
                                <Image src={review.photo_url} alt="Review photo" fill className="object-cover" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Issue Type Section */}
                {review.issue_type && (
                    <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-500">Reported Issue</h3>
                        <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                            <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                                <span>⚠️</span>
                                <span className="capitalize">{review.issue_type.replace(/_/g, " ")}</span>
                            </span>
                        </div>
                    </div>
                )}

                {/* Review Info */}
                <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500">Review Info</h3>
                    <div className="mt-2 space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-500">
                            <span>🕐</span>
                            <span>Reviewed on</span>
                        </div>
                        <p className="ml-6 font-medium text-gray-900">
                            {reviewDate.toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}{" "}
                            at{" "}
                            {reviewDate.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p>
                        <div className="flex items-center gap-2 text-gray-500">
                            <span>#</span>
                            <span>Review ID</span>
                        </div>
                        <p className="ml-6 font-mono text-xs text-gray-700">#{review.id.slice(0, 8)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
