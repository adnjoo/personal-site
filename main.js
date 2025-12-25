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
         content = `
            <div class="w-full h-full flex flex-col items-center justify-center p-4 text-white bg-gradient-to-br" style="background: linear-gradient(135deg, ${item.color || '#6366f1'}, ${item.color2 || '#8b5cf6'})">
            </div>
         `;
      } else if (item.type === 'substack' && item.image) {
         content = `
            <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.parentElement.querySelector('.absolute').style.background='linear-gradient(135deg, #ff6719, #ff8533)';" />
         `;
      } else if (item.image) {
         content = `
            <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.parentElement.querySelector('.absolute').style.background='linear-gradient(135deg, ${item.color || '#8b5cf6'}, ${item.color2 || '#6366f1'})';" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4 text-white">
               <span class="inline-block px-2.5 py-1 rounded-full text-[0.625rem] font-semibold mb-1.5 capitalize" style="background: ${item.badgeColor || 'rgba(139, 92, 246, 0.8)'}">${item.type}</span>
               <h3 class="text-sm font-semibold mb-1">${item.title}</h3>
               ${item.description ? `<p class="text-xs opacity-90 leading-snug">${item.description}</p>` : ''}
            </div>
         `;
      } else {
         const showTitle = item.type !== 'social';
         const iconHTML = item.iconIsEmoji 
            ? `<span class="mb-3" style="font-size: 2rem; line-height: 1;">${item.icon}</span>`
            : `<i class="${item.icon} text-3xl mb-3"></i>`;
         content = `
            <div class="w-full h-full flex flex-col items-center justify-center p-4 text-white bg-gradient-to-br" style="background: linear-gradient(135deg, ${item.color || '#8b5cf6'}, ${item.color2 || '#6366f1'})">
               ${iconHTML}
               ${showTitle ? `<h3 class="text-sm font-semibold mb-1 text-center">${item.title}</h3>` : ''}
            </div>
         `;
      }
      
      const baseClasses = 'grid-item relative rounded-xl overflow-hidden transition-all duration-300 ease-in-out aspect-square w-full min-w-0 opacity-0 scale-[0.8] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.05)]';
      const introClasses = `${baseClasses} cursor-default pointer-events-none`;
      const itemClasses = `${baseClasses} cursor-grab active:cursor-grabbing hover:scale-105 hover:-translate-y-2 hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.15),0_10px_10px_-5px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.1),0_0_30px_rgba(139,92,246,0.2)]`;
      const cardClasses = 'w-full h-full relative overflow-hidden border border-gray-200/50 bg-white/5 backdrop-blur-[10px] shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.05)]';
      
      if (item.type === 'intro') {
         return `<div class="${introClasses}" data-id="${item.id}"><div class="${cardClasses}">${content}</div></div>`;
      }
      
      return `<a href="${item.link}" target="_blank" rel="noopener" class="${itemClasses}" data-id="${item.id}"><div class="${cardClasses}">${content}</div></a>`;
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
               item.classList.add('opacity-100', 'scale-100');
            }, index * 150);
         });
         
         // Setup drag and drop after items are rendered
         setupDragAndDrop();
      }, 10);
   };
   
   let sortableInstance = null;
   
   const setupDragAndDrop = () => {
      if (sortableInstance) sortableInstance.destroy();
      
      sortableInstance = new Sortable(gridContainer, {
         animation: 150,
         filter: '[data-id="intro"]',
         draggable: '.grid-item:not([data-id="intro"])',
         ghostClass: 'opacity-50 scale-95 z-[1000] cursor-grabbing shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),0_15px_30px_-8px_rgba(0,0,0,0.15)]',
         chosenClass: 'scale-110 border-2 border-dashed border-purple-500/60 bg-purple-500/10 transition-all duration-200 shadow-[0_15px_30px_-5px_rgba(139,92,246,0.3),0_8px_16px_-4px_rgba(139,92,246,0.2),0_0_0_2px_rgba(139,92,246,0.4)]',
         dragClass: 'opacity-50 scale-95 z-[1000] cursor-grabbing',
         onEnd: (evt) => {
            const oldIndex = evt.oldIndex;
            const newIndex = evt.newIndex;
            if (oldIndex !== null && newIndex !== null && oldIndex !== newIndex) {
               const draggedItem = gridItems[oldIndex];
               const targetItem = gridItems[newIndex];
               if (draggedItem?.id !== 'intro' && targetItem?.id !== 'intro') {
                  [gridItems[oldIndex], gridItems[newIndex]] = [gridItems[newIndex], gridItems[oldIndex]];
                  renderGrid(gridItems);
               } else {
                  sortableInstance.sort(gridItems.map((_, i) => i));
               }
            }
         }
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

