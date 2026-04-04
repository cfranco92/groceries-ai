import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import * as admin from 'firebase-admin';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
  ],
})
export class AuthModule implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    if (admin.apps.length === 0) {
      const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
          privateKey: privateKey ? privateKey.replace(/\\n/g, '\n') : undefined,
          clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
        }),
      });
    }
  }
}
