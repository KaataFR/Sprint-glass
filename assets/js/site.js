/* Sprint Glass Dépannage — interactions du site (sans dépendance). */
(function () {
  'use strict';

  var NBSP = ' ';   // espace insécable
  var NNBSP = ' ';  // espace fine insécable (avant : ; ? !)

  /* Réglages : à adapter si une information change. */
  var CONFIG = {
    phone: '+33751301632',
    phoneDisplay: ['07', '51', '30', '16', '32'].join(NBSP),
    email: 'Sprintglass75@gmail.com',
    // Passer à true si le 07 51 30 16 32 est joignable sur WhatsApp.
    whatsapp: false,
    // Compte EmailJS du formulaire de devis (recréé en 2026, voir README).
    emailjs: {
      publicKey: 'MHsc0-JDrzeYv7HOF',
      serviceId: 'service_sprintglass',
      templateId: 'template_devis'
    }
  };

  var doc = document;
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };
  var isTouch = window.matchMedia('(pointer: coarse)').matches;

  /* Heure de Paris en direct : « Dimanche, 3 h 07. On décroche. » ------------- */
  var liveTime = $('[data-live-time]');
  if (liveTime && window.Intl && Intl.DateTimeFormat.prototype.formatToParts) {
    var fmt = new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Europe/Paris'
    });
    var renderTime = function () {
      var parts = {};
      fmt.formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
      if (!parts.weekday || !parts.hour || !parts.minute) return;
      var day = parts.weekday.charAt(0).toUpperCase() + parts.weekday.slice(1);
      liveTime.textContent = day + ', ' + parseInt(parts.hour, 10) + NBSP + 'h' + NBSP + parts.minute + '.';
    };
    renderTime();
    setInterval(renderTime, 15000);
  }

  /* En-tête : filet au défilement ---------------------------------------------- */
  var header = $('[data-header]');
  if (header) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        header.classList.toggle('is-scrolled', window.scrollY > 4);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Menu mobile ----------------------------------------------------------------- */
  var toggle = $('[data-menu-toggle]');
  var menu = $('#menu');
  var isMenuOpen = function () { return !!menu && menu.classList.contains('is-open'); };
  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    doc.body.classList.toggle('menu-open', open);
    var use = toggle.querySelector('use');
    if (use) use.setAttribute('href', open ? '#i-close' : '#i-menu');
    var label = toggle.querySelector('.visually-hidden');
    if (label) label.textContent = open ? 'Fermer le menu' : 'Ouvrir le menu';
    if (open) {
      var first = menu.querySelector('a');
      if (first) first.focus();
    }
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () { setMenu(!isMenuOpen()); });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isMenuOpen()) {
        setMenu(false);
        toggle.focus();
      }
    });
    // Toucher en dehors du menu le referme, sans déclencher ce qui se trouve dessous
    // (pour ne pas lancer un appel par erreur).
    var swallowClick = false;
    doc.addEventListener('pointerdown', function (e) {
      if (isMenuOpen() && !menu.contains(e.target) && !toggle.contains(e.target)) {
        setMenu(false);
        swallowClick = true;
        setTimeout(function () { swallowClick = false; }, 500);
      }
    });
    doc.addEventListener('click', function (e) {
      if (!swallowClick) return;
      swallowClick = false;
      e.preventDefault();
      e.stopPropagation();
    }, true);
    // Tabulation : le menu ouvert reste le prochain arrêt, puis on revient au bouton.
    menu.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !isMenuOpen()) return;
      var items = $$('a', menu);
      if (!e.shiftKey && doc.activeElement === items[items.length - 1]) { e.preventDefault(); toggle.focus(); }
    });
    window.matchMedia('(min-width: 64em)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* Barre d'appel mobile : visible dès que les boutons du haut sortent de l'écran */
  var bar = $('[data-action-bar]');
  var heroActions = $('[data-hero-actions]');
  if (bar) {
    if (heroActions && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        bar.classList.toggle('is-visible', !entries[0].isIntersecting);
      }).observe(heroActions);
    } else {
      bar.classList.add('is-visible');
    }
  }

  function smsHref(body) {
    // « ?& » fonctionne à la fois sur iPhone et sur Android.
    return 'sms:' + CONFIG.phone + '?&body=' + encodeURIComponent(body);
  }
  function mailtoHref(subject, body) {
    return 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var area = doc.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      doc.body.appendChild(area);
      area.select();
      try { doc.execCommand('copy') ? resolve() : reject(); } catch (err) { reject(err); }
      doc.body.removeChild(area);
    });
  }

  /* Envoyer ma position ---------------------------------------------------------- */
  var dialog = $('#geo-dialog');
  var geoMessage = '';

  function announce(message) {
    var live = dialog && $('[data-geo-live]', dialog);
    if (live) live.textContent = message;
  }
  function setGeoState(state, message) {
    if (!dialog) return;
    dialog.setAttribute('data-state', state);
    if (message) announce(message);
  }
  function resetCopyFeedback() {
    var copied = dialog && $('[data-geo-copied]', dialog);
    if (copied) copied.textContent = '';
    var label = dialog && $('[data-geo-copy-label]', dialog);
    if (label) label.textContent = 'Copier le message';
  }

  function openDialog() {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  }
  function closeDialog() {
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open');
  }

  function locate() {
    resetCopyFeedback();
    setGeoState('loading', 'Localisation en cours.');
    if (!('geolocation' in navigator)) {
      showGeoError('Votre navigateur ne permet pas la localisation. Appelez-nous et décrivez l’endroit où vous êtes.');
      return;
    }
    navigator.geolocation.getCurrentPosition(onPosition, onPositionError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000
    });
  }

  function onPosition(pos) {
    var lat = pos.coords.latitude.toFixed(5);
    var lng = pos.coords.longitude.toFixed(5);
    var accuracy = Math.max(1, Math.round(pos.coords.accuracy));
    var link = 'https://maps.google.com/?q=' + lat + ',' + lng;
    geoMessage = 'Bonjour, j’ai besoin d’un dépannage. Ma position' + NNBSP + ': ' + link + ' (précision ' + accuracy + NBSP + 'm).';

    var summaryText = 'Position trouvée, à ' + accuracy + NBSP + 'm près. ' +
      (isTouch ? 'Envoyez-la par SMS' + NNBSP + ': le message est déjà rédigé.'
               : 'Sur ordinateur, copiez le message et envoyez-le par SMS au ' + CONFIG.phoneDisplay + '.');
    var summary = $('[data-geo-summary]', dialog);
    if (summary) summary.textContent = summaryText;
    var sms = $('[data-geo-sms]', dialog);
    if (sms) {
      sms.href = smsHref(geoMessage);
      sms.hidden = !isTouch;
    }
    var wa = $('[data-geo-wa]', dialog);
    if (wa) {
      wa.hidden = !CONFIG.whatsapp;
      wa.href = 'https://wa.me/' + CONFIG.phone.replace('+', '') + '?text=' + encodeURIComponent(geoMessage);
    }
    setGeoState('ready', summaryText);
  }

  function onPositionError(err) {
    var messages = {
      1: 'Vous avez refusé l’accès à votre position. Autorisez-le dans les réglages du navigateur, ou appelez-nous et décrivez l’endroit où vous êtes.',
      2: 'Votre position est introuvable pour l’instant. Appelez-nous et décrivez l’endroit où vous êtes.',
      3: 'La localisation prend trop de temps. Réessayez, ou appelez-nous et décrivez l’endroit où vous êtes.'
    };
    showGeoError(messages[err && err.code] || messages[2]);
  }

  function showGeoError(message) {
    var el = $('[data-geo-error]', dialog);
    if (el) el.textContent = message;
    setGeoState('error', message);
  }

  if (dialog) {
    $$('[data-geo]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setMenu(false);
        openDialog();
        locate();
      });
    });
    $$('[data-close]', dialog).forEach(function (btn) { btn.addEventListener('click', closeDialog); });
    var retry = $('[data-geo-retry]', dialog);
    if (retry) retry.addEventListener('click', locate);
    var copyBtn = $('[data-geo-copy]', dialog);
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var copied = $('[data-geo-copied]', dialog);
        var label = $('[data-geo-copy-label]', dialog);
        copyText(geoMessage).then(function () {
          if (label) label.textContent = 'Message copié';
          if (copied) copied.textContent = 'Collez-le dans un SMS au ' + CONFIG.phoneDisplay + '.';
        }, function () {
          if (copied) copied.textContent = 'Copie impossible. Appelez le ' + CONFIG.phoneDisplay + '.';
        });
      });
    }
    dialog.addEventListener('close', resetCopyFeedback);
    // Fermer en touchant le fond assombri.
    dialog.addEventListener('click', function (e) {
      if (e.target !== dialog) return;
      var r = dialog.getBoundingClientRect();
      var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) closeDialog();
    });
  }

  /* Formulaire de devis ------------------------------------------------------------ */
  var form = $('#devis-form');
  if (form) {
    var alertBox = $('[data-form-alert]', form);
    var submitBtn = $('[data-submit]', form);
    var success = $('[data-form-success]');
    var sending = false;
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    // Numéros français (06 12 34 56 78) ou internationaux (+32…, 0044…), séparateurs libres.
    var isValidPhone = function (value) {
      var compact = value.replace(/[\s.\-()]/g, '');
      if (/^0[1-9]\d{8}$/.test(compact)) return true;
      if (/^(\+|00)33(0)?[1-9]\d{8}$/.test(compact)) return true;
      return /^(\+|00)[1-9]\d{6,14}$/.test(compact);
    };

    // Numéro au format international, pour le bouton « Appeler » de l'e-mail reçu.
    var toTelUri = function (value) {
      var compact = value.replace(/[\s.\-()]/g, '').replace(/^00/, '+');
      if (/^0[1-9]\d{8}$/.test(compact)) return '+33' + compact.slice(1);
      return compact.replace(/^\+330/, '+33');
    };

    var rules = {
      nom: function (v) { return v ? '' : 'Indiquez votre nom.'; },
      telephone: function (v) {
        if (!v) return 'Indiquez un numéro pour qu’on vous rappelle.';
        return isValidPhone(v) ? '' : 'Ce numéro ne semble pas valide. Exemple' + NNBSP + ': ' + ['06', '12', '34', '56', '78'].join(NBSP) + '.';
      },
      besoin: function (v) { return v ? '' : 'Choisissez le type de demande.'; },
      email: function (v) { return !v || EMAIL_RE.test(v) ? '' : 'Cette adresse e-mail ne semble pas valide.'; },
      depart: function (v) { return v ? '' : 'Indiquez où se trouve le véhicule.'; }
    };

    var showFieldError = function (name, message) {
      var input = form.elements[name];
      if (!input) return;
      var err = doc.getElementById(input.id + '-error');
      if (message) {
        input.setAttribute('aria-invalid', 'true');
        if (err) {
          err.textContent = message;
          err.hidden = false;
          input.setAttribute('aria-describedby', err.id);
        }
      } else {
        input.removeAttribute('aria-invalid');
        if (err) { err.hidden = true; err.textContent = ''; }
        input.removeAttribute('aria-describedby');
      }
    };

    var validate = function () {
      var firstInvalid = null;
      Object.keys(rules).forEach(function (name) {
        var input = form.elements[name];
        var message = rules[name]((input.value || '').trim());
        showFieldError(name, message);
        if (message && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid) firstInvalid.focus();
      return !firstInvalid;
    };

    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      if (!input) return;
      input.addEventListener('blur', function () {
        if (input.getAttribute('aria-invalid') === 'true' || input.value) {
          showFieldError(name, rules[name]((input.value || '').trim()));
        }
      });
    });

    // Sur mobile, la barre d'appel se retire pendant la saisie pour ne pas masquer les champs.
    form.addEventListener('focusin', function () { doc.body.classList.add('form-focus'); });
    form.addEventListener('focusout', function () {
      setTimeout(function () {
        if (!form.contains(doc.activeElement)) doc.body.classList.remove('form-focus');
      }, 0);
    });

    var composeMessage = function (data) {
      var lines = ['Demande' + NNBSP + ': ' + data.besoin];
      if (data.vehicule) lines.push('Véhicule' + NNBSP + ': ' + data.vehicule);
      lines.push('Prise en charge' + NNBSP + ': ' + data.depart);
      if (data.arrivee) lines.push('Destination' + NNBSP + ': ' + data.arrivee);
      if (data.message) lines.push('', 'Précisions' + NNBSP + ': ' + data.message);
      return lines.join('\n');
    };

    var setSending = function (state) {
      sending = state;
      submitBtn.setAttribute('aria-disabled', String(state));
      submitBtn.setAttribute('aria-busy', String(state));
      submitBtn.textContent = state ? 'Envoi en cours…' : 'Envoyer la demande';
    };

    var showSendError = function (data) {
      var body = 'Demande de devis de ' + data.nom + ' (' + data.telephone + ')\n' + composeMessage(data);
      alertBox.innerHTML = '';
      var p1 = doc.createElement('p');
      p1.textContent = 'L’envoi n’a pas abouti. Appelez-nous au ' + CONFIG.phoneDisplay +
        (isTouch ? ', ou envoyez la même demande par SMS.' : ', ou envoyez la même demande par e-mail.');
      var link = doc.createElement('a');
      link.className = 'btn btn-outline';
      if (isTouch) {
        link.href = smsHref(body);
        link.textContent = 'Envoyer par SMS';
      } else {
        link.href = mailtoHref('Demande de devis', body);
        link.textContent = 'Envoyer par e-mail';
      }
      alertBox.appendChild(p1);
      alertBox.appendChild(link);
      alertBox.hidden = false;
      alertBox.setAttribute('tabindex', '-1');
      alertBox.focus();
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;
      alertBox.hidden = true;

      // Champ piège rempli : c'est un robot, on fait comme si tout allait bien.
      if (form.elements.site && form.elements.site.value) {
        form.hidden = true;
        if (success) success.hidden = false;
        return;
      }
      if (!validate()) return;

      var data = {};
      ['nom', 'telephone', 'email', 'besoin', 'vehicule', 'depart', 'arrivee', 'message'].forEach(function (name) {
        data[name] = form.elements[name] ? form.elements[name].value.trim() : '';
      });

      var payload = {
        service_id: CONFIG.emailjs.serviceId,
        template_id: CONFIG.emailjs.templateId,
        user_id: CONFIG.emailjs.publicKey,
        // Variables du modèle « template_devis ». reply_to : « Répondre » écrit au client,
        // ou revient à l'adresse de l'entreprise s'il n'a pas laissé d'e-mail.
        template_params: {
          nom: data.nom,
          telephone: data.telephone,
          telephone_lien: toTelUri(data.telephone),
          email: data.email || 'non renseigné',
          reply_to: data.email || CONFIG.email,
          besoin: data.besoin,
          depart: data.depart,
          arrivee: data.arrivee || 'non précisée',
          vehicule: data.vehicule || 'non précisé',
          precisions: data.message || 'aucune'
        }
      };

      setSending(true);
      fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        setSending(false);
        form.hidden = true;
        doc.body.classList.remove('form-focus');
        var phoneOut = $('[data-success-phone]');
        if (phoneOut) phoneOut.textContent = data.telephone;
        if (success) {
          success.hidden = false;
          success.focus();
        }
      }).catch(function () {
        setSending(false);
        showSendError(data);
      });
    });
  }

  /* Année en cours ---------------------------------------------------------------- */
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
