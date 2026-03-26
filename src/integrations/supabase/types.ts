export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      agencies: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          phone: string | null
          state: string | null
          updated_at: string
          verified: boolean | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          verified?: boolean | null
          website?: string | null
        }
        Relationships: []
      }
      agent_profiles: {
        Row: {
          agency_id: string | null
          created_at: string
          experience_years: number | null
          id: string
          license_number: string | null
          specialization: string | null
          total_listings: number | null
          total_sales: number | null
          updated_at: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          agency_id?: string | null
          created_at?: string
          experience_years?: number | null
          id?: string
          license_number?: string | null
          specialization?: string | null
          total_listings?: number | null
          total_sales?: number | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          agency_id?: string | null
          created_at?: string
          experience_years?: number | null
          id?: string
          license_number?: string | null
          specialization?: string | null
          total_listings?: number | null
          total_sales?: number | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_profiles_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          api_key: string
          created_at: string
          id: string
          is_active: boolean
          last_used_at: string | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      api_request_logs: {
        Row: {
          api_key_id: string | null
          created_at: string
          endpoint: string
          id: string
          lga: string | null
          state: string | null
          status_code: number
          user_id: string
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string
          endpoint: string
          id?: string
          lga?: string | null
          state?: string | null
          status_code: number
          user_id: string
        }
        Update: {
          api_key_id?: string | null
          created_at?: string
          endpoint?: string
          id?: string
          lga?: string | null
          state?: string | null
          status_code?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_request_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      api_subscriptions: {
        Row: {
          amount: number
          created_at: string
          expires_at: string
          id: string
          lga: string
          paystack_reference: string | null
          starts_at: string
          state: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          expires_at?: string
          id?: string
          lga: string
          paystack_reference?: string | null
          starts_at?: string
          state: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string
          id?: string
          lga?: string
          paystack_reference?: string | null
          starts_at?: string
          state?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bids: {
        Row: {
          amount: number
          bidder_id: string
          created_at: string
          id: string
          property_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          bidder_id: string
          created_at?: string
          id?: string
          property_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          bidder_id?: string
          created_at?: string
          id?: string
          property_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      caution_fee_escrow: {
        Row: {
          amount: number
          auto_release_at: string | null
          created_at: string
          escrow_status: string
          id: string
          landlord_id: string
          payment_status: string
          paystack_authorization_code: string | null
          paystack_reference: string | null
          property_id: string
          release_approved_at: string | null
          release_reason: string | null
          release_rejected_at: string | null
          release_rejected_reason: string | null
          release_requested_at: string | null
          release_requested_by: string | null
          tenancy_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          auto_release_at?: string | null
          created_at?: string
          escrow_status?: string
          id?: string
          landlord_id: string
          payment_status?: string
          paystack_authorization_code?: string | null
          paystack_reference?: string | null
          property_id: string
          release_approved_at?: string | null
          release_reason?: string | null
          release_rejected_at?: string | null
          release_rejected_reason?: string | null
          release_requested_at?: string | null
          release_requested_by?: string | null
          tenancy_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          auto_release_at?: string | null
          created_at?: string
          escrow_status?: string
          id?: string
          landlord_id?: string
          payment_status?: string
          paystack_authorization_code?: string | null
          paystack_reference?: string | null
          property_id?: string
          release_approved_at?: string | null
          release_reason?: string | null
          release_rejected_at?: string | null
          release_rejected_reason?: string | null
          release_requested_at?: string | null
          release_requested_by?: string | null
          tenancy_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "caution_fee_escrow_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caution_fee_escrow_tenancy_id_fkey"
            columns: ["tenancy_id"]
            isOneToOne: false
            referencedRelation: "tenancies"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          last_message_text: string | null
          property_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_text?: string | null
          property_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_text?: string | null
          property_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          admin_notes: string | null
          category: string
          created_at: string
          description: string
          evidence_urls: string[] | null
          filed_against: string | null
          filed_by: string
          id: string
          priority: string
          property_id: string
          resolution_summary: string | null
          resolved_at: string | null
          status: string
          subject: string
          tenancy_id: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          category?: string
          created_at?: string
          description: string
          evidence_urls?: string[] | null
          filed_against?: string | null
          filed_by: string
          id?: string
          priority?: string
          property_id: string
          resolution_summary?: string | null
          resolved_at?: string | null
          status?: string
          subject: string
          tenancy_id?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          category?: string
          created_at?: string
          description?: string
          evidence_urls?: string[] | null
          filed_against?: string | null
          filed_by?: string
          id?: string
          priority?: string
          property_id?: string
          resolution_summary?: string | null
          resolved_at?: string | null
          status?: string
          subject?: string
          tenancy_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_tenancy_id_fkey"
            columns: ["tenancy_id"]
            isOneToOne: false
            referencedRelation: "tenancies"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          message: string
          property_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          message: string
          property_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          message?: string
          property_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      lease_documents: {
        Row: {
          created_at: string
          document_type: string
          file_url: string
          id: string
          name: string
          tenancy_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          document_type?: string
          file_url: string
          id?: string
          name: string
          tenancy_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_url?: string
          id?: string
          name?: string
          tenancy_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "lease_documents_tenancy_id_fkey"
            columns: ["tenancy_id"]
            isOneToOne: false
            referencedRelation: "tenancies"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_contracts: {
        Row: {
          content: string
          contract_type: string
          created_at: string
          id: string
          landlord_id: string
          property_id: string
          sent_via: string[] | null
          status: string
          tenancy_id: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          contract_type?: string
          created_at?: string
          id?: string
          landlord_id: string
          property_id: string
          sent_via?: string[] | null
          status?: string
          tenancy_id: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          contract_type?: string
          created_at?: string
          id?: string
          landlord_id?: string
          property_id?: string
          sent_via?: string[] | null
          status?: string
          tenancy_id?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_contracts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_contracts_tenancy_id_fkey"
            columns: ["tenancy_id"]
            isOneToOne: false
            referencedRelation: "tenancies"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_requests: {
        Row: {
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          priority: string
          property_id: string
          resolved_at: string | null
          status: string
          tenancy_id: string
          tenant_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          priority?: string
          property_id: string
          resolved_at?: string | null
          status?: string
          tenancy_id: string
          tenant_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          priority?: string
          property_id?: string
          resolved_at?: string | null
          status?: string
          tenancy_id?: string
          tenant_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_tenancy_id_fkey"
            columns: ["tenancy_id"]
            isOneToOne: false
            referencedRelation: "tenancies"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          blocked_reason: string | null
          content: string
          content_blocked: boolean | null
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          blocked_reason?: string | null
          content: string
          content_blocked?: boolean | null
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          blocked_reason?: string | null
          content?: string
          content_blocked?: boolean | null
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          agency_id: string | null
          agent_id: string
          area_sqm: number | null
          bathrooms: number | null
          bedrooms: number | null
          caution_fee: number | null
          city: string
          completion_percentage: number | null
          condition: string | null
          created_at: string
          description: string | null
          featured: boolean | null
          features: string[] | null
          floor_plan_url: string | null
          furnishing: string | null
          id: string
          images: string[] | null
          latitude: number | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          longitude: number | null
          parking_spaces: number | null
          price: number
          property_type: Database["public"]["Enums"]["property_type"]
          service_charge: number | null
          state: string
          status: Database["public"]["Enums"]["property_status"]
          title: string
          updated_at: string
          verified: boolean | null
          views_count: number | null
          virtual_tour_url: string | null
          virtual_tour_video_url: string | null
          year_built: number | null
        }
        Insert: {
          address?: string | null
          agency_id?: string | null
          agent_id: string
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          caution_fee?: number | null
          city: string
          completion_percentage?: number | null
          condition?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          features?: string[] | null
          floor_plan_url?: string | null
          furnishing?: string | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          longitude?: number | null
          parking_spaces?: number | null
          price: number
          property_type: Database["public"]["Enums"]["property_type"]
          service_charge?: number | null
          state: string
          status?: Database["public"]["Enums"]["property_status"]
          title: string
          updated_at?: string
          verified?: boolean | null
          views_count?: number | null
          virtual_tour_url?: string | null
          virtual_tour_video_url?: string | null
          year_built?: number | null
        }
        Update: {
          address?: string | null
          agency_id?: string | null
          agent_id?: string
          area_sqm?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          caution_fee?: number | null
          city?: string
          completion_percentage?: number | null
          condition?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          features?: string[] | null
          floor_plan_url?: string | null
          furnishing?: string | null
          id?: string
          images?: string[] | null
          latitude?: number | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          longitude?: number | null
          parking_spaces?: number | null
          price?: number
          property_type?: Database["public"]["Enums"]["property_type"]
          service_charge?: number | null
          state?: string
          status?: Database["public"]["Enums"]["property_status"]
          title?: string
          updated_at?: string
          verified?: boolean | null
          views_count?: number | null
          virtual_tour_url?: string | null
          virtual_tour_video_url?: string | null
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      rent_payments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          paid_date: string | null
          paystack_reference: string | null
          status: string
          tenancy_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          paid_date?: string | null
          paystack_reference?: string | null
          status?: string
          tenancy_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          paid_date?: string | null
          paystack_reference?: string | null
          status?: string
          tenancy_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rent_payments_tenancy_id_fkey"
            columns: ["tenancy_id"]
            isOneToOne: false
            referencedRelation: "tenancies"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          alert_enabled: boolean | null
          created_at: string
          filters: Json
          id: string
          name: string
          user_id: string
        }
        Insert: {
          alert_enabled?: boolean | null
          created_at?: string
          filters?: Json
          id?: string
          name: string
          user_id: string
        }
        Update: {
          alert_enabled?: boolean | null
          created_at?: string
          filters?: Json
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      tenancies: {
        Row: {
          created_at: string
          id: string
          invitation_id: string | null
          landlord_id: string
          lease_end: string | null
          lease_start: string
          monthly_rent: number
          property_id: string
          status: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invitation_id?: string | null
          landlord_id: string
          lease_end?: string | null
          lease_start: string
          monthly_rent?: number
          property_id: string
          status?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invitation_id?: string | null
          landlord_id?: string
          lease_end?: string | null
          lease_start?: string
          monthly_rent?: number
          property_id?: string
          status?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenancies_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "tenant_invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenancies_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_invitations: {
        Row: {
          accepted_by: string | null
          caution_fee: number
          created_at: string
          id: string
          invited_by: string
          lease_end: string | null
          lease_start: string | null
          message: string | null
          monthly_rent: number
          property_id: string
          status: string
          tenant_email: string
          tenant_name: string | null
          updated_at: string
        }
        Insert: {
          accepted_by?: string | null
          caution_fee?: number
          created_at?: string
          id?: string
          invited_by: string
          lease_end?: string | null
          lease_start?: string | null
          message?: string | null
          monthly_rent?: number
          property_id: string
          status?: string
          tenant_email: string
          tenant_name?: string | null
          updated_at?: string
        }
        Update: {
          accepted_by?: string | null
          caution_fee?: number
          created_at?: string
          id?: string
          invited_by?: string
          lease_end?: string | null
          lease_start?: string | null
          message?: string | null
          monthly_rent?: number
          property_id?: string
          status?: string
          tenant_email?: string
          tenant_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_invitations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_records: {
        Row: {
          created_at: string
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          employer_address: string | null
          employer_name: string | null
          employer_phone: string | null
          full_name: string
          gender: string | null
          guarantor_address: string | null
          guarantor_email: string | null
          guarantor_full_name: string | null
          guarantor_id_url: string | null
          guarantor_occupation: string | null
          guarantor_phone: string | null
          id: string
          id_document_url: string | null
          id_expiry_date: string | null
          id_number: string | null
          id_type: string | null
          landlord_id: string
          marital_status: string | null
          monthly_income: number | null
          nationality: string | null
          nok_address: string | null
          nok_email: string | null
          nok_full_name: string | null
          nok_phone: string | null
          nok_relationship: string | null
          notes: string | null
          occupation: string | null
          passport_photo_url: string | null
          phone: string | null
          previous_address: string | null
          previous_landlord_name: string | null
          previous_landlord_phone: string | null
          reason_for_leaving: string | null
          state_of_origin: string | null
          status: string
          tenancy_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employer_address?: string | null
          employer_name?: string | null
          employer_phone?: string | null
          full_name: string
          gender?: string | null
          guarantor_address?: string | null
          guarantor_email?: string | null
          guarantor_full_name?: string | null
          guarantor_id_url?: string | null
          guarantor_occupation?: string | null
          guarantor_phone?: string | null
          id?: string
          id_document_url?: string | null
          id_expiry_date?: string | null
          id_number?: string | null
          id_type?: string | null
          landlord_id: string
          marital_status?: string | null
          monthly_income?: number | null
          nationality?: string | null
          nok_address?: string | null
          nok_email?: string | null
          nok_full_name?: string | null
          nok_phone?: string | null
          nok_relationship?: string | null
          notes?: string | null
          occupation?: string | null
          passport_photo_url?: string | null
          phone?: string | null
          previous_address?: string | null
          previous_landlord_name?: string | null
          previous_landlord_phone?: string | null
          reason_for_leaving?: string | null
          state_of_origin?: string | null
          status?: string
          tenancy_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          employer_address?: string | null
          employer_name?: string | null
          employer_phone?: string | null
          full_name?: string
          gender?: string | null
          guarantor_address?: string | null
          guarantor_email?: string | null
          guarantor_full_name?: string | null
          guarantor_id_url?: string | null
          guarantor_occupation?: string | null
          guarantor_phone?: string | null
          id?: string
          id_document_url?: string | null
          id_expiry_date?: string | null
          id_number?: string | null
          id_type?: string | null
          landlord_id?: string
          marital_status?: string | null
          monthly_income?: number | null
          nationality?: string | null
          nok_address?: string | null
          nok_email?: string | null
          nok_full_name?: string | null
          nok_phone?: string | null
          nok_relationship?: string | null
          notes?: string | null
          occupation?: string | null
          passport_photo_url?: string | null
          phone?: string | null
          previous_address?: string | null
          previous_landlord_name?: string | null
          previous_landlord_phone?: string | null
          reason_for_leaving?: string | null
          state_of_origin?: string | null
          status?: string
          tenancy_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_records_tenancy_id_fkey"
            columns: ["tenancy_id"]
            isOneToOne: false
            referencedRelation: "tenancies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "agent" | "agency" | "user"
      listing_type: "sale" | "rent" | "short_let" | "land" | "bid"
      property_status:
        | "draft"
        | "pending"
        | "active"
        | "sold"
        | "rented"
        | "inactive"
      property_type: "house" | "apartment" | "land" | "commercial" | "short_let"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "agent", "agency", "user"],
      listing_type: ["sale", "rent", "short_let", "land", "bid"],
      property_status: [
        "draft",
        "pending",
        "active",
        "sold",
        "rented",
        "inactive",
      ],
      property_type: ["house", "apartment", "land", "commercial", "short_let"],
    },
  },
} as const
