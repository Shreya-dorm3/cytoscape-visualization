import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MappingService {

  constructor(private http: HttpClient) { }

  getCartons() {
    return this.http.get('../../../assets/Json/CartonResponse.json');
  }

  getHeatMap(data: number) {
    return this.http.get<any>(``);
  }

  saveGraph(data: any) {
    return this.http.get<any>(``);
  }

  getGraph() {
    return this.http.get<any>(``);
  }

  getCartonLocations() {
    return this.http.get<any>(``);
  }
}
