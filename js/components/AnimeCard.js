(function () {
  class AnimeCard extends HTMLElement {
    constructor() {
      super();

      this.anime = null;

      this.rootButton = document.createElement('button');
      this.rootButton.type = 'button';
      this.rootButton.className = 'anime-card__button';

      this.article = document.createElement('article');
      this.article.className = 'anime-card';

      this.image = document.createElement('img');
      this.image.className = 'anime-card__image';
      this.image.alt = 'Portada de anime';

      this.body = document.createElement('div');
      this.body.className = 'anime-card__body';

      this.title = document.createElement('h3');
      this.title.className = 'anime-card__title';

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
      this.body.appendChild(this.title);
      this.body.appendChild(this.meta);
      this.article.appendChild(this.image);
      this.article.appendChild(this.body);
      this.rootButton.appendChild(this.article);
      this.appendChild(this.rootButton);

      this.rootButton.addEventListener('click', this.handleClick.bind(this));

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
          detail: { id: this.anime.mal_id }
        })
      );
    }

    render() {
      var title = 'Anime sin titulo';
      var imageUrl = '';
      var score = 'N/A';
      var episodes = '?';
      var status = 'Estado desconocido';
      var statusClass = 'is-other';

      if (this.anime) {
        title = this.anime.title_english || this.anime.title || 'Anime sin titulo';
        imageUrl = this.anime.images && this.anime.images.jpg ? this.anime.images.jpg.image_url : '';
        score = this.anime.score == null ? 'N/A' : String(this.anime.score);
        episodes = this.anime.episodes == null ? '?' : String(this.anime.episodes);
        status = this.anime.status || 'Estado desconocido';

        if (status === 'Currently Airing') {
          statusClass = 'is-airing';
        } else if (status === 'Finished Airing') {
          statusClass = 'is-finished';
        }
      }

      this.image.src = imageUrl || 'https://via.placeholder.com/400x600?text=AnimeHub';
      this.image.alt = 'Portada de ' + title;
      this.title.textContent = title;
      this.score.textContent = 'Score: ' + score;
      this.episodes.textContent = 'Episodios: ' + episodes;
      this.status.textContent = status;
      this.status.className = 'anime-card__pill anime-card__status ' + statusClass;
    }
  }

  if (!customElements.get('anime-card')) {
    customElements.define('anime-card', AnimeCard);
  }
})();
