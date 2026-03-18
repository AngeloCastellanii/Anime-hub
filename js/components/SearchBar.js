(function () {
  class SearchBar extends HTMLElement {
    constructor() {
      super();

      this.debounceMs = 400;
      this.debounceTimer = null;

      this.root = document.createElement('section');
      this.root.className = 'search-bar';

      this.form = document.createElement('form');
      this.form.className = 'search-bar__form';

      this.label = document.createElement('label');
      this.label.className = 'visually-hidden';
      this.label.textContent = 'Buscar anime';
      this.label.setAttribute('for', 'anime-search-input');

      this.input = document.createElement('input');
      this.input.id = 'anime-search-input';
      this.input.className = 'search-bar__input';
      this.input.type = 'search';
      this.input.name = 'query';
      this.input.placeholder = 'Busca un anime...';
      this.input.autocomplete = 'off';

      this.submitButton = document.createElement('button');
      this.submitButton.type = 'submit';
      this.submitButton.className = 'search-bar__submit';
      this.submitButton.textContent = 'Buscar';

      this.form.appendChild(this.label);
      this.form.appendChild(this.input);
      this.form.appendChild(this.submitButton);
      this.root.appendChild(this.form);

      queueMicrotask(
        function () {
          if (!this.contains(this.root)) {
            this.appendChild(this.root);
          }
        }.bind(this)
      );

      this.form.addEventListener('submit', this.handleSubmit.bind(this));
      this.input.addEventListener('input', this.handleInput.bind(this));
    }

    setValue(value) {
      this.input.value = value || '';
    }

    setDebounceMs(ms) {
      this.debounceMs = typeof ms === 'number' && ms >= 0 ? ms : 400;
    }

    setDisabled(disabled) {
      this.input.disabled = Boolean(disabled);
      this.submitButton.disabled = Boolean(disabled);
    }

    getValue() {
      return this.input.value.trim();
    }

    emitDebouncedSearch() {
      this.dispatchEvent(
        new CustomEvent('search-debounced', {
          bubbles: true,
          composed: true,
          detail: { query: this.getValue() }
        })
      );
    }

    handleInput() {
      if (this.debounceTimer) {
        window.clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = window.setTimeout(
        function () {
          this.emitDebouncedSearch();
        }.bind(this),
        this.debounceMs
      );
    }

    handleSubmit(event) {
      event.preventDefault();

      if (this.debounceTimer) {
        window.clearTimeout(this.debounceTimer);
      }

      this.dispatchEvent(
        new CustomEvent('search-submit', {
          bubbles: true,
          composed: true,
          detail: { query: this.getValue() }
        })
      );
    }
  }

  if (!customElements.get('search-bar')) {
    customElements.define('search-bar', SearchBar);
  }
})();
