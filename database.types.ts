import {MergeDeep} from "type-fest";
import {ListGenres} from "./components/CreateList/CreateList.types";

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type DatabaseGenerated = {
    public: {
        Tables: {
            anime_lists: {
                Row: {
                    comment_instance_id: string
                    created_at: string | null
                    creator_id: string
                    description: string
                    genres: ListGenres
                    id: number
                    is_public: boolean
                    items: Json
                    title: string
                }
                Insert: {
                    comment_instance_id?: string
                    created_at?: string | null
                    creator_id: string
                    description?: string
                    genres?: ListGenres
                    id?: number
                    is_public?: boolean
                    items?: Json
                    title: string
                }
                Update: {
                    comment_instance_id?: string
                    created_at?: string | null
                    creator_id?: string
                    description?: string
                    genres?: ListGenres
                    id?: number
                    is_public?: boolean
                    items?: Json
                    title?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "anime_lists_creator_id_fkey"
                        columns: ["creator_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            comments: {
                Row: {
                    created_at: string | null
                    creator_id: string
                    id: string
                    index: number
                    instance_id: string
                    parent_comment_id: string | null
                    text: string
                    upvoted_by: string[]
                }
                Insert: {
                    created_at?: string | null
                    creator_id: string
                    id?: string
                    index?: number
                    instance_id: string
                    parent_comment_id?: string | null
                    text: string
                    upvoted_by?: string[]
                }
                Update: {
                    created_at?: string | null
                    creator_id?: string
                    id?: string
                    index?: number
                    instance_id?: string
                    parent_comment_id?: string | null
                    text?: string
                    upvoted_by?: string[]
                }
                Relationships: [
                    {
                        foreignKeyName: "comments_creator_id_fkey"
                        columns: ["creator_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            discussions: {
                Row: {
                    body: string
                    comment_instance_id: string
                    created_at: string | null
                    creator_id: string
                    id: number
                    tag: string
                    title: string
                }
                Insert: {
                    body: string
                    comment_instance_id?: string
                    created_at?: string | null
                    creator_id: string
                    id?: number
                    tag: string
                    title: string
                }
                Update: {
                    body?: string
                    comment_instance_id?: string
                    created_at?: string | null
                    creator_id?: string
                    id?: number
                    tag?: string
                    title?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "discussions_creator_id_fkey"
                        columns: ["creator_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            item_recommendations: {
                Row: {
                    id: string
                    item_id: string
                    recommended_by: string
                }
                Insert: {
                    id?: string
                    item_id: string
                    recommended_by: string
                }
                Update: {
                    id?: string
                    item_id?: string
                    recommended_by?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "item_recommendations_recommended_by_fkey"
                        columns: ["recommended_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            item_reviews: {
                Row: {
                    created_at: string
                    creator_id: string
                    id: string
                    index: number
                    item_id: string
                    rating: number
                    review: string
                    upvoted_by: string[]
                }
                Insert: {
                    created_at?: string
                    creator_id?: string
                    id?: string
                    index?: number
                    item_id: string
                    rating: number
                    review?: string
                    upvoted_by?: string[]
                }
                Update: {
                    created_at?: string
                    creator_id?: string
                    id?: string
                    index?: number
                    item_id?: string
                    rating?: number
                    review?: string
                    upvoted_by?: string[]
                }
                Relationships: [
                    {
                        foreignKeyName: "item_reviews_creator_id_fkey"
                        columns: ["creator_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    account_name: string
                    avatar_url: string
                    bio: string | null
                    created_at: string
                    display_name: string
                    email: string
                    fts: unknown | null
                    id: string
                    items_watch_status: Json
                    roles: string[]
                    saved_lists: string[]
                }
                Insert: {
                    account_name: string
                    avatar_url?: string
                    bio?: string | null
                    created_at?: string
                    display_name?: string
                    email: string
                    fts?: unknown | null
                    id: string
                    items_watch_status?: Json
                    roles?: string[]
                    saved_lists?: string[]
                }
                Update: {
                    account_name?: string
                    avatar_url?: string
                    bio?: string | null
                    created_at?: string
                    display_name?: string
                    email?: string
                    fts?: unknown | null
                    id?: string
                    items_watch_status?: Json
                    roles?: string[]
                    saved_lists?: string[]
                }
                Relationships: []
            }
            recent_items: {
                Row: {
                    animes: Json
                    created_at: string | null
                    discussions: string[]
                    lists: string[]
                    profile_id: string
                }
                Insert: {
                    animes?: Json
                    created_at?: string | null
                    discussions?: string[]
                    lists?: string[]
                    profile_id: string
                }
                Update: {
                    animes?: Json
                    created_at?: string | null
                    discussions?: string[]
                    lists?: string[]
                    profile_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "recent_items_profile_id_fkey"
                        columns: ["profile_id"]
                        isOneToOne: true
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            get_item_reviews: {
                Args: {
                    itemid: string
                    n_reviews: number
                    start_after?: number
                }
                Returns: {
                    created_at: string
                    creator_id: string
                    id: string
                    index: number
                    item_id: string
                    rating: number
                    review: string
                    upvoted_by: string[]
                }[]
            }
            get_saved_lists: {
                Args: {
                    acct_name: string
                }
                Returns: {
                    comment_instance_id: string
                    created_at: string | null
                    creator_id: string
                    description: string
                    genres: ListGenres
                    id: number
                    is_public: boolean
                    items: Json
                    title: string
                }[]
            }
            search_list: {
                Args: {
                    phrase: string
                    profile_id?: string
                }
                Returns: {
                    comment_instance_id: string
                    created_at: string | null
                    creator_id: string
                    description: string
                    genres: ListGenres
                    id: number
                    is_public: boolean
                    items: Json
                    title: string
                }[]
            }
            search_user: {
                Args: {
                    phrase: string
                }
                Returns: {
                    account_name: string
                    avatar_url: string
                    bio: string | null
                    created_at: string
                    display_name: string
                    email: string
                    fts: unknown | null
                    id: string
                    items_watch_status: {
                        [key: string]: "NOT_WATCHED" | "WATCHING" | "WATCHED"
                    }
                    roles: string[]
                    saved_lists: string[]
                }[]
            }
            toggle_comment_upvote: {
                Args: {
                    comment_id: string
                    profile_id: string
                }
                Returns: string
            }
            toggle_review_upvote: {
                Args: {
                    review_id: string
                    profile_id: string
                }
                Returns: string
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

export type Database = MergeDeep<DatabaseGenerated, {
    public: {
        Tables: {
            anime_lists: {
                Row: {
                    items: Array<{ id: number, title: string }>
                },
                Update: {
                    items?: Array<{ id: number, title: string }>
                },
            },
            profiles: {
                Row: {
                    items_watch_status: {
                        [key: string]: "NOT_WATCHED" | "WATCHING" | "WATCHED"
                    }
                }
            }
        }
    }
}>

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    PublicTableNameOrOptions extends | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
        | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
        ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
            Database[PublicTableNameOrOptions["schema"]]["Views"])
        : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
        ? R
        : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
            PublicSchema["Views"])
        ? (PublicSchema["Tables"] &
            PublicSchema["Views"])[PublicTableNameOrOptions] extends {
                Row: infer R
            }
            ? R
            : never
        : never

export type TablesInsert<
    PublicTableNameOrOptions extends | keyof PublicSchema["Tables"]
        | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
        ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
            Insert: infer I
        }
        ? I
        : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
        ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
                Insert: infer I
            }
            ? I
            : never
        : never

export type TablesUpdate<
    PublicTableNameOrOptions extends | keyof PublicSchema["Tables"]
        | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
        ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
        : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
            Update: infer U
        }
        ? U
        : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
        ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
                Update: infer U
            }
            ? U
            : never
        : never

export type Enums<
    PublicEnumNameOrOptions extends | keyof PublicSchema["Enums"]
        | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
        ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
        : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
        ? PublicSchema["Enums"][PublicEnumNameOrOptions]
        : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends | keyof PublicSchema["CompositeTypes"]
        | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
            schema: keyof Database
        }
        ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
        : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
        ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
        : never
