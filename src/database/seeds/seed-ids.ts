/**
 * IDs fijos compartidos entre todos los seeds.
 * Permiten ejecutar cada seed por separado y limpiarlos de forma predecible.
 */

// ─── Usuarios ────────────────────────────────────────────────────────────────
export const USER_IDS = {
  juan: 'a1000000-5eed-0000-0000-000000000001',
  maria: 'a1000000-5eed-0000-0000-000000000002',
} as const;

// ─── User devices ────────────────────────────────────────────────────────────
export const DEVICE_IDS = {
  juanPhone: 'a2000000-5eed-0000-0000-000000000001',
  mariaPhone: 'a2000000-5eed-0000-0000-000000000002',
} as const;

// ─── Notification preferences ─────────────────────────────────────────────────
export const PREF_IDS = {
  juan: 'b2000000-5eed-0000-0000-000000000001',
  maria: 'b2000000-5eed-0000-0000-000000000002',
} as const;

// ─── Financial records (deudas / cobros / ingresos / gastos) ─────────────────
export const FINANCIAL_IDS = {
  // Usuario Juan
  prestamoCarlos: 'c3000000-5eed-0000-0000-000000000001', // EXPENSE, vence mañana
  cuotaBanco: 'c3000000-5eed-0000-0000-000000000002', // EXPENSE recurrente, vence en 5 días
  netflix: 'c3000000-5eed-0000-0000-000000000003', // EXPENSE recurrente, sin urgencia
  cobroPedro: 'c3000000-5eed-0000-0000-000000000004', // INCOME, vence mañana
  telefonoPagado: 'c3000000-5eed-0000-0000-000000000005', // EXPENSE pasado (historial)
  // Usuario Maria
  prestamoLuis: 'c3000000-5eed-0000-0000-000000000006', // EXPENSE con interés, vence mañana
  alquilerAna: 'c3000000-5eed-0000-0000-000000000007', // INCOME, vence en 2 días
  materialesJose: 'c3000000-5eed-0000-0000-000000000008', // INCOME, vence en 4 días
} as const;

// ─── Notificaciones ───────────────────────────────────────────────────────────
export const NOTIFICATION_IDS = {
  // Scheduled_at ya pasado → se disparan en el próximo ciclo del cron
  juanCarlos: 'd4000000-5eed-0000-0000-000000000001',
  juanCobroPedro: 'd4000000-5eed-0000-0000-000000000002',
  mariaLuis: 'd4000000-5eed-0000-0000-000000000003',
  // Scheduled_at en el futuro → no se disparan todavía
  juanBanco: 'd4000000-5eed-0000-0000-000000000004',
  mariaCobroAna: 'd4000000-5eed-0000-0000-000000000005',
} as const;

// ─── Shopping lists ───────────────────────────────────────────────────────────
export const LIST_IDS = {
  // Usuario Juan
  listaActiva: 'e5000000-5eed-0000-0000-000000000001', // TEMPLATE activa
  reciboPasado1: 'e5000000-5eed-0000-0000-000000000002', // RECEIPT histórico
  reciboPasado2: 'e5000000-5eed-0000-0000-000000000003', // RECEIPT histórico (con IVA)
  // Usuario Maria
  listaActivaMaria: 'e5000000-5eed-0000-0000-000000000004', // TEMPLATE activa
  reciboMaria: 'e5000000-5eed-0000-0000-000000000005', // RECEIPT histórico
} as const;

// ─── Shopping items ───────────────────────────────────────────────────────────
export const ITEM_IDS = {
  // listaActiva (Juan)
  leche: 'f6000000-5eed-0000-0000-000000000001',
  pan: 'f6000000-5eed-0000-0000-000000000002',
  pollo: 'f6000000-5eed-0000-0000-000000000003',
  arroz: 'f6000000-5eed-0000-0000-000000000004',
  aceite: 'f6000000-5eed-0000-0000-000000000005',
  // reciboPasado1 (Juan)
  pasta: 'f6000000-5eed-0000-0000-000000000006',
  atun: 'f6000000-5eed-0000-0000-000000000007',
  mayonesa: 'f6000000-5eed-0000-0000-000000000008',
  // reciboPasado2 (Juan)
  carne: 'f6000000-5eed-0000-0000-000000000009',
  papa: 'f6000000-5eed-0000-0000-000000000010',
  tomate: 'f6000000-5eed-0000-0000-000000000011',
  // listaActivaMaria
  shampoo: 'f6000000-5eed-0000-0000-000000000012',
  jabon: 'f6000000-5eed-0000-0000-000000000013',
  // reciboMaria
  cafe: 'f6000000-5eed-0000-0000-000000000014',
  azucar: 'f6000000-5eed-0000-0000-000000000015',
  harina: 'f6000000-5eed-0000-0000-000000000016',
} as const;
