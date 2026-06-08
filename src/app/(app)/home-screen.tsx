"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Bell01, Calendar, ChevronRight, Edit05 } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/contexts/user-context";
import { formatDate } from "@/lib/utils/date";
import { VegIndicator } from "@/components/ui/veg-indicator";
import { ReviewModal } from "@/components/review/review-modal";
import { MenuItemSkeleton } from "@/components/ui/shimmer";
import { cx } from "@/utils/cx";
import type { MealType, MenuItem, Review, Profile } from "@/lib/supabase/types";

type MealFilter = "all" | MealType;

interface MenuItemWithReview extends MenuItem {
    avg_rating: number;
    user_review: Review | null;
}

const mealFilters: { value: MealFilter; label: string; time?: string }[] = [
    { value: "all", label: "All", time: "Full Day" },
    { value: "breakfast", label: "Breakfast", time: "7:00 - 9:00 AM" },
    { value: "lunch", label: "Lunch", time: "12:00 - 2:00 PM" },
    { value: "dinner", label: "Dinner", time: "7:30 - 9:30 PM" },
];

const supabase = createClient();

export function HomeScreen() {
    const user = useUser();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItemWithReview[]>([]);
    const [activeFilter, setActiveFilter] = useState<MealFilter>("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<MenuItemWithReview | null>(null);

    const today = new Date();

    // Fetch profile on mount
    useEffect(() => {
        supabase.from("profiles").select("*").eq("id", user.id).single()
            .then(({ data }) => setProfile(data));
    }, [user.id]);

    const fetchMenu = useCallback(async () => {
        setError(null);

        try {
            // Fetch all menu items (same menu every day)
            const { data: menuData, error: menuError } = await supabase
                .from("menu_items")
                .select("*")
                .order("name");

            if (menuError) throw menuError;

            // Fetch user's reviews for menu items (only today's reviews)
            const menuItemIds = (menuData || []).map((m: MenuItem) => m.id);
            const todayStr = new Date().toISOString().split("T")[0];
            let userReviews: Review[] = [];
            if (menuItemIds.length > 0) {
                const { data } = await supabase
                    .from("reviews")
                    .select("*")
                    .eq("user_id", user.id)
                    .eq("review_date", todayStr)
                    .in("menu_item_id", menuItemIds);
                userReviews = (data as Review[]) || [];
            }

            // Transform data
            const items: MenuItemWithReview[] = (menuData || []).map((item: MenuItem) => ({
                ...item,
                avg_rating: 0,
                user_review: userReviews.find(r => r.menu_item_id === item.id) || null,
            }));

            setMenuItems(items);
        } catch (err) {
            console.error("Menu fetch error:", err);
            setError("Failed to load menu. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    // Initial fetch
    useEffect(() => {
        fetchMenu();
    }, [fetchMenu]);

    const filteredItems = activeFilter === "all" ? menuItems : menuItems.filter((item) => item.meal_type === activeFilter);

    const handleReviewSubmit = () => {
        setSelectedItem(null);
        fetchMenu();
    };

    return (
        <div className="flex flex-col bg-white">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white px-4 pb-4 pt-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Welcome back,</p>
                        <h1 className="text-xl font-bold text-gray-900">{profile?.full_name || "User"}</h1>
                    </div>
                    <button className="rounded-full border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">
                        <Bell01 className="size-5" />
                    </button>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                    <Calendar className="size-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{formatDate(today)}</span>
                </div>
            </header>

            {/* Today's Menu */}
            <section className="bg-white p-4">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Today's Menu</h2>

                {/* Meal Filter Tabs */}
                <div className="mb-4 grid grid-cols-4 gap-2">
                    {mealFilters.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setActiveFilter(filter.value)}
                            className={cx(
                                "flex flex-col items-center rounded-lg border px-2 py-2 transition-colors",
                                activeFilter === filter.value
                                    ? "border-gray-900 bg-gray-900 text-white"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                            )}
                        >
                            <span className="text-xs font-medium sm:text-sm">{filter.label}</span>
                            <span className="hidden text-[10px] opacity-70 sm:block">{filter.time}</span>
                        </button>
                    ))}
                </div>

                {/* Items Header */}
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500">All Items</h3>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Edit05 className="size-3" />
                        Tap to review
                    </span>
                </div>

                {/* Menu Items List */}
                {loading ? (
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <MenuItemSkeleton key={i} />
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-sm text-red-500">{error}</p>
                        <button onClick={fetchMenu} className="mt-3 rounded-lg bg-[#f63d68] px-4 py-2 text-sm font-medium text-white hover:bg-[#e02d57]">
                            Retry
                        </button>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <span className="text-4xl">🍽️</span>
                        <h3 className="mt-4 font-semibold text-gray-900">No items found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {activeFilter === "all" ? "Menu items will appear here once added" : `No ${activeFilter} items available`}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {filteredItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setSelectedItem(item)}
                                className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
                            >
                                <div className="relative size-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                    {item.image_url ? (
                                        <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                                    ) : (
                                        <div className="flex size-full items-center justify-center text-2xl">🍽️</div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <VegIndicator isVeg={item.is_veg} />
                                        <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                    </div>
                                    <p className="mt-0.5 truncate text-sm text-gray-500">{item.description}</p>
                                    <p className={cx("mt-1 text-xs font-medium", item.user_review ? "text-green-600" : "text-[#f63d68]")}>
                                        {item.user_review ? `★ ${item.user_review.rating.toFixed(1)} Reviewed today` : "Tap to review"}
                                    </p>
                                </div>
                                <ChevronRight className="size-5 flex-shrink-0 text-gray-300" />
                            </button>
                        ))}
                    </div>
                )}
            </section>

            {/* Review Modal */}
            {selectedItem && user && (
                <ReviewModal
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                    menuItem={selectedItem}
                    existingReview={selectedItem.user_review}
                    userId={user.id}
                    onSubmit={handleReviewSubmit}
                />
            )}
        </div>
    );
}
