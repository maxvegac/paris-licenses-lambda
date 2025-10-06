import { Module, forwardRef } from '@nestjs/common';
import { LicensesController } from './licenses.controller';
import { LicensesService } from './licenses.service';
import { EmailModule } from '../email/email.module';
import { FactoModule } from '../facto/facto.module';
import { ParisModule } from '../paris/paris.module';

@Module({
  imports: [EmailModule, FactoModule, forwardRef(() => ParisModule)],
  controllers: [LicensesController],
  providers: [LicensesService],
  exports: [LicensesService],
})
export class LicensesModule {}
