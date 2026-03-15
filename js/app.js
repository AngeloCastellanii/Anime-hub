(function () {
  var appState = {
    currentView: 'home'
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

  function renderView() {
    var appView = document.getElementById('app-view');
    var navBar = document.querySelector('nav-bar');

    if (!appView) {
      return;
    }

    appView.replaceChildren();

    if (appState.currentView === 'search') {
      appView.appendChild(
        createPlaceholderView(
          'Encuentra tu proximo anime',
          'Busca por nombre, explora por genero y descubre nuevas series en un solo lugar.'
        )
      );
    } else {
      appView.appendChild(
        createPlaceholderView(
          'Explora el universo del anime',
          'Descubre animes populares, sigue la temporada actual y accede rapidamente a informacion detallada de cada titulo.'
        )
      );
    }

    if (navBar && typeof navBar.setActiveView === 'function') {
      navBar.setActiveView(appState.currentView);
    }
  }

  document.addEventListener('navigate', function (event) {
    if (!event.detail || !event.detail.route) {
      return;
    }

    appState.currentView = event.detail.route;
    renderView();
  });

  document.addEventListener('DOMContentLoaded', function () {
    renderView();
  });
})();
