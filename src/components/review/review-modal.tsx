"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { X, Camera01, Image01, CheckCircle, ChevronDown, Trash01 } from "@untitledui/icons";
import { createClient } from "@/lib/supabase/client";
import { StarRating } from "@/components/ui/star-rating";
import { VegIndicator } from "@/components/ui/veg-indicator";
import { cx } from "@/utils/cx";
import type { MenuItem, Review } from "@/lib/supabase/types";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    menuItem: MenuItem;
    existingReview?: Review | null;
    userId: string;
    onSubmit: () => void;
}

const issueOptions = [
    { value: "no_issues", label: "No issues", icon: CheckCircle },
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

export function ReviewModal({ isOpen, onClose, menuItem, existingReview, userId, onSubmit }: ReviewModalProps) {
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [comment, setComment] = useState(existingReview?.comment || "");
    const [issueType, setIssueType] = useState(existingReview?.issue_type || "no_issues");
    const [showIssueDropdown, setShowIssueDropdown] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(existingReview?.photo_url || null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const cameraInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileSelect = (file: File | null) => {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("Image size should be less than 5MB");
            return;
        }

        setPhotoFile(file);
        const previewUrl = URL.createObjectURL(file);
        setPhotoPreview(previewUrl);
    };

    const handleCameraClick = () => {
        cameraInputRef.current?.click();
    };

    const handleGalleryClick = () => {
        galleryInputRef.current?.click();
    };

    const removePhoto = () => {
        setPhotoFile(null);
        if (photoPreview && !existingReview?.photo_url) {
            URL.revokeObjectURL(photoPreview);
        }
        setPhotoPreview(null);
    };

    const uploadPhoto = async (): Promise<string | null> => {
        if (!photoFile) return existingReview?.photo_url || null;

        setUploadingPhoto(true);
        const supabase = createClient();

        // Generate unique filename
        const fileExt = photoFile.name.split(".").pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from("review-photos")
            .upload(fileName, photoFile, {
                cacheControl: "3600",
                upsert: false,
            });

        setUploadingPhoto(false);

        if (error) {
            console.error("Upload error:", error);
            alert("Failed to upload photo. Please try again.");
            return null;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from("review-photos")
            .getPublicUrl(data.path);

        return urlData.publicUrl;
    };

    const handleSubmit = async () => {
        if (rating === 0) return;

        setSubmitting(true);

        // Upload photo if selected
        let photoUrl = existingReview?.photo_url || null;
        if (photoFile) {
            photoUrl = await uploadPhoto();
        } else if (!photoPreview && existingReview?.photo_url) {
            // Photo was removed
            photoUrl = null;
        }

        const supabase = createClient();

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];

        const reviewData = {
            user_id: userId,
            menu_item_id: menuItem.id,
            rating,
            comment: comment || null,
            issue_type: issueType === "no_issues" ? null : issueType,
            photo_url: photoUrl,
            review_date: today,
        };

        if (existingReview) {
            // Update existing review (same day)
            await (supabase.from("reviews") as any).update(reviewData).eq("id", existingReview.id);
        } else {
            // Insert new review for today
            await (supabase.from("reviews") as any).insert(reviewData);
        }

        setSubmitting(false);
        onSubmit();
    };

    const selectedIssue = issueOptions.find((o) => o.value === issueType);

    return (
        <div className="fixed inset-0 z-[60] md:flex md:items-center md:justify-center md:bg-black/50 md:p-4">
            <div className="absolute inset-0 flex flex-col bg-white md:relative md:inset-auto md:h-auto md:max-h-[90vh] md:w-full md:max-w-lg md:rounded-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
                        <X className="size-5 text-gray-700" />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900">Rate this dish</h2>
                    <div className="w-7" />
                </div>

                <div className="flex-1 overflow-y-auto">
                    {/* Menu Item Info */}
                    <div className="mx-4 mt-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="relative size-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        {menuItem.image_url ? (
                            <Image src={menuItem.image_url} alt={menuItem.name} fill className="object-cover" />
                        ) : (
                            <div className="flex size-full items-center justify-center text-xl">🍽️</div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <VegIndicator isVeg={menuItem.is_veg} />
                            <h3 className="font-semibold text-gray-900">{menuItem.name}</h3>
                        </div>
                        <p className="text-sm text-gray-500">{menuItem.description}</p>
                    </div>
                </div>

                {/* Rating */}
                <div className="mt-6 px-4">
                    <p className="mb-3 text-center font-medium text-gray-700">How was the food?</p>
                    <div className="flex flex-col items-center">
                        <StarRating rating={rating} size="lg" interactive onChange={setRating} />
                        <p className="mt-2 text-sm text-gray-400">Tap to rate</p>
                    </div>
                </div>

                {/* Issue Dropdown */}
                <div className="mt-6 px-4">
                    <p className="mb-2 text-sm font-medium text-gray-700">Any issues with the food?</p>
                    <div className="relative">
                        <button
                            onClick={() => setShowIssueDropdown(!showIssueDropdown)}
                            className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left"
                        >
                            <div className="flex items-center gap-2">
                                {issueType === "no_issues" && <CheckCircle className="size-5 text-green-500" />}
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
                                            setIssueType(option.value);
                                            setShowIssueDropdown(false);
                                        }}
                                        className={cx(
                                            "flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-gray-50",
                                            option.value === issueType && "bg-gray-50"
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

                {/* Comment */}
                <div className="mt-6 px-4">
                    <p className="mb-2 text-sm font-medium text-gray-700">Add a comment (optional)</p>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts about this dish..."
                        rows={3}
                        className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#f63d68] focus:outline-none focus:ring-1 focus:ring-[#f63d68]"
                    />
                </div>

                {/* Photo Upload */}
                <div className="mt-6 px-4">
                    <p className="mb-2 text-sm font-medium text-gray-700">Add a photo (optional)</p>

                    {/* Hidden file inputs */}
                    <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                    />
                    <input
                        ref={galleryInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                    />

                    {photoPreview ? (
                        <div className="relative">
                            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
                                <Image
                                    src={photoPreview}
                                    alt="Review photo"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <button
                                onClick={removePhoto}
                                className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                            >
                                <Trash01 className="size-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleCameraClick}
                                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 py-4 hover:border-[#f63d68] hover:bg-red-50"
                            >
                                <Camera01 className="size-6 text-[#f63d68]" />
                                <span className="text-sm text-gray-500">Camera</span>
                            </button>
                            <button
                                onClick={handleGalleryClick}
                                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 py-4 hover:border-[#f63d68] hover:bg-red-50"
                            >
                                <Image01 className="size-6 text-[#f63d68]" />
                                <span className="text-sm text-gray-500">Gallery</span>
                            </button>
                        </div>
                    )}
                </div>

                    {/* Spacer */}
                    <div className="h-6" />
                </div>

                {/* Fixed Submit Button */}
                <div className="border-t border-gray-200 bg-white px-4 py-4 rounded-none md:rounded-b-2xl">
                    <button
                        onClick={handleSubmit}
                        disabled={rating === 0 || submitting || uploadingPhoto}
                        className={cx(
                            "w-full rounded-lg py-3 font-semibold transition-colors",
                            rating === 0 ? "bg-gray-200 text-gray-400" : "bg-[#f63d68] text-white hover:bg-[#e02d57]",
                            (submitting || uploadingPhoto) && "bg-gray-400"
                        )}
                    >
                        {uploadingPhoto ? "Uploading photo..." : submitting ? "Submitting..." : "Submit Review"}
                    </button>
                </div>
            </div>
        </div>
    );
}
