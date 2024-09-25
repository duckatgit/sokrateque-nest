import { ForbiddenException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ALBERT_ENDPOINT } from 'src/config';
import * as FormData from 'form-data';

@Injectable()
export class ApiServiceService {
  private albert_url = ALBERT_ENDPOINT;
  constructor(private readonly httpService: HttpService) {}

  apiGet(endPoint: string): Observable<AxiosResponse<any[]>> {
    const api_end_point = ALBERT_ENDPOINT + '/' + endPoint;
    return this.httpService.get(api_end_point);
  }
  apiPut(endPoint: string, data: any) {
    const api_end_point = ALBERT_ENDPOINT + '/' + endPoint;
    return this.httpService.put(api_end_point, data);
  }
  apiDelete(endPoint: string): Observable<AxiosResponse<any[]>> {
    const api_end_point = ALBERT_ENDPOINT + '/' + endPoint;
    return this.httpService.delete(api_end_point);
  }
  async albertApiCall(bookData: { context: string; question: string }) {
    const formData = new FormData();
    formData.append('context', bookData.context);
    formData.append('question', bookData.question);
    const result = await this.repeator(formData, 0);
    return result;
  }

  async repeator(form: FormData, times: number) {
    if (times >= 3) throw new ForbiddenException('the issues is not solved');
    const api_end_point = this.albert_url + '/predict';
    try {
      const result = await this.httpService.axiosRef({
        method: 'POST',
        responseType: 'json',
        url: api_end_point,
        data: form,
        timeout: 120000,
      });
      return result.data;
    } catch (error) {
      if (error?.cause?.code != 'ECONNRESET') {
        console.error(error);
        return;
      } else {
        this.repeator(form, times + 1);
      }
    }
  }
}
