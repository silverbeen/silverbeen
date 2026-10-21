import { Module } from '@nestjs/common';
import { SupabaseAdminService } from './supabase-admin.service';

@Module({
  providers: [SupabaseAdminService],
  exports: [SupabaseAdminService],
})
export class SupabaseModule {}
