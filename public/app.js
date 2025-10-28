const form = document.getElementById('lookup-form');
const statusEl = document.getElementById('status');
const resultCard = document.getElementById('result');

const fields = {
  phone: document.getElementById('r-phone'),
  name: document.getElementById('r-name'),
  online: document.getElementById('r-online'),
  exp: document.getElementById('r-exp'),
  usage: document.getElementById('r-usage'),
  pkg: document.getElementById('r-pkg'),
  serv: document.getElementById('r-serv'),
  limitcomb: document.getElementById('r-limitcomb'),
  limitexp: document.getElementById('r-limitexp'),
  lastinv: document.getElementById('r-lastinv'),
  raw: document.getElementById('r-raw'),
};

function setStatus(text, isError = false) {
  statusEl.textContent = text || '';
  statusEl.classList.toggle('error', !!isError);
}

function setResult(data) {
  fields.phone.textContent = data.phone ?? '-';
  fields.name.textContent = [data.firstName, data.lastName].filter(Boolean).join(' ') || '-';
  fields.online.textContent = data.online === true ? 'متصل' : data.online === false ? 'غير متصل' : String(data.online ?? '-');
  fields.exp.textContent = data.expiration ?? '-';
  fields.usage.textContent = data.usage ?? '-';
  fields.pkg.textContent = data.package ?? '-';
  fields.serv.textContent = data.service ?? '-';
  fields.limitcomb.textContent = data.limitCombined ?? '-';
  fields.limitexp.textContent = data.limitExpiration ?? '-';
  fields.lastinv.textContent = data.lastInvoice ?? '-';
  fields.raw.textContent = JSON.stringify(data._raw ?? data, null, 2);
}

// Resolve API base from config, query param (?api=...), or default same-origin
function resolveApiBase() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('api');
  if (fromQuery) return fromQuery;
  if (typeof window.API_BASE === 'string' && window.API_BASE.trim() !== '') {
    return window.API_BASE.trim();
  }
  return window.location.origin;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = document.getElementById('user').value.trim();
  const pass = document.getElementById('pass').value.trim();

  if (!user || !pass) {
    setStatus('يرجى إدخال البريد وكلمة المرور', true);
    return;
  }

  setStatus('جاري الاستعلام...');
  resultCard.classList.add('hidden');

  try {
    const apiBase = resolveApiBase();
    const url = new URL('/api/info', apiBase);
    url.searchParams.set('user', user);
    url.searchParams.set('pass', pass);

    const res = await fetch(url.toString());
    const data = await res.json();

    if (!res.ok || data.success === false) {
      throw new Error(data.error || 'فشل الاستعلام');
    }

    setStatus('تم بنجاح');
    setResult(data);
    resultCard.classList.remove('hidden');
  } catch (err) {
    console.error(err);
    setStatus(err.message || 'حدث خطأ غير متوقع', true);
  }
});
