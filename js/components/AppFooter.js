(function () {
  class AppFooter extends HTMLElement {
    constructor() {
      super();

      this.root = document.createElement('footer');
      this.root.className = 'footer';

      this.panel = document.createElement('div');
      this.panel.className = 'footer__panel panel';

      this.credit = document.createElement('p');
      this.credit.textContent = 'Proyecto academico de URU Materia: Lenguajes de clientes web - Angelo Castellani - 2026';

      this.source = document.createElement('p');
      this.source.textContent = 'Datos provistos por Jikan API - MyAnimeList.';

      this.panel.appendChild(this.credit);
      this.panel.appendChild(this.source);
      this.root.appendChild(this.panel);
      this.appendChild(this.root);
    }
  }

  if (!customElements.get('app-footer')) {
    customElements.define('app-footer', AppFooter);
  }
})();
