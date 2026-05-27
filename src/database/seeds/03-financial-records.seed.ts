import { QueryRunner } from 'typeorm';
import { USER_IDS, FINANCIAL_IDS } from './seed-ids';

/** Retorna una fecha a N días desde hoy en formato YYYY-MM-DD */
function dateOnly(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

export const FinancialRecordsSeed = {
  async up(q: QueryRunner): Promise<void> {
    // ── Usuario Juan ─────────────────────────────────────────────────────────
    await q.query(`
      INSERT INTO financial_records (
        id, user_id, type, title, description,
        amount_usd,
        priority, interest_rate,
        date, is_recurring, recurrence_day
      ) VALUES

        -- Gasto alta prioridad, vence MAÑANA → notificación dispara ya
        (
          '${FINANCIAL_IDS.prestamoCarlos}',
          '${USER_IDS.juan}',
          'EXPENSE',
          'Préstamo de Carlos',
          'Préstamo de emergencia del mes pasado, acordado con Carlos',
          150.00,
          'HIGH', NULL,
          '${dateOnly(1)}', false, NULL
        ),

        -- Gasto recurrente prioridad media, vence en 5 días
        (
          '${FINANCIAL_IDS.cuotaBanco}',
          '${USER_IDS.juan}',
          'EXPENSE',
          'Cuota préstamo banco',
          'Cuota mensual del préstamo personal',
          320.00,
          'MEDIUM', NULL,
          '${dateOnly(5)}', true, ${new Date().getDate()}
        ),

        -- Gasto recurrente baja prioridad → no dispara notificación
        (
          '${FINANCIAL_IDS.netflix}',
          '${USER_IDS.juan}',
          'EXPENSE',
          'Netflix compartido con familia',
          NULL,
          5.99,
          'LOW', NULL,
          '${dateOnly(20)}', true, ${((new Date().getDate() + 19) % 28) + 1}
        ),

        -- Ingreso alta prioridad (cobro), vence MAÑANA
        (
          '${FINANCIAL_IDS.cobroPedro}',
          '${USER_IDS.juan}',
          'INCOME',
          'Cobro cena a Pedro',
          'Cena del viernes en el restaurante La Tasca, Pedro debe su parte',
          42.50,
          'HIGH', NULL,
          '${dateOnly(1)}', false, NULL
        ),

        -- Gasto pasado (historial) → no dispara notificación
        (
          '${FINANCIAL_IDS.telefonoPagado}',
          '${USER_IDS.juan}',
          'EXPENSE',
          'Teléfono de febrero',
          'Cuota del plan de telefonía de febrero',
          25.00,
          'LOW', NULL,
          '${dateOnly(-5)}', false, NULL
        )

      ON CONFLICT (id) DO NOTHING
    `);

    // ── Usuario María ─────────────────────────────────────────────────────────
    await q.query(`
      INSERT INTO financial_records (
        id, user_id, type, title, description,
        amount_usd,
        priority, interest_rate,
        date, is_recurring, recurrence_day
      ) VALUES

        -- Gasto alta prioridad con interés 10%, vence MAÑANA
        (
          '${FINANCIAL_IDS.prestamoLuis}',
          '${USER_IDS.maria}',
          'EXPENSE',
          'Préstamo a Luis con interés',
          'Préstamo con acuerdo de 10% mensual, registrado el mes pasado',
          500.00,
          'HIGH', 10.00,
          '${dateOnly(1)}', false, NULL
        ),

        -- Ingreso prioridad media, vence en 2 días
        (
          '${FINANCIAL_IDS.alquilerAna}',
          '${USER_IDS.maria}',
          'INCOME',
          'Cobro alquiler a Ana',
          'Parte del alquiler compartido de este mes',
          180.00,
          'MEDIUM', NULL,
          '${dateOnly(2)}', false, NULL
        ),

        -- Ingreso alta prioridad, vence en 4 días
        (
          '${FINANCIAL_IDS.materialesJose}',
          '${USER_IDS.maria}',
          'INCOME',
          'Cobro materiales a José',
          'Materiales de construcción que José usó y prometió pagar',
          275.00,
          'HIGH', NULL,
          '${dateOnly(4)}', false, NULL
        )

      ON CONFLICT (id) DO NOTHING
    `);
  },

  async down(q: QueryRunner): Promise<void> {
    await q.query(`
      DELETE FROM financial_records
      WHERE id IN (
        '${FINANCIAL_IDS.prestamoCarlos}',
        '${FINANCIAL_IDS.cuotaBanco}',
        '${FINANCIAL_IDS.netflix}',
        '${FINANCIAL_IDS.cobroPedro}',
        '${FINANCIAL_IDS.telefonoPagado}',
        '${FINANCIAL_IDS.prestamoLuis}',
        '${FINANCIAL_IDS.alquilerAna}',
        '${FINANCIAL_IDS.materialesJose}'
      )
    `);
  },
};
