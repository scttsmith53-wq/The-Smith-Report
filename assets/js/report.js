const $=id=>document.getElementById(id);
const DATA={
  period:'June 2026',
  metrics:[
    {label:'Active listings',value:'12,744',note:'near a decade high',spark:[7600,8400,9300,10800,11900,12744]},
    {label:'Months of supply',value:'3.25',note:'tilting to buyers',spark:[1.8,2.0,2.3,2.6,3.0,3.25]},
    {label:'Median close price',value:'$616K',note:'flat year over year',spark:[601,609,614,618,615,616]},
    {label:'30-year fixed',value:'6.55%',note:'illustrative snapshot',spark:[6.35,6.4,6.44,6.47,6.49,6.55]}
  ],
  inventory:[7800,8650,9625,10890,11980,12744],
  sales:[4100,4250,4400,4320,4190,4050],
  periods:['Jan','Feb','Mar','Apr','May','Jun'],
  rates:[6.35,6.40,6.44,6.42,6.47,6.50,6.53,6.51,6.54,6.52,6.49,6.55],
  payments:[5.5,6,6.5,7].map(rate=>[`${rate.toFixed(1)}%`,Math.round(monthlyPI(500000,0,rate))]),
  news:[
    {source:'Mortgage News Daily',title:'Mortgage rates finish the week near recent lows',url:'https://www.mortgagenewsdaily.com/'},
    {source:'HousingWire',title:'What new housing legislation may—and may not—do for affordability',url:'https://www.housingwire.com/'},
    {source:'DMAR',title:'Denver inventory gives buyers more room to negotiate',url:'https://www.dmarealtors.com/market-trends-reports'},
    {source:'Freddie Mac',title:'Weekly mortgage-rate survey and market commentary',url:'https://www.freddiemac.com/pmms'}
  ]
};
const QUOTES=[
  ['Don’t wait to buy real estate. Buy real estate and wait.','Will Rogers'],
  ['Price is what you pay; value is what you get.','Warren Buffett'],
  ['An investment in knowledge pays the best interest.','Benjamin Franklin'],
  ['The best way to predict the future is to create it.','Peter Drucker'],
  ['Time in the market beats timing the market.','Proverb'],
  ['You don’t buy the market; you buy the home.','Proverb']
];
const FEED_BASE='https://qfhfuesnjfuwfujhvgpa.supabase.co/functions/v1/market-feed';
const CAR_COUNTIES=["Adams","Alamosa","Arapahoe","Archuleta","Baca","Bent","Boulder","Broomfield","Chaffee","Cheyenne","Clear Creek","Conejos","Costilla","Crowley","Custer","Delta","Denver","Dolores","Douglas","Eagle","El Paso","Elbert","Fremont","Garfield","Gilpin","Grand","Gunnison","Hinsdale","Huerfano","Jackson","Kiowa","Kit Carson","La Plata","Lake","Larimer","Las Animas","Lincoln","Logan","Mesa","Mineral","Moffat","Montezuma","Montrose","Morgan","Otero","Ouray","Park","Phillips","Pitkin","Prowers","Pueblo","Rio Blanco","Rio Grande","Routt","Saguache","San Juan","San Miguel","Sedgwick","Summit","Teller","Washington","Weld","Yuma"];
const CHAT='https://qfhfuesnjfuwfujhvgpa.supabase.co/functions/v1/agent-chat';

function esc(s){return String(s==null?'':s).replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));}
function monthlyPI(price,down,rate,term=30){const loan=price*(1-down/100),r=rate/1200,n=term*12;return r?loan*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1):loan/n;}
function setDate(){const now=new Date();if($('updatedTop'))$('updatedTop').textContent='Live feeds refreshed '+now.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});if($('editionTop'))$('editionTop').textContent=now.toLocaleDateString('en-US',{weekday:'long'})+' Edition';if($('period'))$('period').textContent=DATA.period;}
function spark(a){const w=78,h=21,min=Math.min(...a),max=Math.max(...a),r=max-min||1,pts=a.map((v,i)=>`${2+i*(w-4)/(a.length-1)},${h-3-(v-min)/r*(h-6)}`).join(' '),last=pts.split(' ').at(-1).split(',');return `<svg class="spark" viewBox="0 0 ${w} ${h}"><polyline points="${pts}" fill="none" stroke="#e9c176" stroke-width="2"/><circle cx="${last[0]}" cy="${last[1]}" r="2.3" fill="#e8a33d"/></svg>`;}
function renderMetrics(){if(!$('metrics'))return;$('metrics').innerHTML=DATA.metrics.map(m=>`<div class="metric"><div class="metric-head"><div class="metric-label">${m.label}</div><div class="metric-value">${m.value}</div></div><div class="metric-foot"><span>${m.note}</span>${spark(m.spark)}</div></div>`).join('');}
function renderSnapshot(){if(!$('snapshotGrid'))return;$('snapshotGrid').innerHTML=DATA.metrics.map(m=>`<div class="card snapshot-card"><div class="snapshot-label">${m.label}</div><div class="snapshot-value">${m.value}</div><div class="snapshot-note">${m.note}</div></div>`).join('');}
function inventoryChart(){if(!$('inventoryChart'))return;const w=620,h=300,m={l:38,r:28,t:14,b:30},iw=w-m.l-m.r,ih=h-m.t-m.b,invMax=Math.max(...DATA.inventory)*1.12,salesMax=Math.max(...DATA.sales)*1.18,step=iw/DATA.inventory.length;let bars='',linePts=[];DATA.inventory.forEach((v,i)=>{const x=m.l+i*step+step*.18,bw=step*.48,bh=v/invMax*ih,y=m.t+ih-bh,label=DATA.periods[i]||'';bars+=`<rect class="bar" x="${x}" y="${y}" width="${bw}" height="${bh}"/><text class="axis" x="${x+bw/2}" y="${h-8}" text-anchor="middle">${esc(label)}</text>`;linePts.push([m.l+i*step+step*.42,m.t+ih-DATA.sales[i]/salesMax*ih])});const grid=[0,1,2,3,4].map(i=>`<line class="gridline" x1="${m.l}" y1="${m.t+i*ih/4}" x2="${w-m.r}" y2="${m.t+i*ih/4}"/>`).join('');const path='M'+linePts.map(p=>p.join(',')).join(' L');$('inventoryChart').innerHTML=`<div class="dash-note" style="margin-bottom:8px">Bars: homes for sale · Gold line: closed sales</div><svg viewBox="0 0 ${w} ${h}" aria-label="Denver County single-family homes for sale and closed sales">${grid}${bars}<path class="line-red" d="${path}"/>${linePts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#e8a33d"/>`).join('')}</svg>`;}
function rateChart(){if(!$('rateChart'))return;const w=620,h=300,m={l:42,r:20,t:18,b:30},iw=w-m.l-m.r,ih=h-m.t-m.b,min=Math.min(...DATA.rates)-.03,max=Math.max(...DATA.rates)+.03,pts=DATA.rates.map((v,i)=>[m.l+i*iw/(DATA.rates.length-1),m.t+ih-(v-min)/(max-min)*ih]);const grid=[0,1,2,3].map(i=>`<line class="gridline" x1="${m.l}" y1="${m.t+i*ih/3}" x2="${w-m.r}" y2="${m.t+i*ih/3}"/>`).join('');const path='M'+pts.map(p=>p.join(',')).join(' L');const area=`M${m.l},${m.t+ih} L${pts.map(p=>p.join(',')).join(' L')} L${pts.at(-1)[0]},${m.t+ih} Z`;$('rateChart').innerHTML=`<svg viewBox="0 0 ${w} ${h}" aria-label="30-year fixed mortgage rate trend">${grid}<path class="area" d="${area}"/><path class="line-gold" d="${path}"/>${pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="${i===pts.length-1?4.5:2.7}" fill="${i===pts.length-1?'#e8a33d':'#e9c176'}"/>`).join('')}</svg>`;}
function paymentBars(){if(!$('paymentList'))return;const max=Math.max(...DATA.payments.map(x=>x[1]));$('paymentList').innerHTML=DATA.payments.map(p=>`<div class="payment-row"><span>${p[0]}</span><div class="payment-track"><div class="payment-fill" style="width:${p[1]/max*100}%"></div></div><span class="payment-value">$${p[1].toLocaleString()}</span></div>`).join('');}
function nrow(n){let host='';try{host=new URL(n.link||n.url).hostname.replace(/^www\./,'')}catch(e){}const link=n.link||n.url||'#',title=n.headline||n.title||'',source=n.source||host,thumb=n.image?`<img class="news-thumb" src="${esc(n.image)}" alt="" loading="lazy">`:(host?`<img class="news-logo" src="https://www.google.com/s2/favicons?sz=64&domain=${host}" alt="" loading="lazy">`:'');return `<a class="news-row" href="${esc(link)}" target="_blank" rel="noopener"><span class="news-source">${thumb}<span>${esc(source)}</span></span><span class="news-title">${esc(title)}</span><span class="news-arrow">›</span></a>`;}
function renderFallbackNews(){if($('newsList'))$('newsList').innerHTML=DATA.news.map(n=>nrow(n)).join('');}
function progCard(label,value,change,cls){const pos=change&&String(change).charAt(0)!=='-';const chip=change?`<span class="prog-chg ${pos?'up':'down'}">${pos?'▲':'▼'} ${esc(change)}</span>`:'';return `<div class="prog-card ${cls||''}"><div class="prog-l">${esc(label)}</div><div class="prog-v">${esc(value)}</div>${chip}</div>`;}
function setPrograms(list){if($('programGrid'))$('programGrid').innerHTML=list.map(p=>progCard(p[0],p[1],p[2],p[4])).join('');}
function setTicker(items){if(!$('tickerTrack')||!items.length)return;const nums=items.map(it=>`<span class="tick"><b>${esc(it[0])}</b><span>${esc(it[1])}</span>${it[2]?`<span class="${String(it[2]).charAt(0)==='-'?'down':'up'}">${esc(it[2])}</span>`:''}</span>`),out=[];QUOTES.forEach((q,i)=>{out.push(nums[i%nums.length]);out.push(`<span class="tick qtick">“${esc(q[0])}” <em>— ${esc(q[1])}</em></span>`)});const html=out.join('');$('tickerTrack').innerHTML=html+html;}
function bootFallback(){setTicker([['30-YR FIXED','6.55%',''],['15-YR FIXED','5.93%',''],['10-YR UST','4.54%','-0.03'],['S&P 500','743.29','-0.99%'],['HOMEBUILDERS','97.33','-2.85%']]);setPrograms([['CONFORMING','6.56%','+0.03'],['FHA','6.39%','+0.11'],['VA','6.20%','+0.03'],['USDA','6.39%','+0.09'],['JUMBO','6.63%','+0.09'],['DPA','~6.5%','','flat','dpa']]);}
let marketRequest = 0;
async function loadFeed(area = 'statewide', propertyType = 'single_family') {
  const request = ++marketRequest;
  try {
    const url = FEED_BASE + '?area=' + encodeURIComponent(area) +
      '&property_type=' + encodeURIComponent(propertyType) + '&months=14';
    const response = await fetch(url);
    if (!response.ok) throw new Error('Market feed HTTP ' + response.status);
    const data = await response.json();
    if (request !== marketRequest || !data || !data.ok) return;
    if (Array.isArray(data.car?.areas) && data.car.areas.length) {
      const selector = $('countySelect');
      if (selector) {
        const selected = data.car.focus?.id || area;
        selector.innerHTML = data.car.areas.filter((item) => item.type === 'statewide' || item.type === 'county')
          .map((item) => `<option value="${esc(item.id)}">${esc(item.label)}</option>`).join('');
        selector.value = selected;
      }
    }

    const ratesByLabel = {};
    (data.rates || []).forEach((rate) => { ratesByLabel[rate.label] = rate; });
    const tickerItems = [];
    if (ratesByLabel['30-yr fixed']) tickerItems.push(['30-YR FIXED', ratesByLabel['30-yr fixed'].value, '']);
    if (ratesByLabel['15-yr fixed']) tickerItems.push(['15-YR FIXED', ratesByLabel['15-yr fixed'].value, '']);
    (data.stocks || []).forEach((stock) => tickerItems.push([
      stock.symbol === 'TNX' ? '10-YR UST' : stock.symbol === 'SPY' ? 'S&P 500' : stock.symbol === 'ITB' ? 'HOMEBUILDERS' : stock.symbol,
      stock.value,
      stock.change
    ]));
    if (tickerItems.length) setTicker(tickerItems);

    if (data.programRates?.length) {
      const programs = data.programRates.map((program) => [
        String(program.label).replace(' 30yr', '').toUpperCase(),
        program.value,
        program.change,
        program.dir
      ]);
      programs.push(['DPA', data.dpa?.value || 'Unavailable', data.dpa?.change || '', data.dpa?.dir || 'flat', 'dpa']);
      setPrograms(programs);
    }

    if (data.mortgage30?.history?.length) {
      const rateHistory = data.mortgage30.history.map((point) => point.rate).slice(-14);
      if (rateHistory.length > 1) {
        DATA.rates = rateHistory;
        rateChart();
      }
    }

    if (data.car) {
      const key = propertyType === 'townhome_condo' ? 'townhome_condo' : 'single_family';
      const isStatewide = area === 'statewide';
      const row = isStatewide ? data.car.statewide :
        (data.car.counties || []).find((item) => item.county === area);
      const current = row && row[key];
      const history = (data.car.history || []).filter((item) => item[key]).slice(-14);
      if (current && history.length) {
        const typeLabel = key === 'single_family' ? 'SF' : 'Townhome/Condo';
        const focusLabel = data.car.focus?.label || (isStatewide ? 'Colorado Statewide' : area + ' County');
        const areaLabel = focusLabel + ' ' + typeLabel;
        if ($('marketAtGlance')) $('marketAtGlance').textContent = focusLabel + ' at a glance';
        if ($('marketChartArea')) $('marketChartArea').textContent = areaLabel + ' trend';
        if ($('marketDateline')) $('marketDateline').textContent = focusLabel.toUpperCase();
        DATA.period = data.car.period_label || DATA.period;
        DATA.inventory = history.map((item) => item[key].homes_for_sale);
        DATA.sales = history.map((item) => item[key].closed_sales);
        DATA.periods = history.map((item) => {
          const parts = String(item.period).split('-');
          return new Date(Number(parts[0]), Number(parts[1]) - 1, 1)
            .toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        });
        DATA.metrics[0] = {
          label: areaLabel + ' for sale',
          value: Number(current.homes_for_sale).toLocaleString(),
          note: (current.homes_for_sale_yoy_pct > 0 ? '+' : '') + current.homes_for_sale_yoy_pct + '% YoY',
          spark: DATA.inventory
        };
        DATA.metrics[1] = {
          label: areaLabel + ' closed sales',
          value: Number(current.closed_sales).toLocaleString(),
          note: (current.closed_sales_yoy_pct > 0 ? '+' : '') + current.closed_sales_yoy_pct + '% YoY',
          spark: DATA.sales
        };
        DATA.metrics[2] = {
          label: areaLabel + ' median price',
          value: '$' + Math.round(current.median_sale_price / 1000) + 'K',
          note: (current.median_sale_price_yoy_pct > 0 ? '+' : '') + current.median_sale_price_yoy_pct + '% YoY',
          spark: history.map((item) => item[key].median_sale_price)
        };
        if (ratesByLabel['30-yr fixed']) {
          DATA.metrics[3] = { ...DATA.metrics[3], value: ratesByLabel['30-yr fixed'].value, note: 'live national average' };
        }
        if ($('period')) $('period').textContent = data.car.data_period_note || DATA.period;
        if ($('marketSource')) {
          $('marketSource').textContent = (data.car.attribution || 'Source: Colorado Association of REALTORS®.') +
            ' Selected: ' + areaLabel + '.';
        }
        renderMetrics();
        renderSnapshot();
        inventoryChart();
      }
    }

    if ($('newsList') && data.news?.length) $('newsList').innerHTML = data.news.slice(0, 6).map(nrow).join('');
    if ($('celebList') && data.celeb?.length) $('celebList').innerHTML = data.celeb.slice(0, 5).map(nrow).join('');
    if ($('vidGrid') && data.videos?.length) {
      $('vidGrid').innerHTML = data.videos.slice(0, 6).map((video) =>
        '<a class="card vid-card" href="' + esc(video.link) + '" target="_blank" rel="noopener">' +
        '<div class="vid-thumb"><img src="' + esc(video.thumbnail) + '" alt="" loading="lazy"><span class="vid-play">▶</span></div>' +
        '<div class="vid-chan">' + esc(video.channel) + '</div>' +
        '<div class="vid-title">' + esc(video.blurb) + '</div>' +
        '<div class="vid-desc">' + esc(video.title || '') + '</div></a>'
      ).join('');
    }
  } catch (error) {
    console.warn('Market feed unavailable; showing verified fallback data.', error);
  }
}

const tools={
 payment:()=>`<div class="calc-grid"><div class="field"><label>Purchase price</label><input id="pPrice" type="number" value="450000" step="5000"></div><div class="field"><label>Down payment %</label><input id="pDown" type="number" value="3.5" step=".5"></div><div class="field"><label>Interest rate %</label><input id="pRate" type="number" value="6.75" step=".01"></div><div class="field"><label>Taxes + insurance + HOA / mo</label><input id="pExtras" type="number" value="425" step="25"></div><div class="result"><div><div class="eyebrow">Estimated full payment</div><div class="result-value" id="pResult"></div></div><div class="result-note">Includes an illustrative mortgage-insurance estimate. Actual taxes, insurance, HOA and mortgage insurance vary by property and loan program.</div></div></div>`,
 buying:()=>`<div class="calc-grid"><div class="field"><label>Annual income</label><input id="bIncome" type="number" value="90000" step="1000"></div><div class="field"><label>Monthly debts</label><input id="bDebt" type="number" value="500" step="50"></div><div class="field"><label>Interest rate %</label><input id="bRate" type="number" value="6.75" step=".01"></div><div class="field"><label>Down payment %</label><input id="bDown" type="number" value="3.5" step=".5"></div><div class="field"><label>Annual property taxes</label><input id="bTax" type="number" value="3500" step="250"></div><div class="field"><label>Annual home insurance</label><input id="bIns" type="number" value="1200" step="100"></div><div class="field"><label>Illustrative DTI</label><select id="bDti"><option value=".40">40% conservative</option><option selected value=".45">45% illustration</option><option value=".50">50% expanded scenario</option></select></div><div class="result"><div><div class="eyebrow">Illustrative purchase price</div><div class="result-value" id="bResult"></div></div><div class="result-note">Uses principal, interest, entered taxes and insurance, plus estimated MI below 20% down. Not a qualification or approval.</div></div></div>`,
 waiting:()=>`<div class="calc-grid"><div class="field"><label>Home price today</label><input id="wPrice" type="number" value="450000" step="5000"></div><div class="field"><label>Monthly rent</label><input id="wRent" type="number" value="2200" step="50"></div><div class="field"><label>Illustrative appreciation %</label><input id="wApp" type="number" value="4" step=".5"></div><div class="field"><label>Months waiting</label><input id="wMonths" type="number" value="12" step="1"></div><div class="result"><div><div class="eyebrow">If you wait</div><div class="mini-compare"><div class="mini-row"><span>Rent paid</span><b id="wRentPaid"></b></div><div class="mini-row"><span>Projected price increase</span><b id="wIncrease"></b></div><div class="mini-row"><span>Projected future home price</span><b id="wFuturePrice"></b></div><div class="mini-row"><span>Combined illustration</span><b id="wResult"></b></div></div></div><div class="result-note">Rent and projected appreciation are shown separately. Appreciation is hypothetical and this is not a complete rent-versus-buy analysis.</div></div></div>`,
 buydown:()=>`<div class="calc-grid"><div class="field"><label>Purchase price</label><input id="dyPrice" type="number" value="450000" step="5000"></div><div class="field"><label>Down payment %</label><input id="dyDown" type="number" value="3.5" step=".5"></div><div class="field"><label>Note rate %</label><input id="dyRate" type="number" value="6.75" step=".01"></div><div class="field"><label>Buydown structure</label><select id="dyType"><option value="21" selected>2-1 buydown</option><option value="321">3-2-1 buydown</option><option value="10">1-0 buydown</option></select></div><div class="result"><div id="dyOut"></div><div class="result-note">Temporary buydowns are commonly funded by seller or lender credit. Educational estimate only.</div></div></div>`
};
function openTool(name) {
  document.querySelectorAll('.js-tool').forEach((button) =>
    button.classList.toggle('active', button.dataset.tool === name)
  );
  if (!$('toolDrawer')) return;
  $('toolDrawer').innerHTML = tools[name]();
  $('toolDrawer').classList.add('open');

  if (name === 'payment') {
    const calc = () => {
      const price = +$('pPrice').value;
      const down = +$('pDown').value;
      const loan = price * (1 - down / 100);
      const mi = down < 20 ? loan * .0055 / 12 : 0;
      const result = monthlyPI(price, down, +$('pRate').value) + +$('pExtras').value + mi;
      $('pResult').textContent = '$' + Math.round(result).toLocaleString() + '/mo';
    };
    ['pPrice', 'pDown', 'pRate', 'pExtras'].forEach((id) => $(id).addEventListener('input', calc));
    calc();
  }

  if (name === 'buying') {
    const calc = () => {
      const income = +$('bIncome').value / 12;
      const debt = +$('bDebt').value;
      const dti = +$('bDti').value;
      const rate = +$('bRate').value;
      const down = Math.min(99, Math.max(0, +$('bDown').value));
      const tax = +$('bTax').value / 12;
      const insurance = +$('bIns').value / 12;
      const budget = Math.max(0, income * dti - debt);
      let low = 0;
      let high = 3000000;
      for (let i = 0; i < 60; i++) {
        const price = (low + high) / 2;
        const loan = price * (1 - down / 100);
        const mi = down < 20 ? loan * .0055 / 12 : 0;
        const total = monthlyPI(price, down, rate) + tax + insurance + mi;
        if (total <= budget) low = price;
        else high = price;
      }
      $('bResult').textContent = '$' + (Math.round(low / 1000) * 1000).toLocaleString();
    };
    ['bIncome', 'bDebt', 'bDti', 'bRate', 'bDown', 'bTax', 'bIns'].forEach((id) => $(id).addEventListener('input', calc));
    calc();
  }

  if (name === 'waiting') {
    const calc = () => {
      const price = +$('wPrice').value;
      const rentMonthly = +$('wRent').value;
      const appreciation = +$('wApp').value / 100;
      const months = +$('wMonths').value;
      const priceIncrease = price * (Math.pow(1 + appreciation, months / 12) - 1);
      const rentPaid = rentMonthly * months;
      $('wRentPaid').textContent = '$' + Math.round(rentPaid).toLocaleString();
      $('wIncrease').textContent = '$' + Math.round(priceIncrease).toLocaleString();
      $('wFuturePrice').textContent = '$' + Math.round(price + priceIncrease).toLocaleString();
      $('wResult').textContent = '$' + Math.round(priceIncrease + rentPaid).toLocaleString();
    };
    ['wPrice', 'wRent', 'wApp', 'wMonths'].forEach((id) => $(id).addEventListener('input', calc));
    calc();
  }

  if (name === 'buydown') {
    const calc = () => {
      const price = +$('dyPrice').value;
      const down = +$('dyDown').value;
      const rate = +$('dyRate').value;
      const type = $('dyType').value;
      const steps = type === '321' ? [3, 2, 1] : type === '10' ? [1] : [2, 1];
      const full = monthlyPI(price, down, rate);
      let rows = '';
      let cost = 0;
      steps.forEach((step, index) => {
        const payment = monthlyPI(price, down, Math.max(rate - step, 0));
        const savings = full - payment;
        cost += savings * 12;
        rows += '<div class="mini-row"><span>Year ' + (index + 1) + ' · ' +
          (rate - step).toFixed(3) + '%</span><b>$' + Math.round(payment).toLocaleString() +
          '/mo · save $' + Math.round(savings).toLocaleString() + '</b></div>';
      });
      const firstYearSavings = full - monthlyPI(price, down, Math.max(rate - steps[0], 0));
      const priceCutSavings = full - monthlyPI(Math.max(price - cost, 0), down, rate);
      $('dyOut').innerHTML =
        '<div class="mini-compare"><div class="mini-row"><span>Standard payment</span><b>$' +
        Math.round(full).toLocaleString() + '/mo</b></div>' + rows +
        '<div class="mini-row"><span><strong>Approx. seller concession</strong></span><b>$' +
        Math.round(cost).toLocaleString() + '</b></div></div><p style="font-size:11px;color:var(--muted)">' +
        'The same seller dollars as a price reduction would lower payment roughly $' +
        Math.round(priceCutSavings).toLocaleString() + '/mo versus about $' +
        Math.round(firstYearSavings).toLocaleString() + '/mo in year one from the buydown.</p>';
    };
    ['dyPrice', 'dyDown', 'dyRate', 'dyType'].forEach((id) => $(id).addEventListener('input', calc));
    calc();
  }
}

const AUDIENCE_COPY={
  agent:{
    utility:'Denver Metro · Mortgage & Housing Intelligence',
    takeawayLabel:'What it means for agents',
    takeawayText:'More homes are available, sellers are more flexible and condition matters again. The opportunity belongs to agents who convert leverage into a monthly payment the buyer can accept.',
    toolsEyebrow:'Conversation tools',toolsTitle:'Run the scenario while you’re talking.',
    partnerEyebrow:'Your financing desk',partnerTitle:'A lender who protects the agent relationship.',partnerDesc:'Your buyer. Your relationship. Citywide mortgage support.',
    partnerHeadline:'Your referral remains credited to you.',partnerTrust:'I connect with your client as the lender, communicate clearly throughout the file and keep the referring agent attached to the relationship.',
    briefEyebrow:'Scott’s Monday Market Brief',briefTitle:'Keep the useful part of the market in your inbox.',briefDesc:'Rates, Denver housing data and one financing strategy to use with a buyer this week.'
  },
  client:{
    utility:'Colorado Homebuyer · Market & Payment Intelligence',
    takeawayLabel:'What it means for buyers and sellers',
    takeawayText:'More choices can create negotiating room, but the right decision still comes down to the property, your payment and your timeline—not a headline about the market.',
    toolsEyebrow:'Planning tools',toolsTitle:'Run the numbers before you make the move.',
    partnerEyebrow:'Your homebuying team',partnerTitle:'Real estate and financing guidance in one place.',partnerDesc:'One plan for the home, the offer and the financing.',
    partnerHeadline:'Know the home and the financing before you commit.',partnerTrust:'I can help you understand the property, structure the offer and evaluate the financing so the pieces work together.',
    briefEyebrow:'Scott’s Homebuyer Brief',briefTitle:'Get the useful part of the market in your inbox.',briefDesc:'Rates, local housing data and one practical homebuying strategy each week.'
  }
};
function setAudience(mode,persist=true){const audience=mode==='client'?'client':'agent',copy=AUDIENCE_COPY[audience];document.body.dataset.audience=audience;Object.entries(copy).forEach(([id,value])=>{const el=$(id);if(el)el.textContent=value});document.querySelectorAll('[data-set-audience]').forEach(b=>b.classList.toggle('active',b.dataset.setAudience===audience));if(persist)localStorage.setItem('smith_report_audience',audience);const chooser=$('audienceChooser');if(chooser){chooser.classList.remove('open');chooser.setAttribute('aria-hidden','true')}}
function setupAudience(){const saved=localStorage.getItem('smith_report_audience');setAudience(saved||'agent',false);document.querySelectorAll('[data-set-audience]').forEach(b=>b.addEventListener('click',()=>setAudience(b.dataset.setAudience)));if(!saved){const chooser=$('audienceChooser');chooser?.classList.add('open');chooser?.setAttribute('aria-hidden','false')}}
function setupMarketControls(){const county=$('countySelect'),type=$('propertyTypeSelect');if(!county||!type)return;county.innerHTML='<option value="statewide">Colorado Statewide</option>'+CAR_COUNTIES.map(c=>`<option value="${esc(c)}">${esc(c)} County</option>`).join('');const refresh=()=>loadFeed(county.value,type.value);county.addEventListener('change',refresh);type.addEventListener('change',refresh)}

function setupReferral(){const modal=$('refModal');if(!modal)return;const open=()=>{modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'},close=()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow=''};document.querySelectorAll('.js-ref').forEach(b=>b.addEventListener('click',open));$('closeRef').onclick=$('cancelRef').onclick=close;modal.addEventListener('click',e=>{if(e.target===modal)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});$('refForm').addEventListener('submit',async e=>{e.preventDefault();const btn=$('sendRef');btn.disabled=true;btn.textContent='Sending…';const payload={client:{first_name:$('clientFirst').value.trim(),last_name:$('clientLast').value.trim(),phone:$('clientPhone').value.trim(),email:$('clientEmail').value.trim(),loan_purpose:$('clientPurpose').value,timeline:$('clientTimeline').value,notes:$('refNotes').value.trim(),consent:true},referrer:{name:$('agentName').value.trim(),brokerage:$('agentBrokerage').value.trim(),phone:$('agentPhone').value.trim(),email:$('agentEmail').value.trim()},source:'the_smith_report_referral',event_source_url:location.href};try{const r=await fetch('https://qfhfuesnjfuwfujhvgpa.supabase.co/functions/v1/agent-referral',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});if(!r.ok)throw Error();$('refForm').style.display='none';$('refSuccess').style.display='block';if(window.fbq)fbq('trackCustom','AgentClientReferral',{content_name:'The Smith Report'})}catch(err){alert('The referral could not be submitted. Please call or text Scott at 720-252-7037.');btn.disabled=false;btn.textContent='Send Referral'}})}
function setupOptin(){if(!$('optinForm'))return;$('optinForm').addEventListener('submit',async e=>{e.preventDefault();if(!$('consent').checked)return;const btn=$('submitBtn');btn.disabled=true;btn.textContent='Adding you…';const evtId='lead.'+Date.now()+'.'+Math.random().toString(36).slice(2,10);try{const r=await fetch('https://qfhfuesnjfuwfujhvgpa.supabase.co/functions/v1/agent-optin',{method:'POST',headers:{'Content-Type':'application/json','apikey':'sb_publishable_YnBBmClE9jpZMKN-OMuFWA_NB3oGOMv','Authorization':'Bearer sb_publishable_YnBBmClE9jpZMKN-OMuFWA_NB3oGOMv'},body:JSON.stringify({first_name:$('first').value.trim(),last_name:$('last').value.trim(),full_name:$('first').value.trim()+' '+$('last').value.trim(),phone:$('phone').value.trim(),email:$('email').value.trim(),brokerage:$('brokerage').value.trim(),source:'the_smith_report',consent:true,event_id:evtId,event_source_url:location.href})});if(!r.ok)throw Error();if(window.fbq)fbq('track','Lead',{content_name:'The Smith Report — Weekly Brief'},{eventID:evtId});$('optinForm').style.display='none';$('optinSuccess').style.display='block'}catch(err){alert('Something went wrong. Please text Scott directly to be added.');btn.disabled=false;btn.textContent='Get Scott’s Brief'}})}
function setupChat(){const chat=$('srChat'),body=$('srBody'),input=$('srInput');if(!chat)return;let msgs=[],opened=false;const add=(role,t)=>{const d=document.createElement('div');d.className='sr-msg '+(role==='user'?'me':'bot');d.textContent=t;body.appendChild(d);body.scrollTop=body.scrollHeight;return d},open=()=>{chat.classList.add('open');if(!opened){opened=true;add('bot',"Hey — I'm Scott's AI desk. Ask me about rates, down payment assistance, or a buyer scenario and I'll give you a straight answer.")}input.focus()},close=()=>chat.classList.remove('open');$('srFab').addEventListener('click',()=>chat.classList.contains('open')?close():open());$('srClose').addEventListener('click',close);async function send(){const t=input.value.trim();if(!t)return;input.value='';add('user',t);msgs.push({role:'user',content:t});const ty=add('bot','…');ty.classList.add('typing');try{const r=await fetch(CHAT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({source:'the_smith_report',messages:msgs.slice(-12)})}),j=await r.json();ty.remove();const rep=j?.reply||"I couldn't reach my desk just then — text Scott directly and he'll jump in.";add('bot',rep);msgs.push({role:'assistant',content:rep})}catch(e){ty.remove();add('bot','Connection hiccup — try again in a moment.')}}$('srSend').addEventListener('click',send);input.addEventListener('keydown',e=>{if(e.key==='Enter')send()})}
function setupReveal(){const observer=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');observer.unobserve(x.target)}}),{threshold:.06});document.querySelectorAll('.reveal,.section').forEach(el=>{el.classList.add('reveal');observer.observe(el)})}
function boot(){setupAudience();setupMarketControls();setDate();renderMetrics();renderSnapshot();inventoryChart();rateChart();paymentBars();renderFallbackNews();bootFallback();if($('samplePayment'))$('samplePayment').textContent='$'+Math.round(monthlyPI(450000,3.5,6.75)+250+175+(450000*.965*.0055/12)).toLocaleString()+'/mo';document.querySelectorAll('.js-tool').forEach(b=>b.addEventListener('click',()=>{openTool(b.dataset.tool);$('tools').scrollIntoView({behavior:'smooth'})}));openTool('payment');setupReferral();setupOptin();setupChat();setupReveal();loadFeed('statewide',$('propertyTypeSelect')?.value||'single_family')}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot):boot();
