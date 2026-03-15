(function () {
  class AnimeGrid extends HTMLElement {
    constructor() {
      super();

      this.items = [];

      this.root = document.createElement('section');
      this.root.className = 'anime-grid';

      this.content = document.createElement('div');
      this.content.className = 'anime-grid__content';

      this.empty = document.createElement('p');
      this.empty.className = 'anime-grid__empty';
      this.empty.textContent = 'Todavia no hay animes para mostrar.';

      this.root.appendChild(this.empty);
      this.root.appendChild(this.content);
      this.appendChild(this.root);

      this.render();
    }

    set data(items) {
      this.items = Array.isArray(items) ? items : [];
      this.render();
    }

    render() {
      var fragment = document.createDocumentFragment();

      this.content.replaceChildren();

      if (!this.items.length) {
        this.empty.hidden = false;
        this.content.hidden = true;
        return;
      }

      this.empty.hidden = true;
      this.content.hidden = false;

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
