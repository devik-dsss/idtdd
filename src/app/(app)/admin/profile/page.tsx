"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut01, ChevronRight, Star01, Users01, FileCheck02, Settings01 } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/contexts/user-context";
import type { Profile } from "@/lib/supabase/types";

interface AdminStats {
    totalReviews: number;
    totalUsers: number;
    totalMenuItems: number;
    avgRating: number;
}

const supabase = createClient();

export default function AdminProfilePage() {
    const router = useRouter();
    const user = useUser();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [stats, setStats] = useState<AdminStats>({ totalReviews: 0, totalUsers: 0, totalMenuItems: 0, avgRating: 0 });
    const [loading, setLoading] = useState(true);

    // Fetch profile and stats on mount
    useEffect(() => {
        // Fetch profile
        supabase.from("profiles").select("*").eq("id", user.id).single()
            .then(({ data }) => setProfile(data));

        // Fetch stats
        const fetchStats = async () => {
            try {
                // Get total reviews and avg rating
                const { data: reviews } = await supabase
                    .from("reviews")
                    .select("rating");

                const reviewsList = (reviews || []) as { rating: number }[];
                const totalReviews = reviewsList.length;
                const avgRating = totalReviews > 0
                    ? reviewsList.reduce((sum, r) => sum + r.rating, 0) / totalReviews
                    : 0;

                // Get total users
                const { count: totalUsers } = await supabase
                    .from("profiles")
                    .select("*", { count: "exact", head: true });

                // Get total menu items
                const { count: totalMenuItems } = await supabase
                    .from("menu_items")
                    .select("*", { count: "exact", head: true });

                setStats({
                    totalReviews,
                    totalUsers: totalUsers || 0,
                    totalMenuItems: totalMenuItems || 0,
                    avgRating,
                });
            } catch (err) {
                console.error("Stats fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user.id]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="size-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#f63d68]" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 lg:mx-auto lg:max-w-3xl">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white px-4 pb-6 pt-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">Admin Profile</h1>
                    <button onClick={handleSignOut} className="rounded-full border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">
                        <LogOut01 className="size-5" />
                    </button>
                </div>

                {/* Profile Card */}
                <div className="mt-4 flex items-center gap-4">
                    <div className="relative size-16 overflow-hidden rounded-full bg-[#f63d68]">
                        <div className="flex size-full items-center justify-center text-2xl font-bold text-white">
                            {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "A"}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-white p-0.5">
                            <div className="flex size-5 items-center justify-center rounded-full bg-amber-500">
                                <Star01 className="size-3 text-white" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-gray-900">{profile?.full_name || "Admin"}</h2>
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Admin</span>
                        </div>
                        <p className="text-sm text-gray-500">{profile?.email || user?.email}</p>
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 p-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                            <FileCheck02 className="size-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalReviews}</p>
                            <p className="text-xs text-gray-500">Total Reviews</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-amber-100">
                            <Star01 className="size-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}</p>
                            <p className="text-xs text-gray-500">Avg Rating</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
                            <Users01 className="size-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                            <p className="text-xs text-gray-500">Total Users</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-purple-100">
                            <Settings01 className="size-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalMenuItems}</p>
                            <p className="text-xs text-gray-500">Menu Items</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="px-4">
                <h3 className="mb-3 text-sm font-medium text-gray-500">Quick Actions</h3>
                <div className="space-y-2">
                    <Link
                        href="/admin"
                        className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-gray-300"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-[#f63d68]/10">
                                <FileCheck02 className="size-5 text-[#f63d68]" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">View All Reviews</p>
                                <p className="text-xs text-gray-500">Manage and moderate reviews</p>
                            </div>
                        </div>
                        <ChevronRight className="size-5 text-gray-300" />
                    </Link>

                    <Link
                        href="/menu"
                        className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-gray-300"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-purple-100">
                                <Settings01 className="size-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">View Menu</p>
                                <p className="text-xs text-gray-500">Check today's menu items</p>
                            </div>
                        </div>
                        <ChevronRight className="size-5 text-gray-300" />
                    </Link>
                </div>
            </div>

            {/* Admin Info */}
            <div className="mt-6 px-4 pb-6">
                <h3 className="mb-3 text-sm font-medium text-gray-500">Account Info</h3>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Role</span>
                            <span className="text-sm font-medium text-gray-900">Administrator</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Email</span>
                            <span className="text-sm font-medium text-gray-900">{profile?.email || user?.email}</span>
                        </div>
                        {profile?.branch && (
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500">Branch</span>
                                <span className="text-sm font-medium text-gray-900">{profile.branch}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Status</span>
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
                                <span className="size-2 rounded-full bg-green-500" />
                                Active
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
