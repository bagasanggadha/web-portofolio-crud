// --- LOGIKA AUTENTIKASI LOGIN ---
const LOGIN_USER = "admin";
const LOGIN_PASS = "admin123";

function checkAuth() {
  const loginModal = document.getElementById('loginModal');
  const isLogged = localStorage.getItem('isLoggedIn') === 'true';
  
  if (loginModal) {
    if (isLogged) {
      loginModal.classList.add('hidden');
    } else {
      loginModal.classList.remove('hidden');
    }
  }
}

// Menjalankan Event Listener setelah seluruh elemen HTML (DOM) dimuat
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const loginUsername = document.getElementById('loginUsername');
  const loginPassword = document.getElementById('loginPassword');
  const loginError = document.getElementById('loginError');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Mencegah form reload/mental
      
      const userVal = loginUsername ? loginUsername.value.trim() : '';
      const passVal = loginPassword ? loginPassword.value.trim() : '';

      if (userVal === LOGIN_USER && passVal === LOGIN_PASS) {
        localStorage.setItem('isLoggedIn', 'true');
        if (loginError) loginError.classList.add('hidden');
        loginForm.reset();
        checkAuth();
      } else {
        if (loginError) loginError.classList.remove('hidden');
      }
    });
  }

  // Cek status login saat halaman pertama kali dibuka
  checkAuth();
});

// Fungsi Logout Global
window.logout = function() {
  localStorage.removeItem('isLoggedIn');
  checkAuth();
};

// --- DATA & CRUD INVENTARIS ---
let items = JSON.parse(localStorage.getItem('crud_items')) || [
  { id: 1, nama: 'Router WiFi Dual Band', kategori: 'Aksesori Network', stok: 12 },
  { id: 2, nama: 'Kabel UTP Cat6 305m', kategori: 'Aksesori Network', stok: 5 },
  { id: 3, nama: 'Printer Thermal Label', kategori: 'Elektronik', stok: 3 }
];

const dataTable = document.getElementById('dataTable');
const totalItem = document.getElementById('totalItem');
const searchInput = document.getElementById('searchInput');

const modalForm = document.getElementById('modalForm');
const modalTitle = document.getElementById('modalTitle');
const itemForm = document.getElementById('itemForm');

const itemIdInput = document.getElementById('itemId');
const namaInput = document.getElementById('namaBarang');
const kategoriInput = document.getElementById('kategoriBarang');
const stokInput = document.getElementById('stokBarang');

const btnBukaModal = document.getElementById('btnBukaModal');
const btnTutupModal = document.getElementById('btnTutupModal');
const btnBatal = document.getElementById('btnBatal');

function simpanKeStorage() {
  localStorage.setItem('crud_items', JSON.stringify(items));
}

function renderTable(data = items) {
  if (!dataTable) return;
  dataTable.innerHTML = '';
  if (totalItem) totalItem.textContent = items.length;

  if (data.length === 0) {
    dataTable.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-6 text-gray-400">Tidak ada data ditemukan.</td>
      </tr>
    `;
    return;
  }

  data.forEach((item, index) => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50 transition';
    row.innerHTML = `
      <td class="p-4 font-medium text-gray-500">${index + 1}</td>
      <td class="p-4 font-semibold text-gray-800">${item.nama}</td>
      <td class="p-4"><span class="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-semibold">${item.kategori}</span></td>
      <td class="p-4 font-medium text-gray-700">${item.stok}</td>
      <td class="p-4 text-center space-x-2">
        <button onclick="editItem(${item.id})" class="text-amber-600 hover:text-amber-800 font-medium text-xs border border-amber-200 px-2.5 py-1 rounded">Edit</button>
        <button onclick="hapusItem(${item.id})" class="text-rose-600 hover:text-rose-800 font-medium text-xs border border-rose-200 px-2.5 py-1 rounded">Hapus</button>
      </td>
    `;
    dataTable.appendChild(row);
  });
}

function bukaModal(isEdit = false) {
  if (modalTitle) modalTitle.textContent = isEdit ? 'Edit Data Barang' : 'Tambah Barang Baru';
  if (modalForm) modalForm.classList.remove('hidden');
}

function tutupModal() {
  if (modalForm) modalForm.classList.add('hidden');
  if (itemForm) itemForm.reset();
  if (itemIdInput) itemIdInput.value = '';
}

if (itemForm) {
  itemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = itemIdInput.value;
    const nama = namaInput.value.trim();
    const kategori = kategoriInput.value;
    const stok = parseInt(stokInput.value);

    if (id) {
      const index = items.findIndex(item => item.id == id);
      if (index !== -1) {
        items[index] = { id: parseInt(id), nama, kategori, stok };
      }
    } else {
      const newItem = { id: Date.now(), nama, kategori, stok };
      items.push(newItem);
    }

    simpanKeStorage();
    renderTable();
    tutupModal();
  });
}

window.editItem = function(id) {
  const item = items.find(item => item.id === id);
  if (item) {
    itemIdInput.value = item.id;
    namaInput.value = item.nama;
    kategoriInput.value = item.kategori;
    stokInput.value = item.stok;
    bukaModal(true);
  }
};

window.hapusItem = function(id) {
  if (confirm('Apakah kamu yakin ingin menghapus data ini?')) {
    items = items.filter(item => item.id !== id);
    simpanKeStorage();
    renderTable();
  }
};

if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    const filteredItems = items.filter(item => 
      item.nama.toLowerCase().includes(keyword) || 
      item.kategori.toLowerCase().includes(keyword)
    );
    renderTable(filteredItems);
  });
}

if (btnBukaModal) btnBukaModal.addEventListener('click', () => bukaModal(false));
if (btnTutupModal) btnTutupModal.addEventListener('click', tutupModal);
if (btnBatal) btnBatal.addEventListener('click', tutupModal);

// Export CSV
window.exportToCSV = function() {
  const dataExport = items.length > 0 ? items : (JSON.parse(localStorage.getItem('crud_items')) || []);
  if (dataExport.length === 0) {
    alert('Belum ada data inventaris untuk diexport!');
    return;
  }
  let csvContent = "data:text/csv;charset=utf-8,No,Nama Barang,Kategori,Jumlah Stok\n";
  dataExport.forEach((item, index) => {
    const row = `${index + 1},"${item.nama}","${item.kategori}",${item.stok}`;
    csvContent += row + "\n";
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "data_inventaris.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Render tabel saat pertama buka
renderTable();