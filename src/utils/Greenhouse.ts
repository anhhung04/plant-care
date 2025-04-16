// types/greenhouse.ts
export interface Greenhouse {
    id: string;
    name: string;
    temperature?: number;
    humidity?: number;
    lightLevel?: number;
    soilMoisture?: number;
    lastUpdated?: string;
    // Thêm các thuộc tính khác nếu cần
  }
  
  export interface GreenhouseResponse {
    data: Greenhouse[];
    page: number;
    size: number;
    total: number;
  }
  
  export interface GreenhouseParams {
    name?: string;
    page?: number;
    size?: number;
  }