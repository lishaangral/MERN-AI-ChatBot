import { Request } from "express";

export interface FileRequest extends Request {
  file?: any;
  files?: any;
}
