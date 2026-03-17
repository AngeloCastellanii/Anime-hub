(function () {
  function createNavButton(label, route) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'navbar__link';
    button.textContent = label;
    button.dataset.route = route;
    return button;
  }

  class NavBar extends HTMLElement {
    constructor() {
      super();

      this.activeView = 'home';

      this.root = document.createElement('header');
      this.root.className = 'navbar';

      this.content = document.createElement('div');
      this.content.className = 'navbar__content';

      this.brandButton = document.createElement('button');
      this.brandButton.type = 'button';
      this.brandButton.className = 'navbar__brand';
      this.brandButton.textContent = 'AnimeHub';

      this.nav = document.createElement('nav');
      this.nav.className = 'navbar__nav';
      this.nav.setAttribute('aria-label', 'Navegacion principal');

      this.homeButton = createNavButton('Inicio', 'home');
      this.searchButton = createNavButton('Busqueda', 'search');

      this.nav.appendChild(this.homeButton);
      this.nav.appendChild(this.searchButton);
      this.content.appendChild(this.brandButton);
      this.content.appendChild(this.nav);
      this.root.appendChild(this.content);

      queueMicrotask(
        function () {
          if (!this.contains(this.root)) {
            this.appendChild(this.root);
          }
        }.bind(this)
      );

      this.brandButton.addEventListener('click', this.handleNavigate.bind(this, 'home'));
      this.homeButton.addEventListener('click', this.handleNavigate.bind(this, 'home'));
      this.searchButton.addEventListener('click', this.handleNavigate.bind(this, 'search'));

      this.render();
    }

    handleNavigate(route) {
      this.dispatchEvent(
        new CustomEvent('navigate', {
          bubbles: true,
          composed: true,
          detail: { route: route }
        })
      );
    }

    setActiveView(viewName) {
      this.activeView = viewName || 'home';
      this.render();
    }

    render() {
      this.homeButton.classList.toggle('is-active', this.activeView === 'home');
      this.searchButton.classList.toggle('is-active', this.activeView === 'search');
      this.homeButton.setAttribute('aria-current', this.activeView === 'home' ? 'page' : 'false');
      this.searchButton.setAttribute('aria-current', this.activeView === 'search' ? 'page' : 'false');
    }
  }

  if (!customElements.get('nav-bar')) {
    customElements.define('nav-bar', NavBar);
  }
})();
