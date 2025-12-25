// Dot Shader Background
(function() {
   const canvas = document.getElementById('dot-shader-bg');
   if (!canvas) return;
   
   const ctx = canvas.getContext('2d');
   if (!ctx) return;
   
   const backgroundColor = '#fafafa';
   const dotColor = 'rgba(139, 92, 246, 0.4)';
   
   let time = 0;
   let animationFrameId;
   
   const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
   };
   
   const drawDots = () => {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const spacing = 35;
      const cols = Math.ceil(canvas.width / spacing);
      const rows = Math.ceil(canvas.height / spacing);
      
      for (let i = 0; i < cols; i++) {
         for (let j = 0; j < rows; j++) {
            const x = i * spacing;
            const y = j * spacing;
            
            const distance = Math.sqrt(
               Math.pow(x - canvas.width / 2, 2) + Math.pow(y - canvas.height / 2, 2)
            );
            
            const wave = Math.sin(distance * 0.01 - time) * 0.5 + 0.5;
            const size = 2 * (0.5 + wave * 0.5);
            
            const opacity = 0.2 + wave * 0.3;
            const color = dotColor.replace(/[\d.]+\)$/, `${opacity})`);
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
         }
      }
   };
   
   const animate = () => {
      time += 0.002;
      drawDots();
      animationFrameId = requestAnimationFrame(animate);
   };
   
   resizeCanvas();
   animate();
   
   window.addEventListener('resize', () => {
      resizeCanvas();
   });
   
   // Cleanup on page unload
   window.addEventListener('beforeunload', () => {
      if (animationFrameId) {
         cancelAnimationFrame(animationFrameId);
      }
   });
})();

// Shuffle Grid Implementation
(function() {
   const gridContainer = document.getElementById('shuffle-grid');
   const shuffleButton = document.getElementById('shuffle-button');
   let gridItems = [];
   
   const extractImageFromContent = (content) => content?.match(/<img[^>]+src="([^"]+)"/i)?.[1] || null;
   
   const createSubstackItem = (post, index) => {
      const image = extractImageFromContent(post.content) || extractImageFromContent(post.description) || `https://picsum.photos/400/300?random=${index}`;
      return {
         id: `substack-${index}`,
         type: 'substack',
         title: post.title,
         image,
         link: post.link,
         badgeColor: 'rgba(249, 115, 22, 0.8)',
      };
   };
   
   const fetchSubstackPosts = () => fetch("https://api.rss2json.com/v1/api.json?rss_url=https://adnjoo.substack.com/feed")
      .then(r => r.json())
      .then(data => (data.items || []).slice(0, 6).map(createSubstackItem));
   
   const createGridItem = (item) => {
      let content = '';
      
      if (item.type === 'intro') {
         // Intro card: title and description with gradient background
         content = `
            <div class="grid-card-intro" style="background: linear-gradient(135deg, ${item.color || '#6366f1'}, ${item.color2 || '#8b5cf6'})">
               <h3 class="grid-card-title text-center mb-3">${item.title}</h3>
               ${item.description ? `<p class="grid-card-description text-center">${item.description}</p>` : ''}
            </div>
         `;
      } else if (item.type === 'substack' && item.image) {
         // Substack posts: image preview with title only, no badge or description
         content = `
            <img src="${item.image}" alt="${item.title}" class="grid-card-image" onerror="this.style.display='none'; this.parentElement.querySelector('.grid-card-overlay').style.background='linear-gradient(135deg, #ff6719, #ff8533)';" />
            <div class="grid-card-overlay">
               <h3 class="grid-card-title">${item.title}</h3>
            </div>
         `;
      } else if (item.image) {
         content = `
            <img src="${item.image}" alt="${item.title}" class="grid-card-image" onerror="this.style.display='none'; this.parentElement.querySelector('.grid-card-overlay').style.background='linear-gradient(135deg, ${item.color || '#8b5cf6'}, ${item.color2 || '#6366f1'})';" />
            <div class="grid-card-overlay">
               <span class="grid-card-badge" style="background: ${item.badgeColor || 'rgba(139, 92, 246, 0.8)'}">${item.type}</span>
               <h3 class="grid-card-title">${item.title}</h3>
               ${item.description ? `<p class="grid-card-description">${item.description}</p>` : ''}
            </div>
         `;
      } else {
         const showTitle = item.type !== 'social';
         const iconHTML = item.iconIsEmoji 
            ? `<span class="text-4xl mb-3" style="font-size: 2rem; line-height: 1;">${item.icon}</span>`
            : `<i class="${item.icon} text-3xl mb-3"></i>`;
         content = `
            <div class="grid-card-icon" style="background: linear-gradient(135deg, ${item.color || '#8b5cf6'}, ${item.color2 || '#6366f1'})">
               ${iconHTML}
               ${showTitle ? `<h3 class="grid-card-title text-center">${item.title}</h3>` : ''}
               ${item.description ? `<p class="grid-card-description text-center mt-2">${item.description}</p>` : ''}
            </div>
         `;
      }
      
      if (item.type === 'intro') {
         return `<div class="grid-item" data-id="${item.id}"><div class="grid-card">${content}</div></div>`;
      }
      
      return `<a href="${item.link}" target="_blank" rel="noopener" class="grid-item" data-id="${item.id}"><div class="grid-card">${content}</div></a>`;
   };
   
   const shuffleArray = (array) => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
   };
   
   const renderGrid = (items) => {
      gridContainer.innerHTML = '';
      items.forEach((item, index) => {
         const itemHTML = createGridItem(item, index);
         gridContainer.innerHTML += itemHTML;
      });
      
      // Animate items in
      setTimeout(() => {
         const items = gridContainer.querySelectorAll('.grid-item');
         items.forEach((item, index) => {
            setTimeout(() => {
               item.classList.add('visible');
            }, index * 150);
         });
         
         // Setup drag and drop after items are rendered
         setupDragAndDrop();
      }, 10);
   };
   
   let draggedIndex = null;
   
   const setupDragAndDrop = () => {
      const items = gridContainer.querySelectorAll('.grid-item');
      
      items.forEach((item, index) => {
         item.draggable = item.dataset.id !== 'intro';
         
         item.addEventListener('dragstart', (e) => {
            if (item.dataset.id === 'intro') {
               e.preventDefault();
               return;
            }
            draggedIndex = index;
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
         });
         
         item.addEventListener('dragend', () => {
            items.forEach(i => i.classList.remove('dragging', 'drag-over'));
         });
         
         item.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (item.dataset.id !== 'intro') item.classList.add('drag-over');
         });
         
         item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
         
         item.addEventListener('drop', (e) => {
            e.preventDefault();
            const dropIndex = Array.from(items).indexOf(item);
            if (draggedIndex !== null && draggedIndex !== dropIndex && item.dataset.id !== 'intro') {
               [gridItems[draggedIndex], gridItems[dropIndex]] = [gridItems[dropIndex], gridItems[draggedIndex]];
               renderGrid(gridItems);
            }
            item.classList.remove('drag-over');
         });
      });
   };
   
   const initializeGrid = () => {
      // Intro card
      const introCard = {
         id: 'intro',
         type: 'intro',
         title: 'Hi, I\'m Drew 👋',
         description: 'I spend my time building tools, marketing, and seeing what works in tech.',
         color: '#6366f1',
         color2: '#8b5cf6',
      };
      
      // Social links
      const socialLinks = [
         {
            id: 'social-github',
            type: 'social',
            title: 'GitHub',
            icon: 'fa-brands fa-github',
            link: 'https://github.com/adnjoo',
            color: '#1f2937',
            color2: '#111827',
         },
         {
            id: 'social-instagram',
            type: 'social',
            title: 'Instagram',
            icon: 'fa-brands fa-instagram',
            link: 'https://instagram.com/adnjoo',
            color: '#ec4899',
            color2: '#db2777',
         },
         {
            id: 'social-linkedin',
            type: 'social',
            title: 'LinkedIn',
            icon: 'fa-brands fa-linkedin',
            link: 'https://linkedin.com/in/adnjoo',
            color: '#2563eb',
            color2: '#1d4ed8',
         },
         {
            id: 'social-twitter',
            type: 'social',
            title: 'Twitter',
            icon: 'fa-brands fa-twitter',
            link: 'https://x.com/adnjoo',
            color: '#000000',
            color2: '#1a1a1a',
         },
         {
            id: 'social-youtube',
            type: 'social',
            title: 'YouTube',
            icon: 'fa-brands fa-youtube',
            link: 'https://youtube.com/@drewnjoo',
            color: '#dc2626',
            color2: '#b91c1c',
         },
         {
            id: 'social-spotify',
            type: 'social',
            title: 'Spotify',
            icon: 'fa-brands fa-spotify',
            link: 'https://open.spotify.com/artist/1351GdPml5Zsm0X4YD3IX7',
            color: '#22c55e',
            color2: '#16a34a',
         },
         {
            id: 'social-soundcloud',
            type: 'social',
            title: 'SoundCloud',
            icon: 'fa-brands fa-soundcloud',
            link: 'https://soundcloud.com/adnjoo',
            color: '#f97316',
            color2: '#ea580c',
         },
      ];
      
      const renderItems = (substackItems = [], projectLinks = []) => {
         gridItems = [introCard, ...substackItems, ...socialLinks, ...projectLinks];
         renderGrid(gridItems);
      };
      
      Promise.all([
         fetch('./projects.json').then(r => r.json()).catch(() => []),
         fetchSubstackPosts().catch(() => [])
      ]).then(([projectLinks, substackItems]) => {
         renderItems(substackItems, projectLinks);
      }).catch(() => {
         renderItems();
      });
   };
   
   // Shuffle button handler
   shuffleButton.addEventListener('click', () => {
      gridItems = shuffleArray(gridItems);
      renderGrid(gridItems);
   });
   
   // Initialize
   initializeGrid();
})();

