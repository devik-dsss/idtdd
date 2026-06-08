"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, AlertCircle, Trash01, Edit02, X, CheckCircle, ChevronDown } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/contexts/user-context";
import { isAdminEmail } from "@/lib/auth/admin";
import { StarRating } from "@/components/ui/star-rating";
import { MealBadge } from "@/components/ui/meal-badge";
import { VegIndicator } from "@/components/ui/veg-indicator";
import { formatRelativeDate } from "@/lib/utils/date";
import { cx } from "@/utils/cx";
import type { ReviewWithDetails, Profile } from "@/lib/supabase/types";

const supabase = createClient();

const issueOptions = [
    { value: "no_issues", label: "No issues" },
    { value: "taste", label: "Taste issue" },
    { value: "quality", label: "Quality issue" },
    { value: "hygiene", label: "Hygiene concern" },
    { value: "quantity", label: "Insufficient quantity" },
    { value: "temperature", label: "Temperature issue" },
    { value: "undercooked", label: "Undercooked" },
    { value: "overcooked", label: "Overcooked" },
    { value: "too_spicy", label: "Too spicy" },
    { value: "too_salty", label: "Too salty" },
    { value: "stale", label: "Stale food" },
    { value: "foreign_object", label: "Foreign object found" },
    { value: "presentation", label: "Poor presentation" },
    { value: "late_service", label: "Late service" },
];

export default function AdminReviewDetailPage() {
    const params = useParams();
    const router = useRouter();
    const reviewId = params.id as string;

    const user = useUser();
    const isAdmin = isAdminEmail(user?.email);

    const [review, setReview] = useState<ReviewWithDetails | null>(null);
    const [reviewer, setReviewer] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Admin edit/delete state
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState("");
    const [editIssueType, setEditIssueType] = useState("no_issues");
    const [showIssueDropdown, setShowIssueDropdown] = useState(false);

    // Fetch review details
    useEffect(() => {
        if (!reviewId) return;

        const fetchReview = async () => {
            setError(null);

            try {
                const { data: reviewData, error: reviewError } = await supabase
                    .from("reviews")
                    .select(`
                        *,
                        menu_item:menu_items(*)
                    `)
                    .eq("id", reviewId)
                    .single();

                if (reviewError) throw reviewError;
                if (!reviewData) throw new Error("Review not found");

                const reviewWithDetails = reviewData as unknown as ReviewWithDetails;
                setReview(reviewWithDetails);

                // Fetch reviewer profile
                if (reviewWithDetails.user_id) {
                    const { data: profileData } = await supabase
                        .from("profiles")
                        .select("*")
                        .eq("id", reviewWithDetails.user_id)
                        .single();

                    if (profileData) {
                        setReviewer(profileData as unknown as Profile);
                    }
                }
            } catch (err) {
                console.error("Review fetch error:", err);
                setError("Failed to load review details.");
            } finally {
                setLoading(false);
            }
        };

        fetchReview();
    }, [reviewId]);

    const startEditing = () => {
        if (!review) return;
        setEditRating(review.rating);
        setEditComment(review.comment || "");
        setEditIssueType(review.issue_type || "no_issues");
        setShowIssueDropdown(false);
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setShowIssueDropdown(false);
    };

    const handleSave = async () => {
        if (!review || editRating === 0) return;

        setSaving(true);
        try {
            const updateData = {
                rating: editRating,
                comment: editComment.trim() || null,
                issue_type: editIssueType === "no_issues" ? null : editIssueType,
                updated_at: new Date().toISOString(),
            };

            const { data, error: updateError } = await (supabase.from("reviews") as any)
                .update(updateData)
                .eq("id", review.id)
                .select();

            if (updateError) throw updateError;
            if (!data || data.length === 0) {
                throw new Error("No rows updated — you may not have permission to edit this review.");
            }

            setReview({ ...review, ...updateData });
            setIsEditing(false);
        } catch (err) {
            console.error("Update error:", err);
            alert("Failed to update review. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!review) return;
        if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) return;

        setDeleting(true);
        try {
            const { data, error: deleteError } = await supabase
                .from("reviews")
                .delete()
                .eq("id", review.id)
                .select();

            if (deleteError) throw deleteError;
            if (!data || data.length === 0) {
                throw new Error("No rows deleted — you may not have permission to delete this review.");
            }

            router.push("/admin");
        } catch (err) {
            console.error("Delete error:", err);
            alert("Failed to delete review. Please try again.");
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <div className="size-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#f63d68]" />
            </div>
        );
    }

    if (error || !review) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
                <AlertCircle className="size-12 text-red-500" />
                <p className="mt-4 text-center text-gray-600">{error || "Review not found"}</p>
                <button
                    onClick={() => router.push("/admin")}
                    className="mt-4 rounded-lg bg-[#f63d68] px-4 py-2 text-sm font-medium text-white hover:bg-[#e02d57]"
                >
                    Back to Admin
                </button>
            </div>
        );
    }

    const selectedIssue = issueOptions.find((o) => o.value === editIssueType);

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 lg:mx-auto lg:max-w-2xl">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
                <button onClick={() => router.back()} className="rounded-full p-2 hover:bg-gray-100" disabled={saving || deleting}>
                    <ArrowLeft className="size-5 text-gray-700" />
                </button>
                <h1 className="font-semibold text-gray-900">{isEditing ? "Edit Review" : "Review Details"}</h1>

                {/* Admin-only actions */}
                {isAdmin ? (
                    isEditing ? (
                        <button onClick={cancelEditing} className="rounded-full p-2 text-gray-700 hover:bg-gray-100" disabled={saving}>
                            <X className="size-5" />
                        </button>
                    ) : (
                        <div className="flex items-center gap-1">
                            <button onClick={startEditing} className="rounded-full p-2 text-gray-700 hover:bg-gray-100" aria-label="Edit review">
                                <Edit02 className="size-5" />
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="rounded-full p-2 text-[#f63d68] hover:bg-red-50 disabled:opacity-50"
                                aria-label="Delete review"
                            >
                                <Trash01 className="size-5" />
                            </button>
                        </div>
                    )
                ) : (
                    <div className="w-9" />
                )}
            </header>

            {/* Content */}
            <div className="flex-1 p-4">
                {/* Menu Item Card */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex gap-4">
                        <div className="relative size-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                            {review.menu_item?.image_url ? (
                                <Image src={review.menu_item.image_url} alt={review.menu_item.name} fill className="object-cover" />
                            ) : (
                                <div className="flex size-full items-center justify-center text-3xl">🍽️</div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-gray-900">{review.menu_item?.name}</h2>
                                <VegIndicator isVeg={review.menu_item?.is_veg ?? true} />
                            </div>
                            {review.menu_item?.description && (
                                <p className="mt-1 text-sm text-gray-500">{review.menu_item.description}</p>
                            )}
                            <div className="mt-2">
                                {review.menu_item?.meal_type && <MealBadge mealType={review.menu_item.meal_type} />}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rating Card */}
                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-sm font-medium text-gray-500">Rating</h3>
                    {isEditing ? (
                        <div className="flex items-center gap-3">
                            <StarRating rating={editRating} size="lg" interactive onChange={setEditRating} />
                            <span className="text-2xl font-bold text-amber-500">{editRating > 0 ? editRating.toFixed(1) : "—"}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <StarRating rating={review.rating} size="lg" />
                            <span className="text-2xl font-bold text-amber-500">{review.rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                {/* Comment Card */}
                {isEditing ? (
                    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <h3 className="mb-3 text-sm font-medium text-gray-500">Comment</h3>
                        <textarea
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            placeholder="No comment"
                            rows={3}
                            className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#f63d68] focus:outline-none focus:ring-1 focus:ring-[#f63d68]"
                        />
                    </div>
                ) : (
                    review.comment && (
                        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <h3 className="mb-3 text-sm font-medium text-gray-500">Comment</h3>
                            <p className="text-gray-900">"{review.comment}"</p>
                        </div>
                    )
                )}

                {/* Issue Type Card */}
                {isEditing ? (
                    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <h3 className="mb-3 text-sm font-medium text-gray-500">Reported Issue</h3>
                        <div className="relative">
                            <button
                                onClick={() => setShowIssueDropdown(!showIssueDropdown)}
                                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left"
                            >
                                <div className="flex items-center gap-2">
                                    {editIssueType === "no_issues" && <CheckCircle className="size-5 text-green-500" />}
                                    <span className="text-gray-900">{selectedIssue?.label}</span>
                                </div>
                                <ChevronDown className={cx("size-5 text-gray-400 transition-transform", showIssueDropdown && "rotate-180")} />
                            </button>

                            {showIssueDropdown && (
                                <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                    {issueOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setEditIssueType(option.value);
                                                setShowIssueDropdown(false);
                                            }}
                                            className={cx(
                                                "flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-gray-50",
                                                option.value === editIssueType && "bg-gray-50"
                                            )}
                                        >
                                            {option.value === "no_issues" && <CheckCircle className="size-5 text-green-500" />}
                                            <span className="text-gray-900">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    review.issue_type && (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
                            <h3 className="mb-2 text-sm font-medium text-red-700">Reported Issue</h3>
                            <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-sm font-medium capitalize text-red-700">
                                {review.issue_type.replace(/_/g, " ")}
                            </span>
                        </div>
                    )
                )}

                {/* Photo Card */}
                {review.photo_url && (
                    <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <h3 className="mb-3 text-sm font-medium text-gray-500">Photo</h3>
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
                            <Image src={review.photo_url} alt="Review photo" fill className="object-cover" />
                        </div>
                    </div>
                )}

                {/* Reviewer Info Card */}
                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-sm font-medium text-gray-500">Reviewer</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-full bg-[#f63d68] text-lg font-bold text-white">
                            {reviewer?.full_name?.charAt(0) || "U"}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{reviewer?.full_name || "Unknown User"}</p>
                            <p className="text-sm text-gray-500">{reviewer?.email}</p>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                                {reviewer?.branch && <span>{reviewer.branch}</span>}
                                {reviewer?.section && <span>• Section {reviewer.section}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timestamp Card */}
                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-2 text-sm font-medium text-gray-500">Submitted</h3>
                    <p className="text-gray-900">{formatRelativeDate(review.created_at)}</p>
                    <p className="mt-1 text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Edit action bar (admin only) */}
            {isAdmin && isEditing && (
                <div className="sticky bottom-0 flex gap-3 border-t border-gray-200 bg-white px-4 py-4">
                    <button
                        onClick={cancelEditing}
                        disabled={saving}
                        className="flex-1 rounded-lg border border-gray-200 bg-white py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || editRating === 0}
                        className={cx(
                            "flex-1 rounded-lg py-3 font-semibold text-white transition-colors",
                            editRating === 0 ? "bg-gray-300" : "bg-[#f63d68] hover:bg-[#e02d57]",
                            saving && "opacity-70"
                        )}
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            )}
        </div>
    );
}
