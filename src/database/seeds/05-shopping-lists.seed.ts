import { QueryRunner } from 'typeorm';
import { USER_IDS, LIST_IDS, ITEM_IDS } from './seed-ids';

/**
 * Tasa local (VES) por USD usada como snapshot de las listas.
 * Se mantiene constante para que los seeds sean reproducibles.
 */
const RATE_TEMPLATE = 35400.0;
const RATE_RECEIPT_1 = 35680.0;
const RATE_RECEIPT_2 = 36180.0;
const RATE_TEMPLATE_M = 35450.0;
const RATE_RECEIPT_M = 36170.0;

export const ShoppingListsSeed = {
  async up(q: QueryRunner): Promise<void> {
    // ── Listas ───────────────────────────────────────────────────────────────
    await q.query(`
      INSERT INTO shopping_lists (
        id, user_id, name, store_name,
        list_type, country_code, currency_code,
        exchange_rate_snapshot, iva_enabled,
        scheduled_date, latitude, longitude, is_active
      ) VALUES

        -- Juan: TEMPLATE en uso (lista de compras programada)
        (
          '${LIST_IDS.listaActiva}',
          '${USER_IDS.juan}',
          'Mercado semanal',
          'Central Madeirense',
          'TEMPLATE', 'VE', 'VES',
          ${RATE_TEMPLATE}, false,
          now() + interval '1 day',
          10.4880, -66.8792, true
        ),

        -- Juan: RECEIPT del mes pasado (historial de compra realizada)
        (
          '${LIST_IDS.reciboPasado1}',
          '${USER_IDS.juan}',
          'Compra de la semana pasada',
          'Bicentenario',
          'RECEIPT', 'VE', 'VES',
          ${RATE_RECEIPT_1}, false,
          now() - interval '7 days',
          10.4915, -66.8825, false
        ),

        -- Juan: RECEIPT histórico con IVA
        (
          '${LIST_IDS.reciboPasado2}',
          '${USER_IDS.juan}',
          'Carne y verduras',
          'El Bodegón',
          'RECEIPT', 'VE', 'VES',
          ${RATE_RECEIPT_2}, true,
          now() - interval '14 days',
          10.4810, -66.9035, false
        ),

        -- María: TEMPLATE activa
        (
          '${LIST_IDS.listaActivaMaria}',
          '${USER_IDS.maria}',
          'Cuidado personal',
          'Farmatodo',
          'TEMPLATE', 'VE', 'VES',
          ${RATE_TEMPLATE_M}, false,
          now() + interval '2 days',
          10.4634, -66.8784, true
        ),

        -- María: RECEIPT (historial)
        (
          '${LIST_IDS.reciboMaria}',
          '${USER_IDS.maria}',
          'Despensa del mes',
          'Día a Día',
          'RECEIPT', 'VE', 'VES',
          ${RATE_RECEIPT_M}, false,
          now() - interval '4 days',
          10.4670, -66.8801, false
        )

      ON CONFLICT (id) DO NOTHING
    `);

    // ── Items ────────────────────────────────────────────────────────────────

    // Lista TEMPLATE de Juan
    await q.query(`
      INSERT INTO shopping_items (
        id, list_id, product_name, category,
        unit_price_local, quantity, unit_price_usd, is_checked
      ) VALUES
        ('${ITEM_IDS.leche}',  '${LIST_IDS.listaActiva}', 'Leche completa 1L',   'Lácteos',    8500.00, 3, 0.2401, true),
        ('${ITEM_IDS.pan}',    '${LIST_IDS.listaActiva}', 'Pan de sándwich',     'Panadería',  6200.00, 2, 0.1751, true),
        ('${ITEM_IDS.pollo}',  '${LIST_IDS.listaActiva}', 'Pechuga de pollo 1kg','Carnes',    45000.00, 1, 1.2712, false),
        ('${ITEM_IDS.arroz}',  '${LIST_IDS.listaActiva}', 'Arroz diana 1kg',     'Granos',    12000.00, 2, 0.3390, false),
        ('${ITEM_IDS.aceite}', '${LIST_IDS.listaActiva}', 'Aceite vegetal 1L',   'Aceites',   18500.00, 1, 0.5226, false)
      ON CONFLICT (id) DO NOTHING
    `);

    // RECEIPT 1 de Juan
    await q.query(`
      INSERT INTO shopping_items (
        id, list_id, product_name, category,
        unit_price_local, quantity, unit_price_usd, is_checked
      ) VALUES
        ('${ITEM_IDS.pasta}',    '${LIST_IDS.reciboPasado1}', 'Pasta espagueti 500g', 'Pastas',     5800.00, 3, 0.1626, true),
        ('${ITEM_IDS.atun}',     '${LIST_IDS.reciboPasado1}', 'Atún en lata 140g',    'Enlatados',  7200.00, 4, 0.2019, true),
        ('${ITEM_IDS.mayonesa}', '${LIST_IDS.reciboPasado1}', 'Mayonesa 445g',        'Salsas',    14500.00, 2, 0.4065, true)
      ON CONFLICT (id) DO NOTHING
    `);

    // RECEIPT 2 de Juan (con IVA)
    await q.query(`
      INSERT INTO shopping_items (
        id, list_id, product_name, category,
        unit_price_local, quantity, unit_price_usd, is_checked
      ) VALUES
        ('${ITEM_IDS.carne}',  '${LIST_IDS.reciboPasado2}', 'Carne molida 1kg', 'Carnes',     85000.00, 1, 2.3491, true),
        ('${ITEM_IDS.papa}',   '${LIST_IDS.reciboPasado2}', 'Papa blanca 1kg',  'Vegetales',   9500.00, 3, 0.2626, true),
        ('${ITEM_IDS.tomate}', '${LIST_IDS.reciboPasado2}', 'Tomate 1kg',       'Vegetales',  11000.00, 2, 0.3040, true)
      ON CONFLICT (id) DO NOTHING
    `);

    // TEMPLATE activa de María
    await q.query(`
      INSERT INTO shopping_items (
        id, list_id, product_name, category,
        unit_price_local, quantity, unit_price_usd, is_checked
      ) VALUES
        ('${ITEM_IDS.shampoo}', '${LIST_IDS.listaActivaMaria}', 'Shampoo Pantene 400ml', 'Higiene', 28000.00, 1, 0.7898, false),
        ('${ITEM_IDS.jabon}',   '${LIST_IDS.listaActivaMaria}', 'Jabón Palmolive x3',    'Higiene',  9500.00, 2, 0.2680, true)
      ON CONFLICT (id) DO NOTHING
    `);

    // RECEIPT de María
    await q.query(`
      INSERT INTO shopping_items (
        id, list_id, product_name, category,
        unit_price_local, quantity, unit_price_usd, is_checked
      ) VALUES
        ('${ITEM_IDS.cafe}',   '${LIST_IDS.reciboMaria}', 'Café molido 250g',    'Bebidas', 18000.00, 2, 0.4977, true),
        ('${ITEM_IDS.azucar}', '${LIST_IDS.reciboMaria}', 'Azúcar refinada 1kg', 'Granos',   8500.00, 4, 0.2349, true),
        ('${ITEM_IDS.harina}', '${LIST_IDS.reciboMaria}', 'Harina de maíz 1kg',  'Granos',   7200.00, 5, 0.1990, true)
      ON CONFLICT (id) DO NOTHING
    `);
  },

  async down(q: QueryRunner): Promise<void> {
    await q.query(`
      DELETE FROM shopping_lists
      WHERE id IN (
        '${LIST_IDS.listaActiva}',
        '${LIST_IDS.reciboPasado1}',
        '${LIST_IDS.reciboPasado2}',
        '${LIST_IDS.listaActivaMaria}',
        '${LIST_IDS.reciboMaria}'
      )
    `);
    // Los items se eliminan por CASCADE desde shopping_lists
  },
};
