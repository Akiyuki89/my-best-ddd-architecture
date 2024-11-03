import * as fs from 'fs';
import * as path from 'path';

const descriptionPath = path.join(process.cwd(), 'src', 'infrastructure', 'documentation', 'config', 'description.txt');
const description = fs.readFileSync(descriptionPath, 'utf8');

export const SWAGGER_API_ROOT = 'api';
export const SWAGGER_API_NAME = 'Global Modal Creation - API';
export const SWAGGER_API_DESCRIPTION = description;
export const SWAGGER_API_CURRENT_VERSION = '1.0';
