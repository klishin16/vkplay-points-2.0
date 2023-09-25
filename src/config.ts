import joi from 'joi'
import { IConfig } from './types';
import { logger } from './logger';

const env_validation_scheam = joi
  .object()
  .keys({
    EMAIL: joi.string().required(),
    PASSWORD: joi.string().required(),
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
  email: envs.EMAIL,
  password: envs.PASSWORD,
  database: envs.DATABASE
}

logger.log('Config:', config);

export default config;
