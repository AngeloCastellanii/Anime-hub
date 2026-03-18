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

      this.header = document.createElement('div');
      this.header.className = 'anime-detail__header';

      this.cover = document.createElement('img');
      this.cover.className = 'anime-detail__cover';
      this.cover.alt = 'Portada de anime';

      this.contentWrap = document.createElement('div');
      this.contentWrap.className = 'anime-detail__content';

      this.titleElement = document.createElement('h2');
      this.titleElement.className = 'anime-detail__title';

      this.subtitle = document.createElement('p');
      this.subtitle.className = 'anime-detail__subtitle';

      this.meta = document.createElement('div');
      this.meta.className = 'anime-detail__meta';

      this.score = document.createElement('span');
      this.score.className = 'anime-detail__pill';

      this.status = document.createElement('span');
      this.status.className = 'anime-detail__pill';

      this.season = document.createElement('span');
      this.season.className = 'anime-detail__pill';

      this.episodes = document.createElement('span');
      this.episodes.className = 'anime-detail__pill';

      this.rating = document.createElement('span');
      this.rating.className = 'anime-detail__pill';

      this.rank = document.createElement('span');
      this.rank.className = 'anime-detail__pill';

      this.popularity = document.createElement('span');
      this.popularity.className = 'anime-detail__pill';

      this.synopsis = document.createElement('p');
      this.synopsis.className = 'anime-detail__synopsis';

      this.sectionGenres = document.createElement('h3');
      this.sectionGenres.className = 'anime-detail__section-title';
      this.sectionGenres.textContent = 'Generos';

      this.genres = document.createElement('div');
      this.genres.className = 'anime-detail__genres';

      this.sectionStudios = document.createElement('h3');
      this.sectionStudios.className = 'anime-detail__section-title';
      this.sectionStudios.textContent = 'Estudios';

      this.studios = document.createElement('div');
      this.studios.className = 'anime-detail__genres';

      this.meta.appendChild(this.score);
      this.meta.appendChild(this.status);
      this.meta.appendChild(this.season);
      this.meta.appendChild(this.episodes);
      this.meta.appendChild(this.rating);
      this.meta.appendChild(this.rank);
      this.meta.appendChild(this.popularity);
      this.panel.appendChild(this.backButton);

      this.contentWrap.appendChild(this.titleElement);
      this.contentWrap.appendChild(this.subtitle);
      this.contentWrap.appendChild(this.meta);
      this.contentWrap.appendChild(this.synopsis);
      this.contentWrap.appendChild(this.sectionGenres);
      this.contentWrap.appendChild(this.genres);
      this.contentWrap.appendChild(this.sectionStudios);
      this.contentWrap.appendChild(this.studios);

      this.header.appendChild(this.cover);
      this.header.appendChild(this.contentWrap);

      this.panel.appendChild(this.header);
      this.root.appendChild(this.panel);

      queueMicrotask(
        function () {
          if (!this.contains(this.root)) {
            this.appendChild(this.root);
          }
        }.bind(this)
      );

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
      var subtitle = 'Sin titulo alternativo';
      var coverUrl = '';
      var score = 'Score: N/A';
      var status = 'Estado: N/A';
      var season = 'Temporada: N/A';
      var episodes = 'Episodios: ?';
      var rating = 'Clasificacion: N/A';
      var rank = 'Ranking: N/A';
      var popularity = 'Popularidad: N/A';
      var synopsis = 'Selecciona un anime para ver su informacion detallada.';
      var genres = [];
      var studios = [];
      var fallbackCover =
        'data:image/svg+xml;charset=UTF-8,' +
        encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="720" viewBox="0 0 480 720"><rect width="480" height="720" fill="#eadfce"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#8a6f4f" font-family="Montserrat, sans-serif" font-size="36">AnimeHub</text></svg>'
        );

      if (this.anime) {
        title = this.anime.title_english || this.anime.title || 'Detalle de anime';
        subtitle = this.anime.title_japanese || this.anime.title || 'Sin titulo alternativo';
        coverUrl =
          this.anime.images && this.anime.images.jpg && this.anime.images.jpg.large_image_url
            ? this.anime.images.jpg.large_image_url
            : this.anime.images && this.anime.images.jpg
              ? this.anime.images.jpg.image_url
              : '';
        score = 'Score: ' + (this.anime.score == null ? 'N/A' : this.anime.score);
        status = 'Estado: ' + (this.anime.status || 'N/A');
        season = 'Temporada: ' + ((this.anime.season || 'N/A') + (this.anime.year ? ' ' + this.anime.year : ''));
        episodes = 'Episodios: ' + (this.anime.episodes == null ? '?' : this.anime.episodes);
        rating = 'Clasificacion: ' + (this.anime.rating || 'N/A');
        rank = 'Ranking: ' + (this.anime.rank == null ? 'N/A' : this.anime.rank);
        popularity = 'Popularidad: ' + (this.anime.popularity == null ? 'N/A' : this.anime.popularity);
        synopsis = this.anime.synopsis || 'Sin sinopsis disponible.';
        genres = Array.isArray(this.anime.genres) ? this.anime.genres : [];
        studios = Array.isArray(this.anime.studios) ? this.anime.studios : [];
      }

      this.titleElement.textContent = title;
      this.subtitle.textContent = subtitle;
      this.cover.src = coverUrl || fallbackCover;
      this.cover.alt = 'Portada de ' + title;
      this.score.textContent = score;
      this.status.textContent = status;
      this.season.textContent = season;
      this.episodes.textContent = episodes;
      this.rating.textContent = rating;
      this.rank.textContent = rank;
      this.popularity.textContent = popularity;
      this.synopsis.textContent = synopsis;
      this.genres.replaceChildren();
      this.studios.replaceChildren();

      if (!genres.length) {
        var emptyGenre = document.createElement('span');
        emptyGenre.className = 'anime-detail__pill';
        emptyGenre.textContent = 'Sin generos disponibles';
        this.genres.appendChild(emptyGenre);
      } else {
        genres.forEach(
          function (genre) {
            var tag = document.createElement('span');
            tag.className = 'anime-detail__pill';
            tag.textContent = genre.name || 'Genero';
            this.genres.appendChild(tag);
          }.bind(this)
        );
      }

      if (!studios.length) {
        var emptyStudio = document.createElement('span');
        emptyStudio.className = 'anime-detail__pill';
        emptyStudio.textContent = 'Sin estudios disponibles';
        this.studios.appendChild(emptyStudio);
      } else {
        studios.forEach(
          function (studio) {
            var tag = document.createElement('span');
            tag.className = 'anime-detail__pill';
            tag.textContent = studio.name || 'Estudio';
            this.studios.appendChild(tag);
          }.bind(this)
        );
      }
    }
  }

  if (!customElements.get('anime-detail')) {
    customElements.define('anime-detail', AnimeDetail);
  }
})();
