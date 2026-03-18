(function () {
  class GenreFilter extends HTMLElement {
    constructor() {
      super();

      this.genres = [];

      this.root = document.createElement('section');
      this.root.className = 'genre-filter';

      this.inner = document.createElement('div');
      this.inner.className = 'genre-filter__inner';

      this.label = document.createElement('label');
      this.label.textContent = 'Genero';
      this.label.setAttribute('for', 'genre-select');

      this.select = document.createElement('select');
      this.select.id = 'genre-select';
      this.select.className = 'genre-filter__select';

      this.inner.appendChild(this.label);
      this.inner.appendChild(this.select);
      this.root.appendChild(this.inner);

      queueMicrotask(
        function () {
          if (!this.contains(this.root)) {
            this.appendChild(this.root);
          }
        }.bind(this)
      );

      this.select.addEventListener('change', this.handleChange.bind(this));

      this.render();
    }

    set data(genres) {
      this.genres = Array.isArray(genres) ? genres : [];
      this.render();
    }

    setValue(value) {
      this.select.value = value || '';
    }

    getValue() {
      return this.select.value || '';
    }

    setDisabled(disabled) {
      this.select.disabled = Boolean(disabled);
    }

    handleChange() {
      this.dispatchEvent(
        new CustomEvent('genre-change', {
          bubbles: true,
          composed: true,
          detail: { genreId: this.select.value }
        })
      );
    }

    render() {
      var defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Todos los generos';

      this.select.replaceChildren(defaultOption);

      this.genres.forEach(
        function (genre) {
          var option = document.createElement('option');
          option.value = genre.mal_id || '';
          option.textContent = genre.name || 'Genero';
          this.select.appendChild(option);
        }.bind(this)
      );
    }
  }

  if (!customElements.get('genre-filter')) {
    customElements.define('genre-filter', GenreFilter);
  }
})();
