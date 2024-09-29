import { NextFunction, Request, Response, Handler as HandlerDefault } from "express";

type FindOptions = Record<string, any>;
export interface RequestCustom extends Request {
  findConfig?: FindConfig;
  setFindConfig: (findConfig: FindOptions) => Promise<FindConfig>;
}

export interface ResponseCustom extends Response {
  // msg: (message: string) => {
  //   data: <T>(data: T) => void;
  // }
};
export type Handler<PayloadSchema extends object = {}, ResponseSchema extends object = {}> = (
  req: RequestCustom & PayloadSchema,
  res: ResponseCustom & ResponseSchema,
  next: NextFunction
) => Promise<any> | void;

interface FindConfig {
  attributes: any;
  where: Where;
  limit?: number;
  offset?: number;
}

interface Where {
  [where: string]: any;
}

export interface CreateControllerParams<PayloadSchema extends object = {}, ResponseSchema extends object = {}> {
  mapFindCriteria?: (searchCriteria: FindOptions, findConfig: FindConfig) => Promise<FindConfig>;
  requestSchema: PayloadSchema extends object ? PayloadSchema : PayloadSchema extends undefined ? {} : never;
  responseSchema: (data: any) => ResponseSchema;
}
/* const controller =
  <User extends object>({ mapFindCriteria, userPayloadSchema }: CreateControllerParams<User>) =>
    (controller: Handler<User>) => {
      const handler: Handler<User> = ((
        req,
        res,
        next,
      ) => {
        const parseToJSON = <T extends object | string>(value: T) => {
          const isString = typeof value === 'string';
          if (!isString) return value;
          return JSON.parse(value);
        };

        // console.log('<<REQ>>', req.query);
        // const attributes = req.query.attributes; //&& JSON.parse(req.query.attributes as string) || undefined;
        // const where = req.query.where as any; //&& JSON.parse(req.query.where as string) || undefined;
        const attributes = parseToJSON(req.query.attributes as any);
        const where = parseToJSON(req.query.where as any);
        const findConfig: FindConfig = {
          attributes,
          where
        };

        //* Eliminar los valores no definidos
        Object.entries(findConfig).forEach(
          ([key, value]) => { if (!value) delete (findConfig as any)[key] }
        );

        findConfig.limit = +req.query.limit! || undefined;
        findConfig.offset = +req.query.offset! || undefined;

        req.setFindConfig = async (searchCriteria: FindOptions) => {
          const finalFindConfig = await mapFindCriteria?.(searchCriteria, findConfig);
          if (!finalFindConfig) return findConfig;


          req.findConfig = finalFindConfig
          return finalFindConfig as FindConfig;
        };

        //* Si no hay atributos o where, se elimina el objeto findConfig
        if (!Object.keys(findConfig).length) delete (req as any).findConfig;

        controller(req, res, next)?.catch(next);
      });
      return handler as HandlerDefault;
    }; */


class Controller<RequestSchema extends object, ResponseSchema extends object = {}> {
  constructor({ mapFindCriteria, requestSchema, responseSchema }: CreateControllerParams<RequestSchema, ResponseSchema>) {
    this.mapFindCriteria = mapFindCriteria;
    this.requestSchema = requestSchema;
    this.responseSchema = responseSchema;
  }
  mapFindCriteria: CreateControllerParams<RequestSchema>['mapFindCriteria'];
  requestSchema: CreateControllerParams<RequestSchema>['requestSchema'];
  responseSchema: CreateControllerParams<RequestSchema>['responseSchema'];

  create = (controller: Handler<RequestSchema, ResponseSchema>) => {
    const handler: Handler<RequestSchema> = (async (
      req,
      res,
      next,
    ) => {
      // req = { ...this.requestSchema, ...req };
      // res = { ...(this.responseSchema({ req, res, next }) || {}) as any, ...res };
      // res = Object.assign(res, this.responseSchema?.({ req, res, next }) || {});
      const parseToJSON = <T extends object | string>(value: T) => {
        const isString = typeof value === 'string';
        if (!isString) return value;
        return JSON.parse(value);
      };

      // console.log('<<REQ>>', req.query);
      // const attributes = req.query.attributes; //&& JSON.parse(req.query.attributes as string) || undefined;
      // const where = req.query.where as any; //&& JSON.parse(req.query.where as string) || undefined;
      const attributes = parseToJSON(req.query.attributes as any);
      const where = parseToJSON(req.query.where as any);
      const findConfig: FindConfig = {
        attributes,
        where
      };

      //* Eliminar los valores no definidos
      Object.entries(findConfig).forEach(
        ([key, value]) => { if (!value) delete (findConfig as any)[key] }
      );

      findConfig.limit = +req.query.limit! || undefined;
      findConfig.offset = +req.query.offset! || undefined;

      req.setFindConfig = async (searchCriteria: FindOptions) => {
        const finalFindConfig = await this.mapFindCriteria?.(searchCriteria, findConfig);
        if (!finalFindConfig) return findConfig;


        req.findConfig = finalFindConfig
        return finalFindConfig as FindConfig;
      }

      //* Si no hay atributos o where, se elimina el objeto findConfig
      if (!Object.keys(findConfig).length) delete (req as any).findConfig;

      const resPayload = this.responseSchema?.({ req, res, next }) || {} as ResponseSchema;

      await controller(req, { ...resPayload, ...res } as any, next)?.catch(next);
    });
    return handler as HandlerDefault;
  }
}

class ResponseSchema<Schema extends object, Fn extends (...args: any) => Schema> {
  constructor(fn: Fn) {
    this.fn = fn;
    this.schema = {} as Schema;
  }
  fn: Fn;
  schema: Schema;
  create = (data: Schema) => {
    this.fn(data);
  }

  init = (schema: Schema) => {
    this.schema = schema;
  }
}
/* 
const get = controller({ userPayloadSchema: { user: { id: 1 } } })(
  async (req, res) => {
    req.user.id
    res.msg('Data fetched').data({ data: 'some data' });
  }
); */

/* const controller = new Controller({
  requestSchema: { user: { id: 1 } }, responseSchema: (data) => {
    return { 1: 3, other: 'other' }
  }
});

const get = controller.create(
  async (req, res) => {
    req.user.id

    // res.init({ id: 1 });
  }
); */

export default Controller;