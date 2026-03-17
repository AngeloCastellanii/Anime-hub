(function () {
  var appState = {
    currentView: null,
    previousView: 'home',
    currentDetailId: null,
    renderToken: 0,
    pendingSearchQuery: ''
  };

  function createPlaceholderView(title, description) {
    var section = document.createElement('section');
    section.className = 'panel hero-panel';

    var heading = document.createElement('h1');
    heading.textContent = title;

    var text = document.createElement('p');
    text.textContent = description;

    section.appendChild(heading);
    section.appendChild(text);

    return section;
  }

  function normalizeHash(rawHash) {
    var cleanHash = (rawHash || '').replace(/^#/, '').trim();

    if (!cleanHash) {
      return { view: 'home', detailId: null, hash: '#home' };
    }

    if (cleanHash === 'home') {
      return { view: 'home', detailId: null, hash: '#home' };
    }

    if (cleanHash === 'search') {
      return { view: 'search', detailId: null, hash: '#search' };
    }

    if (cleanHash.indexOf('detail/') === 0) {
      var detailId = cleanHash.slice('detail/'.length).trim();

      if (detailId) {
        return { view: 'detail', detailId: detailId, hash: '#detail/' + detailId };
      }
    }

    return null;
  }

  function navigateTo(route, replace) {
    var targetHash = route.charAt(0) === '#' ? route : '#' + route;

    if (replace) {
      var nextUrl = window.location.pathname + window.location.search + targetHash;
      window.history.replaceState(null, '', nextUrl);
      return;
    }

    if (window.location.hash === targetHash) {
      handleRouteChange();
      return;
    }

    window.location.hash = targetHash;
  }

  function getFriendlyErrorMessage(error) {
    if (!error || !error.type) {
      return 'Ocurrio un error inesperado. Intenta nuevamente.';
    }

    if (error.type === 'timeout') {
      return 'La solicitud tardo demasiado. Revisa tu conexion e intenta otra vez.';
    }

    if (error.type === 'network') {
      return 'No fue posible conectar con la API. Verifica tu conexion.';
    }

    if (error.type === 'http') {
      return 'La API devolvio una respuesta no valida. Intenta nuevamente en unos segundos.';
    }

    if (error.type === 'rate-limit') {
      return 'Se alcanzo el limite temporal de Jikan. Espera unos segundos y vuelve a intentar.';
    }

    if (error.type === 'validation') {
      return error.message || 'Los datos de entrada no son validos.';
    }

    if (error.type === 'cancelled') {
      return 'La solicitud anterior fue cancelada.';
    }

    return 'Ocurrio un error inesperado. Intenta nuevamente.';
  }

  function createLoadingState(title, message) {
    var loading = document.createElement('loading-state');

    if (typeof loading.setTitle === 'function') {
      loading.setTitle(title || 'Cargando');
    }

    if (typeof loading.setMessage === 'function') {
      loading.setMessage(message || 'Cargando contenido...');
    }

    return loading;
  }

  function createErrorState(title, message, onRetry) {
    var errorState = document.createElement('error-state');

    if (typeof errorState.setTitle === 'function') {
      errorState.setTitle(title || 'No se pudo completar la operacion');
    }

    if (typeof errorState.setMessage === 'function') {
      errorState.setMessage(message || 'Ocurrio un error al cargar la informacion.');
    }

    if (typeof errorState.setCanRetry === 'function') {
      errorState.setCanRetry(typeof onRetry === 'function');
    }

    if (typeof onRetry === 'function') {
      errorState.addEventListener('retry', function () {
        onRetry();
      });
    }

    return errorState;
  }

  function createHomeHero() {
    var hero = createPlaceholderView(
      'Explora el universo del anime',
      'Descubre animes populares, sigue la temporada actual y accede rapidamente a informacion detallada de cada titulo.'
    );
    var searchBar = document.createElement('search-bar');

    searchBar.addEventListener('search-submit', function (event) {
      var query = event.detail && event.detail.query ? event.detail.query : '';
      appState.pendingSearchQuery = query;
      navigateTo('search', false);
    });

    hero.classList.add('home-hero');
    hero.appendChild(searchBar);
    return hero;
  }

  function createTopAnimeSection(animes) {
    var wrapper = document.createElement('section');
    wrapper.className = 'panel hero-panel home-section';

    var heading = document.createElement('h2');
    heading.textContent = 'Top Anime';

    var subtitle = document.createElement('p');
    subtitle.textContent = 'Ranking de titulos populares desde MyAnimeList. Total: ' + animes.length;

    var grid = document.createElement('anime-grid');
    grid.setEmptyMessage('La API respondio sin resultados para Top Anime.');
    grid.data = animes;

    wrapper.appendChild(heading);
    wrapper.appendChild(subtitle);
    wrapper.appendChild(grid);

    return wrapper;
  }

  function getCurrentSeasonLabel() {
    var now = new Date();
    var month = now.getMonth() + 1;
    var year = now.getFullYear();

    if (month >= 3 && month <= 5) {
      return 'Primavera ' + year;
    }

    if (month >= 6 && month <= 8) {
      return 'Verano ' + year;
    }

    if (month >= 9 && month <= 11) {
      return 'Otono ' + year;
    }

    return 'Invierno ' + year;
  }

  function createSectionShell(title, subtitleText) {
    var wrapper = document.createElement('section');
    wrapper.className = 'panel hero-panel home-section';

    var heading = document.createElement('h2');
    heading.textContent = title;

    var subtitle = document.createElement('p');
    subtitle.textContent = subtitleText;

    var body = document.createElement('div');
    body.className = 'home-section__body';

    wrapper.appendChild(heading);
    wrapper.appendChild(subtitle);
    wrapper.appendChild(body);

    return {
      wrapper: wrapper,
      body: body
    };
  }

  function createSectionError(title, message) {
    var shell = createSectionShell(title, '');
    var errorState = createErrorState('No se pudo cargar esta seccion', message, function () {
      renderView();
    });

    shell.body.appendChild(errorState);
    return shell.wrapper;
  }

  function createSeasonSection(animes) {
    var seasonName = getCurrentSeasonLabel();
    var shell = createSectionShell('Temporada actual', seasonName);
    var row = document.createElement('div');
    var items = Array.isArray(animes) ? animes : [];
    var subtitle = document.createElement('p');

    row.className = 'home-season-row';
    subtitle.className = 'home-section__meta';
    subtitle.textContent = 'Resultados de temporada: ' + items.length;

    shell.body.appendChild(subtitle);

    items.slice(0, 6).forEach(function (anime) {
      var card = document.createElement('anime-card');
      card.classList.add('home-season-row__card');
      card.data = anime;
      row.appendChild(card);
    });

    if (!row.children.length) {
      var empty = document.createElement('p');
      empty.className = 'anime-grid__empty';
      empty.textContent = 'No hay animes de temporada disponibles por ahora.';
      shell.body.appendChild(empty);
      return shell.wrapper;
    }

    shell.body.appendChild(row);
    return shell.wrapper;
  }

  async function renderHomeView(appView, renderToken) {
    var hero = createHomeHero();
    var topLoadingShell = createSectionShell('Top Anime', 'Ranking de titulos populares desde MyAnimeList.');
    var seasonLoadingShell = createSectionShell('Temporada actual', getCurrentSeasonLabel());
    var topLoading = createLoadingState('Cargando Top Anime', 'Consultando animes populares...');
    var seasonLoading = createLoadingState('Cargando temporada', 'Consultando animes en emision...');

    topLoadingShell.body.appendChild(topLoading);
    seasonLoadingShell.body.appendChild(seasonLoading);
    appView.appendChild(hero);
    appView.appendChild(topLoadingShell.wrapper);
    appView.appendChild(seasonLoadingShell.wrapper);

    if (!window.AnimeHubApi || typeof window.AnimeHubApi.getTopAnime !== 'function') {
      appView.replaceChildren(
        hero,
        createErrorState('Servicio no disponible', 'No se encontro el servicio de API.', null)
      );
      return;
    }

    try {
      var results = await Promise.allSettled([
        window.AnimeHubApi.getTopAnime({ limit: 12, timeoutMs: 10000 }),
        window.AnimeHubApi.getCurrentSeasonAnime({ limit: 6, timeoutMs: 10000 })
      ]);

      if (appState.renderToken !== renderToken || appState.currentView !== 'home') {
        return;
      }

      var topResult = results[0];
      var seasonResult = results[1];
      var topItems = topResult.status === 'fulfilled' && Array.isArray(topResult.value) ? topResult.value : [];
      var seasonItems = seasonResult.status === 'fulfilled' && Array.isArray(seasonResult.value) ? seasonResult.value : [];
      var topSection =
        topResult.status === 'fulfilled'
          ? createTopAnimeSection(topItems)
          : createSectionError('Top Anime', getFriendlyErrorMessage(topResult.reason));
      var seasonSection =
        seasonResult.status === 'fulfilled'
          ? createSeasonSection(seasonItems)
          : createSectionError('Temporada actual', getFriendlyErrorMessage(seasonResult.reason));

      appView.replaceChildren(hero, topSection, seasonSection);
    } catch (error) {
      if (appState.renderToken !== renderToken || appState.currentView !== 'home') {
        return;
      }

      if (error && error.type === 'cancelled') {
        return;
      }

      appView.replaceChildren(
        hero,
        createErrorState('Error cargando portada', getFriendlyErrorMessage(error), function () {
          renderView();
        })
      );
    }
  }

  function renderSearchView(appView) {
    var container = createPlaceholderView(
      'Encuentra tu proximo anime',
      'Busca por nombre, explora por genero y descubre nuevas series en un solo lugar.'
    );
    var searchBar = document.createElement('search-bar');

    if (typeof searchBar.setValue === 'function') {
      searchBar.setValue(appState.pendingSearchQuery || '');
    }

    searchBar.addEventListener('search-submit', function (event) {
      var query = event.detail && event.detail.query ? event.detail.query : '';
      appState.pendingSearchQuery = query;
    });

    container.appendChild(searchBar);
    appView.appendChild(container);
  }

  async function renderDetailView(appView, detailId, renderToken) {
    var loading = createLoadingState('Cargando detalle', 'Consultando informacion completa del anime...');

    appView.appendChild(loading);

    if (!window.AnimeHubApi || typeof window.AnimeHubApi.getAnimeDetail !== 'function') {
      appView.replaceChildren(
        createErrorState('Servicio no disponible', 'No se encontro el servicio de API.', function () {
          renderView();
        })
      );
      return;
    }

    try {
      var detailData = await window.AnimeHubApi.getAnimeDetail(detailId, { timeoutMs: 10000 });

      if (appState.renderToken !== renderToken || appState.currentView !== 'detail') {
        return;
      }

      var detail = document.createElement('anime-detail');
      detail.data = detailData || { mal_id: detailId, title: 'Anime #' + detailId, synopsis: 'Sin datos disponibles.', genres: [] };

      appView.replaceChildren(detail);
    } catch (error) {
      if (appState.renderToken !== renderToken || appState.currentView !== 'detail') {
        return;
      }

      if (error && error.type === 'cancelled') {
        return;
      }

      appView.replaceChildren(
        createErrorState('Error cargando detalle', getFriendlyErrorMessage(error), function () {
          renderView();
        })
      );
    }
  }

  function renderView() {
    var renderToken = ++appState.renderToken;
    var appView = document.getElementById('app-view');
    var navBar = document.querySelector('nav-bar');
    var navView = appState.currentView === 'detail' ? appState.previousView : appState.currentView;

    if (!appView) {
      return;
    }

    appView.replaceChildren();

    if (appState.currentView === 'search') {
      renderSearchView(appView);
    } else if (appState.currentView === 'detail') {
      renderDetailView(appView, appState.currentDetailId, renderToken);
    } else {
      renderHomeView(appView, renderToken);
    }

    if (navBar && typeof navBar.setActiveView === 'function') {
      navBar.setActiveView(navView || 'home');
    }
  }

  function syncStateWithRoute(routeInfo) {
    if (routeInfo.view === 'detail') {
      if (appState.currentView && appState.currentView !== 'detail') {
        appState.previousView = appState.currentView;
      }
      appState.currentDetailId = routeInfo.detailId;
    } else {
      appState.previousView = routeInfo.view;
      appState.currentDetailId = null;
    }

    appState.currentView = routeInfo.view;
  }

  function handleRouteChange() {
    var routeInfo = normalizeHash(window.location.hash);

    if (!routeInfo) {
      navigateTo('home', true);
      routeInfo = { view: 'home', detailId: null, hash: '#home' };
    }

    if (window.location.hash !== routeInfo.hash) {
      navigateTo(routeInfo.hash, true);
    }

    syncStateWithRoute(routeInfo);
    renderView();
  }

  document.addEventListener('navigate', function (event) {
    if (!event.detail || !event.detail.route) {
      return;
    }

    navigateTo(event.detail.route, false);
  });

  document.addEventListener('go-back', function () {
    var fallbackView = appState.previousView || 'home';

    if (appState.currentView === 'detail') {
      navigateTo(fallbackView, false);
    }
  });

  document.addEventListener('card-click', function (event) {
    if (!event.detail || !event.detail.id) {
      return;
    }

    navigateTo('detail/' + event.detail.id, false);
  });

  window.addEventListener('hashchange', function () {
    handleRouteChange();
  });

  document.addEventListener('DOMContentLoaded', function () {
    handleRouteChange();
  });
})();
