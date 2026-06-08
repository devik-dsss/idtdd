"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronUp } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/contexts/user-context";
import { VegIndicator } from "@/components/ui/veg-indicator";
import { MealSectionSkeleton } from "@/components/ui/shimmer";
import { cx } from "@/utils/cx";
import type { MealType, MenuItem } from "@/lib/supabase/types";

interface MenuItemWithRating extends MenuItem {
    avg_rating: number;
}

interface GroupedMenu {
    breakfast: MenuItemWithRating[];
    lunch: MenuItemWithRating[];
    dinner: MenuItemWithRating[];
    snacks: MenuItemWithRating[];
}

const mealTimes: Record<MealType, { start: string; end: string }> = {
    breakfast: { start: "7:30 AM", end: "9:30 AM" },
    lunch: { start: "12:30 PM", end: "2:30 PM" },
    dinner: { start: "7:30 PM", end: "9:30 PM" },
    snacks: { start: "4:30 PM", end: "6:30 PM" },
};

const supabase = createClient();

export default function MenuPage() {
    const user = useUser();
    const [menu, setMenu] = useState<GroupedMenu | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedMeals, setExpandedMeals] = useState<Record<MealType, boolean>>({
        breakfast: true,
        lunch: true,
        dinner: true,
        snacks: true,
    });

    const fetchMenu = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch all menu items (same menu for all days)
            const { data: menuItems, error: menuError } = await supabase
                .from("menu_items")
                .select("*")
                .order("name");

            if (menuError) throw menuError;

            // Group by meal type
            const grouped: GroupedMenu = {
                breakfast: [],
                lunch: [],
                dinner: [],
                snacks: [],
            };

            (menuItems || []).forEach((item: MenuItem) => {
                const itemWithRating: MenuItemWithRating = {
                    ...item,
                    avg_rating: 0,
                };
                if (item.meal_type && grouped[item.meal_type as MealType]) {
                    grouped[item.meal_type as MealType].push(itemWithRating);
                }
            });

            setMenu(grouped);
        } catch (err) {
            console.error("Menu fetch error:", err);
            setError("Failed to load menu. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMenu();
    }, [fetchMenu]);

    // Refetch on tab visibility change
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                fetchMenu();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [fetchMenu]);

    const toggleMeal = (meal: MealType) => {
        setExpandedMeals((prev) => ({ ...prev, [meal]: !prev[meal] }));
    };

    const totalItems = menu ? Object.values(menu).flat().length : 0;

    return (
        <div className="flex flex-col bg-gray-50">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white px-4 pb-6 pt-6">
                <h1 className="text-xl font-bold text-gray-900">Today's Menu</h1>
                <p className="mt-1 text-sm text-gray-500">Check out what's cooking in the hostel</p>
            </header>

            {/* Menu Content */}
            <section className="p-4">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Daily Menu</h2>
                        <p className="text-sm text-gray-500">Same delicious meals every day</p>
                    </div>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">🍽️ {totalItems} items</span>
                </div>

                {loading ? (
                    <div className="grid gap-4 lg:grid-cols-2 lg:items-start 2xl:grid-cols-4">
                        {[1, 2].map((i) => (
                            <MealSectionSkeleton key={i} />
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-sm text-red-500">{error}</p>
                        <button onClick={() => fetchMenu()} className="mt-3 rounded-lg bg-[#f63d68] px-4 py-2 text-sm font-medium text-white hover:bg-[#e02d57]">
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2 lg:items-start 2xl:grid-cols-4">
                        {(["breakfast", "lunch", "snacks", "dinner"] as MealType[]).map((mealType) => {
                            const items = menu?.[mealType] || [];
                            if (items.length === 0) return null;

                            return (
                                <div key={mealType} className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                    {/* Meal Header */}
                                    <button onClick={() => toggleMeal(mealType)} className="flex w-full items-center justify-between bg-gray-50 p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="text-left">
                                                <h3 className="font-semibold capitalize text-gray-900">{mealType}</h3>
                                                <p className="text-xs text-gray-500">
                                                    {mealTimes[mealType].start} - {mealTimes[mealType].end}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                                                {items.length} items
                                            </span>
                                            {expandedMeals[mealType] ? (
                                                <ChevronUp className="size-5 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="size-5 text-gray-400" />
                                            )}
                                        </div>
                                    </button>

                                    {/* Meal Items */}
                                    {expandedMeals[mealType] && (
                                        <div className="divide-y divide-gray-100 bg-white">
                                            {items.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between p-4">
                                                    <div className="flex items-center gap-2">
                                                        <VegIndicator isVeg={item.is_veg} />
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                                                            {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
                                                        </div>
                                                    </div>
                                                    {item.avg_rating > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-amber-500">★</span>
                                                            <span className="text-sm font-medium text-gray-700">{item.avg_rating.toFixed(1)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {totalItems === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center lg:col-span-full">
                                <span className="text-4xl">🍽️</span>
                                <h3 className="mt-4 font-semibold text-gray-900">No menu items yet</h3>
                                <p className="mt-1 text-sm text-gray-500">Menu items will appear here once added by admin</p>
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}
