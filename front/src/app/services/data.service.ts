import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Stats } from '../interfaces/stats.interface';

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly apiUrl = environment.backendUrl;

  constructor(private http: HttpClient) {}

  getStats(
    startYear?: number,
    endYear?: number,
    startMonth?: number,
    endMonth?: number,
    transportType?: string
  ) {
    const params: any = {};
    if (startYear) params.startYear = startYear;
    if (endYear) params.endYear = endYear;
    if (startMonth) params.startMonth = startMonth;
    if (endMonth) params.endMonth = endMonth;
    if (transportType) params.transportType = transportType;

    return this.http.get<Stats>(`${this.apiUrl}/data/stats`, { params });
  }
}