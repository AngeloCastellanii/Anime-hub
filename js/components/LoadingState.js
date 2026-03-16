(function () {
  class LoadingState extends HTMLElement {
    constructor() {
      super();

      this.titleText = 'Cargando';
      this.message = 'Cargando contenido...';

      this.root = document.createElement('section');
      this.root.className = 'loading-state';

      this.panel = document.createElement('div');
      this.panel.className = 'loading-state__panel';
      this.panel.setAttribute('role', 'status');
      this.panel.setAttribute('aria-live', 'polite');

      this.title = document.createElement('strong');
      this.title.textContent = this.titleText;

      this.text = document.createElement('p');
      this.text.textContent = this.message;

      this.panel.appendChild(this.title);
      this.panel.appendChild(this.text);
      this.root.appendChild(this.panel);
      this.appendChild(this.root);
    }

    setTitle(title) {
      this.titleText = title || 'Cargando';
      this.title.textContent = this.titleText;
    }

    setMessage(message) {
      this.message = message || 'Cargando contenido...';
      this.text.textContent = this.message;
    }
  }

  if (!customElements.get('loading-state')) {
    customElements.define('loading-state', LoadingState);
  }
})();
