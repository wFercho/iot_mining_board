export interface GPSCoordinates {
  lng: number;
  lat: number;
}

export interface Mine {
  id: string;
  name: string;
  companyName: string;
  coordinates: GPSCoordinates;
  city: string;
  department: string;
  neighborhood: string;
  operationalStatus: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}
