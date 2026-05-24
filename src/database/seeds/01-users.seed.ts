import { QueryRunner } from 'typeorm';
import * as admin from 'firebase-admin';
import { USER_IDS, DEVICE_IDS } from './seed-ids';

const SEED_USERS = [
  {
    id: USER_IDS.juan,
    email: 'seed-juan@kashy.test',
    password: 'kashy1234',
    firstName: 'Juan',
    lastName: 'Pérez',
    countryCode: 'VE',
    latitude: 10.4806,
    longitude: -66.9036,
    device: {
      id: DEVICE_IDS.juanPhone,
      deviceId: 'seed-juan-device-id',
      deviceName: 'Pixel 7 (seed Juan)',
      fcmToken:
        'cFake_FCM_Token_Juan_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      refreshToken: 'cFake_Refresh_Token_Juan_seed',
    },
  },
  {
    id: USER_IDS.maria,
    email: 'seed-maria@kashy.test',
    password: 'kashy1234',
    firstName: 'María',
    lastName: 'González',
    countryCode: 'VE',
    latitude: 10.4634,
    longitude: -66.8784,
    device: {
      id: DEVICE_IDS.mariaPhone,
      deviceId: 'seed-maria-device-id',
      deviceName: 'iPhone 14 (seed María)',
      fcmToken:
        'cFake_FCM_Token_Maria_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      refreshToken: 'cFake_Refresh_Token_Maria_seed',
    },
  },
];

async function upsertFirebaseUser(
  auth: admin.auth.Auth,
  email: string,
  password: string,
  displayName: string,
): Promise<string> {
  try {
    const existing = await auth.getUserByEmail(email);
    return existing.uid;
  } catch {
    const created = await auth.createUser({ email, password, displayName });
    return created.uid;
  }
}

export const UsersSeed = {
  async up(q: QueryRunner): Promise<void> {
    const auth = admin.app().auth();

    for (const u of SEED_USERS) {
      const firebaseUid = await upsertFirebaseUser(
        auth,
        u.email,
        u.password,
        `${u.firstName} ${u.lastName}`,
      );

      await q.query(
        `
        INSERT INTO users (
          id, firebase_uid, email,
          first_name, last_name,
          country_code, latitude, longitude,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now(), now())
        ON CONFLICT (id) DO UPDATE SET firebase_uid = EXCLUDED.firebase_uid
        `,
        [
          u.id,
          firebaseUid,
          u.email,
          u.firstName,
          u.lastName,
          u.countryCode,
          u.latitude,
          u.longitude,
        ],
      );

      await q.query(
        `
        INSERT INTO user_devices (
          id, user_id, device_id, device_name,
          firebase_fcm_token, firebase_refresh_token,
          last_active_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, now(), now())
        ON CONFLICT (id) DO UPDATE SET
          firebase_fcm_token = EXCLUDED.firebase_fcm_token,
          firebase_refresh_token = EXCLUDED.firebase_refresh_token,
          last_active_at = now()
        `,
        [
          u.device.id,
          u.id,
          u.device.deviceId,
          u.device.deviceName,
          u.device.fcmToken,
          u.device.refreshToken,
        ],
      );
    }
  },

  async down(q: QueryRunner): Promise<void> {
    const auth = admin.app().auth();

    // user_devices borra por CASCADE al borrar el user, pero limpiamos primero
    await q.query(`DELETE FROM user_devices WHERE id IN ($1, $2)`, [
      DEVICE_IDS.juanPhone,
      DEVICE_IDS.mariaPhone,
    ]);

    await q.query(`DELETE FROM users WHERE id IN ($1, $2)`, [
      USER_IDS.juan,
      USER_IDS.maria,
    ]);

    for (const u of SEED_USERS) {
      try {
        const fbUser = await auth.getUserByEmail(u.email);
        await auth.deleteUser(fbUser.uid);
      } catch {
        // Ya no existe en Firebase, ignorar
      }
    }
  },
};
