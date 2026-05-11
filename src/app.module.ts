import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// Core
import { AuthModule } from './modules/auth/auth.module';
import { envConfig } from './common/config';

// Role-based modules
import { AdminModule } from './modules/admin/admin.module';
import { TeacherModule } from './modules/teacher/teacher.module';
import { SupportModule } from './modules/support/support.module';

// Feature modules
import { AttendanceModule } from './modules/attendance/attendance.module';
import { GroupsModule } from './modules/groups/groups.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { TestsModule } from './modules/tests/tests.module';
import { StudentsModule } from './modules/student/student.module';
import { ParentsModule } from './modules/parent/parent.module';
import { DirectionModule } from './modules/directions/directions.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { OtpModule } from './modules/otp/otp.module';
import { BranchesModule } from './modules/branches/branches.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: envConfig.DB_URL,
      synchronize: true,
      autoLoadEntities: true,
    }),
    // Auth
    AuthModule,

    // Rol modullari
    AdminModule,
    TeacherModule,
    SupportModule,

    // Feature modullari
    AttendanceModule,
    GroupsModule,
    TelegramModule,
    TestsModule,
    StudentsModule,
    ParentsModule,
    DirectionModule,
    QuestionsModule,
    OtpModule,
    BranchesModule,
  ],
})
export class AppModule {}
