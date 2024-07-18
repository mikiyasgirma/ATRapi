import {post} from '@loopback/rest';
import {StrApplication} from '../application';

export class MigrateController {
  constructor() {}

  @post('/migrate-schema', {
    responses: {
      '200': {
        description: 'Schema migration triggered',
      },
    },
  })
  async migrateSchema(): Promise<void> {
    const app = new StrApplication();
    await app.boot();
    await app.migrateSchema({
      existingSchema: 'alter', // options: 'drop', 'alter', 'create'
    });
  }
}
