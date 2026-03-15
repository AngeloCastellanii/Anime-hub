(function () {
  class AnimeDetail extends HTMLElement {
    constructor() {
      super();

      this.anime = null;

      this.root = document.createElement('section');
      this.root.className = 'anime-detail';

      this.panel = document.createElement('article');
      this.panel.className = 'anime-detail__panel';

      this.backButton = document.createElement('button');
      this.backButton.type = 'button';
      this.backButton.className = 'anime-detail__back';
      this.backButton.textContent = '<- Volver';

      this.title = document.createElement('h2');
      this.title.className = 'anime-detail__title';

      this.meta = document.createElement('div');
      this.meta.className = 'anime-detail__meta';

      this.score = document.createElement('span');
      this.score.className = 'anime-detail__pill';

      this.status = document.createElement('span');
      this.status.className = 'anime-detail__pill';

      this.season = document.createElement('span');
      this.season.className = 'anime-detail__pill';

      this.synopsis = document.createElement('p');
      this.synopsis.className = 'anime-detail__synopsis';

      this.genres = document.createElement('div');
      this.genres.className = 'anime-detail__genres';

      this.meta.appendChild(this.score);
      this.meta.appendChild(this.status);
      this.meta.appendChild(this.season);
      this.panel.appendChild(this.backButton);
      this.panel.appendChild(this.title);
      this.panel.appendChild(this.meta);
      this.panel.appendChild(this.synopsis);
      this.panel.appendChild(this.genres);
      this.root.appendChild(this.panel);
      this.appendChild(this.root);

      this.backButton.addEventListener('click', this.handleBack.bind(this));

      this.render();
    }

    set data(anime) {
      this.anime = anime;
      this.render();
    }

    handleBack() {
      this.dispatchEvent(
        new CustomEvent('go-back', {
          bubbles: true,
          composed: true
        })
      );
    }

    render() {
      var title = 'Detalle de anime';
      var score = 'Score: N/A';
      var status = 'Estado: N/A';
      var season = 'Temporada: N/A';
      var synopsis = 'Selecciona un anime para ver su informacion detallada.';
      var genres = [];

      if (this.anime) {
        title = this.anime.title_english || this.anime.title || 'Detalle de anime';
        score = 'Score: ' + (this.anime.score == null ? 'N/A' : this.anime.score);
        status = 'Estado: ' + (this.anime.status || 'N/A');
        season = 'Temporada: ' + (this.anime.season || 'N/A');
        synopsis = this.anime.synopsis || 'Sin sinopsis disponible.';
        genres = Array.isArray(this.anime.genres) ? this.anime.genres : [];
      }

      this.title.textContent = title;
      this.score.textContent = score;
      this.status.textContent = status;
      this.season.textContent = season;
      this.synopsis.textContent = synopsis;
      this.genres.replaceChildren();

      if (!genres.length) {
        var emptyGenre = document.createElement('span');
        emptyGenre.className = 'anime-detail__pill';
        emptyGenre.textContent = 'Generos pendientes';
        this.genres.appendChild(emptyGenre);
        return;
      }

      genres.forEach(
        function (genre) {
          var tag = document.createElement('span');
          tag.className = 'anime-detail__pill';
          tag.textContent = genre.name || 'Genero';
          this.genres.appendChild(tag);
        }.bind(this)
      );
    }
  }

  if (!customElements.get('anime-detail')) {
    customElements.define('anime-detail', AnimeDetail);
  }
})();
