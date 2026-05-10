import { QueryRunner } from 'typeorm';
import { USER_IDS, FINANCIAL_IDS, NOTIFICATION_IDS } from './seed-ids';

/**
 * scheduled_at = date - 1 día.
 * El cron compara contra hoy: si scheduled_at <= hoy, dispara la notificación.
 * Migración nueva define scheduled_at como `date` (no timestamptz), así que
 * trabajamos a granularidad diaria.
 */
function scheduledAt(daysUntilDue: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysUntilDue - 1);
  return d.toISOString().split('T')[0];
}

export const NotificationsSeed = {
  async up(q: QueryRunner): Promise<void> {
    await q.query(`
      INSERT INTO notifications (
        id, user_id, financial_id, type,
        scheduled_at, sent_at, status, is_read
      ) VALUES

        -- Juan: "Préstamo de Carlos" vence mañana → scheduled_at = hoy → DISPARA YA
        (
          '${NOTIFICATION_IDS.juanCarlos}',
          '${USER_IDS.juan}',
          '${FINANCIAL_IDS.prestamoCarlos}',
          'debt_due_reminder',
          '${scheduledAt(1)}',
          NULL, 'PENDING', false
        ),

        -- Juan: "Cobro cena a Pedro" vence mañana → DISPARA YA
        (
          '${NOTIFICATION_IDS.juanCobroPedro}',
          '${USER_IDS.juan}',
          '${FINANCIAL_IDS.cobroPedro}',
          'collection_due_reminder',
          '${scheduledAt(1)}',
          NULL, 'PENDING', false
        ),

        -- María: "Préstamo a Luis" vence mañana → DISPARA YA
        (
          '${NOTIFICATION_IDS.mariaLuis}',
          '${USER_IDS.maria}',
          '${FINANCIAL_IDS.prestamoLuis}',
          'debt_due_reminder',
          '${scheduledAt(1)}',
          NULL, 'PENDING', false
        ),

        -- Juan: "Cuota préstamo banco" vence en 5 días → no dispara aún
        (
          '${NOTIFICATION_IDS.juanBanco}',
          '${USER_IDS.juan}',
          '${FINANCIAL_IDS.cuotaBanco}',
          'debt_due_reminder',
          '${scheduledAt(5)}',
          NULL, 'PENDING', false
        ),

        -- María: "Cobro alquiler a Ana" vence en 2 días → no dispara aún
        (
          '${NOTIFICATION_IDS.mariaCobroAna}',
          '${USER_IDS.maria}',
          '${FINANCIAL_IDS.alquilerAna}',
          'collection_due_reminder',
          '${scheduledAt(2)}',
          NULL, 'PENDING', false
        )

      ON CONFLICT (id) DO NOTHING
    `);
  },

  async down(q: QueryRunner): Promise<void> {
    await q.query(`
      DELETE FROM notifications
      WHERE id IN (
        '${NOTIFICATION_IDS.juanCarlos}',
        '${NOTIFICATION_IDS.juanCobroPedro}',
        '${NOTIFICATION_IDS.mariaLuis}',
        '${NOTIFICATION_IDS.juanBanco}',
        '${NOTIFICATION_IDS.mariaCobroAna}'
      )
    `);
  },
};
