/**
 * Apify Integration Service
 * Handles scraping from 2GIS, Yandex Maps, Google Maps
 */

const APIFY_TOKEN = process.env.APIFY_TOKEN || '';
const APIFY_BASE_URL = 'https://api.apify.com/v2';

// Apify Actor IDs for different map services
export const APIFY_ACTORS = {
  '2gis': 'voyager/2gis-scraper',
  'yandex': 'voyager/yandex-maps-scraper', 
  'google': 'apify/google-maps-scraper',
} as const;

export type ScrapingSourceType = keyof typeof APIFY_ACTORS;

export interface ScrapingConfig {
  city: string;
  category: string;
  radius?: number;
  maxResults?: number;
  language?: string;
}

export interface ScrapedVenue {
  externalId: string;
  source: ScrapingSourceType;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  categories?: string[];
  cuisines?: string[];
  workingHours?: Record<string, string>;
  photos?: string[];
  priceLevel?: number;
  rawData: Record<string, unknown>;
}

export interface ApifyRunResult {
  runId: string;
  status: 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'ABORTED';
  datasetId?: string;
  itemCount?: number;
}

/**
 * Start a scraping run on Apify
 */
export async function startScrapingRun(
  sourceType: ScrapingSourceType,
  config: ScrapingConfig
): Promise<ApifyRunResult> {
  const actorId = APIFY_ACTORS[sourceType];
  
  // Build input based on source type
  const input = buildActorInput(sourceType, config);
  
  const response = await fetch(
    `${APIFY_BASE_URL}/acts/${actorId}/runs?token=${APIFY_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to start Apify run: ${response.statusText}`);
  }
  
  const data = (await response.json()) as any;
  
  return {
    runId: data.data.id,
    status: data.data.status,
    datasetId: data.data.defaultDatasetId,
  };
}

/**
 * Get the status of a scraping run
 */
export async function getRunStatus(runId: string): Promise<ApifyRunResult> {
  const response = await fetch(
    `${APIFY_BASE_URL}/actor-runs/${runId}?token=${APIFY_TOKEN}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to get run status: ${response.statusText}`);
  }
  
  const data = (await response.json()) as any;
  
  return {
    runId: data.data.id,
    status: data.data.status,
    datasetId: data.data.defaultDatasetId,
    itemCount: data.data.stats?.itemCount,
  };
}

/**
 * Get scraped data from a completed run
 */
export async function getScrapedData(
  datasetId: string,
  sourceType: ScrapingSourceType,
  offset = 0,
  limit = 100
): Promise<ScrapedVenue[]> {
  const response = await fetch(
    `${APIFY_BASE_URL}/datasets/${datasetId}/items?token=${APIFY_TOKEN}&offset=${offset}&limit=${limit}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to get scraped data: ${response.statusText}`);
  }
  
  const items = (await response.json()) as any[];
  
  // Normalize data based on source type
  return items.map((item: Record<string, unknown>) => 
    normalizeVenueData(item, sourceType)
  );
}

/**
 * Build actor input based on source type
 */
function buildActorInput(
  sourceType: ScrapingSourceType,
  config: ScrapingConfig
): Record<string, unknown> {
  switch (sourceType) {
    case '2gis':
      return {
        searchQueries: [`${config.category} ${config.city}`],
        maxItems: config.maxResults || 500,
        language: config.language || 'ru',
        includePhotos: true,
        includeReviews: false,
      };
      
    case 'yandex':
      return {
        searchQuery: `${config.category} ${config.city}`,
        maxResults: config.maxResults || 500,
        language: config.language || 'ru',
        extractContacts: true,
        extractPhotos: true,
      };
      
    case 'google':
      return {
        searchStringsArray: [`${config.category} in ${config.city}`],
        maxCrawledPlacesPerSearch: config.maxResults || 500,
        language: config.language || 'ru',
        maxImages: 5,
        maxReviews: 0,
        includeWebResults: false,
      };
      
    default:
      throw new Error(`Unknown source type: ${sourceType}`);
  }
}

/**
 * Normalize venue data from different sources into a unified format
 */
function normalizeVenueData(
  rawData: Record<string, unknown>,
  sourceType: ScrapingSourceType
): ScrapedVenue {
  switch (sourceType) {
    case '2gis':
      return normalize2GisData(rawData);
    case 'yandex':
      return normalizeYandexData(rawData);
    case 'google':
      return normalizeGoogleData(rawData);
    default:
      throw new Error(`Unknown source type: ${sourceType}`);
  }
}

function normalize2GisData(data: Record<string, unknown>): ScrapedVenue {
  const d = data as any;
  return {
    externalId: String(d.id || d.firmId || ''),
    source: '2gis',
    name: String(d.name || d.title || ''),
    address: String(d.address || d.addressName || ''),
    city: String(d.city || ''),
    lat: Number(d.lat || d.point?.lat || 0),
    lng: Number(d.lng || d.point?.lon || 0),
    phone: String(d.phone || d.contacts?.phone || ''),
    website: String(d.website || d.url || ''),
    rating: Number(d.rating || 0),
    reviewCount: Number(d.reviewCount || d.reviews_count || 0),
    categories: (d.rubrics as string[]) || [],
    workingHours: (d.schedule as Record<string, string>) || {},
    photos: (d.photos as string[]) || [],
    rawData: d,
  };
}

function normalizeYandexData(data: Record<string, unknown>): ScrapedVenue {
  const d = data as any;
  const coords = (d.coordinates as { lat: number; lng: number }) || { lat: 0, lng: 0 };
  
  return {
    externalId: String(d.id || d.oid || ''),
    source: 'yandex',
    name: String(d.name || d.title || ''),
    address: String(d.address || ''),
    city: String(d.city || ''),
    lat: coords.lat,
    lng: coords.lng,
    phone: String(d.phone || d.phones?.[0] || ''),
    website: String(d.website || d.url || ''),
    rating: Number(d.rating || d.stars || 0),
    reviewCount: Number(d.reviewCount || d.reviews || 0),
    categories: (d.categories as string[]) || [],
    workingHours: (d.workingTime as Record<string, string>) || {},
    photos: (d.images as string[]) || [],
    rawData: d,
  };
}

function normalizeGoogleData(data: Record<string, unknown>): ScrapedVenue {
  const d = data as any;
  const location = (d.location as { lat: number; lng: number }) || { lat: 0, lng: 0 };
  
  return {
    externalId: String(d.placeId || d.cid || ''),
    source: 'google',
    name: String(d.title || d.name || ''),
    address: String(d.address || d.street || ''),
    city: String(d.city || ''),
    lat: location.lat || Number(d.latitude || 0),
    lng: location.lng || Number(d.longitude || 0),
    phone: String(d.phone || d.phoneUnformatted || ''),
    website: String(d.website || d.url || ''),
    rating: Number(d.totalScore || d.rating || 0),
    reviewCount: Number(d.reviewsCount || 0),
    categories: (d.categories as string[]) || [String(d.categoryName || '')],
    priceLevel: Number(d.priceLevel || 0),
    workingHours: parseGoogleHours(d.openingHours),
    photos: ((d.imageUrls as string[]) || []).slice(0, 5),
    rawData: d,
  };
}

function parseGoogleHours(hours: unknown): Record<string, string> {
  if (!hours || typeof hours !== 'object') return {};
  
  const result: Record<string, string> = {};
  const daysMap: Record<number, string> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };
  
  if (Array.isArray(hours)) {
    hours.forEach((period: any) => {
      const day = daysMap[period.day];
      if (day) {
        result[day] = `${period.open?.time || ''}-${period.close?.time || ''}`;
      }
    });
  }
  
  return result;
}

/**
 * Calculate similarity between two venue names/addresses
 * Used for conflict detection
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 100;
  
  // Levenshtein distance
  const matrix: number[][] = [];
  
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const maxLen = Math.max(s1.length, s2.length);
  const distance = matrix[s1.length][s2.length];
  
  return Math.round((1 - distance / maxLen) * 100);
}

/**
 * Find potential matches in existing merchants
 */
export async function findPotentialMatches(
  venue: ScrapedVenue,
  existingMerchants: Array<{ id: string; name: string; address: string; lat: number; lng: number }>
): Promise<Array<{ merchantId: string; similarity: number }>> {
  const matches: Array<{ merchantId: string; similarity: number }> = [];
  
  for (const merchant of existingMerchants) {
    // Calculate name similarity
    const nameSimilarity = calculateSimilarity(venue.name, merchant.name);
    
    // Calculate address similarity
    const addressSimilarity = calculateSimilarity(venue.address, merchant.address);
    
    // Calculate distance (in meters)
    const distance = calculateHaversineDistance(
      venue.lat, venue.lng,
      merchant.lat, merchant.lng
    );
    
    // If within 100m and similar name/address, consider it a match
    const isNearby = distance < 100;
    const combinedSimilarity = (nameSimilarity * 0.6 + addressSimilarity * 0.4);
    
    if (combinedSimilarity > 60 || (isNearby && combinedSimilarity > 40)) {
      matches.push({
        merchantId: merchant.id,
        similarity: Math.round(isNearby ? combinedSimilarity + 10 : combinedSimilarity),
      });
    }
  }
  
  return matches.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateHaversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

