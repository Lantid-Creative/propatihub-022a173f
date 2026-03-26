/**
 * Validates image dimensions. Rejects images below minimum resolution.
 * Returns a promise that resolves with { valid, width, height } or rejects.
 */
export const MIN_IMAGE_WIDTH = 1200;
export const MIN_IMAGE_HEIGHT = 800;

export interface ImageValidationResult {
  valid: boolean;
  width: number;
  height: number;
  message?: string;
}

export const validateImageResolution = (file: File): Promise<ImageValidationResult> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width < MIN_IMAGE_WIDTH || img.height < MIN_IMAGE_HEIGHT) {
        resolve({
          valid: false,
          width: img.width,
          height: img.height,
          message: `Image is ${img.width}×${img.height}px. Minimum required is ${MIN_IMAGE_WIDTH}×${MIN_IMAGE_HEIGHT}px. Please upload a higher quality image.`,
        });
      } else {
        resolve({ valid: true, width: img.width, height: img.height });
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ valid: false, width: 0, height: 0, message: "Could not read image file." });
    };
    img.src = url;
  });
};

/**
 * Calculates property listing completion percentage based on filled fields.
 */
export interface PropertyData {
  title?: string;
  description?: string;
  price?: number;
  property_type?: string;
  listing_type?: string;
  city?: string;
  state?: string;
  address?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area_sqm?: number | null;
  images?: string[] | null;
  features?: string[] | null;
  floor_plan_url?: string | null;
  virtual_tour_url?: string | null;
  virtual_tour_video_url?: string | null;
  year_built?: number | null;
  parking_spaces?: number | null;
  furnishing?: string | null;
  condition?: string | null;
  service_charge?: number | null;
}

interface CompletionField {
  key: keyof PropertyData;
  label: string;
  weight: number;
  check: (val: any) => boolean;
}

const completionFields: CompletionField[] = [
  { key: "title", label: "Title", weight: 8, check: (v) => !!v && v.length > 5 },
  { key: "description", label: "Description", weight: 8, check: (v) => !!v && v.length > 30 },
  { key: "price", label: "Price", weight: 8, check: (v) => !!v && v > 0 },
  { key: "property_type", label: "Property Type", weight: 5, check: (v) => !!v },
  { key: "listing_type", label: "Listing Type", weight: 5, check: (v) => !!v },
  { key: "city", label: "City", weight: 5, check: (v) => !!v },
  { key: "state", label: "State", weight: 5, check: (v) => !!v },
  { key: "address", label: "Address", weight: 5, check: (v) => !!v && v.length > 3 },
  { key: "bedrooms", label: "Bedrooms", weight: 4, check: (v) => v != null && v > 0 },
  { key: "bathrooms", label: "Bathrooms", weight: 4, check: (v) => v != null && v > 0 },
  { key: "area_sqm", label: "Area (m²)", weight: 4, check: (v) => v != null && v > 0 },
  { key: "images", label: "Photos (min 3)", weight: 12, check: (v) => Array.isArray(v) && v.length >= 3 },
  { key: "features", label: "Features", weight: 5, check: (v) => Array.isArray(v) && v.length >= 2 },
  { key: "floor_plan_url", label: "Floor Plan", weight: 6, check: (v) => !!v },
  { key: "virtual_tour_url", label: "Virtual Tour", weight: 6, check: (v) => !!v },
  { key: "year_built", label: "Year Built", weight: 3, check: (v) => v != null && v > 1900 },
  { key: "parking_spaces", label: "Parking", weight: 2, check: (v) => v != null },
  { key: "furnishing", label: "Furnishing", weight: 2, check: (v) => !!v },
  { key: "condition", label: "Condition", weight: 2, check: (v) => !!v },
  { key: "service_charge", label: "Service Charge", weight: 1, check: (v) => v != null },
];

export const calculateCompletion = (data: PropertyData) => {
  let earned = 0;
  let total = 0;
  const missing: string[] = [];
  const completed: string[] = [];

  for (const field of completionFields) {
    total += field.weight;
    if (field.check(data[field.key])) {
      earned += field.weight;
      completed.push(field.label);
    } else {
      missing.push(field.label);
    }
  }

  const percentage = Math.round((earned / total) * 100);
  return { percentage, missing, completed, total: completionFields.length, filled: completed.length };
};

export const getCompletionLevel = (percentage: number) => {
  if (percentage >= 95) return { level: "Complete", color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" };
  if (percentage >= 70) return { level: "Advanced", color: "text-accent", bg: "bg-accent/10", border: "border-accent/30" };
  if (percentage >= 40) return { level: "Standard", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" };
  return { level: "Basic", color: "text-muted-foreground", bg: "bg-muted", border: "border-border" };
};
