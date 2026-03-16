(function () {
  var appState = {
    currentView: null,
    previousView: 'home',
    currentDetailId: null,
    renderToken: 0
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
    return createPlaceholderView(
      'Explora el universo del anime',
      'Descubre animes populares, sigue la temporada actual y accede rapidamente a informacion detallada de cada titulo.'
    );
  }

  function createTopAnimeSection(animes) {
    var wrapper = document.createElement('section');
    wrapper.className = 'panel hero-panel';

    var heading = document.createElement('h2');
    heading.textContent = 'Top Anime';

    var subtitle = document.createElement('p');
    subtitle.textContent = 'Ranking de titulos populares desde MyAnimeList.';

    var grid = document.createElement('anime-grid');
    grid.data = animes;

    wrapper.appendChild(heading);
    wrapper.appendChild(subtitle);
    wrapper.appendChild(grid);

    return wrapper;
  }

  async function renderHomeView(appView, renderToken) {
    var loading = createLoadingState('Cargando portada', 'Consultando animes populares...');

    appView.appendChild(createHomeHero());
    appView.appendChild(loading);

    if (!window.AnimeHubApi || typeof window.AnimeHubApi.getTopAnime !== 'function') {
      appView.replaceChildren(
        createHomeHero(),
        createErrorState('Servicio no disponible', 'No se encontro el servicio de API.', null)
      );
      return;
    }

    try {
      var topAnime = await window.AnimeHubApi.getTopAnime({ limit: 12, timeoutMs: 10000 });

      if (appState.renderToken !== renderToken || appState.currentView !== 'home') {
        return;
      }

      appView.replaceChildren(createHomeHero(), createTopAnimeSection(topAnime));
    } catch (error) {
      if (appState.renderToken !== renderToken || appState.currentView !== 'home') {
        return;
      }

      if (error && error.type === 'cancelled') {
        return;
      }

      appView.replaceChildren(
        createHomeHero(),
        createErrorState('Error cargando portada', getFriendlyErrorMessage(error), function () {
          renderView();
        })
      );
    }
  }

  function renderSearchView(appView) {
    appView.appendChild(
      createPlaceholderView(
        'Encuentra tu proximo anime',
        'Busca por nombre, explora por genero y descubre nuevas series en un solo lugar.'
      )
    );
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

    if (window.AnimeHubApi && typeof window.AnimeHubApi.cancelAllRequests === 'function') {
      window.AnimeHubApi.cancelAllRequests();
    }

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
