import { Module } from '@nestjs/common';
import { ProductionOrdersModule } from './production-orders.module';

@Module({
  imports: [ProductionOrdersModule],
})
export class AppModule {}
