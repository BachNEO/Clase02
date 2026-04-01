const API_BASE = 'http://127.0.0.1:8000';
const protectedTabs = ['servicios', 'mascotas', 'reporte'];
let currentUserEmail = null;

const tabLinks = Array.from(document.querySelectorAll('.sidebar-nav a'));
const sections = Array.from(document.querySelectorAll('.section'));

const userBadge = document.querySelector('.user-badge span');
const logoutBtn = document.getElementById('logout-btn');
const reportEmailInput = document.getElementById('report-email');

function showAlert(container, message, type = 'success', duration = 3300) {
  if (!container) return;
  const existing = container.querySelector('.alert');
  if (existing) existing.remove();

  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  container.appendChild(alert);

  setTimeout(() => {
    alert.remove();
  }, duration);
}

function setActiveSection(tabName) {
  sections.forEach((sec) => {
    sec.classList.remove('active');
  });
  const target = document.getElementById(tabName);
  if (target) {
    target.classList.add('active');
  }
}

function lockProtectedTabs() {
  protectedTabs.forEach((name) => {
    const link = tabLinks.find((a) => a.dataset.tab === name);
    if (link) {
      link.classList.add('locked');
      link.dataset.locked = 'true';
    }
  });
}

function unlockProtectedTabs() {
  protectedTabs.forEach((name) => {
    const link = tabLinks.find((a) => a.dataset.tab === name);
    if (link) {
      link.classList.remove('locked');
      delete link.dataset.locked;
    }
  });
}

function switchTab(tabName) {
  const targetLink = tabLinks.find((a) => a.dataset.tab === tabName);
  if (!targetLink) return;

  const isProtected = protectedTabs.includes(tabName);
  if (isProtected && !currentUserEmail) {
    showAlert(document.querySelector(`#${tabName}`) || document.querySelector('main'), 'Debes iniciar sesión para acceder a esta sección.', 'error');
    return;
  }

  tabLinks.forEach((a) => a.classList.remove('active'));
  targetLink.classList.add('active');
  setActiveSection(tabName);

  if (tabName === 'servicios') {
    loadServices();
  }

  if (tabName === 'mascotas') {
    loadPets();
  }

  if (tabName === 'reporte') {
    if (currentUserEmail) {
      reportEmailInput.value = currentUserEmail;
      fetchReport(currentUserEmail);
    }
  }
}

function onLoginSuccess(email) {
  currentUserEmail = email;
  userBadge.textContent = `Usuario: ${email}`;
  logoutBtn.style.display = 'block';
  unlockProtectedTabs();
  showAlert(document.querySelector('#acceso'), 'Ingreso exitoso. ¡Bienvenido!', 'success');
  switchTab('servicios');
}

function logout() {
  currentUserEmail = null;
  userBadge.textContent = 'Usuario: Invitado';
  lockProtectedTabs();
  logoutBtn.style.display = 'none';
  switchTab('acceso');
  showAlert(document.querySelector('#acceso'), 'Sesión cerrada.', 'success');
}

async function loadServices() {
  const list = document.getElementById('services-ul');
  const select = document.getElementById('pet-service');
  if (!list || !select) return;

  try {
    const res = await fetch(`${API_BASE}/servicios`);
    if (!res.ok) throw new Error('No se pudieron cargar servicios');
    const data = await res.json();
    const items = Array.isArray(data.servicios) ? data.servicios : [];

    list.innerHTML = '';
    select.innerHTML = '<option value="">Seleccionar servicio</option>';

    items.forEach((servicio) => {
      const li = document.createElement('li');
      li.textContent = `${servicio.nombre} - $${servicio.precio}`;
      list.appendChild(li);
      const option = document.createElement('option');
      option.value = servicio.nombre;
      option.textContent = `${servicio.nombre} ($${servicio.precio})`;
      select.appendChild(option);
    });
  } catch (err) {
    showAlert(document.querySelector('#servicios'), err.message, 'error');
  }
}

async function loadPets() {
  if (!currentUserEmail) return;
  try {
    const res = await fetch(`${API_BASE}/mascotas/${encodeURIComponent(currentUserEmail)}`);
    if (!res.ok) throw new Error('No se pudo obtener las mascotas');
    const data = await res.json();
    const pets = Array.isArray(data.mascotas) ? data.mascotas : [];

    let container = document.getElementById('pet-cards-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'pet-cards-container';
      container.style.marginTop = '1rem';
      const mascotasSection = document.getElementById('mascotas');
      mascotasSection.appendChild(container);
    }

    renderPetCards(pets, container);
  } catch (err) {
    showAlert(document.querySelector('#mascotas'), err.message, 'error');
  }
}

function renderPetCards(pets, container) {
  container.innerHTML = '';
  if (!pets.length) {
    container.textContent = 'No se encontraron mascotas.';
    return;
  }

  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
  grid.style.gap = '0.8rem';

  pets.forEach((pet) => {
    const card = document.createElement('article');
    card.style.background = '#fff';
    card.style.border = '1px solid #dce4eb';
    card.style.borderRadius = '10px';
    card.style.boxShadow = '0 3px 12px rgba(16, 42, 67, 0.08)';
    card.style.padding = '0.8rem';

    card.innerHTML = `
      <h4 style="margin:0 0 0.35rem;">${pet.nombre}</h4>
      <p style="margin: 0.2rem 0;"><strong>Propietario:</strong> ${pet.correo}</p>
      <p style="margin: 0.2rem 0;"><strong>Servicio:</strong> ${pet.tipo_servicio || pet.servicio || '-'}</p>
      <p style="margin: 0.2rem 0;"><strong>Fecha:</strong> ${pet.fecha || '-'}</p>
    `;
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

async function fetchReport(correo) {
  if (!correo) return;
  try {
    const res = await fetch(`${API_BASE}/reporte/${encodeURIComponent(correo)}`);
    if (!res.ok) throw new Error('No se pudo cargar el reporte');
    const data = await res.json();
    renderReport(data);
  } catch (err) {
    showAlert(document.querySelector('#reporte'), err.message, 'error');
  }
}

function renderReport({ cantidad_servicios, total_gastado, servicios = [], correo = '' }) {
  const output = document.getElementById('report-output');
  if (!output) return;

  output.innerHTML = '';

  const stats = document.createElement('div');
  stats.style.display = 'flex';
  stats.style.gap = '0.6rem';
  stats.style.flexWrap = 'wrap';

  const statTemplate = (label, value) => {
    const stat = document.createElement('div');
    stat.style.flex = '1';
    stat.style.minWidth = '160px';
    stat.style.background = '#fff';
    stat.style.border = '1px solid #dce4eb';
    stat.style.borderRadius = '10px';
    stat.style.padding = '0.85rem';
    stat.innerHTML = `<strong>${label}</strong><p style="margin:0.35rem 0 0; font-size:1.15rem;">${value}</p>`;
    return stat;
  };

  stats.appendChild(statTemplate('Cantidad de servicios', cantidad_servicios ?? 0));
  stats.appendChild(statTemplate('Total gastado', `$${(total_gastado ?? 0).toFixed(2)}`));
  stats.appendChild(statTemplate('Correo', correo || '--'));

  const tagsBox = document.createElement('div');
  tagsBox.style.marginTop = '0.8rem';
  tagsBox.innerHTML = '<strong>Servicios usados:</strong>';

  const tags = document.createElement('div');
  tags.style.display = 'flex';
  tags.style.flexWrap = 'wrap';
  tags.style.gap = '0.45rem';
  tags.style.marginTop = '0.4rem';

  if (servicios.length) {
    servicios.forEach((s) => {
      const tag = document.createElement('span');
      tag.textContent = typeof s === 'string' ? s : s.nombre || JSON.stringify(s);
      tag.style.background = '#e0f2fe';
      tag.style.color = '#0369a1';
      tag.style.padding = '0.25rem 0.5rem';
      tag.style.borderRadius = '999px';
      tag.style.fontSize = '0.84rem';
      tags.appendChild(tag);
    });
  } else {
    tags.innerHTML = '<span style="color:#64748b;">Sin servicios reportados.</span>';
  }

  tagsBox.appendChild(tags);
  output.appendChild(stats);
  output.appendChild(tagsBox);
}

async function callApi(method, path, body) {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const errMsg = errorBody?.detail || errorBody?.mensaje || `${res.status} ${res.statusText}`;
    throw new Error(errMsg);
  }

  return res.json();
}

function setInitialState() {
  lockProtectedTabs();
  logoutBtn.style.display = 'none';
  userBadge.textContent = 'Usuario: Invitado';

  // initial default tab
  const inicioTab = tabLinks.find((a) => a.dataset.tab === 'inicio');
  tabLinks.forEach((a) => a.classList.remove('active'));
  if (inicioTab) {
    inicioTab.classList.add('active');
  }
  setActiveSection('inicio');

  tabLinks.forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = a.dataset.tab;
      switchTab(tab);
    });
  });

  const greetingForm = document.querySelector('.greeting-form');
  greetingForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('user-name').value.trim();
    if (!name) {
      showAlert(greetingForm, 'Ingresa tu nombre.', 'error');
      return;
    }
    showAlert(greetingForm, `Hola, ${name}! Bienvenido a PetCare.`, 'success');
  });

  const registerForm = document.querySelector('.register-form');
  registerForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const correo = document.getElementById('register-email').value.trim();
    const contrasena = document.getElementById('register-password').value.trim();
    if (!correo || !contrasena) {
      showAlert(registerForm, 'Completa correo y contraseña.', 'error');
      return;
    }
    try {
      await callApi('POST', '/register', { correo, contrasena });
      showAlert(registerForm, 'Registro exitoso, por favor inicia sesión.', 'success');
      registerForm.reset();
    } catch (err) {
      showAlert(registerForm, err.message, 'error');
    }
  });

  const loginForm = document.querySelector('.login-form');
  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const correo = document.getElementById('login-email').value.trim();
    const contrasena = document.getElementById('login-password').value.trim();
    if (!correo || !contrasena) {
      showAlert(loginForm, 'Completa correo y contraseña.', 'error');
      return;
    }
    try {
      await callApi('POST', '/login', { correo, contrasena });
      loginForm.reset();
      onLoginSuccess(correo);
    } catch (err) {
      showAlert(loginForm, err.message, 'error');
    }
  });

  const serviceForm = document.querySelector('.add-service-form');
  serviceForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const nombre = document.getElementById('service-name').value.trim();
    const precio = parseFloat(document.getElementById('service-price').value);
    if (!nombre || Number.isNaN(precio) || precio <= 0) {
      showAlert(serviceForm, 'Datos de servicio inválidos.', 'error');
      return;
    }
    try {
      await callApi('POST', '/agregar-servicio', { nombre, precio });
      showAlert(serviceForm, 'Servicio agregado correctamente.', 'success');
      serviceForm.reset();
      await loadServices();
    } catch (err) {
      showAlert(serviceForm, err.message, 'error');
    }
  });

  const petForm = document.querySelector('.register-pet-form');
  petForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const correo = document.getElementById('pet-email').value.trim();
    const nombre = document.getElementById('pet-name').value.trim();
    const tipo_servicio = document.getElementById('pet-service').value.trim();
    const fecha = document.getElementById('pet-date').value;
    if (!correo || !nombre || !tipo_servicio || !fecha) {
      showAlert(petForm, 'Completa todos los datos de la mascota.', 'error');
      return;
    }
    try {
      await callApi('POST', '/registrar-mascota', { correo, nombre, tipo_servicio, fecha });
      showAlert(petForm, 'Mascota registrada exitosamente.', 'success');
      petForm.reset();
      if (correo === currentUserEmail) {
        await loadPets();
      }
    } catch (err) {
      showAlert(petForm, err.message, 'error');
    }
  });

  const searchBtn = document.getElementById('search-pet-btn');
  searchBtn?.addEventListener('click', async (event) => {
    event.preventDefault();
    const searchTerm = document.getElementById('search-pet').value.trim().toLowerCase();
    if (!currentUserEmail) {
      showAlert(document.querySelector('#mascotas'), 'Debes iniciar sesión para buscar mascotas.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/mascotas/${encodeURIComponent(currentUserEmail)}`);
      if (!res.ok) throw new Error('Error al buscar mascotas');
      const data = await res.json();
      const pets = Array.isArray(data.mascotas) ? data.mascotas : [];
      const filtered = pets.filter((pet) => pet.nombre.toLowerCase().includes(searchTerm));
      let container = document.getElementById('pet-cards-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'pet-cards-container';
        container.style.marginTop = '1rem';
        document.getElementById('mascotas').appendChild(container);
      }
      renderPetCards(filtered, container);
      showAlert(document.querySelector('#mascotas'), `Mascotas encontradas: ${filtered.length}`, 'success');
    } catch (err) {
      showAlert(document.querySelector('#mascotas'), err.message, 'error');
    }
  });

  const reportBtn = document.getElementById('generate-report-btn');
  reportBtn?.addEventListener('click', async (event) => {
    event.preventDefault();
    const email = reportEmailInput.value.trim();
    if (!email) {
      showAlert(document.querySelector('#reporte'), 'Debes ingresar un correo.', 'error');
      return;
    }
    await fetchReport(email);
  });

  logoutBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });

  // Carga inicial.
  loadServices();
}

setInitialState();
