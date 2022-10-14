// @ts-ignore
import { resolve } from 'path';
import { writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
//import prettier from 'prettier';
import _ from 'lodash';
import * as TJS from 'typescript-json-schema';

export function generateJSONSchema(
  typeFolder: string,
  outputDir: string,
  namespacesString: string = 'messages'
) {
  console.log('START: Generating JSON Schema', {
    typeFolder,
    outputDir,
    namespacesString,
  });
  let namespaces = namespacesString.split(',');
  // optionally pass argument to schema generator
  const settings: TJS.PartialArgs = {
    required: true,
    titles: true,
    ref: false,
    include: readdirSync(typeFolder).map((file) =>
      resolve(`${typeFolder}/${file}`)
    ),
  };

  // optionally pass ts compiler options
  const compilerOptions: TJS.CompilerOptions = {
    strictNullChecks: true,
  };

  // optionally pass a base path
  const basePath = undefined;

  console.log('Loading types');
  const program = TJS.getProgramFromFiles(
    readdirSync(typeFolder).map((file) => resolve(`${typeFolder}/${file}`)),
    compilerOptions,
    basePath
  );

  // We can either get the schema for one file and one type...
  // const schema = TJS.generateSchema(program, 'MyType', settings);

  // ... or a generator that lets us incrementally get more schemas

  console.log('Generating types');
  const generator = TJS.buildGenerator(
    program,
    settings,
    undefined // readdirSync(typeFolder)
  );

  // all symbols
  console.log('Getting all symbols');
  const symbols = generator!.getUserSymbols();

  let schemaMap: {
    [namespace: string]: {
      [schema: string]: string;
    };
  } = {};
  let types: Array<string> = [];
  for (let schemaName of symbols) {
    // console.log(schemaName);
    // The first symbols contain the types we want
    let namespace = namespaces.find((namespace) =>
      schemaName.startsWith(namespace + '.')
    );
    // If we don't find the namespace then continue
    if (!namespace) {
      continue;
    }

    schemaMap[namespace] = schemaMap[namespace] || {};

    let schemaNameNoPrefix = schemaName.split('.')[1];
    console.log(`Generating schema for ${schemaName}`);
    let schema = generator!.getSchemaForSymbol(schemaName);
    let writeFolder = `${outputDir}/${namespace}`;
    if (!existsSync(writeFolder)) {
      mkdirSync(writeFolder, { recursive: true });
    }
    let path = resolve(`${writeFolder}/${schemaNameNoPrefix}.json`);
    let schemaString = JSON.stringify(schema, null, 2);
    let messageType = _.get(schema, 'properties.type.enum[0]');
    writeFileSync(path, schemaString);

    //schemaTs += `\n\nexport const ${schemaNameNoPrefix} = require('../schema/${schemaNameNoPrefix}.json');`;
    schemaMap[namespace][
      schemaNameNoPrefix
    ] = `require("./${schemaNameNoPrefix}.json")`;

    types.push(schemaNameNoPrefix);

    if (messageType) {
      //schemaTs += `\n\nexport const ${messageType} = ${schemaNameNoPrefix};`;
      schemaMap[namespace][
        messageType
      ] = `require("../schema/${schemaNameNoPrefix}.json")`;
    }
    console.log(`Wrote schema for ${schemaName} to ${path}`);
  }
  console.log('END: Generating JSON Schema');
}

const [, , inputTypesFolder, outputSchemaFolder, namespacesToTransform] =
  process.argv;
generateJSONSchema(
  inputTypesFolder, // Type folder
  outputSchemaFolder,
  namespacesToTransform
);
