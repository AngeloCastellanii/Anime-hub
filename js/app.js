(function () {
  var appState = {
    currentView: null,
    previousView: 'home',
    currentDetailId: null
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

  function renderHomeView(appView) {
    appView.appendChild(
      createPlaceholderView(
        'Explora el universo del anime',
        'Descubre animes populares, sigue la temporada actual y accede rapidamente a informacion detallada de cada titulo.'
      )
    );
  }

  function renderSearchView(appView) {
    appView.appendChild(
      createPlaceholderView(
        'Encuentra tu proximo anime',
        'Busca por nombre, explora por genero y descubre nuevas series en un solo lugar.'
      )
    );
  }

  function renderDetailView(appView, detailId) {
    var detail = document.createElement('anime-detail');

    detail.data = {
      mal_id: detailId,
      title: 'Anime #' + detailId,
      synopsis: 'Vista de detalle base activa. En el siguiente bloque conectaremos este componente con la API.',
      genres: []
    };

    appView.appendChild(detail);
  }

  function renderView() {
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
      renderDetailView(appView, appState.currentDetailId);
    } else {
      renderHomeView(appView);
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
