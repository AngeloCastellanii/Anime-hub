(function () {
  class ErrorState extends HTMLElement {
    constructor() {
      super();

      this.titleText = 'No se pudo completar la operacion';
      this.message = 'Ocurrio un error al cargar la informacion.';

      this.root = document.createElement('section');
      this.root.className = 'error-state';

      this.panel = document.createElement('div');
      this.panel.className = 'error-state__panel';
      this.panel.setAttribute('role', 'alert');

      this.title = document.createElement('strong');
      this.title.textContent = this.titleText;

      this.text = document.createElement('p');
      this.text.textContent = this.message;

      this.retryButton = document.createElement('button');
      this.retryButton.type = 'button';
      this.retryButton.className = 'error-state__retry';
      this.retryButton.textContent = 'Reintentar';

      this.panel.appendChild(this.title);
      this.panel.appendChild(this.text);
      this.panel.appendChild(this.retryButton);
      this.root.appendChild(this.panel);
      this.appendChild(this.root);

      this.retryButton.addEventListener('click', this.handleRetry.bind(this));
    }

    handleRetry() {
      this.dispatchEvent(
        new CustomEvent('retry', {
          bubbles: true,
          composed: true
        })
      );
    }

    setMessage(message) {
      this.message = message || 'Ocurrio un error al cargar la informacion.';
      this.text.textContent = this.message;
    }

    setTitle(title) {
      this.titleText = title || 'No se pudo completar la operacion';
      this.title.textContent = this.titleText;
    }

    setCanRetry(canRetry) {
      this.retryButton.hidden = !canRetry;
    }
  }

  if (!customElements.get('error-state')) {
    customElements.define('error-state', ErrorState);
  }
})();
