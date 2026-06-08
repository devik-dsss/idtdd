"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit02, ChevronRight, LogOut01 } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/contexts/user-context";
import { StarRating } from "@/components/ui/star-rating";
import { MealBadge } from "@/components/ui/meal-badge";
import { formatRelativeDate } from "@/lib/utils/date";
import type { ReviewWithDetails, Profile } from "@/lib/supabase/types";

const supabase = createClient();

export default function ProfilePage() {
    const router = useRouter();
    const user = useUser();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [recentReviews, setRecentReviews] = useState<ReviewWithDetails[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch profile and reviews on mount
    useEffect(() => {
        // Fetch profile
        supabase.from("profiles").select("*").eq("id", user.id).single()
            .then(({ data }) => setProfile(data));

        // Fetch recent reviews
        supabase
            .from("reviews")
            .select(`
                *,
                menu_item:menu_items(*)
            `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5)
            .then(({ data }) => {
                setRecentReviews((data as ReviewWithDetails[]) || []);
                setLoading(false);
            });
    }, [user.id]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    // Show loading while auth is checking
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="size-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#f63d68]" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-gray-50">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white px-4 pb-6 pt-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
                    <div className="flex gap-2">
                        <Link href="/profile/edit" className="rounded-full border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">
                            <Edit02 className="size-5" />
                        </Link>
                        <button onClick={handleSignOut} className="rounded-full border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">
                            <LogOut01 className="size-5" />
                        </button>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="mt-4 flex items-center gap-4">
                    <div className="relative size-16 overflow-hidden rounded-full bg-[#f63d68]">
                        <div className="flex size-full items-center justify-center text-2xl font-bold text-white">
                            {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                        </div>
                        <div className="absolute bottom-0 right-0 size-4 rounded-full border-2 border-white bg-green-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{profile?.full_name || "User"}</h2>
                        <p className="text-sm text-gray-500">{profile?.email || user?.email}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            {profile?.branch && <span className="text-xs text-gray-500">{profile.branch}</span>}
                            {profile?.section && <span className="text-xs text-gray-500">Section {profile.section}</span>}
                        </div>
                    </div>
                </div>
            </header>

            {/* Action Buttons */}
            <div className="mt-4 grid grid-cols-2 gap-3 px-4 sm:max-w-md">
                <Link href="/" className="flex items-center justify-center gap-2 rounded-lg bg-[#f63d68] py-3 font-semibold text-white hover:bg-[#e02d57]">
                    + New Review
                </Link>
                <Link
                    href="/menu"
                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-3 font-semibold text-gray-900 hover:bg-gray-50"
                >
                    View Menu
                </Link>
            </div>

            {/* Recent Reviews */}
            <section className="mt-6 px-4 pb-6">
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900">Recent Reviews</h3>
                        <p className="text-xs text-gray-500">Your latest food ratings</p>
                    </div>
                    <Link href="/reviews" className="text-sm font-medium text-[#f63d68]">
                        See All
                    </Link>
                </div>

                {recentReviews.length === 0 ? (
                    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
                        <p className="text-gray-500">No reviews yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                        {recentReviews.map((review) => (
                            <Link
                                key={review.id}
                                href={`/reviews/${review.id}`}
                                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-[#f63d68]/30 hover:shadow-md"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative size-12 overflow-hidden rounded-lg bg-gray-100">
                                        <div className="flex size-full items-center justify-center text-xl">🍽️</div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium text-gray-900">{review.menu_item?.name || "Unknown"}</h4>
                                            {review.menu_item?.meal_type && <MealBadge mealType={review.menu_item.meal_type} />}
                                        </div>
                                        <div className="mt-1 flex items-center gap-2">
                                            <StarRating rating={review.rating} size="sm" />
                                            <span className="text-sm font-medium text-amber-600">{review.rating.toFixed(1)}</span>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-400">{formatRelativeDate(review.created_at)}</p>
                                    </div>
                                </div>
                                <ChevronRight className="size-5 text-gray-300" />
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
