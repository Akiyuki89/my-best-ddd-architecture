import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SWAGGER_API_ROOT, SWAGGER_API_NAME, SWAGGER_API_DESCRIPTION, SWAGGER_API_CURRENT_VERSION } from '@infrastructure/documentation/config/swagger-constants.config';
import { addSwaggerTags } from '@infrastructure/documentation/config/swagger-tags.config';

export function setupSwagger(app: INestApplication): void {
  let config = new DocumentBuilder().setTitle(SWAGGER_API_NAME).setDescription(SWAGGER_API_DESCRIPTION).setVersion(SWAGGER_API_CURRENT_VERSION);

  config = addSwaggerTags(config);

  const document = SwaggerModule.createDocument(app, config.build());
  SwaggerModule.setup(SWAGGER_API_ROOT, app, document);
}
