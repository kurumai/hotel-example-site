import {ready, redirectToTop, formatCurrency, formatDateLong, parseDateISO} from './lib/global.js';
import {getTransactionId, deleteTransactionId} from './lib/session.js';
import {calcTotalBill} from './lib/billing.js';

history.replaceState(null, '', 'confirm.html');

ready(() => {
  // load data
  const transactionId = getTransactionId();
  if (!transactionId) {
    redirectToTop();
    return;
  }
  const data = sessionStorage.getItem(transactionId);
  if (!data) {
    redirectToTop();
    return;
  }
  const reservation = JSON.parse(data);
  deleteTransactionId();
  sessionStorage.removeItem(transactionId);

  // create contents
  const reserveDate = parseDateISO(reservation.date);
  const endDate = new Date(reserveDate.getFullYear(), reserveDate.getMonth(), reserveDate.getDate() + reservation.term);
  const totalBill = calcTotalBill(reservation.roomBill, reserveDate, reservation.term,
      reservation.headCount, reservation.breakfast, reservation.earlyCheckIn, reservation.sightseeing);

  // set result
  document.getElementById('total-bill').textContent = `合計 ${formatCurrency(totalBill)}（税込み）`;
  document.getElementById('plan-name').textContent = reservation.planName;
  document.getElementById('plan-desc').textContent = `お一人様1泊${formatCurrency(reservation.roomBill)}〜、土日は25%アップ`;
  document.getElementById('term').textContent = `${formatDateLong(reserveDate)} 〜 ${formatDateLong(endDate)} ${reservation.term}泊`;
  document.getElementById('head-count').textContent = `${reservation.headCount}名様`;
  let plansHtml = '';
  if (reservation.breakfast) {
    plansHtml += '<li>朝食バイキング</li>';
  }
  if (reservation.earlyCheckIn) {
    plansHtml += '<li>昼からチェックインプラン</li>';
  }
  if (reservation.sightseeing) {
    plansHtml += '<li>お得な観光プラン</li>';
  }
  if (plansHtml.length > 0) {
    plansHtml = `<ul>${plansHtml}</ul>`;
  } else {
    plansHtml = 'なし';
  }
  document.getElementById('plans').innerHTML = plansHtml;
  document.getElementById('username').textContent = `${reservation.username}様`;
  let contactText = '';
  if (reservation.contact === 'no') {
    contactText += '希望しない';
  } else if (reservation.contact === 'email') {
    contactText += `メール：${reservation.email}`;
  } else if (reservation.contact === 'tel') {
    contactText += `電話：${reservation.tel}`;
  }
  document.getElementById('contact').textContent = contactText;
  document.getElementById('comment').textContent = reservation.comment ? reservation.comment : 'なし';

  $('#success-modal').on('hidden.bs.modal', function() {
    window.close();
  });
});
