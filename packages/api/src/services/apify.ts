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
  
  const data = await response.json();
  
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
  
  const data = await response.json();
  
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
  
  const items = await response.json();
  
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
  return {
    externalId: String(data.id || data.firmId || ''),
    source: '2gis',
    name: String(data.name || data.title || ''),
    address: String(data.address || data.addressName || ''),
    city: String(data.city || ''),
    lat: Number(data.lat || data.point?.lat || 0),
    lng: Number(data.lng || data.point?.lon || 0),
    phone: String(data.phone || (data.contacts as any)?.phone || ''),
    website: String(data.website || data.url || ''),
    rating: Number(data.rating || 0),
    reviewCount: Number(data.reviewCount || data.reviews_count || 0),
    categories: (data.rubrics as string[]) || [],
    workingHours: data.schedule as Record<string, string> || {},
    photos: (data.photos as string[]) || [],
    rawData: data,
  };
}

function normalizeYandexData(data: Record<string, unknown>): ScrapedVenue {
  const coords = data.coordinates as { lat: number; lng: number } || { lat: 0, lng: 0 };
  
  return {
    externalId: String(data.id || data.oid || ''),
    source: 'yandex',
    name: String(data.name || data.title || ''),
    address: String(data.address || ''),
    city: String(data.city || ''),
    lat: coords.lat,
    lng: coords.lng,
    phone: String(data.phone || data.phones?.[0] || ''),
    website: String(data.website || data.url || ''),
    rating: Number(data.rating || data.stars || 0),
    reviewCount: Number(data.reviewCount || data.reviews || 0),
    categories: (data.categories as string[]) || [],
    workingHours: data.workingTime as Record<string, string> || {},
    photos: (data.images as string[]) || [],
    rawData: data,
  };
}

function normalizeGoogleData(data: Record<string, unknown>): ScrapedVenue {
  const location = data.location as { lat: number; lng: number } || { lat: 0, lng: 0 };
  
  return {
    externalId: String(data.placeId || data.cid || ''),
    source: 'google',
    name: String(data.title || data.name || ''),
    address: String(data.address || data.street || ''),
    city: String(data.city || ''),
    lat: location.lat || Number(data.latitude || 0),
    lng: location.lng || Number(data.longitude || 0),
    phone: String(data.phone || data.phoneUnformatted || ''),
    website: String(data.website || data.url || ''),
    rating: Number(data.totalScore || data.rating || 0),
    reviewCount: Number(data.reviewsCount || 0),
    categories: (data.categories as string[]) || [String(data.categoryName || '')],
    priceLevel: Number(data.priceLevel || 0),
    workingHours: parseGoogleHours(data.openingHours),
    photos: ((data.imageUrls as string[]) || []).slice(0, 5),
    rawData: data,
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

