export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    full_name: string;
                    username: string;
                    email: string;
                    usn: string | null;
                    branch: string | null;
                    section: string | null;
                    phone_number: string | null;
                    hostel_location: string | null;
                    room_number: string | null;
                    bio: string | null;
                    avatar_url: string | null;
                    is_verified: boolean;
                    is_admin: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    full_name: string;
                    username: string;
                    email: string;
                    usn?: string | null;
                    branch?: string | null;
                    section?: string | null;
                    phone_number?: string | null;
                    hostel_location?: string | null;
                    room_number?: string | null;
                    bio?: string | null;
                    avatar_url?: string | null;
                    is_verified?: boolean;
                    is_admin?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    full_name?: string;
                    username?: string;
                    email?: string;
                    usn?: string | null;
                    branch?: string | null;
                    section?: string | null;
                    phone_number?: string | null;
                    hostel_location?: string | null;
                    room_number?: string | null;
                    bio?: string | null;
                    avatar_url?: string | null;
                    is_verified?: boolean;
                    is_admin?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            menu_items: {
                Row: {
                    id: string;
                    name: string;
                    description: string | null;
                    image_url: string | null;
                    is_veg: boolean;
                    meal_type: MealType;
                    start_time: string | null;
                    end_time: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    description?: string | null;
                    image_url?: string | null;
                    is_veg?: boolean;
                    meal_type: MealType;
                    start_time?: string | null;
                    end_time?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    description?: string | null;
                    image_url?: string | null;
                    is_veg?: boolean;
                    meal_type?: MealType;
                    start_time?: string | null;
                    end_time?: string | null;
                    created_at?: string;
                };
            };
            reviews: {
                Row: {
                    id: string;
                    user_id: string;
                    menu_item_id: string;
                    rating: number;
                    comment: string | null;
                    photo_url: string | null;
                    issue_type: string | null;
                    review_date: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    menu_item_id: string;
                    rating: number;
                    comment?: string | null;
                    photo_url?: string | null;
                    issue_type?: string | null;
                    review_date?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    menu_item_id?: string;
                    rating?: number;
                    comment?: string | null;
                    photo_url?: string | null;
                    issue_type?: string | null;
                    review_date?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
        Views: {};
        Functions: {};
        Enums: {
            meal_type: MealType;
        };
    };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];

export type MenuItemWithDetails = MenuItem & {
    avg_rating?: number;
    review_count?: number;
    user_review?: Review | null;
};

export type ReviewWithDetails = Review & {
    menu_item: MenuItem;
    profile?: Profile;
};
