(function () {
  var DEFAULT_TIMEOUT_MS = 10000;

  function createAppError(type, message, details) {
    var error = new Error(message);
    error.name = 'AnimeHubError';
    error.type = type;
    error.details = details || null;
    return error;
  }

  function mergeSignals(signalA, signalB) {
    if (!signalA && !signalB) {
      return null;
    }

    if (signalA && !signalB) {
      return signalA;
    }

    if (!signalA && signalB) {
      return signalB;
    }

    var controller = new AbortController();

    function forwardAbort(sourceSignal) {
      if (!controller.signal.aborted) {
        controller.abort(sourceSignal.reason || 'merged-signal-abort');
      }
    }

    signalA.addEventListener('abort', function () {
      forwardAbort(signalA);
    });

    signalB.addEventListener('abort', function () {
      forwardAbort(signalB);
    });

    return controller.signal;
  }

  // Ejecuta fetch con timeout y clasificacion de errores para que la UI los maneje de forma uniforme.
  async function requestJson(url, options) {
    var config = options || {};
    var timeoutMs = typeof config.timeoutMs === 'number' ? config.timeoutMs : DEFAULT_TIMEOUT_MS;
    var timeoutController = new AbortController();
    var combinedSignal = mergeSignals(config.signal || null, timeoutController.signal);
    var timeoutId;

    if (timeoutMs > 0) {
      timeoutId = window.setTimeout(function () {
        timeoutController.abort('request-timeout');
      }, timeoutMs);
    }

    try {
      var response = await fetch(url, {
        method: config.method || 'GET',
        headers: config.headers || {},
        signal: combinedSignal
      });

      if (!response.ok) {
        throw createAppError('http', 'La API respondio con error.', {
          status: response.status,
          statusText: response.statusText,
          url: url
        });
      }

      return await response.json();
    } catch (error) {
      if (error && error.type) {
        throw error;
      }

      if (error && error.name === 'AbortError') {
        var abortReason = timeoutController.signal.aborted ? 'timeout' : 'cancelled';
        throw createAppError(abortReason, 'La solicitud fue abortada.', {
          reason: error.message,
          url: url
        });
      }

      throw createAppError('network', 'No se pudo completar la solicitud.', {
        reason: error && error.message ? error.message : 'unknown-network-error',
        url: url
      });
    } finally {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    }
  }

  window.AnimeHubRequestClient = {
    DEFAULT_TIMEOUT_MS: DEFAULT_TIMEOUT_MS,
    createAppError: createAppError,
    requestJson: requestJson
  };
})();
