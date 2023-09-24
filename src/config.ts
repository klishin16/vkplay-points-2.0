import joi from 'joi'
import { IConfig } from './types';
import { logger } from './logger';

const env_validation_scheam = joi
  .object()
  .keys({
    NODE_ENV: joi
      .string()
      .valid("production", "development", "test")
      .required(),
    EMAIL: joi.string().required(),
    PASSWORD: joi.string().required(),
    HOST: joi.string().required(),
    PORT: joi.number().positive().required(),
    DATABASE: joi.string().required().description("DB name"),
  })
  .unknown();

const { value: envs, error } = env_validation_scheam
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config: IConfig = {
  env: envs.NODE_ENV,
  email: envs.EMAIL,
  password: envs.PASSWORD,
  host: envs.HOST,
  port: envs.PORT,
  database: envs.DATABASE
}

logger.log('Config:', config);

export default config;
