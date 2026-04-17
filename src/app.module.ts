import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { GroupsModule } from './modules/groups/groups.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { TestsModule } from './modules/tests/tests.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/student/student.module';
import { SupportModule } from './modules/support/support.module';
import { envConfig } from './common/config';
import { TeachersModule } from './modules/teacher/teacher.module';
import { ParentsModule } from './modules/parent/parent.module';
import { AdminsModule } from './admin/admin.module';
import { DirectionModule } from './modules/directions/directions.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: envConfig.DB_URL,
      synchronize: true,
      autoLoadEntities: true,
    }),
    AuthModule,
    AttendanceModule,
    GroupsModule,
    TelegramModule,
    TestsModule,
    UsersModule,
    StudentsModule,
    SupportModule,
    TeachersModule,
    ParentsModule,
    AdminsModule,
    DirectionModule
  ],
  
})
export class AppModule {}