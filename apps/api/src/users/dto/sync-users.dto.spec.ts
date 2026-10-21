import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SyncUsersDto } from './sync-users.dto';

describe('SyncUsersDto', () => {
  it('keeps app_metadata.role after whitelist validation', async () => {
    const dto = plainToInstance(SyncUsersDto, {
      users: [
        {
          id: '11111111-1111-4111-8111-111111111111',
          email: 'admin@example.com',
          app_metadata: { role: 'admin', provider: 'email' },
        },
      ],
    });

    const errors = await validate(dto, { whitelist: true });

    expect(errors).toHaveLength(0);
    expect(dto.users[0].app_metadata?.role).toBe('admin');
  });

  it('rejects invalid email', async () => {
    const dto = plainToInstance(SyncUsersDto, {
      users: [{ id: '11111111-1111-4111-8111-111111111111', email: 'not-an-email' }],
    });

    const errors = await validate(dto, { whitelist: true });

    expect(errors.length).toBeGreaterThan(0);
  });
});
