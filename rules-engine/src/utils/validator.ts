import _ from 'lodash';
import Ajv from 'ajv';
const ajv = new Ajv({ allowUnionTypes: true });

export class Validator {
  /*
   * validateJson
   * Do this by
   * 1. Validate the facts using the passed inschema
   * 2. return validation errors
   * 3. Return facts and continue if there is no error
   * @param data - JSON data to validate
   * @param schema - Schema to validate against
   * @return void - Throw error if there is an error
   */
  static validateJson(data: any, schema: any, context?: any) {
    // 1. Validate the facts using passed in schema
    const valid = ajv.validate(schema, data);
    if (!valid) {
      context?.logger.error(`validateJson - isValid: ${valid}`, {
        tags: context?.parameters?.validationTags,
        errors: ajv.errors,
      }); // log errors
      return false;
    }
    return true;
  }
}
