import * as express from 'express';

declare module 'express' {
  export interface Request {
    // Add custom request properties here if needed
  }

  export interface Response {
    // Add custom response properties here if needed
  }
}

export = express;
