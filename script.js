
// Firebase config and import (تأكد أنه مستورد من firebase-config.js)
import { auth, db } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  Timestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// عناصر الصفحة
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const userEmailDisplay = document.getElementById('user-email');
const flightForm = document.getElementById('flight-form');
const flightsTable = document.querySelector('#flights-table tbody');
const exportPDFBtn = document.getElementById('export-pdf');
const exportWordBtn = document.getElementById('export-word');

// تسجيل الدخول
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert('فشل تسجيل الدخول: ' + err.message);
    }
  });
}

// حالة المستخدم
onAuthStateChanged(auth, (user) => {
  const isAdmin = user && user.email === "mostafa.admin@gmail.com";

  if (user) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('main-section').style.display = 'block';
    userEmailDisplay.innerText = user.email;
    if (isAdmin) loadFlights();
  } else {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('main-section').style.display = 'none';
  }
});

// تسجيل الخروج
logoutBtn?.addEventListener('click', () => {
  signOut(auth);
});

// تحميل الرحلات
async function loadFlights() {
  flightsTable.innerHTML = '';
  const q = query(collection(db, 'flights'), orderBy('date'));
  const snapshot = await getDocs(q);
  snapshot.forEach((doc) => {
    const data = doc.data();
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${data.date}</td><td>${data.flightNumber}</td><td>${data.onChocksTime}</td>
      <td>${data.openDoorTime}</td><td>${data.startCleaningTime}</td><td>${data.completeCleaningTime}</td>
      <td>${data.readyBoardingTime}</td><td>${data.startBoardingTime}</td><td>${data.completeBoardingTime}</td>
      <td>${data.closeDoorTime}</td><td>${data.offChocksTime}</td>
      <td>${data.name}</td><td>${data.notes || ''}</td>
    `;
    flightsTable.appendChild(row);
  });
}

// حفظ الرحلة
if (flightForm) {
  flightForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(flightForm);
    const data = Object.fromEntries(formData.entries());
    try {
      await addDoc(collection(db, 'flights'), {
        ...data,
        timestamp: Timestamp.now(),
      });
      flightForm.reset();
      if (isAdmin) loadFlights();
    } catch (err) {
      alert('خطأ في حفظ الرحلة: ' + err.message);
    }
  });
}

// تصدير PDF
exportPDFBtn?.addEventListener('click', () => {
  window.print();
});

// تصدير Word
exportWordBtn?.addEventListener('click', () => {
  const content = document.getElementById('flights-container').innerHTML;
  const blob = new Blob(['<html><body>' + content + '</body></html>'], {
    type: 'application/msword'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'رحلات.doc';
  link.click();
});
