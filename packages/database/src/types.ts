/**
 * Supabase Database Types
 *
 * This file defines TypeScript types that match our database schema.
 * In production, regenerate this file using:
 *   npm run db:generate-types
 *
 * This runs: supabase gen types typescript --project-id <YOUR_PROJECT_ID>
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PropertyType = 'apartment' | 'house' | 'condo';
export type InspectionStatus = 'draft' | 'completed';
export type SubscriptionStatus = 'free' | 'premium' | 'canceled' | 'past_due';
export type RoomType = 'bedroom' | 'bathroom' | 'kitchen' | 'living_room' | 'other';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      properties: {
        Row: {
          id: string;
          user_id: string;
          address: string;
          property_type: PropertyType;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          address: string;
          property_type: PropertyType;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          address?: string;
          property_type?: PropertyType;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'properties_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      inspections: {
        Row: {
          id: string;
          property_id: string;
          inspection_date: string;
          status: InspectionStatus;
          notes: string | null;
          share_token: string | null;
          share_expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          inspection_date?: string;
          status?: InspectionStatus;
          notes?: string | null;
          share_token?: string;
          share_expires_at?: string;
          created_at?: string;
        };
        Update: {
          inspection_date?: string;
          status?: InspectionStatus;
          notes?: string | null;
          share_token?: string | null;
          share_expires_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'inspections_property_id_fkey';
            columns: ['property_id'];
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          }
        ];
      };
      inspection_photos: {
        Row: {
          id: string;
          inspection_id: string;
          storage_path: string;
          caption: string | null;
          room_type: RoomType | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          inspection_id: string;
          storage_path: string;
          caption?: string | null;
          room_type?: RoomType | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          storage_path?: string;
          caption?: string | null;
          room_type?: RoomType | null;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'inspection_photos_inspection_id_fkey';
            columns: ['inspection_id'];
            referencedRelation: 'inspections';
            referencedColumns: ['id'];
          }
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          status: SubscriptionStatus;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          status?: SubscriptionStatus;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          status?: SubscriptionStatus;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'subscriptions_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_subscription_status: {
        Args: Record<string, never>;
        Returns: string;
      };
      check_free_tier_limits: {
        Args: Record<string, never>;
        Returns: {
          can_create_property: boolean;
          can_create_inspection: boolean;
          properties_count: number;
          inspections_count: number;
          properties_limit: number;
          inspections_limit: number;
        }[];
      };
    };
    Enums: Record<string, never>;
  };
}

// Convenience type aliases for common use cases
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type Property = Database['public']['Tables']['properties']['Row'];
export type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
export type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

export type Inspection = Database['public']['Tables']['inspections']['Row'];
export type InspectionInsert = Database['public']['Tables']['inspections']['Insert'];
export type InspectionUpdate = Database['public']['Tables']['inspections']['Update'];

export type InspectionPhoto = Database['public']['Tables']['inspection_photos']['Row'];
export type InspectionPhotoInsert = Database['public']['Tables']['inspection_photos']['Insert'];
export type InspectionPhotoUpdate = Database['public']['Tables']['inspection_photos']['Update'];

export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update'];

// Inspection with related data (for queries with joins)
export type InspectionWithPhotos = Inspection & {
  inspection_photos: InspectionPhoto[];
};

export type InspectionWithProperty = Inspection & {
  properties: Property;
};

export type PropertyWithInspections = Property & {
  inspections: Inspection[];
};

// Free tier limits response type
export type FreeTierLimits = {
  can_create_property: boolean;
  can_create_inspection: boolean;
  properties_count: number;
  inspections_count: number;
  properties_limit: number;
  inspections_limit: number;
};
