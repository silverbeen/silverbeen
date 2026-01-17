import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SupabaseStrategy } from './strategies/supabase.strategy';
import { SupabaseGuard } from './guards/supabase.guard';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'supabase' })],
  providers: [SupabaseStrategy, SupabaseGuard],
  exports: [SupabaseGuard, PassportModule],
})
export class AuthModule {}
