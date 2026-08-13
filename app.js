/* =============================================
   PixelForge — Application Logic
   Photo to PDF · Compress · Format Convert
   + Antigravity Dotted Animation + Dark Mode
   ============================================= */

(function () {
  'use strict';

  // ─── State ───
  const state = {
    pdf: { files: [] },
    compress: { files: [] },
    convert: { files: [], targetFormat: 'jpeg' },
  };

  // ─── DOM References ───
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ═══════════════════════════════════════════════
  // ANTIGRAVITY-STYLE DOTTED GRID ANIMATION
  // A clean, structured grid of dots that subtly
  // react to mouse movement (push away and fade in).
  // ═══════════════════════════════════════════════
  function initDotAnimation() {
    const canvas = $('#dot-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let dots = [];
    let mouse = { x: -1000, y: -1000, vx: 0, vy: 0 };
    let lastMouse = { x: -1000, y: -1000 };
    let frameId;

    const SPACING = 36; // Distance between grid dots
    const BASE_RADIUS = 1.2;
    const MOUSE_RADIUS = 140;

    function isDark() {
      return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createDots();
    }

    function createDots() {
      dots = [];
      const cols = Math.ceil(canvas.width / SPACING) + 2;
      const rows = Math.ceil(canvas.height / SPACING) + 2;
      
      const offsetX = (canvas.width - (cols * SPACING)) / 2;
      const offsetY = (canvas.height - (rows * SPACING)) / 2;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const px = offsetX + x * SPACING;
          const py = offsetY + y * SPACING;
          dots.push({
            baseX: px,
            baseY: py,
            x: px,
            y: py,
            vx: 0,
            vy: 0
          });
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const dark = isDark();
      
      const baseAlpha = dark ? 0.15 : 0.1;
      const activeAlpha = dark ? 0.6 : 0.4;
      const colorRGB = dark ? '255, 255, 255' : '0, 0, 0';

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        
        // Mouse interaction
        const dx = mouse.x - d.baseX;
        const dy = mouse.y - d.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        let targetX = d.baseX;
        let targetY = d.baseY;
        let currentAlpha = baseAlpha;
        let currentR = BASE_RADIUS;

        if (dist < MOUSE_RADIUS) {
          // Push away from mouse
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          const pushX = (dx / dist) * force * 15;
          const pushY = (dy / dist) * force * 15;
          
          targetX = d.baseX - pushX;
          targetY = d.baseY - pushY;
          currentAlpha = baseAlpha + (activeAlpha - baseAlpha) * force;
          currentR = BASE_RADIUS + force * 1.5;
        }

        // Spring physics to return to base or move to target
        d.vx += (targetX - d.x) * 0.1;
        d.vy += (targetY - d.y) * 0.1;
        d.vx *= 0.8; // friction
        d.vy *= 0.8;
        
        d.x += d.vx;
        d.y += d.vy;

        // Draw dot
        ctx.beginPath();
        ctx.arc(d.x, d.y, currentR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colorRGB}, ${currentAlpha})`;
        ctx.fill();
      }

      frameId = requestAnimationFrame(draw);
    }

    // Track mouse
    window.addEventListener('mousemove', (e) => {
      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.vx = mouse.x - lastMouse.x;
      mouse.vy = mouse.y - lastMouse.y;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    window.addEventListener('resize', resize);
    
    // Track touch
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        lastMouse.x = mouse.x;
        lastMouse.y = mouse.y;
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.vx = mouse.x - lastMouse.x;
        mouse.vy = mouse.y - lastMouse.y;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    resize();
    draw();
  }

  // ═══════════════════════════════════════════════
  // DARK MODE
  // ═══════════════════════════════════════════════
  function initDarkMode() {
    const toggle = $('#theme-toggle');
    if (!toggle) return;

    // Set initial toggle state based on current DOM (set by index.html script)
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // Toggle button purely switches theme for the current active session
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
    });

    // Strictly enforce system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    });
  }

  // ─── Header Scroll Effect ───
  function initHeader() {
    const header = $('#main-header');
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ─── Smooth Scroll for Anchor Links ───
  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // ─── Tool Tabs ───
  function initTabs() {
    const tabs = $$('.tool-tab');
    const panels = $$('.tool-panel');
    const indicator = $('#tab-indicator');

    function updateIndicator(tab) {
      if (!indicator || !tab) return;
      indicator.style.width = `${tab.offsetWidth}px`;
      indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
    }

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const tool = tab.dataset.tool;
        tabs.forEach((t) => {
          t.classList.toggle('active', t === tab);
          t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        });
        panels.forEach((p) => {
          p.classList.toggle('active', p.id === `panel-${tool}`);
        });
        updateIndicator(tab);
      });
    });

    // Initialize indicator on the active tab after font loads
    const activeTab = $('.tool-tab.active');
    if (activeTab) {
      setTimeout(() => updateIndicator(activeTab), 50);
    }
    
    window.addEventListener('resize', () => {
      const currentTab = $('.tool-tab.active');
      if (currentTab) updateIndicator(currentTab);
    });
  }

  // ─── Utility Functions ───
  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function getExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  }

  function getMimeType(format) {
    const mimeMap = {
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      bmp: 'image/bmp',
      gif: 'image/gif',
      tiff: 'image/tiff',
      avif: 'image/avif',
      ico: 'image/x-icon',
      svg: 'image/svg+xml',
    };
    return mimeMap[format] || 'image/png';
  }

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url); // Free memory once loaded
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image: ' + file.name));
      };
      img.src = url;
    });
  }

  function createThumbnail(file) {
    // Return an object URL instantly for thumbnails. 
    // It uses no extra memory and avoids freezing the browser.
    return Promise.resolve(URL.createObjectURL(file));
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  let toastTimeoutId = null;
  function showToast(message, duration = 3500) {
    let overlay = $('.toast-overlay');
    let toast = $('.toast');
    
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'toast-overlay';
      toast = document.createElement('div');
      toast.className = 'toast';
      overlay.appendChild(toast);
      document.body.appendChild(overlay);
      
      // Failsafe: Allow user to click anywhere to dismiss the success message 
      // in case mobile browsers freeze the timeout during file downloads.
      overlay.addEventListener('click', () => {
        overlay.classList.remove('visible');
        toast.classList.remove('visible');
      });
    }
    
    if (toastTimeoutId) clearTimeout(toastTimeoutId);
    
    toast.textContent = message;
    overlay.classList.remove('visible');
    toast.classList.remove('visible');
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('visible');
        toast.classList.add('visible');
      });
    });
    
    if (duration > 0) {
      toastTimeoutId = setTimeout(() => {
        overlay.classList.remove('visible');
        toast.classList.remove('visible');
      }, duration);
    }
  }

  function showProgress(show, text, detail, percent) {
    const overlay = $('#progress-overlay');
    const textEl = $('#progress-text');
    const detailEl = $('#progress-detail');
    const bar = $('#progress-bar');
    if (show) {
      overlay.hidden = false;
      if (text) textEl.textContent = text;
      if (detail) detailEl.textContent = detail;
      if (percent !== undefined) bar.style.width = percent + '%';
    } else {
      overlay.hidden = true;
    }
  }

  function initDropZone(dropZoneId, fileInputId, toolKey) {
    const dropZone = $(`#${dropZoneId}`);
    if (!dropZone) return;

    function triggerFileSelect() {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = 'image/*';
      input.style.display = 'none';
      dropZone.appendChild(input);

      input.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
          await addFiles(toolKey, files);
        }
      });
      
      // We must wrap the click in a small timeout to prevent 
      // the browser from getting confused by synchronous DOM mutations 
      // right before opening a native dialog, especially on Android Chrome.
      setTimeout(() => input.click(), 10);
    }

    dropZone.addEventListener('click', (e) => {
      // Prevent bubbling loops if the dynamic input's click bubbles up
      if (e.target.tagName && e.target.tagName.toLowerCase() === 'input') return;
      if (e.target.closest('.file-remove')) return;
      
      e.preventDefault();
      triggerFileSelect();
    });

    dropZone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerFileSelect();
      }
    });

    ['dragenter', 'dragover'].forEach((ev) => {
      dropZone.addEventListener(ev, (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach((ev) => {
      dropZone.addEventListener(ev, (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
      });
    });

    dropZone.addEventListener('drop', (e) => {
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('image/') || f.name.toLowerCase().match(/\.hei[cf]$/i)
      );
      if (files.length > 0) addFiles(toolKey, files);
    });
  }

  // ─── File Management ───
  async function addFiles(toolKey, files) {
    const currentCount = state[toolKey].files.length;
    if (currentCount + files.length > 10) {
      showToast('⚠️ Maximum 10 photos allowed at once.');
      files = files.slice(0, Math.max(0, 10 - currentCount));
    }

    if (files.length === 0) return;
    
    // Show sleek blurred overlay with custom scissor animation
    const uploadOverlay = $('#upload-overlay');
    if (uploadOverlay) uploadOverlay.classList.add('visible');
    
    // Force DOM repaint before intensive processing
    await new Promise(r => setTimeout(r, 60)); 
    
    for (const f of files) {
      try {
        let file = f;
        const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
        
        if (isHeic) {
          try {
            if (typeof heic2any !== 'undefined') {
              const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 });
              const blobArr = Array.isArray(blob) ? blob : [blob];
              file = new File([blobArr[0]], file.name.replace(/\.hei[cf]$/i, '.jpg'), { type: 'image/jpeg' });
            } else {
              console.warn('heic2any not loaded');
            }
          } catch (e) {
            console.error('HEIC conversion error:', e);
          }
        }
        
        const thumb = await createThumbnail(file);
        state[toolKey].files.push({
          id: Date.now() + '-' + Math.random().toString(36).slice(2, 9),
          file,
          thumb,
          name: file.name,
          size: file.size,
        });
      } catch (err) {
        console.error('Error adding file:', err);
        showToast(`❌ Could not load ${f.name}`);
      }
    }
    
    renderFileList(toolKey);
    updateButtonState(toolKey);
    
    // Hide overlay completely and gracefully
    if (uploadOverlay) uploadOverlay.classList.remove('visible');
  }

  function removeFile(toolKey, fileId) {
    state[toolKey].files = state[toolKey].files.filter((f) => f.id !== fileId);
    renderFileList(toolKey);
    updateButtonState(toolKey);
  }

  function renderFileList(toolKey) {
    const listEl = $(`#${toolKey}-file-list`);
    if (!listEl) return;
    listEl.innerHTML = '';

    state[toolKey].files.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'file-item';
      div.style.animationDelay = `${index * 0.05}s`;
      div.draggable = toolKey === 'pdf';
      div.dataset.id = item.id;

      div.innerHTML = `
        ${toolKey === 'pdf' ? `
        <div class="file-drag-handle" title="Drag to reorder">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="18" x2="16" y2="18"/>
          </svg>
        </div>` : ''}
        <img class="file-thumb" src="${item.thumb}" alt="${item.name}" loading="lazy">
        <div class="file-info">
          <div class="file-name">${item.name}</div>
          <div class="file-meta">${formatSize(item.size)} · ${getExtension(item.name).toUpperCase()}</div>
        </div>
        <button class="file-remove" title="Remove" data-remove="${item.id}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      `;

      listEl.appendChild(div);
    });

    // Remove handlers
    listEl.querySelectorAll('[data-remove]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeFile(toolKey, btn.dataset.remove);
      });
    });

    // Drag & drop reorder for PDF
    // Force a DOM layout recalculation (reflow) to fix Chrome Android repaint bugs
    void listEl.offsetHeight;
    if (toolKey === 'pdf') {
      initDragReorder(listEl, toolKey);
    }
  }

  function updateButtonState(toolKey) {
    const btnMap = {
      pdf: '#pdf-generate-btn',
      compress: '#compress-btn',
      convert: '#convert-btn',
    };
    const btn = $(btnMap[toolKey]);
    if (btn) {
      btn.disabled = state[toolKey].files.length === 0;
    }
  }

  // ─── Drag-to-Reorder (PDF) ───
  function initDragReorder(listEl, toolKey) {
    let draggedId = null;

    listEl.querySelectorAll('.file-item').forEach((item) => {
      item.addEventListener('dragstart', (e) => {
        draggedId = item.dataset.id;
        item.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        listEl.querySelectorAll('.file-item').forEach((el) => el.classList.remove('drag-target'));
        draggedId = null;
      });

      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        item.classList.add('drag-target');
      });

      item.addEventListener('dragleave', () => {
        item.classList.remove('drag-target');
      });

      item.addEventListener('drop', (e) => {
        e.preventDefault();
        item.classList.remove('drag-target');
        if (!draggedId || draggedId === item.dataset.id) return;

        const files = state[toolKey].files;
        const fromIdx = files.findIndex((f) => f.id === draggedId);
        const toIdx = files.findIndex((f) => f.id === item.dataset.id);
        if (fromIdx === -1 || toIdx === -1) return;

        const [moved] = files.splice(fromIdx, 1);
        files.splice(toIdx, 0, moved);
        renderFileList(toolKey);
      });
    });
  }

  // ─── Range Slider Labels ───
  function initRangeSliders() {
    const ranges = [
      { id: 'pdf-margin', labelId: 'pdf-margin-value', suffix: 'mm' },
      { id: 'pdf-quality', labelId: 'pdf-quality-value', suffix: '%' },
      { id: 'compress-quality', labelId: 'compress-quality-value', suffix: '%' },
      { id: 'convert-quality', labelId: 'convert-quality-value', suffix: '%' },
    ];

    ranges.forEach(({ id, labelId, suffix }) => {
      const input = $(`#${id}`);
      const label = $(`#${labelId}`);
      if (!input || !label) return;
      const update = () => (label.textContent = input.value + suffix);
      input.addEventListener('input', update);
      update();
    });
  }

  // ─── Format Buttons (Convert) ───
  function initFormatButtons() {
    const btns = $$('.format-btn');
    btns.forEach((btn) => {
      btn.addEventListener('click', () => {
        btns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.convert.targetFormat = btn.dataset.format;

        // Show/hide quality slider based on format
        const qualityGroup = $('#convert-quality-group');
        const lossy = ['jpeg', 'webp', 'avif'].includes(btn.dataset.format);
        if (qualityGroup) {
          qualityGroup.style.display = lossy ? 'block' : 'none';
        }
      });
    });
  }

  // ═══════════════════════════════════════════
  //  CORE FEATURES
  // ═══════════════════════════════════════════

  // Helper: wait for jsPDF to be loaded
  function waitForJsPDF(maxWait) {
    return new Promise((resolve, reject) => {
      if (window.jspdf && window.jspdf.jsPDF) {
        return resolve(window.jspdf.jsPDF);
      }
      const start = Date.now();
      const check = setInterval(() => {
        if (window.jspdf && window.jspdf.jsPDF) {
          clearInterval(check);
          resolve(window.jspdf.jsPDF);
        } else if (Date.now() - start > maxWait) {
          clearInterval(check);
          reject(new Error('jsPDF library failed to load. Please check your internet connection and reload the page.'));
        }
      }, 100);
    });
  }

  // ─── 1. Photos to PDF ───
  async function generatePDF() {
    const files = state.pdf.files;
    if (files.length === 0) return;

    showProgress(true, 'Loading PDF library...', 'Please wait', 0);

    let JsPDF;
    try {
      JsPDF = await waitForJsPDF(8000);
    } catch (err) {
      showProgress(false);
      showToast('❌ ' + err.message);
      return;
    }

    const pageSize = $('#pdf-page-size').value;
    const orientation = $('#pdf-orientation').value;
    const margin = parseInt($('#pdf-margin').value);
    const quality = parseInt($('#pdf-quality').value) / 100;

    showProgress(true, 'Generating PDF...', `0 / ${files.length} images`, 0);

    try {
      let pdf = null;

      for (let i = 0; i < files.length; i++) {
        const item = files[i];
        showProgress(true, 'Generating PDF...', `Processing image ${i + 1} / ${files.length}`, ((i + 1) / files.length) * 90);

        const img = await loadImage(item.file);
        const imgW = img.naturalWidth;
        const imgH = img.naturalHeight;

        // Determine page orientation
        let pageOrientation;
        if (orientation === 'auto') {
          pageOrientation = imgW > imgH ? 'l' : 'p';
        } else {
          pageOrientation = orientation === 'landscape' ? 'l' : 'p';
        }

        // Compress image via canvas before adding to PDF
        const canvas = document.createElement('canvas');
        const maxDim = 2400;
        let cW = imgW;
        let cH = imgH;
        if (cW > maxDim || cH > maxDim) {
          const ratio = Math.min(maxDim / cW, maxDim / cH);
          cW = Math.round(cW * ratio);
          cH = Math.round(cH * ratio);
        }
        canvas.width = cW;
        canvas.height = cH;
        const cCtx = canvas.getContext('2d');
        // White background for transparency
        cCtx.fillStyle = '#FFFFFF';
        cCtx.fillRect(0, 0, cW, cH);
        cCtx.drawImage(img, 0, 0, cW, cH);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Initialize PDF on first page or add new page
        if (i === 0) {
          if (pageSize === 'fit') {
            const pxToMm = 25.4 / 96;
            const pageW = Math.max(10, cW * pxToMm + margin * 2); // Enforce min width for low-quality/small images
            const pageH = Math.max(10, cH * pxToMm + margin * 2);
            pdf = new JsPDF({
              orientation: pageOrientation,
              unit: 'mm',
              format: [pageW, pageH],
            });
          } else {
            pdf = new JsPDF({
              orientation: pageOrientation,
              unit: 'mm',
              format: pageSize,
            });
          }
        } else {
          if (pageSize === 'fit') {
            const pxToMm = 25.4 / 96;
            const pageW = Math.max(10, cW * pxToMm + margin * 2);
            const pageH = Math.max(10, cH * pxToMm + margin * 2);
            pdf.addPage([pageW, pageH], pageOrientation);
          } else {
            pdf.addPage(pageSize, pageOrientation);
          }
        }

        const pW = pdf.internal.pageSize.getWidth();
        const pH = pdf.internal.pageSize.getHeight();

        // Fit image within page with margins
        const availW = pW - margin * 2;
        const availH = pH - margin * 2;
        const scale = Math.min(availW / cW, availH / cH);
        const drawW = cW * scale;
        const drawH = cH * scale;
        const x = margin + (availW - drawW) / 2;
        const y = margin + (availH - drawH) / 2;

        pdf.addImage(dataUrl, 'JPEG', x, y, drawW, drawH);

        // Let UI breathe
        await new Promise((r) => setTimeout(r, 30));
      }

      showProgress(true, 'Saving PDF...', 'Almost done', 95);
      await new Promise((r) => setTimeout(r, 100));

      const baseName = files[0].name.replace(/\.[^.]+$/, '');
      const outName = `${baseName}_pdf_${Date.now()}.pdf`;
      pdf.save(outName);
      showProgress(false);
      showToast(`✅ PDF created with ${files.length} page${files.length > 1 ? 's' : ''}!`);
      // Track in admin analytics
      if (window.PFAdmin) window.PFAdmin.trackPDF(files);
    } catch (err) {
      showProgress(false);
      showToast('❌ Error generating PDF: ' + err.message);
      console.error('PDF generation error:', err);
    }
  }

  // ─── 2. Compress Images ───
  async function compressImages() {
    const files = state.compress.files;
    if (files.length === 0) return;

    const quality = parseInt($('#compress-quality').value) / 100;
    const maxW = parseInt($('#compress-max-width').value) || 1920;
    const maxH = parseInt($('#compress-max-height').value) || 1080;
    const outputFormat = $('#compress-output-format').value;
    const mimeType = getMimeType(outputFormat);

    showProgress(true, 'Compressing images...', `0 / ${files.length}`, 0);

    try {
      let totalOriginal = 0;
      let totalCompressed = 0;
      let zip = null;
      if (files.length > 1 && window.JSZip) {
        zip = new JSZip();
      }

      for (let i = 0; i < files.length; i++) {
        const item = files[i];
        showProgress(true, 'Compressing images...', `${i + 1} / ${files.length}`, ((i + 1) / files.length) * 100);

        const img = await loadImage(item.file);
        const canvas = document.createElement('canvas');

        let w = img.naturalWidth;
        let h = img.naturalHeight;

        // Resize if larger than max dimensions
        if (w > maxW || h > maxH) {
          const ratio = Math.min(maxW / w, maxH / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        // White background for formats that don't support transparency
        if (outputFormat === 'jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, w, h);
        }
        ctx.drawImage(img, 0, 0, w, h);

        const blob = await new Promise((resolve) => {
          canvas.toBlob(resolve, mimeType, quality);
        });

        totalOriginal += item.size;
        totalCompressed += blob.size;

        const outName = item.name; // Keep exact original filename as requested!
        
        if (zip) {
          zip.file(outName, blob);
        } else {
          downloadBlob(blob, outName);
        }

        await new Promise((r) => setTimeout(r, 50));
      }

      if (zip) {
        showProgress(true, 'Zipping files...', 'Almost done', 95);
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const baseName = files[0].name.replace(/\.[^.]+$/, '');
        downloadBlob(zipBlob, `${baseName}_batch_${Date.now()}.zip`);
      }

      showProgress(false);
      const savedPercent = Math.round((1 - totalCompressed / totalOriginal) * 100);
      showToast(`✅ ${files.length} image${files.length > 1 ? 's' : ''} compressed! Saved ${savedPercent}% size`);
      // Track in admin analytics
      if (window.PFAdmin) window.PFAdmin.trackCompress(files, savedPercent);
    } catch (err) {
      showProgress(false);
      showToast('❌ Error compressing: ' + err.message);
      console.error(err);
    }
  }

  // ─── 3. Convert Image Format ───
  async function convertImages() {
    const files = state.convert.files;
    if (files.length === 0) return;

    const targetFormat = state.convert.targetFormat;
    const quality = parseInt($('#convert-quality').value) / 100;
    const mimeType = getMimeType(targetFormat);

    showProgress(true, 'Converting images...', `0 / ${files.length}`, 0);

    try {
      let zip = null;
      if (files.length > 1 && window.JSZip) {
        zip = new JSZip();
      }

      for (let i = 0; i < files.length; i++) {
        const item = files[i];
        showProgress(true, 'Converting images...', `${i + 1} / ${files.length}`, ((i + 1) / files.length) * 100);

        // Handle SVG output specially
        if (targetFormat === 'svg') {
          const reader = new FileReader();
          const dataUrl = await new Promise((resolve) => {
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(item.file);
          });
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = dataUrl;
          });
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${img.naturalWidth}" height="${img.naturalHeight}" viewBox="0 0 ${img.naturalWidth} ${img.naturalHeight}"><image xlink:href="${dataUrl}" width="${img.naturalWidth}" height="${img.naturalHeight}"/></svg>`;
          const blob = new Blob([svg], { type: 'image/svg+xml' });
          const baseName = item.name.replace(/\.[^.]+$/, '');
          const outName = `${baseName}.svg`;
          if (zip) zip.file(outName, blob);
          else downloadBlob(blob, outName);
        } else if (targetFormat === 'ico') {
          const img = await loadImage(item.file);
          const canvas = document.createElement('canvas');
          canvas.width = 256;
          canvas.height = 256;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, 256, 256);
          const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
          const baseName = item.name.replace(/\.[^.]+$/, '');
          const outName = `${baseName}.ico`;
          if (zip) zip.file(outName, blob);
          else downloadBlob(blob, outName);
        } else if (targetFormat === 'tiff') {
          const img = await loadImage(item.file);
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
          const baseName = item.name.replace(/\.[^.]+$/, '');
          const outName = `${baseName}.tiff`;
          if (zip) zip.file(outName, blob);
          else downloadBlob(blob, outName);
        } else {
          const img = await loadImage(item.file);
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');

          // Handle transparency for JPEG/BMP
          if (['jpeg', 'bmp'].includes(targetFormat)) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(img, 0, 0);

          const isLossy = ['jpeg', 'webp', 'avif'].includes(targetFormat);
          const blob = await new Promise((resolve) => {
            canvas.toBlob(resolve, mimeType, isLossy ? quality : undefined);
          });

          const baseName = item.name.replace(/\.[^.]+$/, '');
          const ext = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
          const outName = `${baseName}.${ext}`;
          if (zip) zip.file(outName, blob);
          else downloadBlob(blob, outName);
        }

        await new Promise((r) => setTimeout(r, 50));
      }

      if (zip) {
        showProgress(true, 'Zipping files...', 'Almost done', 95);
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const baseName = files[0].name.replace(/\.[^.]+$/, '');
        downloadBlob(zipBlob, `${baseName}_batch_${Date.now()}.zip`);
      }

      showProgress(false);
      showToast(`✅ ${files.length} image${files.length > 1 ? 's' : ''} converted to ${targetFormat.toUpperCase()}`);
      // Track in admin analytics
      if (window.PFAdmin) window.PFAdmin.trackConvert(files, targetFormat);
    } catch (err) {
      showProgress(false);
      showToast('❌ Error converting: ' + err.message);
      console.error(err);
    }
  }

  // ─── Button Handlers ───
  function initButtons() {
    const pdfBtn = $('#pdf-generate-btn');
    const compressBtn = $('#compress-btn');
    const convertBtn = $('#convert-btn');

    if (pdfBtn) pdfBtn.addEventListener('click', generatePDF);
    if (compressBtn) compressBtn.addEventListener('click', compressImages);
    if (convertBtn) convertBtn.addEventListener('click', convertImages);
  }

  // ─── Intersection Observer for Scroll Animations ───
  function initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    $$('.step-card, .privacy-card, .section-header').forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      observer.observe(el);
    });
  }

  // ─── Typing Animation ───
  function initTypingAnimation() {
    const targets = $$('.typing-target');
    if (!targets.length) return;

    // Pre-cache all text content BEFORE observer can wipe it when off-screen!
    targets.forEach(target => {
      const lines = target.querySelectorAll('.title-line');
      if (lines.length >= 2) {
        target.dataset.originalText1 = lines[0].textContent;
        target.dataset.originalText2 = lines[1].textContent;
      }
    });

    // We will use requestAnimationFrame for hyper-smooth typing
    function playTyping(target) {
      const lines = target.querySelectorAll('.title-line');
      if (lines.length < 2) return;

      const text1 = target.dataset.originalText1;
      const text2 = target.dataset.originalText2;

      // Reset
      lines[0].textContent = '';
      lines[1].textContent = '';
      lines[1].style.display = 'none';

      // Clear any previous interval
      if (target.blinkInterval) clearInterval(target.blinkInterval);
      target.isTyping = true; // prevent overlapping calls

      lines[0].style.borderRight = '2px solid var(--text-primary)';
      lines[0].style.paddingRight = '4px';

      let i = 0;
      let lastTime = performance.now();
      const speed = 40; // slightly slower (40ms) for better readability

      function typeFirstLine(time) {
        if (!target.isTyping) return; // stopped
        if (time - lastTime > speed) {
          lines[0].textContent += text1.charAt(i);
          i++;
          lastTime = time;
        }
        if (i < text1.length) {
          requestAnimationFrame(typeFirstLine);
        } else {
          lines[0].style.borderRight = 'none';
          lines[0].style.paddingRight = '0';
          lines[1].style.display = 'block';
          lines[1].style.borderRight = '2px solid var(--text-primary)';
          lines[1].style.paddingRight = '4px';
          
          let j = 0;
          let lastTime2 = performance.now();
          
          function typeSecondLine(time2) {
            if (!target.isTyping) return;
            if (time2 - lastTime2 > speed) {
              lines[1].textContent += text2.charAt(j);
              j++;
              lastTime2 = time2;
            }
            if (j < text2.length) {
              requestAnimationFrame(typeSecondLine);
            } else {
              // Smooth pulse blinking cursor
              let visible = true;
              target.blinkInterval = setInterval(() => {
                visible = !visible;
                lines[1].style.borderColor = visible ? 'var(--text-primary)' : 'transparent';
              }, 500);
            }
          }
          setTimeout(() => requestAnimationFrame(typeSecondLine), 150);
        }
      }
      
      setTimeout(() => requestAnimationFrame(typeFirstLine), 200);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          playTyping(entry.target);
        } else {
          // Reset text so it's ready to type again when scrolled into view
          entry.target.isTyping = false;
          const lines = entry.target.querySelectorAll('.title-line');
          if (lines.length >= 2) {
            if (entry.target.blinkInterval) clearInterval(entry.target.blinkInterval);
            lines[0].textContent = '';
            lines[1].textContent = '';
            lines[1].style.display = 'none';
            lines[0].style.borderRight = 'none';
          }
        }
      });
    }, { threshold: 0.2 });

    targets.forEach(target => observer.observe(target));
  }

  // ─── Initialize Everything ───
  function init() {
    initDarkMode();
    initDotAnimation();
    initHeader();
    initSmoothScroll();
    initTabs();
    initRangeSliders();
    initFormatButtons();
    initButtons();
    initScrollAnimations();
    initTypingAnimation();

    // Drop zones
    initDropZone('pdf-drop-zone', 'pdf-file-input', 'pdf');
    initDropZone('compress-drop-zone', 'compress-file-input', 'compress');
    initDropZone('convert-drop-zone', 'convert-file-input', 'convert');
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
/* =============================================
   PixelForge — Admin Panel
   Secret dashboard for the site owner only.
   Access: Ctrl+Shift+A or URL #admin
   ============================================= */

(function () {
  'use strict';

  // ═══════════════════════════════════════════
  // ADMIN ACCESS
  // ═══════════════════════════════════════════
  const _PK = '8f6e6e5a46f067810717eae70248445901be5156f13386bdbc0d258f4f1aeff3';

  async function _verify(input) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex === _PK;
    } catch {
      return false;
    }
  }

  // ═══════════════════════════════════════════
  // ANALYTICS STORAGE
  // ═══════════════════════════════════════════
  const STORAGE_KEY = 'pf_analytics';

  function getAnalytics() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createEmptyAnalytics();
      return JSON.parse(raw);
    } catch {
      return createEmptyAnalytics();
    }
  }

  function saveAnalytics(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Analytics storage full:', e);
    }
  }

  function createEmptyAnalytics() {
    return {
      visits: 0,
      pdfsGenerated: 0,
      imagesCompressed: 0,
      imagesConverted: 0,
      totalFilesProcessed: 0,
      activityLog: [],
      fileLog: [],
    };
  }

  // ═══════════════════════════════════════════
  // PUBLIC API — called from app.js
  // ═══════════════════════════════════════════

  // Track a page visit
  function trackVisit() {
    const data = getAnalytics();
    data.visits++;
    data.activityLog.unshift({
      type: 'visit',
      time: new Date().toISOString(),
      action: 'Page Visit',
      details: `${navigator.userAgent.split(') ')[0]})`,
      fileCount: 0,
    });
    // Keep log under 500 entries
    if (data.activityLog.length > 500) data.activityLog.length = 500;
    saveAnalytics(data);
  }

  // Track PDF generation
  function trackPDF(files) {
    const data = getAnalytics();
    data.pdfsGenerated++;
    data.totalFilesProcessed += files.length;

    data.activityLog.unshift({
      type: 'pdf',
      time: new Date().toISOString(),
      action: 'PDF Generated',
      details: `${files.length} image${files.length > 1 ? 's' : ''} → 1 PDF`,
      fileCount: files.length,
    });

    for (const f of files) {
      data.fileLog.unshift({
        time: new Date().toISOString(),
        name: f.name,
        size: f.size,
        type: f.file ? f.file.type : 'image/*',
        tool: 'PDF',
      });
    }

    if (data.activityLog.length > 500) data.activityLog.length = 500;
    if (data.fileLog.length > 1000) data.fileLog.length = 1000;
    saveAnalytics(data);
  }

  // Track image compression
  function trackCompress(files, savedPercent) {
    const data = getAnalytics();
    data.imagesCompressed += files.length;
    data.totalFilesProcessed += files.length;

    data.activityLog.unshift({
      type: 'compress',
      time: new Date().toISOString(),
      action: 'Images Compressed',
      details: `${files.length} file${files.length > 1 ? 's' : ''}, saved ${savedPercent}%`,
      fileCount: files.length,
    });

    for (const f of files) {
      data.fileLog.unshift({
        time: new Date().toISOString(),
        name: f.name,
        size: f.size,
        type: f.file ? f.file.type : 'image/*',
        tool: 'Compress',
      });
    }

    if (data.activityLog.length > 500) data.activityLog.length = 500;
    if (data.fileLog.length > 1000) data.fileLog.length = 1000;
    saveAnalytics(data);
  }

  // Track format conversion
  function trackConvert(files, targetFormat) {
    const data = getAnalytics();
    data.imagesConverted += files.length;
    data.totalFilesProcessed += files.length;

    data.activityLog.unshift({
      type: 'convert',
      time: new Date().toISOString(),
      action: 'Format Converted',
      details: `${files.length} file${files.length > 1 ? 's' : ''} → ${targetFormat.toUpperCase()}`,
      fileCount: files.length,
    });

    for (const f of files) {
      data.fileLog.unshift({
        time: new Date().toISOString(),
        name: f.name,
        size: f.size,
        type: f.file ? f.file.type : 'image/*',
        tool: 'Convert → ' + targetFormat.toUpperCase(),
      });
    }

    if (data.activityLog.length > 500) data.activityLog.length = 500;
    if (data.fileLog.length > 1000) data.fileLog.length = 1000;
    saveAnalytics(data);
  }

  // Expose tracking functions globally for app.js to call
  window.PFAdmin = {
    trackVisit,
    trackPDF,
    trackCompress,
    trackConvert,
  };

  // ═══════════════════════════════════════════
  // ADMIN UI
  // ═══════════════════════════════════════════
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  let adminUnlocked = false;
  let currentFilter = 'all';

  function formatSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function formatTime(isoStr) {
    try {
      const d = new Date(isoStr);
      const now = new Date();
      const diffMs = now - d;
      const diffMin = Math.floor(diffMs / 60000);
      const diffHr = Math.floor(diffMs / 3600000);
      const diffDay = Math.floor(diffMs / 86400000);

      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHr < 24) return `${diffHr}h ago`;
      if (diffDay < 7) return `${diffDay}d ago`;

      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  }

  function getActionBadgeClass(type) {
    const map = {
      visit: 'badge-blue',
      pdf: 'badge-purple',
      compress: 'badge-green',
      convert: 'badge-coral',
    };
    return map[type] || 'badge-blue';
  }

  // Show login gate
  function showLogin() {
    const overlay = $('#admin-login-overlay');
    if (overlay) {
      overlay.hidden = false;
      setTimeout(() => {
        const input = $('#admin-password-input');
        if (input) input.focus();
      }, 100);
    }
  }

  function hideLogin() {
    const overlay = $('#admin-login-overlay');
    if (overlay) overlay.hidden = true;
    const err = $('#admin-login-error');
    if (err) err.hidden = true;
    const input = $('#admin-password-input');
    if (input) input.value = '';
  }

  // Show admin panel
  function showAdmin() {
    adminUnlocked = true;
    hideLogin();
    const panel = $('#admin-panel');
    if (panel) panel.hidden = false;
    document.body.style.overflow = 'hidden';
    refreshDashboard();
  }

  function hideAdmin() {
    const panel = $('#admin-panel');
    if (panel) panel.hidden = true;
    document.body.style.overflow = '';
    adminUnlocked = false;
  }

  // Refresh dashboard data
  function refreshDashboard() {
    const data = getAnalytics();

    // Update stat cards
    const statVisits = $('#stat-visits');
    const statPdfs = $('#stat-pdfs');
    const statCompressed = $('#stat-compressed');
    const statConverted = $('#stat-converted');
    const statTotalFiles = $('#stat-total-files');
    const statLastActive = $('#stat-last-active');

    if (statVisits) statVisits.textContent = data.visits.toLocaleString();
    if (statPdfs) statPdfs.textContent = data.pdfsGenerated.toLocaleString();
    if (statCompressed) statCompressed.textContent = data.imagesCompressed.toLocaleString();
    if (statConverted) statConverted.textContent = data.imagesConverted.toLocaleString();
    if (statTotalFiles) statTotalFiles.textContent = data.totalFilesProcessed.toLocaleString();

    if (statLastActive) {
      if (data.activityLog.length > 0) {
        statLastActive.textContent = formatTime(data.activityLog[0].time);
      } else {
        statLastActive.textContent = '—';
      }
    }

    // Render activity log
    renderActivityLog(data);

    // Render file log
    renderFileLog(data);
  }

  function renderActivityLog(data) {
    const tbody = $('#admin-log-body');
    if (!tbody) return;

    const filtered = currentFilter === 'all'
      ? data.activityLog
      : data.activityLog.filter((e) => e.type === currentFilter);

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr class="admin-log-empty"><td colspan="4">No activity recorded yet</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.slice(0, 100).map((entry) => `
      <tr>
        <td class="log-time">${formatTime(entry.time)}</td>
        <td><span class="log-badge ${getActionBadgeClass(entry.type)}">${entry.action}</span></td>
        <td class="log-details">${entry.details}</td>
        <td class="log-files">${entry.fileCount > 0 ? entry.fileCount : '—'}</td>
      </tr>
    `).join('');
  }

  function renderFileLog(data) {
    const tbody = $('#admin-files-body');
    if (!tbody) return;

    if (data.fileLog.length === 0) {
      tbody.innerHTML = '<tr class="admin-log-empty"><td colspan="5">No files processed yet</td></tr>';
      return;
    }

    tbody.innerHTML = data.fileLog.slice(0, 100).map((f) => `
      <tr>
        <td class="log-time">${formatTime(f.time)}</td>
        <td class="log-filename">${escapeHtml(f.name)}</td>
        <td>${formatSize(f.size)}</td>
        <td><code>${f.type}</code></td>
        <td><span class="log-badge badge-blue">${f.tool}</span></td>
      </tr>
    `).join('');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ═══════════════════════════════════════════
  // EVENT BINDINGS
  // ═══════════════════════════════════════════
  function initAdmin() {
    // Secret keyboard shortcut: Ctrl+Shift+A
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        if (adminUnlocked) {
          hideAdmin();
        } else {
          showLogin();
        }
      }
      // Escape to close
      if (e.key === 'Escape') {
        if (adminUnlocked) hideAdmin();
        else hideLogin();
      }
    });

    // URL hash check
    if (window.location.hash === '#admin') {
      showLogin();
      // Remove hash so it's not visible
      history.replaceState(null, '', window.location.pathname);
    }

    // Login form
    const form = $('#admin-login-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = $('#admin-password-input');
        const err = $('#admin-login-error');
        if (!input) return;

        const isValid = await _verify(input.value);
        if (isValid) {
          showAdmin();
        } else {
          if (err) {
            err.hidden = false;
            err.classList.add('shake');
            setTimeout(() => err.classList.remove('shake'), 500);
          }
          input.value = '';
          input.focus();
        }
      });
    }

    // Password visibility toggle
    const pwToggle = $('#admin-pw-toggle');
    if (pwToggle) {
      pwToggle.addEventListener('click', () => {
        const input = $('#admin-password-input');
        if (!input) return;
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        pwToggle.querySelector('.eye-open').style.display = isPassword ? 'none' : 'block';
        pwToggle.querySelector('.eye-closed').style.display = isPassword ? 'block' : 'none';
      });
    }

    // Close buttons
    const loginClose = $('#admin-login-close');
    if (loginClose) loginClose.addEventListener('click', hideLogin);

    const adminClose = $('#admin-close');
    if (adminClose) adminClose.addEventListener('click', hideAdmin);

    // Clear data
    const clearBtn = $('#admin-clear-data');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Clear ALL analytics data? This cannot be undone.')) {
          localStorage.removeItem(STORAGE_KEY);
          refreshDashboard();
        }
      });
    }

    // Export data
    const exportBtn = $('#admin-export-data');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const data = getAnalytics();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `anyimageconverter-analytics-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }

    // Filter buttons
    $$('.admin-filter').forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('.admin-filter').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        refreshDashboard();
      });
    });

    // Track this page visit
    trackVisit();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdmin);
  } else {
    initAdmin();
  }
})();
