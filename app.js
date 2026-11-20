(() => {
  const C = window.POUSADA;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const brl = (n) => "R$ " + Math.round(n).toLocaleString("pt-BR");
  const wa = (msg) => `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(msg)}`;
  const MESES = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  const MES3 = MESES.map((m) => m.slice(0, 3));

  // =================================================================
  //  FOTOS (por unidade e cômodo)
  // =================================================================
  const FOTOS = {
    cobertura: {
      "Terraço e vista": ["b19", "b01", "b02", "b04", "b15"],
      "Quartos": ["b06", "b07", "b03", "b11", "b14"],
      "Sala": ["b12", "b13", "b17", "b18"],
      "Cozinha": ["b05", "b20", "b10", "b16"],
      "Banheiros": ["b08", "b09"],
    },
    apartamento: {
      "Sala": ["a03", "a09"],
      "Quartos": ["a10", "a11", "a04", "a05"],
      "Cozinha": ["a01", "a02"],
      "Banheiros": ["a07", "a08", "a13"],
      "Circulação": ["a06", "a12"],
    },
  };
  const DESTAQUE = {
    cobertura: ["b19", "b02", "b06", "b12", "b05", "b07", "b04"],
    apartamento: ["a03", "a10", "a09", "a04", "a11", "a01", "a07"],
  };
  const TEXTO = {
    cobertura: {
      tag: "Mais pedida",
      desc: "No topo do prédio, com terraço privativo, rede e vista para o mar e para a cidade. Dois quartos com ar-condicionado, sala com sofá-cama e cozinha equipada.",
      chips: [["group", "até 5"], ["bed", "2 quartos"], ["deck", "terraço privativo"], ["water", "vista mar"], ["ac_unit", "ar-cond."]],
    },
    apartamento: {
      tag: "Ideal p/ famílias",
      desc: "Amplo e iluminado: quarto de casal, quarto com duas camas de solteiro, sala com sofá-cama e Smart TV e cozinha completa para os dias de praia.",
      chips: [["group", "até 5"], ["king_bed", "1 casal"], ["single_bed", "2 solteiro"], ["weekend", "sofá-cama"], ["tv", "Smart TV"]],
    },
  };
  const flat = (u) => Object.entries(FOTOS[u]).flatMap(([cat, fs]) => fs.map((f) => ({ src: `img/${f}.jpg`, id: f, cap: cat })));
  const total = (u) => flat(u).length;

  // =================================================================
  //  PREÇOS
  // =================================================================
  const pad = (n) => String(n).padStart(2, "0");
  const key = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d, 12); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const nightsBetween = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
  const inSeason = (md, [s, e]) => (s <= e ? md >= s && md <= e : md >= s || md <= e);

  function rate(u, k) {
    const U = C.unidades[u], md = k.slice(5);
    const t = (U.temporadas || []).find((t) => inSeason(md, t));
    return t ? { price: t[2], min: t[3] || U.minNoites, high: true } : { price: U.diaria, min: U.minNoites, high: false };
  }
  const fromPrice = (u) => Math.min(C.unidades[u].diaria, ...(C.unidades[u].temporadas || []).map((t) => t[2]));
  const isBlocked = (u, k) => (C.unidades[u].ocupado || []).some(([a, b]) => k >= a && k < b);

  function quote(u, ci, co) {
    const lines = {}; let sum = 0;
    for (let d = parse(ci); key(d) < co; d = addDays(d, 1)) {
      const p = rate(u, key(d)).price; sum += p; lines[p] = (lines[p] || 0) + 1;
    }
    const limpeza = C.unidades[u].limpeza || 0;
    return { lines: Object.entries(lines).sort((a, b) => b[0] - a[0]), sum, limpeza, total: sum + limpeza, n: nightsBetween(ci, co) };
  }

  // =================================================================
  //  ESTADO
  // =================================================================
  const S = { unit: "cobertura", ci: null, co: null, hover: null, g: { ad: 2, cr: 0, bb: 0 }, view: null };
  const todayK = key(new Date());

  // =================================================================
  //  DADOS GLOBAIS
  // =================================================================
  $$("[data-nome]").forEach((e) => (e.textContent = C.nome));
  $$("[data-cidade]").forEach((e) => (e.textContent = C.cidade));
  $$("[data-wa]").forEach((a) => (a.href = wa(a.dataset.wa)));
  $$("[data-ig]").forEach((a) => (a.href = C.instagram));
  $$("[data-endereco]").forEach((e) => (e.textContent = C.endereco));
  $$("[data-praia]").forEach((e) => (e.textContent = C.distanciaPraia));
  $$("[data-checkin]").forEach((e) => (e.textContent = C.checkin));
  $$("[data-checkout]").forEach((e) => (e.textContent = C.checkout));
  $$("[data-fone]").forEach((e) => (e.textContent = C.whatsapp.replace(/^55(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3")));
  $$("[data-route]").forEach((a) => (a.href = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(C.endereco)));
  $$("[data-taxa]").forEach((e) => (e.textContent = Math.round(C.taxaPlataforma * 100)));
  $$("[data-from]").forEach((e) => (e.textContent = brl(fromPrice(e.dataset.from))));
  $("#yr").textContent = new Date().getFullYear();
  if (C.mapsEmbed) $("#mapBox").innerHTML = `<iframe src="${C.mapsEmbed}" class="w-full h-full border-0" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
  if (C.avaliacao?.nota) {
    const n = C.avaliacao.nota.toLocaleString("pt-BR", { minimumFractionDigits: 1 });
    $$("[data-rating-text]").forEach((e) => (e.textContent = `${n} · ${C.avaliacao.total} avaliações`));
    $$("[data-rating-nota]").forEach((e) => (e.textContent = n));
    $$("[data-rating-total]").forEach((e) => (e.textContent = `${C.avaliacao.total} avaliações no ${C.avaliacao.fonte}`));
  } else $$("[data-rating-badge],[data-rating-block]").forEach((e) => e.remove());

  // toast
  let tt; const toast = (m) => { const t = $("#toast"); t.textContent = m; t.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), 2600); };

  // header + barra mobile
  const hdr = $("#hdr"), mbar = $("#mbar");
  const onScroll = () => {
    hdr.classList.toggle("scrolled", scrollY > 40);
    mbar.style.transform = scrollY > innerHeight * 0.7 ? "translateY(0)" : "";
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // =================================================================
  //  CARDS DAS UNIDADES
  // =================================================================
  $("#units").innerHTML = Object.keys(FOTOS).map((u) => {
    const U = C.unidades[u], T = TEXTO[u], imgs = DESTAQUE[u];
    return `
    <article class="unit reveal" data-unit="${u}">
      <div class="car">
        <div class="car-track">${imgs.map((f, i) => `<img src="img/${f}.jpg" alt="${U.nome} — foto ${i + 1}" loading="${i ? "lazy" : "eager"}" data-view="${u}" data-id="${f}"/>`).join("")}</div>
        <span class="car-tag">${T.tag}</span>
        <button class="car-btn left-3 ms" data-car="-1" aria-label="Anterior">chevron_left</button>
        <button class="car-btn right-3 ms" data-car="1" aria-label="Próxima">chevron_right</button>
        <div class="car-dots">${imgs.map((_, i) => `<i class="${i ? "" : "on"}"></i>`).join("")}</div>
        <button class="car-all" data-gallery="${u}"><span class="ms text-base">grid_view</span>${total(u)} fotos</button>
      </div>
      <div class="p-6 md:p-8 flex flex-col gap-5 flex-1">
        <div>
          <h3 class="font-serif text-3xl text-primary">${U.nome}</h3>
          <p class="text-muted mt-2 leading-relaxed">${T.desc}</p>
        </div>
        <div class="flex flex-wrap gap-2">${T.chips.map(([i, t]) => `<span class="chip"><span class="ms">${i}</span>${t}</span>`).join("")}</div>
        <div class="mt-auto pt-5 border-t border-black/5 flex flex-wrap items-center justify-between gap-4">
          <div><p class="text-xs text-muted">a partir de</p><p class="text-2xl font-extrabold text-primary">${brl(fromPrice(u))}<span class="text-sm font-medium text-muted"> /noite</span></p></div>
          <div class="flex gap-2 w-full sm:w-auto">
            <button data-gallery="${u}" class="px-5 py-3 rounded-full border border-black/15 font-semibold text-sm hover:bg-black/5">Fotos</button>
            <button data-book-unit="${u}" class="btn-accent flex-1 sm:flex-none !py-3 !text-sm">Ver datas e preço</button>
          </div>
        </div>
      </div>
    </article>`;
  }).join("");

  // carrossel
  $$(".car").forEach((car) => {
    const tr = $(".car-track", car), dots = $$(".car-dots i", car), [prev, next] = $$("[data-car]", car);
    const idx = () => Math.round(tr.scrollLeft / tr.clientWidth);
    const upd = () => { const i = idx(); dots.forEach((d, j) => d.classList.toggle("on", i === j)); prev.disabled = i === 0; next.disabled = i === dots.length - 1; };
    tr.addEventListener("scroll", () => requestAnimationFrame(upd), { passive: true });
    $$("[data-car]", car).forEach((b) => (b.onclick = (e) => { e.stopPropagation(); tr.scrollTo({ left: (idx() + +b.dataset.car) * tr.clientWidth }); }));
    upd();
  });

  // thumbs extras: nada — a galeria cobre

  // =================================================================
  //  MODAIS (pilha)
  // =================================================================
  const stack = [];
  function openModal(id) { const m = $("#" + id); m.classList.add("open"); m.setAttribute("aria-hidden", "false"); stack.push(id); document.body.classList.add("lock"); }
  function closeModal(id = stack[stack.length - 1]) {
    if (!id) return; const m = $("#" + id); m.classList.remove("open"); m.setAttribute("aria-hidden", "true");
    stack.splice(stack.indexOf(id), 1); if (!stack.length) document.body.classList.remove("lock");
  }
  $$("[data-close]").forEach((b) => b.addEventListener("click", () => closeModal(b.closest(".modal").id)));
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
    if (stack[stack.length - 1] === "viewer") { if (e.key === "ArrowRight") vGo(1); if (e.key === "ArrowLeft") vGo(-1); }
  });

  // =================================================================
  //  GALERIA
  // =================================================================
  let galUnit = "cobertura";
  function openGallery(u, cat) {
    galUnit = u;
    $("#galTitle").textContent = `${C.unidades[u].nome} · ${total(u)} fotos`;
    const cats = Object.keys(FOTOS[u]);
    $("#galCats").innerHTML = cats.map((c, i) => `<button data-cat="${i}" class="${i ? "" : "on"}">${c}</button>`).join("");
    $("#galGrid").innerHTML = cats.map((c, i) => `
      <section class="gal-sec" id="gs${i}"><h4>${c}</h4>
        <div class="gal-grid">${FOTOS[u][c].map((f) => `<button data-view="${u}" data-id="${f}"><img src="img/${f}.jpg" loading="lazy" alt="${c}"/></button>`).join("")}</div>
      </section>`).join("");
    $$("#galCats button").forEach((b) => (b.onclick = () => {
      $$("#galCats button").forEach((x) => x.classList.toggle("on", x === b));
      $("#gs" + b.dataset.cat).scrollIntoView({ behavior: "smooth" });
    }));
    $(".gal-panel").scrollTop = 0;
    openModal("gal");
  }
  $(".gal-panel").addEventListener("scroll", () => {
    const secs = $$(".gal-sec"); let cur = 0;
    secs.forEach((s, i) => { if (s.getBoundingClientRect().top < 140) cur = i; });
    $$("#galCats button").forEach((b, i) => b.classList.toggle("on", i === cur));
  }, { passive: true });
  $("[data-gal-book]").onclick = () => { closeModal("gal"); openBook({ unit: galUnit }); };

  // =================================================================
  //  VIEWER (tela cheia)
  // =================================================================
  let V = { list: [], i: 0 };
  function openViewer(u, id) {
    V.list = flat(u); V.i = Math.max(0, V.list.findIndex((p) => p.id === id));
    $("#vThumbs").innerHTML = V.list.map((p, i) => `<button data-vi="${i}"><img src="${p.src}" loading="lazy" alt=""/></button>`).join("");
    $$("#vThumbs button").forEach((b) => (b.onclick = () => vShow(+b.dataset.vi)));
    vShow(V.i); openModal("viewer");
  }
  function vShow(i) {
    V.i = (i + V.list.length) % V.list.length;
    const p = V.list[V.i], img = $("#vImg");
    img.style.opacity = 0;
    const pre = new Image(); pre.onload = pre.onerror = () => { img.src = p.src; img.style.opacity = 1; }; pre.src = p.src;
    [1, -1].forEach((d) => (new Image().src = V.list[(V.i + d + V.list.length) % V.list.length].src));
    $("#vCount").textContent = `${V.i + 1} / ${V.list.length}`;
    $("#vCap").textContent = p.cap;
    $$("#vThumbs button").forEach((b, j) => b.classList.toggle("on", j === V.i));
    $$("#vThumbs button")[V.i]?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }
  const vGo = (d) => vShow(V.i + d);
  $("#vPrev").onclick = () => vGo(-1); $("#vNext").onclick = () => vGo(1);
  // swipe
  (() => {
    const st = $("#vStage"), img = $("#vImg"); let x0 = null, dx = 0;
    st.addEventListener("pointerdown", (e) => { x0 = e.clientX; dx = 0; img.style.transition = "none"; });
    st.addEventListener("pointermove", (e) => { if (x0 === null) return; dx = e.clientX - x0; img.style.transform = `translateX(${dx}px)`; });
    const end = () => {
      if (x0 === null) return; img.style.transition = ""; img.style.transform = "";
      if (Math.abs(dx) > 50) vGo(dx < 0 ? 1 : -1); else if (Math.abs(dx) < 5) { /* tap */ }
      x0 = null;
    };
    st.addEventListener("pointerup", end); st.addEventListener("pointercancel", end); st.addEventListener("pointerleave", end);
  })();

  // =================================================================
  //  RESERVA: painel, calendário, hóspedes, resumo
  // =================================================================
  function openBook({ unit, focus } = {}) {
    if (unit) S.unit = unit;
    clampGuests();
    if (!S.view) { const b = S.ci ? parse(S.ci) : new Date(); S.view = new Date(b.getFullYear(), b.getMonth(), 1); }
    if (focus === "ci") { S.ci = null; S.co = null; }
    if (focus === "co" && S.ci) S.co = null;
    renderBook(); openModal("book");
  }

  function renderTabs() {
    $("#unitTabs").innerHTML = Object.keys(FOTOS).map((u) => `
      <button class="unit-tab ${S.unit === u ? "on" : ""}" data-tab="${u}">
        <img src="img/${DESTAQUE[u][0]}.jpg" alt=""/><span><b>${C.unidades[u].curto}</b><small>a partir de ${brl(fromPrice(u))}</small></span>
      </button>`).join("");
    $$("[data-tab]").forEach((b) => (b.onclick = () => {
      S.unit = b.dataset.tab;
      if (S.ci && S.co && !validRange(S.ci, S.co)) { S.co = null; toast("Ajustamos o check-out: o mínimo de noites mudou."); }
      clampGuests(); renderBook();
    }));
  }

  function validRange(ci, co) {
    const n = nightsBetween(ci, co); if (n < rate(S.unit, ci).min) return false;
    for (let d = parse(ci); key(d) < co; d = addDays(d, 1)) if (isBlocked(S.unit, key(d))) return false;
    return true;
  }

  function renderCal() {
    const v = S.view, now = new Date(), firstMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const months = [0, 1].map((o) => new Date(v.getFullYear(), v.getMonth() + o, 1));
    const end = S.co || (S.ci && S.hover && S.hover > S.ci ? S.hover : null);
    const minN = S.ci ? rate(S.unit, S.ci).min : 0;
    const html = months.map((m) => {
      const y = m.getFullYear(), mo = m.getMonth(), days = new Date(y, mo + 1, 0).getDate(), off = m.getDay();
      let cells = "DSTQQSS".split("").map((d) => `<div class="cal-dow">${d}</div>`).join("") + "<div></div>".repeat(off);
      for (let d = 1; d <= days; d++) {
        const k = `${y}-${pad(mo + 1)}-${pad(d)}`, r = rate(S.unit, k);
        const past = k < todayK, blocked = isBlocked(S.unit, k);
        let cls = "cal-d";
        if (past || (blocked && !(S.ci && !S.co && k > S.ci))) cls += " off";
        if (k === todayK) cls += " today";
        if (r.high) cls += " high";
        if (S.ci && !S.co && k > S.ci && nightsBetween(S.ci, k) < minN) cls += " nomin";
        if (k === S.ci) cls += " start" + (end ? " has-end" : "");
        if (end && k === end) cls += " end";
        if (S.ci && end && k > S.ci && k < end) cls += " in";
        cells += `<button class="${cls}" data-k="${k}" ${past ? "disabled" : ""}>${d}<small>${past ? "" : r.price}</small></button>`;
      }
      return `<div class="cal-m"><h4>${MESES[mo]} ${y}</h4><div class="cal-grid">${cells}</div></div>`;
    }).join("");
    $("#cal").innerHTML = `
      <div class="cal-head"><button data-nav="-1" class="ms" ${v <= firstMonth ? "disabled" : ""} aria-label="Mês anterior">chevron_left</button><button data-nav="1" class="ms" aria-label="Próximo mês">chevron_right</button></div>
      <div class="cal-months">${html}</div>
      <div class="cal-legend"><span><i style="background:#6c5b4d"></i>diária em R$</span><span><i style="background:#c86446"></i>alta temporada</span></div>`;
    $$("[data-nav]").forEach((b) => (b.onclick = () => {
      const step = matchMedia("(max-width:640px)").matches ? 1 : 1;
      S.view = new Date(v.getFullYear(), v.getMonth() + +b.dataset.nav * step, 1); renderCal();
    }));
    $$(".cal-d:not([disabled])").forEach((b) => {
      b.onclick = () => pickDay(b.dataset.k);
      b.onmouseenter = () => { if (S.ci && !S.co) { S.hover = b.dataset.k; paintHover(); } };
    });
  }
  // hover leve (sem re-render)
  function paintHover() {
    $$(".cal-d").forEach((b) => {
      const k = b.dataset.k, e = S.hover > S.ci ? S.hover : null;
      b.classList.toggle("in", !!e && k > S.ci && k < e);
      b.classList.toggle("end", !!e && k === e);
      if (k === S.ci) b.classList.toggle("has-end", !!e);
    });
  }

  function pickDay(k) {
    if (!S.ci || S.co || k <= S.ci) {
      if (isBlocked(S.unit, k)) return toast("Data indisponível.");
      S.ci = k; S.co = null; S.hover = null;
    } else {
      const min = rate(S.unit, S.ci).min, n = nightsBetween(S.ci, k);
      if (n < min) return toast(`Nesse período o mínimo é de ${min} noites.`);
      if (!validRange(S.ci, k)) return toast("Há datas indisponíveis nesse intervalo.");
      S.co = k;
    }
    renderBook();
  }

  const fmtShort = (k) => { const d = parse(k); return `${d.getDate()} ${MES3[d.getMonth()]}`; };
  const fmtLong = (k) => { const d = parse(k); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; };
  const guestsTxt = () => {
    const { ad, cr, bb } = S.g; let t = `${ad} adulto${ad > 1 ? "s" : ""}`;
    if (cr) t += `, ${cr} criança${cr > 1 ? "s" : ""}`; if (bb) t += `, ${bb} bebê${bb > 1 ? "s" : ""}`; return t;
  };

  function clampGuests() {
    const max = C.unidades[S.unit].hospedes;
    while (S.g.ad + S.g.cr > max) S.g.cr > 0 ? S.g.cr-- : S.g.ad--;
  }
  function renderGuests() {
    const max = C.unidades[S.unit].hospedes, tot = S.g.ad + S.g.cr;
    $$("[data-gv]").forEach((e) => (e.textContent = S.g[e.dataset.gv]));
    $$("[data-g]").forEach((b) => {
      const g = b.dataset.g, d = +b.dataset.d;
      b.disabled = d < 0 ? S.g[g] <= (g === "ad" ? 1 : 0) : g === "bb" ? S.g.bb >= 2 : tot >= max;
    });
  }
  $$("[data-g]").forEach((b) => (b.onclick = () => { S.g[b.dataset.g] += +b.dataset.d; renderGuests(); renderSummary(); syncBar(); }));

  function renderSummary() {
    const U = C.unidades[S.unit], el = $("#summary");
    $("[data-book-title]").textContent = !S.ci ? "Quando você vem?" : !S.co ? "E quando vai embora?" : `${nightsBetween(S.ci, S.co)} noites em ${U.curto.toLowerCase()}`;
    $("[data-book-sub]").textContent = !S.ci ? "Escolha a data de check-in" : !S.co ? `Check-in em ${fmtShort(S.ci)} · escolha o check-out` : `${fmtShort(S.ci)} → ${fmtShort(S.co)} · ${guestsTxt()}`;
    $("[data-min-info]").textContent = S.ci ? `Mínimo de ${rate(S.unit, S.ci).min} noites a partir desta data` : `Mínimo de ${U.minNoites} noites (mais na alta temporada)`;

    if (!S.ci || !S.co) {
      el.innerHTML = `
        <div class="rounded-2xl bg-white border border-black/5 p-5 text-center">
          <span class="ms text-4xl text-accent">calendar_month</span>
          <p class="font-semibold mt-2">${!S.ci ? "Escolha o check-in" : "Agora o check-out"}</p>
          <p class="text-sm text-muted mt-1">O valor de cada noite aparece no calendário. O total aparece aqui.</p>
        </div>
        <a href="${wa("Olá! Vim pelo site e quero ajuda para escolher as datas.")}" target="_blank" rel="noopener" class="block text-center text-sm font-semibold text-primary mt-4 underline underline-offset-4">Prefiro falar no WhatsApp</a>`;
      return;
    }
    const q = quote(S.unit, S.ci, S.co), save = Math.round(q.total * C.taxaPlataforma);
    const cta = C.motor === "whatsapp" ? "Solicitar reserva" : "Reservar agora";
    const note = C.motor === "whatsapp"
      ? "Você ainda não paga nada. Confirmamos a disponibilidade pelo WhatsApp e enviamos o Pix/link de pagamento."
      : "Você será levado ao pagamento seguro.";
    el.innerHTML = `
      <div class="rounded-2xl bg-white border border-black/5 p-5">
        <div class="grid grid-cols-2 gap-2 text-sm mb-4">
          <button data-refocus="ci" class="text-left rounded-xl border border-black/10 p-2.5"><b class="block text-[11px] uppercase tracking-wider">Check-in</b>${fmtShort(S.ci)}</button>
          <button data-refocus="co" class="text-left rounded-xl border border-black/10 p-2.5"><b class="block text-[11px] uppercase tracking-wider">Check-out</b>${fmtShort(S.co)}</button>
        </div>
        ${q.lines.map(([p, n]) => `<div class="sum-row"><u>${brl(p)} × ${n} noite${n > 1 ? "s" : ""}</u><span>${brl(p * n)}</span></div>`).join("")}
        ${q.limpeza ? `<div class="sum-row"><u>Taxa de limpeza</u><span>${brl(q.limpeza)}</span></div>` : ""}
        <div class="sum-row"><u>Taxa de serviço</u><span class="text-ok font-semibold">R$ 0</span></div>
        <div class="sum-total"><span>Total</span><span>${brl(q.total)}</span></div>
        ${save > 0 ? `<div class="save"><span class="ms">savings</span><span>Reservando direto você economiza <b>~${brl(save)}</b> em relação às plataformas.</span></div>` : ""}
      </div>
      <div class="book-cta">
        <button data-confirm class="btn-accent w-full">${cta} · ${brl(q.total)} <span class="ms">arrow_forward</span></button>
        <p class="text-[11.5px] text-muted text-center mt-2 leading-snug">${note}</p>
      </div>`;
    $("[data-confirm]").onclick = confirmBooking;
    $$("[data-refocus]").forEach((b) => (b.onclick = () => { if (b.dataset.refocus === "ci") { S.ci = S.co = null; } else S.co = null; renderBook(); }));
  }

  function renderBook() { renderTabs(); renderCal(); renderGuests(); renderSummary(); syncBar(); }
  $("[data-clear]").onclick = () => { S.ci = S.co = S.hover = null; renderBook(); };

  // barra do hero + barra mobile
  function syncBar() {
    const ci = $("[data-ci-label]"), co = $("[data-co-label]");
    ci.textContent = S.ci ? fmtShort(S.ci) : "Adicionar data"; ci.classList.toggle("set", !!S.ci);
    co.textContent = S.co ? fmtShort(S.co) : "Adicionar data"; co.classList.toggle("set", !!S.co);
    const gl = $("[data-guests-label]"); gl.textContent = guestsTxt(); gl.classList.add("set");
    if (S.ci && S.co) {
      const q = quote(S.unit, S.ci, S.co);
      $("[data-mbar-price]").textContent = `${brl(q.total)} total`;
      $("[data-mbar-sub]").textContent = `${q.n} noites · ${fmtShort(S.ci)} – ${fmtShort(S.co)}`;
      $("[data-mbar-btn]").textContent = "Reservar";
    } else {
      $("[data-mbar-price]").textContent = `${brl(Math.min(fromPrice("cobertura"), fromPrice("apartamento")))} /noite`;
      $("[data-mbar-sub]").textContent = C.avaliacao?.nota ? `a partir de · ★ ${C.avaliacao.nota.toLocaleString("pt-BR")}` : "a partir de";
      $("[data-mbar-btn]").textContent = "Ver datas";
    }
  }

  // gatilhos
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-open-cal],[data-open-guests],[data-go-book],[data-book-unit],[data-gallery],[data-view]");
    if (!t) return;
    if (t.matches("[data-view]")) { e.preventDefault(); return openViewer(t.dataset.view, t.dataset.id); }
    if (t.matches("[data-gallery]")) { e.stopPropagation(); return openGallery(t.dataset.gallery); }
    if (t.matches("[data-book-unit]")) return openBook({ unit: t.dataset.bookUnit });
    if (t.matches("[data-open-guests]")) { openBook(); return setTimeout(() => $("#guestsBox").scrollIntoView({ behavior: "smooth", block: "center" }), 250); }
    if (t.matches("[data-open-cal]")) return openBook({ focus: t.dataset.openCal || undefined });
    if (t.matches("[data-go-book]")) return openBook();
  });

  // =================================================================
  //  MOTOR DE RESERVA
  // =================================================================
  function bookingUrl() {
    const U = C.unidades[S.unit];
    switch (C.motor) {
      case "cloudbeds": {
        const rid = U.cloudbedsRid ? `?rid=${U.cloudbedsRid}` : "";
        return `https://${C.cloudbeds.host}/reservation/${C.cloudbeds.codigo}${rid}#checkin=${S.ci}&checkout=${S.co}`;
      }
      case "seazone":
        return `https://seazone.com.br/s/${U.seazone}`; // TODO: confirmar formato com a Seazone
      case "custom":
        return C.customUrl.replace("{checkin}", S.ci).replace("{checkout}", S.co).replace("{adultos}", S.g.ad).replace("{criancas}", S.g.cr).replace("{unidade}", S.unit);
      default: {
        const q = quote(S.unit, S.ci, S.co);
        return wa(
`Olá! Vim pelo site e quero reservar:

🏠 ${U.nome}
📅 ${fmtLong(S.ci)} a ${fmtLong(S.co)} (${q.n} noites)
👥 ${guestsTxt()}
💰 Total estimado: ${brl(q.total)}

Está disponível?`);
      }
    }
  }
  function confirmBooking() { window.open(bookingUrl(), "_blank", "noopener"); }

  // =================================================================
  //  FAQ (respostas EXEMPLO — validar com o anfitrião)
  // =================================================================
  const faq = [
    ["Como funciona a reserva direta? É seguro?", "Você escolhe as datas aqui, envia o pedido e a Eliane confirma a disponibilidade pelo WhatsApp. Para garantir, pedimos um sinal via Pix ou cartão e enviamos o comprovante de reserva. O restante é pago antes do check-in."],
    ["Qual a política de cancelamento?", "Cancelamento com reembolso integral até 30 dias antes do check-in; 50% de reembolso entre 30 e 7 dias. Menos de 7 dias, o sinal não é devolvido, mas você pode remarcar a estadia (sujeito à disponibilidade)."],
    ["Quais os horários de check-in e check-out?", `Check-in a partir das ${C.checkin} e check-out até as ${C.checkout}. Precisa chegar antes ou sair mais tarde? Fale com a gente — sempre que possível a gente ajusta.`],
    ["Roupa de cama e toalhas estão incluídas?", "Sim. Os apartamentos são entregues com camas feitas, toalhas de banho e itens básicos de cozinha. Só traga as toalhas de praia."],
    ["Cabem 5 pessoas mesmo?", "Sim. Cada apartamento tem 2 quartos e sofá-cama na sala. Bebês (até 2 anos) não contam no limite."],
    ["Tem estacionamento?", "Sim! A Beach Route tem estacionamento para hóspedes — chegue de carro sem preocupação."],
    ["Aceitam pets?", "A confirmar com o anfitrião."],
    ["A que distância fica da praia?", `A ${C.distanciaPraia.toLowerCase()} da praia de Canasvieiras. Mercado, padaria e restaurantes também ficam a poucos minutos.`],
  ];
  $("#faqList").innerHTML = faq.map(([q, a], i) => `<details class="faq" ${i === 0 ? "open" : ""}><summary>${q}<span class="ms">add</span></summary><p>${a}</p></details>`).join("");

  // =================================================================
  //  ANIMAÇÕES DE ENTRADA
  // =================================================================
  const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))), { threshold: 0.1, rootMargin: "0px 0px -40px" });
  $$(".reveal").forEach((el) => io.observe(el));

  syncBar();
})();
