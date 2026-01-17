export class ApiResponse<T = any> {
  message: string;
  data: T;
  status: number;

  constructor(message: string, data: T, status: number) {
    this.message = message;
    this.data = data;
    this.status = status;
  }
}
