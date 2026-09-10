import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import ts from "typescript";

// Compile the domain exports without adding a second test runtime.
const dir = new URL("../.test-cache/", import.meta.url);
await mkdir(dir, { recursive: true });
for (const [source, target] of [
  ["data.ts", "data.mjs"],
  ["store.tsx", "store.mjs"],
]) {
  const text = (await readFile(new URL(`../src/lib/${source}`, import.meta.url), "utf8")).replace(
    'from "./data"',
    'from "./data.mjs"',
  );
  const compiled = ts.transpileModule(text, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  await writeFile(new URL(target, dir), compiled.outputText);
}
const { initialState, isState, conflicts, overlaps, reservedFor, stockProblems } = await import(
  new URL("store.mjs", dir)
);
const event = (changes = {}) => ({
  ...initialState.eventos[0],
  id: "test",
  date: "2026-06-18",
  montagem: "10:00",
  desmontagem: "14:00",
  deslocamento: "~30 min",
  status: "Confirmado",
  ...changes,
});

test("travel before assembly can create a conflict even when event times differ", () => {
  assert.equal(
    overlaps(event(), event({ id: "other", montagem: "14:20", desmontagem: "18:00" })),
    true,
  );
  assert.equal(
    overlaps(event(), event({ id: "other", montagem: "14:30", desmontagem: "18:00" })),
    false,
  );
});
test("overnight teardown blocks the next morning", () => {
  assert.equal(
    overlaps(
      event({ montagem: "20:00", desmontagem: "02:00" }),
      event({ date: "2026-06-19", montagem: "01:00", desmontagem: "05:00" }),
    ),
    true,
  );
});
test("canceled, completed and draft events do not block the operator", () => {
  assert.equal(
    conflicts(event(), [
      event({ id: "a", status: "Cancelado" }),
      event({ id: "b", status: "Realizado" }),
      event({ id: "c", status: "Orçamento" }),
    ]).length,
    0,
  );
});
test("physical stock counts duplicate quote lines and blocks excess reservations", () => {
  const item = initialState.estoque.find((i) => i.id === "itm-carrinho-doces");
  const line = { estoqueId: item.id, nome: item.nome, qtd: 1, preco: 450 };
  const other = event({ id: "other", itens: [line] });
  const proposal = event({ itens: [line, line] });
  assert.equal(stockProblems(proposal, { ...initialState, eventos: [other] })[0].id, item.id);
  assert.equal(
    stockProblems(proposal, {
      ...initialState,
      eventos: [other],
      estoque: [{ ...item, servico: true }],
    }).length,
    0,
  );
});
test("stock reserves the whole day, releases on cancellation and includes overnight teardown", () => {
  const itemId = "itm-carrinho-doces";
  const reserved = event({
    montagem: "20:00",
    desmontagem: "02:00",
    itens: [{ estoqueId: itemId, nome: "Carrinho", qtd: 2, preco: 450 }],
  });
  assert.equal(reservedFor(itemId, "2026-06-18", [reserved]), 2);
  assert.equal(reservedFor(itemId, "2026-06-19", [reserved]), 2);
  assert.equal(reservedFor(itemId, "2026-06-20", [reserved]), 0);
  assert.equal(reservedFor(itemId, "2026-06-18", [{ ...reserved, status: "Cancelado" }]), 0);
});
test("seed receivables reconcile with each contracted event without double counting deposits", () => {
  for (const e of initialState.eventos.filter((e) => e.status !== "Orçamento")) {
    const bills = initialState.contas.filter((c) => c.tipo === "receber" && c.eventoId === e.id);
    assert.equal(
      bills.reduce((s, c) => s + c.valor, 0),
      e.total,
    );
    assert.equal(
      bills.reduce((s, c) => s + c.pago, 0),
      e.pago,
    );
  }
});

test("backup validation accepts the complete state and rejects incomplete files", () => {
  assert.equal(isState(initialState), true);
  assert.equal(isState({ eventos: [], clientes: [] }), false);
  assert.equal(isState({ ...initialState, contas: [{ tipo: "unknown" }] }), false);
});
