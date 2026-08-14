/* =============================================
   Application Logic
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
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        resolve(img);
      };
      img.onerror = () => {
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        reject(new Error("Failed to load image: " + file.name));
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
              throw new Error('heic2any not loaded');
            }
          } catch (e) {
            console.error('HEIC conversion error:', e);
            throw new Error('Failed to convert HEIC image');
          }
        }
        
        // Strict validation: attempt to load the image into memory immediately.
        // If it's a corrupted file or an unsupported format, this will cleanly reject it.
        await loadImage(file);
        
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
        showToast(`❌ Could not load ${f.name} - Unsupported or corrupted file.`);
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

      const pdfBlob = pdf.output('blob');
      const newSize = pdfBlob.size;
      const originalSize = files.reduce((acc, f) => acc + f.size, 0);
      
      const baseName = files[0].name.replace(/\.[^.]+$/, '');
      const outName = `${baseName}_pdf_${Date.now()}.pdf`;
      pdf.save(outName);
      showProgress(false);
      showToast(`✅ PDF created with ${files.length} page${files.length > 1 ? 's' : ''}!`);
      if (window.PFAdmin) window.PFAdmin.trackPDF(files, originalSize, newSize);
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
      if (window.PFAdmin) window.PFAdmin.trackCompress(files, savedPercent, totalOriginal, totalCompressed);
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
      let totalOriginal = 0; let totalConverted = 0; let zip = null;
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
          totalOriginal += item.size; totalConverted += blob.size;
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
          totalOriginal += item.size; totalConverted += blob.size;
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
          totalOriginal += item.size; totalConverted += blob.size;
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
          totalOriginal += item.size; totalConverted += blob.size;
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
      if (window.PFAdmin) window.PFAdmin.trackConvert(files, targetFormat, totalOriginal, totalConverted);
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
     PixelForge — Admin Panel (Global Tracking)
     Access: Ctrl+Shift+A or URL #admin
  ============================================= */
  

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  // ─── Firebase Initialization ───
  const firebaseConfig = {
    apiKey: "AIzaSyD-LoafDXPUWJdE0cTxxlr1_lo3OMy05pQ",
    authDomain: "anyimageconverter-6f18b.firebaseapp.com",
    projectId: "anyimageconverter-6f18b",
    storageBucket: "anyimageconverter-6f18b.firebasestorage.app",
    messagingSenderId: "697621272556",
    appId: "1:697621272556:web:896904baa0c2aa31f212c9",
    measurementId: "G-3647HTVH6V"
  };

  let db = null;
  if (typeof firebase !== 'undefined') {
    try {
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      console.log("Firebase initialized for Universal Tracking.");
    } catch (e) {
      console.error("Firebase init failed:", e);
    }
  }

  // ─── Universal Device Parser ───
  function getDeviceMetadata() {
    const ua = navigator.userAgent;
    let os = 'Unknown OS';
    let browser = 'Unknown Browser';
    let type = 'Desktop';

    // Detect OS
    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Mac OS X/i.test(ua)) {
      if (/iPhone|iPad|iPod/i.test(ua)) { os = 'iOS'; type = 'Mobile'; }
      else os = 'macOS';
    }
    else if (/Android/i.test(ua)) { os = 'Android'; type = 'Mobile'; }
    else if (/Linux/i.test(ua)) os = 'Linux';

    // Detect Browser
    if (/Chrome|CriOS/i.test(ua) && !/Edg|OPR|SamsungBrowser/i.test(ua)) browser = 'Chrome';
    else if (/Safari/i.test(ua) && !/Chrome|CriOS/i.test(ua)) browser = 'Safari';
    else if (/Firefox|FxiOS/i.test(ua)) browser = 'Firefox';
    else if (/Edg/i.test(ua)) browser = 'Edge';
    else if (/OPR|Opera/i.test(ua)) browser = 'Opera';
    else if (/SamsungBrowser/i.test(ua)) browser = 'Samsung Internet';
    
    return { os, browser, type };
  }

  // ─── Cloud Tracking Logic ───
  async function incrementStat(field, amount = 1) {
    if (!db) return;
    try {
      const docRef = db.collection('stats').doc('global');
      await docRef.set({
        [field]: firebase.firestore.FieldValue.increment(amount)
      }, { merge: true });
    } catch (e) {
      console.error("Stat update failed:", e);
    }
  }

  async function pushLog(action, details, fileInfo = null) {
    if (!db) return;
    try {
      const device = getDeviceMetadata();
      await db.collection('logs').add({
        action,
        details,
        os: device.os,
        browser: device.browser,
        type: device.type,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        originalSize: fileInfo ? fileInfo.originalSize : null,
        newSize: fileInfo ? fileInfo.newSize : null,
        toolUsed: fileInfo ? fileInfo.toolUsed : null
      });
    } catch (e) {
      console.error("Log push failed:", e);
    }
  }

  window.PFAdmin = {
    trackAdminLogin: () => {
      pushLog('admin', 'Admin Panel Unlocked');
    },
    trackVisit: () => {
      incrementStat('visits');
      pushLog('visit', 'Page loaded');
    },
    trackPDF: (files, oSize, nSize) => {
      incrementStat('pdfsGenerated');
      incrementStat('totalFilesProcessed', files.length);
      pushLog('pdf', `Generated PDF from ${files.length} images`, { originalSize: oSize, newSize: nSize, toolUsed: 'PDF Generator' });
    },
    trackCompress: (files, savedPercent, oSize, nSize) => {
      incrementStat('imagesCompressed', files.length);
      incrementStat('totalFilesProcessed', files.length);
      pushLog('compress', `Compressed ${files.length} images (Saved ~${savedPercent}%)`, { originalSize: oSize, newSize: nSize, toolUsed: 'Compressor' });
    },
    trackConvert: (files, targetFormat, oSize, nSize) => {
      incrementStat('imagesConverted', files.length);
      incrementStat('totalFilesProcessed', files.length);
      pushLog('convert', `Converted ${files.length} images to ${targetFormat.toUpperCase()}`, { originalSize: oSize, newSize: nSize, toolUsed: 'Format Converter' });
    }
  };

  // ─── ADMIN UI LOGIC ───
  let cachedData = {
    visits: 0, pdfsGenerated: 0, imagesCompressed: 0, imagesConverted: 0, totalFilesProcessed: 0, activityLog: []
  };
  let adminUnlocked = false;

  const formatTime = (ts) => {
    if (!ts) return 'Just now';
    if (ts.toDate) ts = ts.toDate();
    const d = new Date(ts);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff/60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff/3600000) + 'h ago';
    if (diff < 172800000) return 'Yesterday';
    return d.toLocaleDateString();
  };

  let statsUnsubscribe = null;
  let logsUnsubscribe = null;

  function subscribeAdminData() {
    if (!db) return;
    
    if (!statsUnsubscribe) {
      statsUnsubscribe = db.collection('stats').doc('global').onSnapshot((doc) => {
        if (doc.exists) {
          const stats = doc.data();
          cachedData.visits = stats.visits || 0;
          cachedData.pdfsGenerated = stats.pdfsGenerated || 0;
          cachedData.imagesCompressed = stats.imagesCompressed || 0;
          cachedData.imagesConverted = stats.imagesConverted || 0;
          cachedData.totalFilesProcessed = stats.totalFilesProcessed || 0;
          updateDashboardUI();
        }
      }, (e) => console.error('Stats sync error:', e));
    }

    if (!logsUnsubscribe) {
      logsUnsubscribe = db.collection('logs').orderBy('timestamp', 'desc').limit(100).onSnapshot((snap) => {
        cachedData.activityLog = [];
        snap.forEach(doc => cachedData.activityLog.push(doc.data()));
        updateDashboardUI();
      }, (e) => {
        console.error('Logs sync error:', e);
        const fileBody = $('#admin-log-body');
        if (fileBody) fileBody.innerHTML = `<tr class="admin-log-empty"><td colspan="8" style="color:var(--color-accent-coral)">Database Error: ${e.message}</td></tr>`;
      });
    }
  }

  function unsubscribeAdminData() {
    if (statsUnsubscribe) { statsUnsubscribe(); statsUnsubscribe = null; }
    if (logsUnsubscribe) { logsUnsubscribe(); logsUnsubscribe = null; }
  }

  async function refreshDashboard() {
    if (!adminUnlocked) return;
    // The refresh button can now just force a UI update since data is synced
    updateDashboardUI();
  }

  function updateDashboardUI() {
    if (!adminUnlocked) return;
    const data = cachedData;
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
      if (data.activityLog.length > 0 && data.activityLog[0].timestamp) {
        statLastActive.textContent = formatTime(data.activityLog[0].timestamp);
      } else {
        statLastActive.textContent = '—';
      }
    }

    renderActivityLog(data);
  }

  function formatSize(bytes) {
    if (!bytes || bytes === 0) return '—';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function renderActivityLog(data) {
    const tbody = $('#admin-log-body');
    if (!tbody) return;

    const currentFilter = document.querySelector('.admin-filter.active')?.dataset.filter || 'all';
    
    let logs = data.activityLog;
    if (currentFilter !== 'all') {
      logs = logs.filter(log => log.action === currentFilter);
    }

    if (logs.length === 0) {
      tbody.innerHTML = '<tr class="admin-log-empty"><td colspan="8">No global activity recorded yet</td></tr>';
      return;
    }

    tbody.innerHTML = logs.map(log => {
      const timeStr = formatTime(log.timestamp);
      
      let badgeClass = 'badge-blue';
      let actionName = 'Visit';
      if (log.action === 'pdf') { badgeClass = 'badge-purple'; actionName = 'PDF'; }
      if (log.action === 'compress') { badgeClass = 'badge-green'; actionName = 'Compress'; }
      if (log.action === 'convert') { badgeClass = 'badge-coral'; actionName = 'Convert'; }
      if (log.action === 'admin') { badgeClass = 'badge-green'; actionName = 'Admin Login'; }

      let osIcon = '💻';
      if (log.os === 'iOS' || log.os === 'Android') osIcon = '📱';
      
      const oSize = formatSize(log.originalSize);
      const nSize = formatSize(log.newSize);
      const tool = log.toolUsed || '—';

      return `
        <tr>
          <td><span class="log-time">${timeStr}</span></td>
          <td><span style="font-weight:500; color:var(--text-primary)">${osIcon} ${log.os || 'Unknown'}</span></td>
          <td>${log.browser || 'Unknown'}</td>
          <td><span class="log-badge ${badgeClass}">${actionName}</span></td>
          <td><div class="log-details">${log.details}</div></td>
          <td style="color:var(--text-secondary)">${oSize}</td>
          <td style="color:var(--color-accent-green); font-weight:500;">${nSize}</td>
          <td><span class="log-badge badge-blue">${tool}</span></td>
        </tr>
      `;
    }).join('');
  }

  async function checkAdminPassword(e) {
    e.preventDefault();
    const input = $('#admin-password-input');
    const err = $('#admin-login-error');
    
    // Add cryptographic salt and hash it
    const msgBuffer = new TextEncoder().encode(input.value + "AnyImageSalt_99");
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    // Obfuscated integer array to prevent AI scrapers from reading string hashes
    const target = [255, 80, 142, 90, 119, 106, 59, 129, 251, 94, 221, 146, 121, 170, 15, 241, 38, 223, 74, 124, 123, 155, 135, 181, 166, 127, 144, 76, 215, 105, 61, 16];
    
    let isValid = hashArray.length === target.length;
    for (let i = 0; i < target.length; i++) {
      if (hashArray[i] !== target[i]) isValid = false;
    }

    if (isValid) {
      input.value = '';
      err.hidden = true;
      $('#admin-login-overlay').hidden = true;
      showAdmin();
      if (window.PFAdmin) window.PFAdmin.trackAdminLogin();
    } else {
      err.hidden = false;
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 400);
    }
  }

  function showAdmin() {
    adminUnlocked = true;
    const panel = $('#admin-panel');
    if (panel) {
      panel.hidden = false;
      subscribeAdminData();
      refreshDashboard();
    }
  }

  function hideAdmin() {
    const panel = $('#admin-panel');
    if (panel) panel.hidden = true;
    adminUnlocked = false;
    unsubscribeAdminData();
  }

  function initAdmin() {
    // Check hash on load
    if (window.location.hash === '#admin') {
      const overlay = $('#admin-login-overlay');
      if (overlay) overlay.hidden = false;
    }

    // Keyboard shortcut (Ctrl+Shift+A)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (adminUnlocked) {
          hideAdmin();
        } else {
          const overlay = $('#admin-login-overlay');
          if (overlay) {
            overlay.hidden = !overlay.hidden;
            if (!overlay.hidden) setTimeout(() => $('#admin-password-input')?.focus(), 100);
          }
        }
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        const overlay = $('#admin-login-overlay');
        if (overlay && !overlay.hidden) {
          overlay.hidden = true;
        } else if (adminUnlocked) {
          hideAdmin();
        }
      }
    });

    // Login Form
    const form = $('#admin-login-form');
    if (form) form.addEventListener('submit', checkAdminPassword);

    // Password Toggle
    const pwToggle = $('#admin-pw-toggle');
    if (pwToggle) {
      pwToggle.addEventListener('click', () => {
        const input = $('#admin-password-input');
        const openIcon = pwToggle.querySelector('.eye-open');
        const closedIcon = pwToggle.querySelector('.eye-closed');
        if (input.type === 'password') {
          input.type = 'text';
          openIcon.style.display = 'none';
          closedIcon.style.display = 'block';
        } else {
          input.type = 'password';
          openIcon.style.display = 'block';
          closedIcon.style.display = 'none';
        }
      });
    }

    // Close Buttons
    const loginClose = $('#admin-login-close');
    if (loginClose) loginClose.addEventListener('click', () => $('#admin-login-overlay').hidden = true);

    const adminClose = $('#admin-close');
    if (adminClose) adminClose.addEventListener('click', hideAdmin);

    // Refresh Button
    const adminRefresh = $('#admin-refresh-data');
    if (adminRefresh) {
      adminRefresh.addEventListener('click', async () => {
        const svg = adminRefresh.querySelector('svg');
        if (svg) svg.style.animation = 'spin 1s linear infinite';
        // Force UI update
        updateDashboardUI();
        // Keep spinner spinning for half a second for UX feedback
        await new Promise(r => setTimeout(r, 500));
        if (svg) svg.style.animation = '';
      });
    }

    // Export Data
    const adminExport = $('#admin-export-data');
    if (adminExport) {
      adminExport.addEventListener('click', () => {
        if (cachedData.activityLog.length === 0) return showToast('⚠️ No data to export');
        
        let csv = 'Time,OS,Browser,Action,Details,OriginalSize,NewSize,Tool\\n';
        cachedData.activityLog.forEach(log => {
          const t = new Date(log.timestamp ? log.timestamp.toMillis() : Date.now()).toLocaleString().replace(/,/g, '');
          const action = log.action || '';
          const details = (log.details || '').replace(/"/g, '""');
          csv += `"${t}","${log.os||''}","${log.browser||''}","${action}","${details}","${log.originalSize||0}","${log.newSize||0}","${log.toolUsed||''}"\\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pixel_forge_global_log_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    // Clear Data
    const adminClear = $('#admin-clear-data');
    if (adminClear) {
      adminClear.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to clear ALL global logs and stats? This cannot be undone!')) return;
        if (!db) return;
        try {
          const svg = adminClear.querySelector('svg');
          if (svg) svg.style.animation = 'spin 1s linear infinite';
          
          await db.collection('stats').doc('global').set({
            visits: 0, pdfsGenerated: 0, imagesCompressed: 0, imagesConverted: 0, totalFilesProcessed: 0
          });
          
          const snap = await db.collection('logs').get();
          const batch = db.batch();
          snap.docs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
          
          if (svg) svg.style.animation = '';
          showToast('✅ Global Database Cleared');
        } catch (e) {
          console.error(e);
          showToast('❌ Error clearing DB: ' + e.message);
          const svg = adminClear.querySelector('svg');
          if (svg) svg.style.animation = '';
        }
      });
    }

    // Filter Buttons
    $$('.admin-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.admin-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderActivityLog(cachedData);
      });
    });

    // Track Visit
    if (window.PFAdmin) window.PFAdmin.trackVisit();
  }

  // Inject initAdmin into the main init flow
  document.addEventListener('DOMContentLoaded', () => {
    // Delay admin init slightly so main app loads fast
    setTimeout(initAdmin, 500); 
  });
