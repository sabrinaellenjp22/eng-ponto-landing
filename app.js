/* ==========================================================================
   ENG PONTO - LOGICA E INTERATIVIDADE
   Relógio ao vivo, abas acessíveis, simulação AFD, seletor de planos, acordeão
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* 01. STICKY NAV: VIDRO SOBRE A HERO, SÓLIDA AO PASSAR DELA */
  const nav = document.getElementById('nav');
  const heroEl = document.getElementById('hero');

  function updateNavHeightVar() {
    document.documentElement.style.setProperty('--nav-h', `${nav.offsetHeight}px`);
  }
  updateNavHeightVar();
  window.addEventListener('resize', updateNavHeightVar);

  function updateNavGlass() {
    const heroBottom = heroEl ? heroEl.offsetTop + heroEl.offsetHeight : 0;
    if (window.scrollY + nav.offsetHeight > heroBottom) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', updateNavGlass, { passive: true });
  updateNavGlass();


  /* 01b. MENU HAMBÚRGUER (mobile): abre/fecha o painel com os links e o CTA */
  const navHamburger = document.querySelector('.nav-hamburger');
  const navMobilePanel = document.querySelector('.nav-mobile-panel');
  if (navHamburger && navMobilePanel) {
    const closeNavMobile = () => {
      navMobilePanel.classList.remove('is-open');
      navHamburger.classList.remove('is-open');
      navHamburger.setAttribute('aria-expanded', 'false');
    };
    navHamburger.addEventListener('click', () => {
      const open = navMobilePanel.classList.toggle('is-open');
      navHamburger.classList.toggle('is-open', open);
      navHamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navMobilePanel.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNavMobile));
    window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) closeNavMobile(); });
  }


  /* 02. RELÓGIO AO VIVO NO MOCK DO HERO */
  const clockElement = document.getElementById('hero-clock');
  function updateClock() {
    if (!clockElement) return;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockElement.textContent = `${hours}:${minutes}:${seconds}`;
  }
  updateClock();
  // Atualiza a cada 1 segundo se não houver preferência de movimento reduzido
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    setInterval(updateClock, 1000);
  }


  /* 02b. TÍTULO DINÂMICO DO HERO (efeito de digitação) */
  const heroRotatingWord = document.getElementById('hero-rotating-word');
  if (heroRotatingWord && !prefersReducedMotion) {
    const heroWords = ['do celular.', 'do computador.', 'do totem.', 'de onde estiver.'];
    let heroWordIndex = heroWords.length - 1; // já exibida no HTML estático
    let heroCharIndex = heroWords[heroWordIndex].length;

    function typeHeroWord() {
      const word = heroWords[heroWordIndex];
      heroCharIndex++;
      heroRotatingWord.textContent = word.slice(0, heroCharIndex);
      if (heroCharIndex < word.length) {
        setTimeout(typeHeroWord, 110);
      } else {
        setTimeout(deleteHeroWord, 2600);
      }
    }

    function deleteHeroWord() {
      const word = heroWords[heroWordIndex];
      heroCharIndex--;
      heroRotatingWord.textContent = word.slice(0, heroCharIndex);
      if (heroCharIndex > 0) {
        setTimeout(deleteHeroWord, 55);
      } else {
        heroWordIndex = (heroWordIndex + 1) % heroWords.length;
        setTimeout(typeHeroWord, 400);
      }
    }

    setTimeout(deleteHeroWord, 2600);
  }


  /* 03. ACORDEÃO DE "COMO FUNCIONA" (o passo aberto define o vídeo ao lado; o primeiro já vem aberto) */
  const comoSteps = document.querySelectorAll('.como-step');
  const comoVideo = document.querySelector('.como-video');
  const comoVideoSource = comoVideo ? comoVideo.querySelector('source') : null;

  comoSteps.forEach((step, index) => {
    const head = step.querySelector('.como-step-head');
    head.addEventListener('click', () => setComoOpen(step.classList.contains('is-open') ? -1 : index));

    head.addEventListener('keydown', (e) => {
      let targetIndex = null;
      if (e.key === 'ArrowDown') {
        targetIndex = (index + 1) % comoSteps.length;
      } else if (e.key === 'ArrowUp') {
        targetIndex = (index - 1 + comoSteps.length) % comoSteps.length;
      }

      if (targetIndex !== null) {
        e.preventDefault();
        comoSteps[targetIndex].querySelector('.como-step-head').focus();
      }
    });
  });

  // no mobile o vídeo (.como-visual) vai pra dentro do passo aberto; no desktop fica ao lado da lista
  const comoVisual = document.querySelector('.como-visual');
  const comoLayout = document.querySelector('.como-layout');
  const comoMobile = window.matchMedia('(max-width: 960px)');
  let comoCurrent = 0;

  function placeComoVisual() {
    if (!comoVisual || !comoLayout) return;
    const target = comoMobile.matches ? comoSteps[comoCurrent].querySelector('.como-step-body-inner') : comoLayout;
    if (comoVisual.parentElement !== target) {
      target.appendChild(comoVisual);
      if (comoVideo) comoVideo.play().catch(() => {});
    }
  }
  comoMobile.addEventListener('change', placeComoVisual);
  placeComoVisual();

  // botão de expandir: tela cheia no vídeo (iPhone só aceita o método webkitEnterFullscreen)
  document.querySelector('.como-visual-chip')?.addEventListener('click', () => {
    const enter = comoVideo.requestFullscreen || comoVideo.webkitRequestFullscreen || comoVideo.webkitEnterFullscreen;
    if (enter) enter.call(comoVideo);
  });

  function setComoOpen(index) {
    comoSteps.forEach((s, i) => {
      s.classList.toggle('is-open', i === index);
      s.querySelector('.como-step-head').setAttribute('aria-expanded', i === index ? 'true' : 'false');
    });
    if (index >= 0) { comoCurrent = index; placeComoVisual(); }

    if (index < 0 || !comoVideo || !comoVideoSource) return;
    const videoSrc = comoSteps[index].querySelector('.como-step-head').dataset.video;
    if (comoVideoSource.getAttribute('src') !== videoSrc) {
      comoVideoSource.setAttribute('src', videoSrc);
      comoVideo.load();
      comoVideo.addEventListener('loadeddata', () => comoVideo.play().catch(() => {}), { once: true });
    } else {
      comoVideo.play().catch(() => {});
    }
  }


  /* 03b. ABAS DE GRUPOS DE FUNCIONALIDADES (troca a foto + legenda ao lado) */
  const funcGroupButtons = document.querySelectorAll('.func-group-btn');
  const funcImg = document.querySelector('.funcionalidades-photo-img');
  const funcCaption = document.querySelector('.funcionalidades-photo-caption p');

  funcGroupButtons.forEach((btn, index) => {
    btn.addEventListener('mouseenter', () => switchFuncGroup(index));
    btn.addEventListener('focus', () => switchFuncGroup(index));
    btn.addEventListener('click', () => switchFuncGroup(index));

    btn.addEventListener('keydown', (e) => {
      let targetIndex = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        targetIndex = (index + 1) % funcGroupButtons.length;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        targetIndex = (index - 1 + funcGroupButtons.length) % funcGroupButtons.length;
      }

      if (targetIndex !== null) {
        e.preventDefault();
        funcGroupButtons[targetIndex].focus();
      }
    });
  });

  function switchFuncGroup(index) {
    const active = funcGroupButtons[index];

    funcGroupButtons.forEach((b, i) => {
      b.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });

    if (funcImg) {
      funcImg.src = active.dataset.img;
      funcImg.alt = active.dataset.alt;
    }
    if (funcCaption) {
      funcCaption.textContent = active.dataset.caption;
    }
  }


  /* 05. ACORDEÃO DAS FAQS */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const trigger = item.querySelector('.faq-trigger');

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Fecha todos os acordeões primeiro
      faqItems.forEach(i => {
        i.classList.remove('active');
        i.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
      });

      // Se não estava aberto, abre o clicado
      if (!isOpen) {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });


  /* 08. TRÊS FORMAS DE BATER O PONTO: um card sempre ativo (começa no 1º). O mouse troca o ativo e,
     enquanto não houver mouse sobre nenhum card, o destaque avança sozinho a cada 6s */
  const modosCards = [...document.querySelectorAll('.modos-card')];
  if (modosCards.length > 0) {
    let modosIndex = 0;
    let modosHover = false;
    let modosTimer;
    const setModosActive = (i) => {
      modosIndex = i;
      modosCards.forEach((c, j) => c.classList.toggle('is-active', j === i));
    };
    const restartModosTimer = () => {
      clearInterval(modosTimer);
      if (prefersReducedMotion) return;
      modosTimer = setInterval(() => {
        if (!modosHover) setModosActive((modosIndex + 1) % modosCards.length);
      }, 6000);
    };
    modosCards.forEach((card, i) => {
      card.addEventListener('pointerenter', (e) => {
        setModosActive(i);
        modosHover = e.pointerType === 'mouse';
        restartModosTimer();
      });
      card.addEventListener('pointerleave', () => {
        modosHover = false;
        restartModosTimer();
      });
    });
    setModosActive(0);
    restartModosTimer();
  }


  /* 08b. PLANOS (mobile): as 3 fotos viram carrossel que avança sozinho a cada 4s; tocar/rolar reinicia a contagem */
  const planosBento = document.querySelector('.planos-bento');
  if (planosBento) {
    const items = planosBento.children;
    const dots = document.querySelectorAll('.planos-bento-dot');
    let planosTimer;
    const planosStep = () => items[1].offsetLeft - items[0].offsetLeft;
    const planosIndex = () => Math.round(planosBento.scrollLeft / planosStep());
    const planosGo = (i) => planosBento.scrollTo({ left: ((i + items.length) % items.length) * planosStep(), behavior: 'smooth' });
    const startPlanosTimer = () => {
      clearInterval(planosTimer);
      if (prefersReducedMotion) return;
      planosTimer = setInterval(() => { if (comoMobile.matches) planosGo(planosIndex() + 1); }, 4000);
    };
    planosBento.addEventListener('scroll', () => dots.forEach((d, i) => d.classList.toggle('is-active', i === planosIndex())), { passive: true });
    dots.forEach((d, i) => d.addEventListener('click', () => { planosGo(i); startPlanosTimer(); }));
    document.querySelectorAll('.planos-bento-arrow').forEach(a => a.addEventListener('click', () => { planosGo(planosIndex() + Number(a.dataset.dir)); startPlanosTimer(); }));
    ['pointerdown', 'wheel'].forEach(ev => planosBento.addEventListener(ev, startPlanosTimer, { passive: true }));
    startPlanosTimer();
  }


  /* 09. REVELAÇÃO NO SCROLL (INTERSECTION OBSERVER ABAIXO DA DOBRA) */
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if (revealElements.length > 0) {
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          scrollObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px' });

    revealElements.forEach(el => scrollObserver.observe(el));
  }

});
