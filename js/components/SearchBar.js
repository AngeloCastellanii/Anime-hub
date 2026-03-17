(function () {
  class SearchBar extends HTMLElement {
    constructor() {
      super();

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
    }

    setValue(value) {
      this.input.value = value || '';
    }

    handleSubmit(event) {
      event.preventDefault();

      this.dispatchEvent(
        new CustomEvent('search-submit', {
          bubbles: true,
          composed: true,
          detail: { query: this.input.value.trim() }
        })
      );
    }
  }

  if (!customElements.get('search-bar')) {
    customElements.define('search-bar', SearchBar);
  }
})();
