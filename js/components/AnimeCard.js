(function () {
  function getFallbackCoverDataUrl() {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">' +
      '<rect width="400" height="600" fill="#eadfce"/>' +
      '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#8a6f4f" font-family="Montserrat, sans-serif" font-size="28">AnimeHub</text>' +
      '</svg>';

    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  function mapStatusClass(status) {
    if (status === 'Currently Airing') {
      return 'is-airing';
    }

    if (status === 'Finished Airing') {
      return 'is-finished';
    }

    return 'is-other';
  }

  function normalizeAnime(anime) {
    var safeAnime = anime || {};
    var title = safeAnime.title_english || safeAnime.title || 'Anime sin titulo';
    var imageUrl = safeAnime.images && safeAnime.images.jpg ? safeAnime.images.jpg.image_url : '';
    var scoreValue = safeAnime.score == null ? 'N/A' : String(safeAnime.score);
    var episodeValue = safeAnime.episodes == null ? '?' : String(safeAnime.episodes);
    var statusValue = safeAnime.status || 'Estado desconocido';

    return {
      id: safeAnime.mal_id || null,
      title: title,
      imageUrl: imageUrl,
      score: scoreValue,
      episodes: episodeValue,
      status: statusValue,
      statusClass: mapStatusClass(statusValue)
    };
  }

  class AnimeCard extends HTMLElement {
    constructor() {
      super();

      this.anime = null;
      this.fallbackCover = getFallbackCoverDataUrl();

      this.rootButton = document.createElement('button');
      this.rootButton.type = 'button';
      this.rootButton.className = 'anime-card__button';
      this.rootButton.setAttribute('aria-label', 'Abrir detalle de anime');

      this.article = document.createElement('article');
      this.article.className = 'anime-card';

      this.image = document.createElement('img');
      this.image.className = 'anime-card__image';
      this.image.alt = 'Portada de anime';

      this.body = document.createElement('div');
      this.body.className = 'anime-card__body';

      this.titleElement = document.createElement('h3');
      this.titleElement.className = 'anime-card__title';

      this.meta = document.createElement('div');
      this.meta.className = 'anime-card__meta';

      this.score = document.createElement('span');
      this.score.className = 'anime-card__pill';

      this.episodes = document.createElement('span');
      this.episodes.className = 'anime-card__pill';

      this.status = document.createElement('span');
      this.status.className = 'anime-card__pill anime-card__status';

      this.meta.appendChild(this.score);
      this.meta.appendChild(this.episodes);
      this.meta.appendChild(this.status);
      this.body.appendChild(this.titleElement);
      this.body.appendChild(this.meta);
      this.article.appendChild(this.image);
      this.article.appendChild(this.body);
      this.rootButton.appendChild(this.article);

      queueMicrotask(
        function () {
          if (!this.contains(this.rootButton)) {
            this.appendChild(this.rootButton);
          }
        }.bind(this)
      );

      this.rootButton.addEventListener('click', this.handleClick.bind(this));
      this.image.addEventListener('error', this.handleImageError.bind(this));

      this.render();
    }

    set data(anime) {
      this.anime = anime;
      this.render();
    }

    handleClick() {
      if (!this.anime || !this.anime.mal_id) {
        return;
      }

      this.dispatchEvent(
        new CustomEvent('card-click', {
          bubbles: true,
          composed: true,
          detail: {
            id: this.anime.mal_id,
            anime: this.anime
          }
        })
      );
    }

    handleImageError() {
      this.image.src = this.fallbackCover;
    }

    render() {
      var animeInfo = normalizeAnime(this.anime);

      this.image.src = animeInfo.imageUrl || this.fallbackCover;
      this.image.alt = 'Portada de ' + animeInfo.title;
      this.titleElement.textContent = animeInfo.title;
      this.score.textContent = 'Score: ' + animeInfo.score;
      this.episodes.textContent = 'Episodios: ' + animeInfo.episodes;
      this.status.textContent = animeInfo.status;
      this.status.className = 'anime-card__pill anime-card__status ' + animeInfo.statusClass;
      this.rootButton.setAttribute('aria-label', 'Abrir detalle de ' + animeInfo.title);
    }
  }

  if (!customElements.get('anime-card')) {
    customElements.define('anime-card', AnimeCard);
  }
})();
