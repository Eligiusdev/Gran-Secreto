// app.js — lógica de todo el sitio. Se ejecuta en las 3 páginas y cada bloque solo actúa si su HTML existe.
(() => {
  // ---------- Utilidades ----------
  const $ = (sel) => document.querySelector(sel);                    // atajo para buscar un elemento
  const raiz = document.body.dataset.raiz || '';                     // '' en index.html, '../' en /pages
  const pagina = document.body.dataset.pagina;                       // nombre de la página, para marcar el menú
  const limpiar = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); // sin tildes ni mayúsculas (HU-05)
  const maps = (l) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.nombre + ' Medellín')}`; // enlace "cómo llegar"
  const categoria = (id) => CATEGORIAS.find((c) => c.id === id);     // busca una categoría por id

  // ---------- Encabezado y pie (se escriben una sola vez para las 3 páginas) ----------
  const MENU = [['inicio', 'index.html', 'Inicio'], ['categorias', 'pages/categorias.html', 'Categorías'],
                ['explorar', 'pages/explorar.html', 'Explorar'], ['favoritos', 'pages/explorar.html#favoritos', 'Favoritos']];
  // Genera los enlaces del menú; el de la página actual se resalta y lleva aria-current (accesibilidad).
  const enlaces = (base, activa) => MENU.map(([k, ruta, txt]) =>
    `<a href="${raiz}${ruta}" ${k === pagina ? 'aria-current="page"' : ''} class="${base} ${k === pagina ? activa : ''}">${txt}</a>`).join('');
  $('#encabezado').className = 'sticky top-0 z-50 bg-green-900 text-white shadow-md';
  $('#encabezado').innerHTML = `
    <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
      <a href="${raiz}index.html" class="block shrink-0" aria-label="Medellín Secreta, inicio"><img src="${raiz}img/logo.png" alt="Medellín Secreta" class="h-14 w-44 object-cover object-center md:w-52"></a>
      <nav class="hidden items-center gap-8 md:flex" aria-label="Navegación principal">${enlaces('transition-colors duration-200 hover:text-emerald-400', 'font-semibold text-emerald-400')}</nav>
      <details class="relative md:hidden"><!-- menú móvil sin JS: <details> abre y cierra solo -->
        <summary class="list-none cursor-pointer rounded-md p-2 hover:bg-green-700 [&::-webkit-details-marker]:hidden"><span class="sr-only">Abrir menú de navegación</span>
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg></summary>
        <nav class="absolute right-0 top-full mt-2 min-w-48 rounded-lg bg-green-900 p-2 shadow-lg" aria-label="Navegación móvil">${enlaces('block rounded px-4 py-2 hover:bg-green-700', 'font-semibold text-emerald-400')}</nav>
      </details>
    </div>`;
  $('#pie').className = 'bg-green-900 px-6 py-8 text-center text-white';
  $('#pie').innerHTML = `
    <a href="${raiz}index.html" class="text-lg font-bold tracking-wide">Medellín Secreta</a>
    <p class="mt-2 text-green-100">Descubre los secretos de tu ciudad.</p>
    <nav class="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Enlaces del pie de página">${enlaces('hover:text-emerald-400', '')}</nav>
    <p class="mt-6 text-sm text-green-200">&copy; ${new Date().getFullYear()} Medellín Secreta</p>`;  // el año se actualiza solo

  // Si una foto no existe, se muestra la imagen de reemplazo (fase de captura, porque "error" no burbujea).
  document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG' && !e.target.src.endsWith('placeholder.svg')) e.target.src = `${raiz}img/placeholder.svg`;
  }, true);

  // ---------- Página CATEGORÍAS: una tarjeta por categoría, generada desde datos.js ----------
  if ($('#listaCategorias')) {
    $('#listaCategorias').innerHTML = CATEGORIAS.map((c) => {
      const total = LUGARES.filter((l) => l.categoria === c.id).length; // cuántos lugares tiene
      return `<article class="flex flex-col overflow-hidden rounded-lg bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl">
        <img src="${raiz}${c.imagen}" alt="${c.nombre}" loading="lazy" class="h-48 w-full object-cover">
        <div class="flex flex-1 flex-col p-5"><h3 class="mb-2 text-xl font-bold text-green-900">${c.nombre}</h3>
          <p class="mb-3 text-gray-600">${c.texto}</p>
          <a href="explorar.html#${c.id}" class="mt-auto inline-block self-start rounded bg-green-900 px-4 py-2 text-white hover:bg-green-700" aria-label="Ver lugares de ${c.nombre}">Ver ${total} lugares</a></div></article>`;
    }).join('');
  }

  // ---------- Página EXPLORAR: catálogo, filtros, buscador, favoritos y ventana emergente ----------
  if (!$('#catalogo')) return;                                       // si no es Explorar, terminamos aquí

  const CLAVE = 'gran-secreto-favoritos';                            // nombre con el que se guarda en LocalStorage (HU-06)
  let favs;                                                          // lista de ids favoritos
  try { favs = JSON.parse(localStorage.getItem(CLAVE)) || []; } catch { favs = []; } // si el dato está dañado, empieza vacío
  const VALIDOS = ['todos', 'favoritos', ...CATEGORIAS.map((c) => c.id)];  // filtros permitidos
  const desdeHash = () => (VALIDOS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'todos'); // lee #categoria de la URL
  let filtro = desdeHash();                                          // filtro inicial
  let texto = '';                                                    // texto actual del buscador
  const modal = $('#modal');                                         // el <dialog> de la ventana emergente

  const alternarFav = (id) => {                                      // agrega o quita un favorito y lo guarda
    favs = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
    localStorage.setItem(CLAVE, JSON.stringify(favs));
    pintar();
  };
  const botonFav = (id, extra = '') => {                             // botón corazón reutilizado en tarjeta y modal
    const activo = favs.includes(id);
    return `<button data-fav="${id}" aria-pressed="${activo}" aria-label="${activo ? 'Quitar de' : 'Agregar a'} favoritos"
      class="${extra} rounded-full p-2 text-xl ${activo ? 'bg-rose-100 text-rose-600' : 'bg-white/90 text-gray-500'} shadow hover:scale-110 transition">
      <i class="bi ${activo ? 'bi-heart-fill' : 'bi-heart'}"></i></button>`;
  };
  const tarjeta = (l) => `
    <article class="relative flex flex-col overflow-hidden rounded-xl bg-white shadow-md">
      <img src="${raiz}${l.imagen}" alt="${l.nombre}" loading="lazy" class="h-44 w-full object-cover">
      ${botonFav(l.id, 'absolute right-3 top-3')}
      <div class="flex flex-1 flex-col p-5">
        <span class="text-xs font-bold uppercase text-emerald-700">${categoria(l.categoria).nombre}</span>
        <h2 class="text-lg font-bold text-emerald-900">${l.nombre}</h2>
        <p class="mb-2 text-sm text-gray-500"><i class="bi bi-geo-alt"></i> ${l.zona}</p>
        <p class="mb-3 text-gray-600">${l.descripcion}</p>
        <ul class="mb-4 flex flex-wrap gap-2">${l.tags.map((t) => `<li class="rounded-full bg-green-100 px-3 py-1 text-xs text-green-900">${t}</li>`).join('')}</ul>
        <button data-detalle="${l.id}" class="mt-auto self-start rounded bg-emerald-900 px-4 py-2 text-white hover:bg-emerald-700">Conocer más</button>
      </div></article>`;

  function pintar() {                                                // dibuja filtros + tarjetas según el estado actual
    const chips = [{ id: 'todos', nombre: 'Todos' }, ...CATEGORIAS, { id: 'favoritos', nombre: `Favoritos (${favs.length})` }];
    $('#filtros').innerHTML = chips.map((c) => `<button data-filtro="${c.id}" class="rounded-full border px-4 py-1 text-sm font-semibold ${c.id === filtro ? 'border-emerald-900 bg-emerald-900 text-white' : 'border-emerald-900 text-emerald-900 hover:bg-emerald-50'}">${c.nombre}</button>`).join('');
    const visibles = LUGARES.filter((l) =>
      (filtro === 'todos' || (filtro === 'favoritos' ? favs.includes(l.id) : l.categoria === filtro)) && // categoría o favoritos
      limpiar(l.nombre).includes(limpiar(texto)));                   // y coincide con el buscador
    $('#catalogo').innerHTML = visibles.map(tarjeta).join('');
    $('#contador').textContent = `${visibles.length} ${visibles.length === 1 ? 'lugar' : 'lugares'}`; // aria-live: lo anuncia el lector de pantalla
    $('#sinResultados').classList.toggle('hidden', visibles.length > 0); // mensaje si no hay nada (HU-05.5)
    if (modal.open) abrirModal(modal.dataset.id);                    // si el modal está abierto, refresca su corazón
  }

  function abrirModal(id) {                                          // llena y abre la ventana emergente (HU-04)
    const l = LUGARES.find((x) => x.id === id);
    modal.dataset.id = id;
    modal.innerHTML = `
      <img src="${raiz}${l.imagen}" alt="${l.nombre}" class="h-56 w-full object-cover">
      <div class="space-y-3 p-6">
        <div class="flex items-start justify-between gap-3"><h2 class="text-2xl font-bold text-emerald-900">${l.nombre}</h2>${botonFav(l.id)}</div>
        <p class="text-sm text-gray-500"><i class="bi bi-tag"></i> ${categoria(l.categoria).nombre} &nbsp; <i class="bi bi-geo-alt"></i> ${l.zona}, Medellín</p>
        <p class="text-gray-700">${l.detalle}</p>
        <ul class="flex flex-wrap gap-2">${l.tags.map((t) => `<li class="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-800">${t}</li>`).join('')}</ul>
        <div class="flex flex-wrap gap-3 pt-2">
          <a href="${maps(l)}" target="_blank" rel="noopener" class="rounded bg-emerald-900 px-4 py-2 text-white hover:bg-emerald-700"><i class="bi bi-map"></i> Cómo llegar</a>
          <button data-cerrar class="rounded border border-emerald-900 px-4 py-2 text-emerald-900 hover:bg-emerald-50">Volver al catálogo</button>
        </div></div>`;
    if (!modal.open) { modal.showModal(); document.body.classList.add('overflow-hidden'); } // showModal: fondo oscuro, foco atrapado y ESC gratis
  }

  // Un solo "oyente" para clics en toda la página (delegación): evita un listener por botón.
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-fav],[data-detalle],[data-filtro],[data-cerrar]'); // ¿se pulsó algún botón nuestro?
    if (b) {
      if (b.dataset.fav) alternarFav(b.dataset.fav);
      else if (b.dataset.detalle) abrirModal(b.dataset.detalle);
      else if (b.dataset.filtro) { filtro = b.dataset.filtro; history.replaceState(null, '', '#' + filtro); pintar(); } // guarda el filtro en la URL
      else modal.close();
    } else if (e.target === modal) modal.close();                    // clic en el fondo oscuro cierra el modal
  });
  modal.addEventListener('close', () => document.body.classList.remove('overflow-hidden')); // devuelve el scroll al cerrar
  $('#buscador').addEventListener('input', (e) => { texto = e.target.value; pintar(); });    // buscar mientras se escribe
  window.addEventListener('hashchange', () => { filtro = desdeHash(); pintar(); }); // si cambia el # (menú Favoritos), refiltra
  pintar();                                                          // primer dibujo al cargar
})();
