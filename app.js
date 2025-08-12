(function(){
  function qs(key){ const p = new URLSearchParams(window.location.search); return p.get(key) || ""; }
  function toNumber(v){ const n = Number(v); return Number.isFinite(n) && n>0 ? n : 0; }
  function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
  function formatDKK(n){ return new Intl.NumberFormat('da-DK', { style:'currency', currency:'DKK', maximumFractionDigits:0 }).format(n); }

  const companyType = qs('companyType');
  const location = qs('location');
  const elec = toNumber(qs('elecL')) + toNumber(qs('elecR'));
  const heat = toNumber(qs('heatL')) + toNumber(qs('heatR'));
  const gas_m3 = toNumber(qs('gasL')) + toNumber(qs('gasR'));
  const gas_kWh = gas_m3 * 10.8;

  const total_kWh = elec + heat + gas_kWh;

  const internal = clamp(30 + (total_kWh/50000), 20, 80);
  const byproduct = clamp(internal - 20 + (elec>0?10:0), 10, 70);
  const residual = clamp(100 - (internal + byproduct), 5, 40);
  const match = clamp(internal - residual/2, 20, 95);

  const assumed_savings_kWh = total_kWh * 0.30;
  const kg_per_kWh = 0.25;
  const co2_tons = (assumed_savings_kWh * kg_per_kWh) / 1000;
  const price_per_kWh = 1.5;
  const quarterly_savings = (assumed_savings_kWh * price_per_kWh) / 4;

  const pct = (n)=> Math.round(n) + '%';
  const el = (id)=> document.getElementById(id);

  if(el('companyMeta')){
    const meta = [companyType, location].filter(Boolean).join(' — ');
    el('companyMeta').textContent = meta || 'Based on your inputs';
  }
  el('matchPct').textContent = pct(match);
  el('pctInternal').textContent = pct(internal);
  el('pctByproduct').textContent = pct(byproduct);
  el('pctResidual').textContent = pct(residual);
  el('barInternal').style.width = pct(internal);
  el('barByproduct').style.width = pct(byproduct);
  el('barResidual').style.width = pct(residual);
  el('co2').textContent = new Intl.NumberFormat('da-DK').format(Math.round(co2_tons)) + ' ton CO₂';
  el('savings').textContent = formatDKK(quarterly_savings) + ' per quarter';
})();
