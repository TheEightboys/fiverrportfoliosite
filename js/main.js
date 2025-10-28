// create blobs if not present and add parallax on mouse move
(function(){
  const container = document.getElementById('headerBlobs');
  if(!container) return;

  // ensure 3 blobs
  if(container.children.length === 0){
    const b1 = document.createElement('div');
    b1.className = 'blob b1';
    const b2 = document.createElement('div');
    b2.className = 'blob b2';
    const b3 = document.createElement('div');
    b3.className = 'blob b3';
    // data-depth for mouse parallax
    b1.dataset.depth = 0.06;
    b2.dataset.depth = 0.045;
    b3.dataset.depth = 0.025;
    container.appendChild(b1);
    container.appendChild(b2);
    container.appendChild(b3);
  }

  // simple parallax that shifts blobs based on mouse inside header
  const header = document.querySelector('.site-header');
  header.addEventListener('mousemove', (e) => {
    const rect = header.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;

    container.querySelectorAll('.blob').forEach((el) => {
      const depth = parseFloat(el.dataset.depth || 0.04);
      const tx = dx * 60 * depth * -1;
      const ty = dy * 60 * depth * -1;
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    });
  });

  // subtle idle motion when mouse leaves
  header.addEventListener('mouseleave', () => {
    container.querySelectorAll('.blob').forEach((el) => {
      el.style.transform = '';
    });
  });

})();

/* -------------------------
   ABOUT section : simple particle background + media stack loader + tilt
   (skip floating frame & particles on small viewports)
   ------------------------- */
(function(){
  // If mobile/tablet viewport, remove/hide the floating media stack and particles
  if(window.innerWidth <= 900){
    const stack = document.getElementById('mediaStack');
    if(stack){
      // hide element so existing layout/markup stays the same but it's not rendered/used
      stack.style.display = 'none';
      stack.classList && stack.classList.remove('floating-frame');
    }
    const canvas = document.getElementById('aboutParticles');
    if(canvas){
      canvas.style.display = 'none';
    }
    // do not initialize particle/stack logic on small screens
    return;
  }

  // desktop behavior: existing functionality runs here
  const canvas = document.getElementById('aboutParticles');
  const mediaStack = document.getElementById('mediaStack');
  if(!canvas || !mediaStack) return;

  // lazy load stack images and animate in
  const imgs = Array.from(mediaStack.querySelectorAll('img[data-src]'));
  imgs.forEach((img, i) => {
    const src = img.dataset.src;
    const image = new Image();
    image.onload = () => {
      img.src = src;
      setTimeout(()=> img.classList.add('visible'), 120 + i*140);
    };
    image.src = src;
  });

  // tilt effect on media stack
  mediaStack.addEventListener('mousemove', (e) => {
    const r = mediaStack.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    const imgs = mediaStack.querySelectorAll('.stack-img');
    imgs.forEach((el, idx) => {
      const depth = (idx+1) * 6;
      el.style.transform = `translateZ(${12 - idx*3}px) rotateY(${px*8 - idx*1}deg) rotateX(${py*-8 + idx*0.6}deg)`;
    });
  });
  mediaStack.addEventListener('mouseleave', () => {
    mediaStack.querySelectorAll('.stack-img').forEach((el, idx) => {
      el.style.transform = '';
    });
  });

  // canvas particle background (subtle, kid-friendly blobs)
  const ctx = canvas.getContext('2d');
  let W, H, particles;
  function resize(){ W = canvas.width = canvas.clientWidth; H = canvas.height = canvas.clientHeight; initParticles(); }
  function initParticles(){
    particles = [];
    const count = Math.max(6, Math.floor((W*H)/50000));
    for(let i=0;i<count;i++){
      particles.push({
        x: Math.random()*W,
        y: Math.random()*H,
        r: 10 + Math.random()*36,
        vx: (Math.random()-0.5)*0.3,
        vy: (Math.random()-0.5)*0.3,
        hue: 150 + Math.random()*140,
        alpha: 0.06 + Math.random()*0.12
      });
    }
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    particles.forEach(p=>{
      p.x += p.vx;
      p.y += p.vy;
      if(p.x < -p.r) p.x = W + p.r;
      if(p.x > W + p.r) p.x = -p.r;
      if(p.y < -p.r) p.y = H + p.r;
      if(p.y > H + p.r) p.y = -p.r;

      const g = ctx.createRadialGradient(p.x, p.y, p.r*0.1, p.x, p.y, p.r);
      g.addColorStop(0, `hsla(${p.hue},85%,65%,${p.alpha})`);
      g.addColorStop(0.5, `hsla(${(p.hue+40)%360},75%,55%,${p.alpha*0.6})`);
      g.addColorStop(1, `hsla(${(p.hue+80)%360},65%,45%,0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

/* -------------------------
   Dynamic portfolio cards
   ------------------------- */
(function(){
  const data = {
    camps: [
      { src: "assets/IMG_5070.jpg", type:"image", title:"Java : Builds Mods with MineCrafts", caption:"Programming class at Montclair State" },
      { src: "assets/IMG_5071.jpg", type:"image", title:"Unity and MetaQuest for VR games", caption:"VR game programming certificate (ID Tech)" },
      { src: "assets/IMG_5072.jpg", type:"image", title:"ROBOFUN program", caption:"parcipation certificate coding" },
      { src: "assets/IMG_3353.jpg", type:"image", title:"Montclair State University Summer", caption:"Summer program projects" }
    ],
    projects: [
      // as.gif is actually a protest GIF (label corrected)
      { src: "assets/as.gif", type:"gif", title:"Protest GIF", caption:"Animated GIF — protest" },
      { src: "assets/dd.gif", type:"gif", title:"Game GIF", caption:"Game programming GIF" },
      // eoodd.gif is the track GIF (label corrected)
      { src: "assets/eoodd.gif", type:"gif", title:"Track GIF", caption:"Animated GIF for track" },
{ src: "assets/RenderedImage (1).jpg", type:"image", title:"Eclipse Event — Liberty State Park ", caption:" April 2024" },
  // IMG_3358.jpg is the glasses photo from the Eclipse event at Liberty State Park
  { src: "assets/IMG_3358.jpg", type:"image", title:"Rendered Image — Wall signs (from camp)", caption:"Wall signs / signs from camp" }
    ],
    sports: [
      { src: "assets/IMG_3177.jpg", type:"image", title:"Soccer action", caption:"Soccer photos" },
      { src: "assets/IMG_8048.jpg", type:"image", title:"On the field", caption:"Match day" },
      { src: "assets/IMG_5254.mov", type:"video", title:"warmup video", caption:"Highlights (tap to play)" },
      // corrected: this video is soccer practice, not track
      { src: "assets/IMG_8025.mov", type:"video", title:"Soccer practice", caption:"Soccer practice clips" },
      { src: "assets/IMG_8684.jpg", type:"image", title:"Group Photo", caption:"Soccer Group Photos" },
    ],
    news: [
      { src: "assets/IMG_8404 (1).jpg", type:"image", title:"Protest", caption:"Community activism — protest photo" },
  // this image is the newspaper cover photo — add real link and a short description
  { src: "assets/IMG_7813-scaled.webp", type:"image", title:"Newspaper coverage — JCityTimes", caption:"Newspaper cover photo", link: "https://jcitytimes.com/shame-on-you-rally-decries-unethical-95-5-deed-restriction/", description: "Coverage of the ‘Shame on You’ rally and the deed restriction debate in Jersey City (JCityTimes)." },
      { src: "assets/IMG_4327.jpg", type:"image", title:"Save Liberty State Park", caption:"Save Liberty State Park — community event photo" }
    ]
  };

  function buildCard(item, order){
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('data-order', String(order || 1));
    card.setAttribute('tabindex','0'); // allow focus for keyboard users

    const badge = document.createElement('div');
    badge.className = 'card-badge';
    badge.textContent = item.type.toUpperCase();
    card.appendChild(badge);

    // inner wrapper that will slide left-right automatically
    const inner = document.createElement('div');
    inner.className = 'card-inner';

    const media = document.createElement('div');
    media.className = 'card-media card-tilt';
    media.setAttribute('aria-hidden','false');

    if(item.type === 'video'){
      const video = document.createElement('video');
      video.src = item.src;
      video.setAttribute('playsinline','');
      video.setAttribute('preload','metadata');
      video.setAttribute('controls','');
      video.style.display = 'block';
      media.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.alt = item.title || '';
      img.src = item.src;
      media.appendChild(img);
    }

    const meta = document.createElement('div');
    meta.className = 'card-meta';
    const h3 = document.createElement('h3');
    h3.className = 'card-title';
    h3.textContent = item.title || '';
    const p = document.createElement('p');
    p.className = 'card-caption';
    p.textContent = item.caption || '';
    meta.appendChild(h3);
    meta.appendChild(p);

    // optional description / link for news items
    if(item.description){
      const desc = document.createElement('p');
      desc.className = 'card-desc';
      desc.textContent = item.description;
      meta.appendChild(desc);
    }

    if(item.link){
      const actions = document.createElement('div');
      actions.className = 'card-actions';

      // Read article (open new tab)
      const a = document.createElement('a');
      a.className = 'btn small';
      a.href = item.link;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = 'Read article';
      actions.appendChild(a);

      // Preview (attempt in-modal webview iframe; falls back to new tab if not supported)
      const preview = document.createElement('a');
      preview.className = 'btn ghost small';
      preview.href = item.link;
      preview.textContent = 'Preview';
      preview.addEventListener('click', (ev) => {
        // if modal opener is available, use it; otherwise let anchor open in new tab
        if(window.openMediaModal){
          ev.preventDefault();
          try{
            window.openMediaModal('iframe', item.link, { alt: item.title || 'Article preview' });
          }catch(e){
            // fallback: open in new tab
            window.open(item.link, '_blank', 'noopener');
          }
        }
      });
      actions.appendChild(preview);

      meta.appendChild(actions);
    }

    inner.appendChild(media);
    inner.appendChild(meta);
    card.appendChild(inner);

    // randomize animation duration slightly so cards do not sync perfectly
    const dur = 14 + Math.round(Math.random() * 12); // 14s - 26s
    inner.style.animationDuration = dur + 's';

    // pointer interactions: when user touches/enters, pause auto-slide and let normal hover/tilt run
    const setUserInteract = (on) => {
      if(on) card.classList.add('user-interact');
      else card.classList.remove('user-interact');
    };

    // use pointer events for mouse/touch/pen
    card.addEventListener('pointerenter', () => setUserInteract(true));
    card.addEventListener('pointerleave', () => setUserInteract(false));
    card.addEventListener('pointerdown', () => setUserInteract(true));
    card.addEventListener('pointerup', () => setTimeout(()=> setUserInteract(false), 800));

    // small mouse tilt/3d effect for media (unchanged)
    media.addEventListener('mousemove', (ev) => {
      const r = media.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width - 0.5;
      const py = (ev.clientY - r.top) / r.height - 0.5;
      const rx = py * 6;
      const ry = px * -8;
      media.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(10px)`;
      // while interacting, also ensure the card is flagged as user-interact
      card.classList.add('user-interact');
    });
    media.addEventListener('mouseleave', () => {
      media.style.transform = '';
      card.classList.remove('user-interact');
    });

    return card;
  }

  function renderSection(key, container){
    const items = data[key] || [];
    container.innerHTML = '';
    items.forEach((it, idx) => {
      container.appendChild(buildCard(it, idx+1));
    });
  }

  // render all sections
  document.querySelectorAll('.card-grid').forEach(grid => {
    const sec = grid.dataset.section;
    renderSection(sec, grid);
  });

  // reveal on scroll with IntersectionObserver (observe cards after they are added)
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('inview');
      }
    });
  }, { threshold: 0.12 });

  // observe cards dynamically (give browser a tick so cards exist)
  requestAnimationFrame(() => {
    document.querySelectorAll('.card').forEach(c => obs.observe(c));
  });

  // pause non-focused videos and play on click
  document.addEventListener('click', (e) => {
    const v = e.target.closest('video');
    if(v){
      if(v.paused) v.play(); else v.pause();
    }
  });

  // stop videos when scrolling away
  const vidObs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      const vid = en.target;
      if(en.intersectionRatio < 0.25){
        try{ vid.pause(); }catch(e){}
      }
    });
  }, { threshold: [0,0.25] });
  document.querySelectorAll('video').forEach(v => vidObs.observe(v));

})();

/* -------------------------
   Media modal (zoom-to-50%) behavior
   ------------------------- */
(function(){
  const modal = document.getElementById('mediaModal');
  const modalContent = document.getElementById('mediaModalContent');
  const closeBtn = modal && modal.querySelector('.media-modal-close');
  const backdrop = modal && modal.querySelector('.media-modal-backdrop');

  if(!modal || !modalContent) return;

  function openModalWith(nodeType, src, options = {}){
    // Set loading state
    modal.setAttribute('data-loading', 'true');
    
    // clear existing
    modalContent.innerHTML = '';

    if(nodeType === 'video'){
      const v = document.createElement('video');
      v.src = src;
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      v.muted = !!options.muted ? true : false;
      v.style.display = 'block';
      v.setAttribute('aria-label', options.alt || 'Video preview');
      modalContent.appendChild(v);
      // ensure play tries
      v.play().catch(()=>{ /* ignore autoplay policy */ });
    } else {
      if(nodeType === 'iframe'){
        // try to show an iframe preview for external links (may be blocked by X-Frame-Options)
        const frame = document.createElement('iframe');
        frame.src = src;
        frame.style.width = '100%';
        frame.style.height = '80vh';
        frame.style.border = '0';
        frame.setAttribute('aria-label', options.alt || 'Web preview');
        // allow some features for richer previews
        frame.setAttribute('allow', 'geolocation; microphone; camera; fullscreen');
        modalContent.appendChild(frame);
      } else {
        const img = document.createElement('img');
        img.alt = options.alt || '';
        
        // Preload image for smooth transition
        const preloadImg = new Image();
        preloadImg.onload = () => {
          img.src = src;
          modalContent.appendChild(img);
          // Remove loading state once image is ready
          requestAnimationFrame(() => {
            modal.removeAttribute('data-loading');
          });
        };
        preloadImg.src = src;
      }
    }

    // show modal
    modal.setAttribute('data-open','true');
    modal.setAttribute('aria-hidden','false');
    // trap focus on close button
    closeBtn && closeBtn.focus();
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  // expose modal opener so other UI (like 'Preview' links) can use it
  window.openMediaModal = function(nodeType, src, options){
    try{ openModalWith(nodeType, src, options); }
    catch(e){ console.warn('openMediaModal failed', e); }
  };

  function closeModal(){
    // pause any media inside modal
    const v = modalContent.querySelector('video');
    if(v){ try{ v.pause(); }catch(_){} }
    modal.setAttribute('data-open','false');
    modal.setAttribute('aria-hidden','true');
    modalContent.innerHTML = '';
    document.body.style.overflow = '';
  }

  // click handling: open when a media inside .card-media is clicked
  document.addEventListener('click', (e) => {
    // prefer closest to include gifs/images inside .card-media
    const img = e.target.closest('.card-media img');
    const vid = e.target.closest('.card-media video');

    if(img){
      e.preventDefault();
      const src = img.currentSrc || img.src || img.getAttribute('data-src');
      openModalWith('image', src, { alt: img.alt || '' });
      return;
    }
    if(vid){
      e.preventDefault();
      // if clicking the <video> element, open modal with its src
      const src = vid.currentSrc || vid.src;
      openModalWith('video', src, { alt: vid.getAttribute('aria-label') || '' });
      return;
    }
  });

  // close controls
  closeBtn && closeBtn.addEventListener('click', closeModal);
  backdrop && backdrop.addEventListener('click', closeModal);

  // keyboard: Esc to close; left/right could be added later
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && modal.getAttribute('data-open') === 'true'){
      closeModal();
    }
  });

  // when modal closes, return focus to the last focused element if desired (simple approach)
  let lastFocus = null;
  document.addEventListener('focusin', (ev) => {
    if(modal.getAttribute('data-open') === 'true'){
      lastFocus = ev.target;
    }
  });

  // ensure clicking outside content closes (already handled by backdrop) and clicking content doesn't bubble
  modalContent.addEventListener && modalContent.addEventListener('click', (e) => { e.stopPropagation(); });

})();

/* -------------------------
   Enable Netflix-like horizontal auto-scroll per .card-grid
   (updated so items that disappear from the right re-appear from the left)
   ------------------------- */
(function enableCarousels(){
  const grids = document.querySelectorAll('.card-grid');
  if(!grids.length) return;

  grids.forEach(grid => {
    if(grid.dataset.carousel === 'true') return;

    const originalCards = Array.from(grid.children).filter(n => n.classList && n.classList.contains('card'));
    if(originalCards.length === 0) return;

    const carousel = document.createElement('div');
    carousel.className = 'carousel';
    const track = document.createElement('div');
    track.className = 'carousel-track';

    // move original cards into track
    originalCards.forEach(c => track.appendChild(c));

    // duplicate content for seamless looping
    const clones = Array.from(track.children).map(node => node.cloneNode(true));
    clones.forEach(c => track.appendChild(c));

    carousel.appendChild(track);
    grid.innerHTML = '';
    grid.appendChild(carousel);
    grid.dataset.carousel = 'true';

    // Choose direction:
    // 'right' => track animates from -50% -> 0% so items that disappear off the right appear from the left
    // 'left'  => track animates from 0 -> -50% (items disappear left then appear right)
    const direction = 'right'; // set to 'right' per request (disappears from right -> appears left)

    // set initial transform to match animation start
    if(direction === 'right'){
      track.style.transform = 'translateX(-50%)';
      track.classList.add('right');
    } else {
      track.style.transform = 'translateX(0%)';
      track.classList.add('left');
    }

    // compute duration based on one-sequence width and desired speed
    function computeDurationAndStart(){
      const total = track.scrollWidth || track.getBoundingClientRect().width;
      const oneWidth = total / 2 || total;
      const pxPerSec = 90; // pixels per second (adjust speed)
      const duration = Math.max(8, Math.round(oneWidth / pxPerSec));
      track.style.animationDuration = duration + 's';

      // ensure the appropriate class is used for animation
      track.classList.add('animate');
      // re-apply left/right class to ensure correct animation-name
      track.classList.remove('left','right');
      track.classList.add(direction === 'right' ? 'right' : 'left');
    }

    // pause/resume on pointer events
    carousel.addEventListener('pointerenter', () => carousel.classList.add('paused'));
    carousel.addEventListener('pointerleave', () => carousel.classList.remove('paused'));
    carousel.addEventListener('pointerdown', () => carousel.classList.add('paused'));
    carousel.addEventListener('pointerup', () => setTimeout(()=> carousel.classList.remove('paused'), 300));

    // recalc when images load or window resizes
    const imgs = carousel.querySelectorAll('img');
    let loadedCount = 0;
    if(imgs.length === 0) computeDurationAndStart();
    imgs.forEach(img => {
      if(img.complete) {
        loadedCount++;
        if(loadedCount === imgs.length) computeDurationAndStart();
      } else {
        img.addEventListener('load', () => {
          loadedCount++;
          if(loadedCount === imgs.length) computeDurationAndStart();
        }, { once: true });
      }
    });
    window.addEventListener('resize', () => {
      track.classList.remove('animate');
      setTimeout(computeDurationAndStart, 150);
    });
  });
})();

/* --- Mobile Navigation --- */
/* --- Mobile Navigation --- */
(function(){
  const nav = document.getElementById('mainNav');
  const toggle = document.getElementById('navToggle');
  
  if(!nav || !toggle) return;

  // Toggle mobile menu function
  function toggleMobileMenu(e) {
    if(e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const isOpen = nav.classList.toggle('active');
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  // Single click event listener for toggle button
  toggle.addEventListener('click', toggleMobileMenu);

  // Handle nav item clicks (close menu when clicking a link)
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close nav when clicking outside
  document.addEventListener('click', (e) => {
    if(!nav.classList.contains('active')) return;
    if(e.target === nav || nav.contains(e.target) || e.target === toggle) return;
    nav.classList.remove('active');
    toggle.setAttribute('aria-expanded','false');
    document.body.style.overflow = '';
  });

  // Close nav on Escape key
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && nav.classList.contains('active')){
      nav.classList.remove('active');
      toggle.setAttribute('aria-expanded','false');
      document.body.style.overflow = '';
    }
  });
})();
