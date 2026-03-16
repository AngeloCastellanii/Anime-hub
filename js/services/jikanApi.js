(function () {
  var BASE_URL = 'https://api.jikan.moe/v4';
  var inFlightRequests = {};

  function assertRequestClient() {
    if (!window.AnimeHubRequestClient || typeof window.AnimeHubRequestClient.requestJson !== 'function') {
      throw new Error('AnimeHubRequestClient no esta disponible.');
    }
  }

  function buildUrl(path, queryParams) {
    var url = new URL(BASE_URL + path);
    var entries = queryParams || {};

    Object.keys(entries).forEach(function (key) {
      var value = entries[key];

      if (value === undefined || value === null || value === '') {
        return;
      }

      url.searchParams.set(key, value);
    });

    return url.toString();
  }

  // Evita dobles peticiones para la misma accion critica: cancela la anterior y conserva solo la mas reciente.
  function runRequest(requestKey, path, queryParams, options) {
    assertRequestClient();

    var config = options || {};
    var timeoutMs = typeof config.timeoutMs === 'number' ? config.timeoutMs : window.AnimeHubRequestClient.DEFAULT_TIMEOUT_MS;
    var allowConcurrent = Boolean(config.allowConcurrent);
    var previousRequest = inFlightRequests[requestKey];

    if (!allowConcurrent && previousRequest) {
      previousRequest.controller.abort('superseded-by-new-request');
    }

    var controller = new AbortController();
    var requestMeta = {
      controller: controller,
      startedAt: Date.now()
    };

    inFlightRequests[requestKey] = requestMeta;

    return window.AnimeHubRequestClient.requestJson(buildUrl(path, queryParams), {
      timeoutMs: timeoutMs,
      signal: controller.signal
    }).finally(function () {
      if (inFlightRequests[requestKey] === requestMeta) {
        delete inFlightRequests[requestKey];
      }
    });
  }

  function getTopAnime(options) {
    var config = options || {};
    var page = config.page || 1;
    var limit = config.limit || 12;

    return runRequest('top-anime', '/top/anime', { page: page, limit: limit }, config).then(function (payload) {
      return payload.data || [];
    });
  }

  function getCurrentSeasonAnime(options) {
    var config = options || {};
    var page = config.page || 1;
    var limit = config.limit || 6;

    return runRequest('season-now', '/seasons/now', { page: page, limit: limit }, config).then(function (payload) {
      return payload.data || [];
    });
  }

  function getAnimeGenres(options) {
    var config = options || {};

    return runRequest('genres-anime', '/genres/anime', {}, config).then(function (payload) {
      return payload.data || [];
    });
  }

  function searchAnime(options) {
    var config = options || {};
    var page = config.page || 1;

    return runRequest(
      'search-anime',
      '/anime',
      {
        q: config.query || '',
        genres: config.genreId || '',
        page: page
      },
      config
    ).then(function (payload) {
      return payload.data || [];
    });
  }

  function getAnimeDetail(animeId, options) {
    var config = options || {};

    if (!animeId) {
      return Promise.reject(
        window.AnimeHubRequestClient.createAppError('validation', 'Se requiere un id de anime para consultar el detalle.')
      );
    }

    return runRequest('detail-' + animeId, '/anime/' + animeId + '/full', {}, config).then(function (payload) {
      return payload.data || null;
    });
  }

  function cancelRequest(requestKey) {
    var activeRequest = inFlightRequests[requestKey];

    if (!activeRequest) {
      return;
    }

    activeRequest.controller.abort('cancel-request');
    delete inFlightRequests[requestKey];
  }

  function cancelAllRequests() {
    Object.keys(inFlightRequests).forEach(function (requestKey) {
      cancelRequest(requestKey);
    });
  }

  window.AnimeHubApi = {
    getTopAnime: getTopAnime,
    getCurrentSeasonAnime: getCurrentSeasonAnime,
    getAnimeGenres: getAnimeGenres,
    searchAnime: searchAnime,
    getAnimeDetail: getAnimeDetail,
    cancelRequest: cancelRequest,
    cancelAllRequests: cancelAllRequests
  };
})();
