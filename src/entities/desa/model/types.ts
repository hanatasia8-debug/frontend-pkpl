export interface VillageOfficialDto {
  id?: string;
  name: string;
  position: string;
  photo?: string;
  photoUrl?: string;
  greeting?: string;
  email?: string;
}

export interface VillageProfileDto {
  villageName: string;
  headGreeting: string;
  headPhoto: string;
  headName?: string | null;
  headPosition?: string | null;
  address?: string;
  phone?: string;
  email?: string;
  aboutText?: string;
  officials: VillageOfficialDto[];
}

export interface VillageStatsDto {
  umkmCount: number;
  productCount: number;
  newsCount: number;
  potentialCount?: number;
  dusunCount?: number;
}

export interface VillageProfileResponse {
  profile: VillageProfileDto | null;
  stats: VillageStatsDto;
}

