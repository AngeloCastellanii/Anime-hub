(function () {
  class AnimeGrid extends HTMLElement {
    constructor() {
      super();

      this.items = [];
      this.emptyMessage = 'Todavia no hay animes para mostrar.';

      this.root = document.createElement('section');
      this.root.className = 'anime-grid';

      this.content = document.createElement('div');
      this.content.className = 'anime-grid__content';

      this.empty = document.createElement('p');
      this.empty.className = 'anime-grid__empty';
      this.empty.textContent = this.emptyMessage;

      this.root.appendChild(this.empty);
      this.root.appendChild(this.content);

      queueMicrotask(
        function () {
          if (!this.contains(this.root)) {
            this.appendChild(this.root);
          }
        }.bind(this)
      );

      this.content.addEventListener('card-click', this.handleCardClick.bind(this));

      this.render();
    }

    set data(items) {
      this.items = Array.isArray(items) ? items.slice() : [];
      this.render();
    }

    setEmptyMessage(message) {
      this.emptyMessage = message || 'Todavia no hay animes para mostrar.';
      this.empty.textContent = this.emptyMessage;

      if (!this.items.length) {
        this.render();
      }
    }

    handleCardClick(event) {
      this.dispatchEvent(
        new CustomEvent('grid-card-click', {
          bubbles: true,
          composed: true,
          detail: event.detail || null
        })
      );
    }

    render() {
      var fragment = document.createDocumentFragment();

      this.content.replaceChildren();

      if (!this.items.length) {
        this.empty.hidden = false;
        this.empty.removeAttribute('hidden');
        this.content.hidden = true;
        this.content.setAttribute('hidden', 'hidden');
        return;
      }

      this.empty.hidden = true;
      this.empty.setAttribute('hidden', 'hidden');
      this.content.hidden = false;
      this.content.removeAttribute('hidden');

      this.items.forEach(function (anime) {
        var card = document.createElement('anime-card');
        card.data = anime;
        fragment.appendChild(card);
      });

      this.content.appendChild(fragment);
    }
  }

  if (!customElements.get('anime-grid')) {
    customElements.define('anime-grid', AnimeGrid);
  }
})();
