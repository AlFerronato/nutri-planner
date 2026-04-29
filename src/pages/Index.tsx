import { useMemo, useState } from "react";

// ─── DATA ──────────────────────────────────────────────────────────────
type Food = { id: number; name: string; cal: number; prot: number; carb: number; fat: number };
type Group = { id: string; name: string; icon: string; tone: "gold" | "red" | "info" | "green" | "olive"; foods: Food[] };

const FOOD_GROUPS: Group[] = [
  {
    id: "cereals", name: "Cereais e Tubérculos", icon: "🌾", tone: "gold",
    foods: [
      { id: 1, name: "Arroz branco", cal: 130, prot: 2.7, carb: 28, fat: 0.3 },
      { id: 2, name: "Pão integral", cal: 247, prot: 9, carb: 41, fat: 3.4 },
      { id: 3, name: "Macarrão cozido", cal: 158, prot: 5.8, carb: 31, fat: 0.9 },
      { id: 4, name: "Batata cozida", cal: 77, prot: 2, carb: 17, fat: 0.1 },
      { id: 5, name: "Mandioca cozida", cal: 125, prot: 1, carb: 30, fat: 0.3 },
      { id: 6, name: "Aveia", cal: 389, prot: 17, carb: 66, fat: 7 },
    ],
  },
  {
    id: "proteins", name: "Proteínas", icon: "🥩", tone: "red",
    foods: [
      { id: 7, name: "Frango grelhado", cal: 165, prot: 31, carb: 0, fat: 3.6 },
      { id: 8, name: "Ovo cozido", cal: 155, prot: 13, carb: 1.1, fat: 11 },
      { id: 9, name: "Atum em água", cal: 116, prot: 26, carb: 0, fat: 1 },
      { id: 10, name: "Carne bovina magra", cal: 218, prot: 26, carb: 0, fat: 12 },
      { id: 11, name: "Tofu", cal: 76, prot: 8, carb: 1.9, fat: 4.8 },
      { id: 12, name: "Salmão", cal: 208, prot: 20, carb: 0, fat: 13 },
    ],
  },
  {
    id: "dairy", name: "Laticínios", icon: "🥛", tone: "info",
    foods: [
      { id: 13, name: "Leite integral", cal: 61, prot: 3.2, carb: 4.8, fat: 3.3 },
      { id: 14, name: "Iogurte natural", cal: 61, prot: 3.5, carb: 4.7, fat: 3.3 },
      { id: 15, name: "Queijo mussarela", cal: 280, prot: 22, carb: 2.2, fat: 22 },
      { id: 16, name: "Queijo cottage", cal: 98, prot: 11, carb: 3.4, fat: 4.3 },
      { id: 17, name: "Whey protein", cal: 370, prot: 75, carb: 8, fat: 5 },
    ],
  },
  {
    id: "veggies", name: "Frutas e Vegetais", icon: "🥗", tone: "green",
    foods: [
      { id: 18, name: "Banana", cal: 89, prot: 1.1, carb: 23, fat: 0.3 },
      { id: 19, name: "Maçã", cal: 52, prot: 0.3, carb: 14, fat: 0.2 },
      { id: 20, name: "Alface", cal: 15, prot: 1.4, carb: 2.9, fat: 0.2 },
      { id: 21, name: "Tomate", cal: 18, prot: 0.9, carb: 3.9, fat: 0.2 },
      { id: 22, name: "Brócolis", cal: 34, prot: 2.8, carb: 7, fat: 0.4 },
      { id: 23, name: "Laranja", cal: 47, prot: 0.9, carb: 12, fat: 0.1 },
    ],
  },
  {
    id: "fats", name: "Gorduras e Oleaginosas", icon: "🥑", tone: "olive",
    foods: [
      { id: 24, name: "Abacate", cal: 160, prot: 2, carb: 9, fat: 15 },
      { id: 25, name: "Azeite de oliva", cal: 884, prot: 0, carb: 0, fat: 100 },
      { id: 26, name: "Amendoim", cal: 567, prot: 26, carb: 16, fat: 49 },
      { id: 27, name: "Castanha-do-Pará", cal: 656, prot: 14, carb: 12, fat: 66 },
      { id: 28, name: "Amêndoas", cal: 579, prot: 21, carb: 22, fat: 50 },
    ],
  },
];

const MEALS_DEF = [
  { id: "breakfast", name: "Café da Manhã", icon: "☀️" },
  { id: "lunch", name: "Almoço", icon: "🌤️" },
  { id: "dinner", name: "Jantar", icon: "🌙" },
] as const;
type MealId = typeof MEALS_DEF[number]["id"];

const CARDIO = [
  { name: "Caminhada", icon: "🚶", calPerHour: 280 },
  { name: "Corrida leve", icon: "🏃", calPerHour: 600 },
  { name: "Ciclismo", icon: "🚴", calPerHour: 500 },
  { name: "Natação", icon: "🏊", calPerHour: 550 },
  { name: "Pular corda", icon: "🤸", calPerHour: 700 },
  { name: "Dança", icon: "💃", calPerHour: 350 },
];

// Tone → HSL var lookups (kept in design system)
const TONE: Record<Group["tone"], { color: string; bg: string; border: string }> = {
  gold:  { color: "hsl(var(--primary))",     bg: "hsl(36 65% 95%)",  border: "hsl(38 50% 78%)" },
  red:   { color: "hsl(var(--destructive))", bg: "hsl(11 60% 96%)",  border: "hsl(11 45% 82%)" },
  info:  { color: "hsl(var(--info))",        bg: "hsl(200 45% 95%)", border: "hsl(200 40% 82%)" },
  green: { color: "hsl(var(--success))",     bg: "hsl(140 30% 95%)", border: "hsl(140 30% 78%)" },
  olive: { color: "hsl(var(--olive))",       bg: "hsl(47 35% 94%)",  border: "hsl(47 35% 75%)" },
};

type MealItem = Food & { grams: number; uid: number };

function calc(food: Food, grams: number) {
  const f = grams / 100;
  return {
    cal: +(food.cal * f).toFixed(1),
    prot: +(food.prot * f).toFixed(1),
    carb: +(food.carb * f).toFixed(1),
    fat: +(food.fat * f).toFixed(1),
  };
}

// ─── COMPONENT ─────────────────────────────────────────────────────────
const Index = () => {
  const [meals, setMeals] = useState<Record<MealId, MealItem[]>>({ breakfast: [], lunch: [], dinner: [] });
  const [goal, setGoal] = useState(2000);
  const [modal, setModal] = useState<{ food: Food; group: Group } | null>(null);
  const [grams, setGrams] = useState(100);
  const [modalMeal, setModalMeal] = useState<MealId>("breakfast");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({ cereals: true });
  const [expandedMeals, setExpandedMeals] = useState<Record<MealId, boolean>>({ breakfast: true, lunch: true, dinner: true });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totals = useMemo(() => {
    const all = [...meals.breakfast, ...meals.lunch, ...meals.dinner];
    return all.reduce(
      (a, i) => ({
        cal: +(a.cal + i.cal).toFixed(1),
        prot: +(a.prot + i.prot).toFixed(1),
        carb: +(a.carb + i.carb).toFixed(1),
        fat: +(a.fat + i.fat).toFixed(1),
      }),
      { cal: 0, prot: 0, carb: 0, fat: 0 }
    );
  }, [meals]);

  const surplus = +(totals.cal - goal).toFixed(1);
  const pct = Math.min((totals.cal / Math.max(goal, 1)) * 100, 100);

  const mealTotals = (id: MealId) =>
    meals[id].reduce(
      (a, i) => ({
        cal: +(a.cal + i.cal).toFixed(1),
        prot: +(a.prot + i.prot).toFixed(1),
        carb: +(a.carb + i.carb).toFixed(1),
        fat: +(a.fat + i.fat).toFixed(1),
      }),
      { cal: 0, prot: 0, carb: 0, fat: 0 }
    );

  function openModal(food: Food, group: Group, defaultMeal: MealId = "breakfast") {
    setModal({ food, group });
    setGrams(100);
    setModalMeal(defaultMeal);
  }

  function confirmAdd() {
    if (!modal) return;
    const macros = calc(modal.food, grams);
    setMeals((prev) => ({
      ...prev,
      [modalMeal]: [...prev[modalMeal], { ...modal.food, grams, ...macros, uid: Date.now() + Math.random() }],
    }));
    setModal(null);
  }

  function removeFood(mealId: MealId, uid: number) {
    setMeals((prev) => ({ ...prev, [mealId]: prev[mealId].filter((i) => i.uid !== uid) }));
  }

  const preview = modal ? calc(modal.food, grams || 0) : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header
        className="sticky top-0 z-30 px-5 py-4 text-accent shadow-[0_4px_20px_hsl(30_30%_13%/0.2)]"
        style={{ background: "var(--gradient-header)" }}
      >
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-[clamp(1.2rem,3vw,1.8rem)] tracking-wide" style={{ color: "hsl(var(--accent))" }}>
              🥗 NutriPlanner
            </h1>
            <p className="font-body text-xs font-light" style={{ color: "hsl(var(--primary))" }}>
              Monte seu cardápio com equilíbrio
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2">
            <label htmlFor="goal" className="font-body text-xs" style={{ color: "hsl(var(--primary))" }}>
              Meta diária:
            </label>
            <input
              id="goal"
              type="number"
              min={500}
              max={9999}
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value) || 0)}
              className="w-[90px] border-0 border-b bg-transparent text-center font-display text-base text-white outline-none"
              style={{ borderBottomColor: "hsl(var(--primary))" }}
            />
            <span className="font-body text-xs" style={{ color: "hsl(var(--primary))" }}>kcal</span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1200px] items-start gap-6 px-4 py-5 lg:gap-6">
        {/* LEFT COLUMN */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {/* SUMMARY */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <h2 className="mb-4 font-display text-base text-secondary">Resumo do Dia</h2>
            <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {[
                { label: "Calorias", val: totals.cal, unit: "kcal", color: "hsl(var(--primary))" },
                { label: "Proteínas", val: totals.prot, unit: "g", color: "hsl(var(--destructive))" },
                { label: "Carboidratos", val: totals.carb, unit: "g", color: "hsl(var(--success))" },
                { label: "Gorduras", val: totals.fat, unit: "g", color: "hsl(var(--olive))" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-[10px] bg-muted/60 px-1.5 py-2.5 text-center"
                  style={{ border: `1px solid ${m.color.replace(")", " / 0.25)")}` }}
                >
                  <div className="font-display text-[clamp(1rem,2.5vw,1.4rem)] font-bold" style={{ color: m.color }}>
                    {m.val}
                  </div>
                  <div className="font-body text-[0.65rem] text-muted-foreground">{m.unit}</div>
                  <div className="font-body text-[0.65rem]" style={{ color: "hsl(var(--muted-foreground) / 0.7)" }}>
                    {m.label}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="mb-1 flex justify-between font-body text-xs">
                <span className="text-muted-foreground">Progresso calórico</span>
                <span
                  className="font-bold"
                  style={{ color: surplus > 0 ? "hsl(var(--destructive))" : "hsl(var(--success))" }}
                >
                  {surplus > 0
                    ? `+${surplus.toFixed(0)} kcal excedidas`
                    : `${Math.abs(surplus).toFixed(0)} kcal restantes`}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-lg" style={{ background: "hsl(38 30% 92%)" }}>
                <div
                  className="progress-fill h-full rounded-lg"
                  style={{
                    width: `${pct}%`,
                    background: surplus > 0 ? "var(--gradient-progress-over)" : "var(--gradient-progress-ok)",
                  }}
                />
              </div>
              <div className="mt-1 flex justify-between font-body text-[0.7rem]" style={{ color: "hsl(36 20% 70%)" }}>
                <span>0</span>
                <span>{goal} kcal</span>
              </div>
            </div>
          </section>

          {/* MEALS */}
          {MEALS_DEF.map((meal) => {
            const mt = mealTotals(meal.id);
            const open = expandedMeals[meal.id];
            return (
              <section key={meal.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
                <button
                  onClick={() => setExpandedMeals((p) => ({ ...p, [meal.id]: !p[meal.id] }))}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[1.3rem]">{meal.icon}</span>
                    <div>
                      <h3 className="font-display text-base text-foreground">{meal.name}</h3>
                      <span className="font-body text-[0.72rem] text-muted-foreground">
                        {meals[meal.id].length} item(s) · {mt.cal} kcal
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="hidden gap-1.5 sm:flex">
                      {[
                        { l: "P", v: mt.prot, c: "hsl(var(--destructive))" },
                        { l: "C", v: mt.carb, c: "hsl(var(--success))" },
                        { l: "G", v: mt.fat, c: "hsl(var(--olive))" },
                      ].map((x) => (
                        <span
                          key={x.l}
                          className="rounded font-body text-[0.65rem]"
                          style={{ background: `${x.c.replace(")", " / 0.12)")}`, color: x.c, padding: "2px 6px" }}
                        >
                          {x.l}: {x.v}g
                        </span>
                      ))}
                    </div>
                    <span
                      className="text-sm transition-transform"
                      style={{ color: "hsl(var(--primary))", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                    >
                      ▼
                    </span>
                  </div>
                </button>

                {open && (
                  <div className="px-5 pb-4">
                    {meals[meal.id].length === 0 ? (
                      <p className="py-2.5 font-body text-[0.82rem] italic" style={{ color: "hsl(36 20% 75%)" }}>
                        Nenhum alimento adicionado. {window.innerWidth >= 900 ? "Selecione ao lado →" : "Toque no botão 🥦"}
                      </p>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        {meals[meal.id].map((item) => (
                          <div
                            key={item.uid}
                            className="meal-item flex items-center justify-between gap-2 rounded-[10px] bg-muted/60 px-3 py-2"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="font-body text-sm font-bold text-foreground">{item.name}</span>
                              <span className="ml-1.5 font-body text-[0.72rem] text-muted-foreground">{item.grams}g</span>
                            </div>
                            <div className="flex flex-shrink-0 flex-wrap justify-end gap-1.5">
                              <span
                                className="rounded font-body text-[0.7rem]"
                                style={{ color: "hsl(var(--primary))", background: "hsl(36 65% 95%)", padding: "2px 6px" }}
                              >
                                {item.cal} kcal
                              </span>
                              <span
                                className="rounded font-body text-[0.7rem]"
                                style={{ color: "hsl(var(--destructive))", background: "hsl(11 60% 96%)", padding: "2px 6px" }}
                              >
                                P {item.prot}g
                              </span>
                            </div>
                            <button
                              onClick={() => removeFood(meal.id, item.uid)}
                              className="remove-btn flex-shrink-0 border-0 bg-transparent px-1 text-base"
                              style={{ color: "hsl(0 70% 65%)" }}
                              aria-label="Remover"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })}

          {/* CARDIO ALERT */}
          {surplus > 0 && (
            <section
              className="rounded-2xl border p-5"
              style={{
                background: "var(--gradient-cardio)",
                borderColor: "hsl(11 45% 82%)",
                boxShadow: "0 2px 16px hsl(11 53% 49% / 0.1)",
              }}
            >
              <div className="mb-3.5 flex items-center gap-2">
                <span className="text-[1.4rem]">🔥</span>
                <div>
                  <h3 className="font-display text-base" style={{ color: "hsl(var(--destructive))" }}>
                    Você excedeu {surplus.toFixed(0)} kcal!
                  </h3>
                  <p className="font-body text-xs text-muted-foreground">
                    Veja quanto cardio seria necessário para compensar:
                  </p>
                </div>
              </div>
              <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))" }}>
                {CARDIO.map((c, i) => {
                  const minutes = Math.ceil((surplus / c.calPerHour) * 60);
                  return (
                    <div
                      key={c.name}
                      className="animate-slide-up rounded-xl border bg-card p-3 text-center"
                      style={{ animationDelay: `${i * 0.07}s`, borderColor: "hsl(11 30% 87%)" }}
                    >
                      <div className="mb-1 text-[1.6rem]">{c.icon}</div>
                      <div className="font-body text-[0.8rem] font-bold text-foreground">{c.name}</div>
                      <div
                        className="my-1 font-display text-lg font-bold"
                        style={{ color: "hsl(var(--destructive))" }}
                      >
                        {minutes} min
                      </div>
                      <div className="font-body text-[0.65rem] text-muted-foreground">{c.calPerHour} kcal/h</div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT FOOD PANEL — desktop */}
        <aside className="sticky top-[88px] hidden w-[320px] flex-shrink-0 flex-col gap-3 lg:flex" style={{ maxHeight: "calc(100vh - 110px)", overflowY: "auto" }}>
          <h2
            className="border-b-2 px-1 pb-1.5 font-display text-base text-secondary"
            style={{ borderBottomColor: "hsl(var(--accent))" }}
          >
            Alimentos disponíveis
          </h2>
          <FoodPanel
            expanded={expandedGroups}
            toggle={(id) => setExpandedGroups((p) => ({ ...p, [id]: !p[id] }))}
            onPick={(food, group) => openModal(food, group)}
          />
        </aside>
      </main>

      {/* FAB mobile */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex h-[58px] w-[58px] items-center justify-center rounded-full text-2xl text-white shadow-[var(--shadow-fab)] lg:hidden"
        style={{ background: "var(--gradient-cta)" }}
        aria-label="Abrir alimentos"
      >
        🥦
      </button>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setDrawerOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-card p-5 lg:hidden">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg text-secondary">Alimentos</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="border-0 bg-transparent text-lg text-muted-foreground"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>
            <FoodPanel
              expanded={expandedGroups}
              toggle={(id) => setExpandedGroups((p) => ({ ...p, [id]: !p[id] }))}
              onPick={(food, group) => {
                setDrawerOpen(false);
                openModal(food, group);
              }}
            />
          </div>
        </>
      )}

      {/* Modal */}
      {modal && preview && (
        <div
          className="animate-fade-in fixed inset-0 z-[100] flex items-center justify-center p-5"
          style={{ background: "hsl(30 30% 13% / 0.55)" }}
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div className="w-full max-w-[400px] rounded-[20px] bg-card p-7 shadow-[0_20px_60px_hsl(30_30%_13%/0.25)]">
            <h3 className="mb-1 font-display text-xl text-foreground">{modal.food.name}</h3>
            <p className="mb-4 font-body text-xs text-muted-foreground">
              Por 100g: {modal.food.cal} kcal · P {modal.food.prot}g · C {modal.food.carb}g · G {modal.food.fat}g
            </p>

            <label className="mb-1.5 block font-body text-[0.82rem] font-bold text-secondary">
              Quantidade (gramas)
            </label>
            <input
              type="number"
              min={1}
              max={9999}
              value={grams}
              onChange={(e) => setGrams(Math.max(0, Number(e.target.value) || 0))}
              className="w-full rounded-[10px] border-2 px-3.5 py-2.5 font-display text-base text-foreground outline-none focus:border-primary"
              style={{ borderColor: "hsl(var(--accent))" }}
            />

            <div className="my-3 grid grid-cols-4 gap-2">
              {[
                { l: "kcal", v: preview.cal, c: "hsl(var(--primary))", bg: "hsl(36 65% 95%)" },
                { l: "Prot", v: `${preview.prot}g`, c: "hsl(var(--destructive))", bg: "hsl(11 60% 96%)" },
                { l: "Carb", v: `${preview.carb}g`, c: "hsl(var(--success))", bg: "hsl(140 30% 95%)" },
                { l: "Gord", v: `${preview.fat}g`, c: "hsl(var(--olive))", bg: "hsl(47 35% 94%)" },
              ].map((x) => (
                <div key={x.l} className="rounded-[10px] p-2 text-center" style={{ background: x.bg }}>
                  <div className="font-display text-sm font-bold" style={{ color: x.c }}>{x.v}</div>
                  <div className="font-body text-[0.65rem] text-muted-foreground">{x.l}</div>
                </div>
              ))}
            </div>

            <span className="mb-2 block font-body text-[0.82rem] font-bold text-secondary">Adicionar em:</span>
            <div className="mb-4 grid grid-cols-3 gap-2">
              {MEALS_DEF.map((m) => {
                const active = modalMeal === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setModalMeal(m.id)}
                    className="rounded-[10px] border-2 px-1.5 py-2.5 font-body text-[0.78rem] text-foreground transition-colors"
                    style={{
                      borderColor: active ? "hsl(var(--primary))" : "hsl(var(--accent))",
                      background: active ? "hsl(var(--primary) / 0.12)" : "hsl(var(--muted) / 0.6)",
                    }}
                  >
                    {m.icon} {m.name}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setModal(null)}
                className="flex-1 rounded-xl border bg-muted/60 py-3 font-body text-sm text-muted-foreground"
                style={{ borderColor: "hsl(var(--accent))" }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmAdd}
                className="flex-[2] rounded-xl border-0 py-3 font-body text-sm font-bold text-white shadow-[0_4px_14px_hsl(33_25%_22%/0.3)] transition-opacity hover:opacity-90"
                style={{ background: "var(--gradient-cta)" }}
              >
                ✓ Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Subcomponent: Food Panel ─────────────────────────────────────────
function FoodPanel({
  expanded,
  toggle,
  onPick,
}: {
  expanded: Record<string, boolean>;
  toggle: (id: string) => void;
  onPick: (food: Food, group: Group) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {FOOD_GROUPS.map((group) => {
        const t = TONE[group.tone];
        const open = !!expanded[group.id];
        return (
          <div
            key={group.id}
            className="overflow-hidden rounded-2xl border"
            style={{ background: t.bg, borderColor: t.border }}
          >
            <button
              onClick={() => toggle(group.id)}
              className="flex w-full items-center justify-between border-0 bg-transparent px-3.5 py-3 text-left"
            >
              <span className="font-body text-[0.88rem] font-bold" style={{ color: t.color }}>
                {group.icon} {group.name}
              </span>
              <span
                className="text-xs transition-transform"
                style={{ color: t.color, transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                ▼
              </span>
            </button>
            {open && (
              <div className="flex flex-col gap-1.5 px-2.5 pb-3">
                {group.foods.map((food) => (
                  <div
                    key={food.id}
                    className="food-card-hover flex items-center justify-between gap-2 rounded-[10px] bg-card px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-body text-[0.82rem] font-bold text-foreground">{food.name}</div>
                      <div className="font-body text-[0.68rem] text-muted-foreground">
                        {food.cal} kcal · P {food.prot}g · C {food.carb}g · G {food.fat}g
                      </div>
                    </div>
                    <button
                      onClick={() => onPick(food, group)}
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border-0 text-lg text-white transition-transform hover:scale-110"
                      style={{ background: t.color }}
                      aria-label={`Adicionar ${food.name}`}
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Index;
