document.addEventListener('DOMContentLoaded', function() {
    // --- LÓGICA DO CARROSSEL DE BANNER ---
    const bannerCarouselContainer = document.querySelector('.banner-section .carousel-container');
    const bannerSlides = document.querySelectorAll('.banner-section .carousel-slide');
    const bannerIndicators = document.querySelectorAll('.banner-section .indicator-item');
    const bannerSlideIntervalTime = 5000;
    let currentBannerSlide = 0;
    let bannerAutoRotateInterval;
    let bannerTouchStartX = 0;
    let bannerTouchStartY = 0;
    let bannerTouchEndX = 0;
    const bannerIndicatorsContainer = document.querySelector('.banner-section .carousel-indicators');

    if (bannerSlides.length > 0) {
        function updateBannerIndicators(activeIndex) {
            if (bannerIndicators.length === bannerSlides.length) {
                bannerIndicators.forEach((indicator, index) => {
                    indicator.classList.toggle('active', index === activeIndex);
                });
            }
        }
        function showBannerSlide(index) {
            const N = bannerSlides.length;
            if (N === 0) return;
            const effectiveIndex = (index % N + N) % N; 
            bannerSlides.forEach((slide) => slide.classList.remove('active'));
            if (bannerSlides[effectiveIndex]) {
                bannerSlides[effectiveIndex].classList.add('active');
                updateBannerIndicators(effectiveIndex);
                currentBannerSlide = effectiveIndex;
            }
        }
        function moveToNextBannerSlide() { showBannerSlide(currentBannerSlide + 1); }
        function moveToPrevBannerSlide() { showBannerSlide(currentBannerSlide - 1); }
        function startBannerAutoRotate() {
            clearInterval(bannerAutoRotateInterval); 
            if (bannerSlides.length > 1) {
                bannerAutoRotateInterval = setInterval(moveToNextBannerSlide, bannerSlideIntervalTime);
            }
        }
        if (bannerIndicators.length === bannerSlides.length && bannerSlides.length > 1) {
            bannerIndicators.forEach(indicator => {
                indicator.addEventListener('click', function() {
                    const slideTo = parseInt(this.dataset.slideTo);
                    if (slideTo !== currentBannerSlide && bannerSlides[slideTo]) { 
                        showBannerSlide(slideTo);
                        startBannerAutoRotate(); 
                    }
                });
            });
        }
        if (bannerSlides.length <= 1) {
            if(bannerIndicatorsContainer) bannerIndicatorsContainer.classList.add('hidden');
        }
        if (bannerCarouselContainer && bannerSlides.length > 1) {
            bannerCarouselContainer.addEventListener('touchstart', e => { bannerTouchStartX = e.touches?.[0]?.clientX; bannerTouchStartY = e.touches?.[0]?.clientY; }, { passive: true });
            bannerCarouselContainer.addEventListener('touchend', e => {
                if (bannerTouchStartX === 0) return;
                bannerTouchEndX = e.changedTouches?.[0]?.clientX;
                let bannerTouchEndY = e.changedTouches?.[0]?.clientY;
                handleBannerSwipe(bannerTouchEndY);
                bannerTouchStartX = 0; bannerTouchStartY = 0;
            }, { passive: true });
        }
        function handleBannerSwipe(currentTouchEndY) {
            const swipeThresholdX = 40, swipeThresholdY = 60;
            let diffX = bannerTouchStartX - bannerTouchEndX;
            let diffY = Math.abs(bannerTouchStartY - currentTouchEndY);
            if (Math.abs(diffX) > swipeThresholdX && diffY < swipeThresholdY) {
                if (diffX > 0) moveToNextBannerSlide(); else moveToPrevBannerSlide();
                startBannerAutoRotate(); 
            }
        }
        if (bannerSlides.length > 0) {
            showBannerSlide(0);
            startBannerAutoRotate();
        }
    } else {
        if(bannerIndicatorsContainer) bannerIndicatorsContainer.classList.add('hidden');
    }

    // --- CARROSSEL DE SERVIÇOS (6 ITENS, LOOP, 3 VISÍVEIS NO DESKTOP) ---
    const servicosViewport = document.querySelector('.servicos-box-carousel-container');
    const servicosWrapper = document.querySelector('.servicos-box-wrapper');
    const servicosIndicatorsContainer = document.querySelector('.servicos-carousel-indicators');

    if (servicosViewport && servicosWrapper) {
        let servicoBoxesOriginal = Array.from(servicosWrapper.querySelectorAll('.servico-box'));
        let totalOriginalServicos = servicoBoxesOriginal.length; 

        if (totalOriginalServicos > 0) {
            let sbcItemsPerPage;
            let sbcItemWidth;
            let sbcItemMargin = 20; 
            
            let sbcCurrentLogicalIndex = 0; 
            let sbcCurrentActualIndex = 0; 
            let sbcClonesCount = 0;
            let sbcIsTransitioning = false;
            let sbcAutoRotateServicesInterval;
            const sbcAutoRotateTime = 6000;

            function sbcSetupCarousel() {
                clearInterval(sbcAutoRotateServicesInterval);

                totalOriginalServicos = servicosWrapper.querySelectorAll('.servico-box:not(.clone)').length;
                if (totalOriginalServicos === 0) {
                    servicoBoxesOriginal = Array.from(servicosWrapper.querySelectorAll('.servico-box'));
                    totalOriginalServicos = servicoBoxesOriginal.length;
                }

                const viewportParentWidth = servicosViewport.parentElement.offsetWidth; 
                let carouselViewportWidthToSet = viewportParentWidth;

                // ***** INÍCIO DAS MODIFICAÇÕES PARA MOBILE NO CARROSSEL DE SERVIÇOS *****
                if (window.innerWidth <= 768) { 
                    sbcItemsPerPage = 1;
                    sbcItemMargin = 15; // Margem entre itens, se houver mais de um visível ou para clones

                    // O '.servicos-container-conteudo' (pai do viewport) tem width: 85% e margin: auto no CSS mobile.
                    // O 'viewportParentWidth' já reflete a largura do '.servicos-container-conteudo'.
                    const containerConteudoWidth = viewportParentWidth;
                    
                    // O viewport do carrossel (.servicos-box-carousel-container) ocupa a largura total do seu pai.
                    carouselViewportWidthToSet = containerConteudoWidth; 
                    servicosViewport.style.width = `${carouselViewportWidthToSet}px`;
                    servicosViewport.style.margin = '0 auto'; // Garante centralização do viewport

                    // O item do carrossel (.servico-box) ocupa 100% da largura do viewport.
                    // O espaçamento visual lateral virá do container pai '.servicos-container-conteudo' que tem width: 85% da tela.
                    sbcItemWidth = carouselViewportWidthToSet; 

                } else if (window.innerWidth <= 992) { // Tablet
                    sbcItemsPerPage = 2;
                    sbcItemMargin = 20;
                    // No tablet, .servicos-container-conteudo (pai do viewport) tem width 100% do .servicos-section (que é 90% da tela).
                    // E tem padding: 0 15px.
                    // viewportParentWidth é a largura do .servicos-container-conteudo.
                    // Os itens dividirão essa largura, considerando a margem.
                    carouselViewportWidthToSet = viewportParentWidth; // Viewport ocupa o pai
                    servicosViewport.style.width = `${carouselViewportWidthToSet}px`;
                    servicosViewport.style.margin = '0 auto';

                    sbcItemWidth = (carouselViewportWidthToSet - sbcItemMargin * (sbcItemsPerPage - 1)) / sbcItemsPerPage;
                
                } else { // Desktop
                    sbcItemsPerPage = 3;
                    sbcItemMargin = 20;
                    
                    const sobreContainerDesktop = document.querySelector('.sobre-container-desktop-ajustado');
                    let referenceWidth = viewportParentWidth; 
                    if (sobreContainerDesktop) {
                        // No desktop, .servicos-container-conteudo (pai do viewport) tem width 100% do .servicos-section (que é 80% da tela)
                        // e padding: 0 20px.
                        // A intenção original parecia querer alinhar com .sobre-container-desktop-ajustado,
                        // mas o pai do viewport é .servicos-container-conteudo.
                        // Usaremos a largura do pai do viewport como referência principal.
                        referenceWidth = viewportParentWidth; // Largura do .servicos-container-conteudo
                    }
                    carouselViewportWidthToSet = referenceWidth;
                    servicosViewport.style.width = `${carouselViewportWidthToSet}px`;
                    servicosViewport.style.margin = '0 auto';
                    sbcItemWidth = (carouselViewportWidthToSet - sbcItemMargin * (sbcItemsPerPage - 1)) / sbcItemsPerPage;
                }
                // ***** FIM DAS MODIFICAÇÕES PARA MOBILE/TABLET/DESKTOP NO CARROSSEL DE SERVIÇOS *****


                servicosWrapper.innerHTML = '';
                servicoBoxesOriginal.forEach(boxOriginalHTML => {
                    const newBox = document.createElement('div');
                    newBox.classList.add('servico-box');
                    newBox.innerHTML = boxOriginalHTML.innerHTML; 
                    for (const attr of boxOriginalHTML.attributes) {
                        if (attr.name.startsWith('data-')) {
                            newBox.setAttribute(attr.name, attr.value);
                        }
                    }
                    servicosWrapper.appendChild(newBox);
                });
                
                const currentBoxesInDom = Array.from(servicosWrapper.querySelectorAll('.servico-box'));

                sbcClonesCount = 0;
                if (totalOriginalServicos > sbcItemsPerPage && totalOriginalServicos > 1) {
                    sbcClonesCount = sbcItemsPerPage; 
                    for (let i = 0; i < sbcClonesCount; i++) {
                        const originalBox = servicoBoxesOriginal[i % totalOriginalServicos];
                        const cloneEnd = originalBox.cloneNode(true);
                        servicosWrapper.appendChild(cloneEnd);
                    }
                    for (let i = 0; i < sbcClonesCount; i++) {
                        const originalBox = servicoBoxesOriginal[(totalOriginalServicos - sbcClonesCount + i + totalOriginalServicos) % totalOriginalServicos];
                        const cloneStart = originalBox.cloneNode(true);
                        servicosWrapper.insertBefore(cloneStart, servicosWrapper.firstChild);
                    }
                    sbcCurrentActualIndex = sbcClonesCount + sbcCurrentLogicalIndex;
                } else {
                    sbcCurrentActualIndex = sbcCurrentLogicalIndex;
                    if (totalOriginalServicos > 0) {
                         servicosWrapper.style.justifyContent = 'center';
                    } else {
                         servicosWrapper.style.justifyContent = 'flex-start';
                    }
                }
                
                const allBoxesNow = servicosWrapper.querySelectorAll('.servico-box');
                allBoxesNow.forEach((box) => {
                    box.style.flex = `0 0 ${sbcItemWidth}px`;
                    box.style.minWidth = `${sbcItemWidth}px`;
                    box.style.maxWidth = `${sbcItemWidth}px`;
                    box.style.marginRight = `${sbcItemMargin}px`;
                });
                
                if (allBoxesNow.length > 0) {
                    const totalWrapperWidth = allBoxesNow.length * sbcItemWidth + (allBoxesNow.length -1) * sbcItemMargin; // Correção para não somar margem do último
                    servicosWrapper.style.width = `${totalWrapperWidth}px`; 
                    // Remove margem direita do último item REAL (não clone), se não houver loop infinito.
                    // Se houver loop, a margem é necessária para o cálculo de translate.
                    // A lógica atual com clones e translate já deve lidar bem com isso.
                    // O último item (seja clone ou não) deve ter a margem para o cálculo correto do translate,
                    // a menos que seja o último item visível e não haja mais para onde ir.
                    // Vamos manter a margem em todos para consistência do cálculo de translate.
                    // Apenas o último item visualmente não deveria ter uma margem se não houver mais itens,
                    // mas com carrossel infinito, isso é menos relevante.
                }


                servicosWrapper.style.transition = 'none';
                // O cálculo de translateX deve considerar que a margem direita é aplicada a cada item
                const initialTranslateX = -(sbcCurrentActualIndex * (sbcItemWidth + sbcItemMargin));
                servicosWrapper.style.transform = `translateX(${initialTranslateX}px)`;
                
                setTimeout(() => {
                    servicosWrapper.style.transition = 'transform 0.5s ease-in-out';
                }, 50);

                sbcCreateIndicators();
                startSbcAutoRotate(); 
            }

            function sbcCreateIndicators() {
                if (!servicosIndicatorsContainer) return;
                servicosIndicatorsContainer.innerHTML = '';
                
                const numIndicatorDots = totalOriginalServicos;

                // Condição para esconder indicadores: se for 1 item OU (se itens originais <= itens por página E não for mobile)
                // No mobile (sbcItemsPerPage é 1), só esconde se totalOriginalServicos <= 1.
                let hideIndicators = (totalOriginalServicos <= 1);
                if (window.innerWidth > 768 && totalOriginalServicos <= sbcItemsPerPage) {
                    hideIndicators = true;
                }

                if (hideIndicators) {
                    servicosIndicatorsContainer.classList.add('hidden'); return;
                }
                servicosIndicatorsContainer.classList.remove('hidden');

                for (let i = 0; i < numIndicatorDots; i++) {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.classList.add('sbc-indicator-item');
                    button.dataset.sbcSlideTo = i; 
                    button.setAttribute('aria-label', `Ir para serviço ${i + 1}`);
                    button.addEventListener('click', function() { 
                        sbcGoToLogical(parseInt(this.dataset.sbcSlideTo)); 
                        startSbcAutoRotate(); 
                    });
                    servicosIndicatorsContainer.appendChild(button);
                }
                sbcUpdateIndicators();
            }

            function sbcUpdateIndicators() {
                const sbcIndicators = servicosIndicatorsContainer?.querySelectorAll('.sbc-indicator-item');
                sbcIndicators?.forEach((indicator, index) => {
                    indicator.classList.toggle('active', index === sbcCurrentLogicalIndex);
                });
            }
            
            function sbcGoToLogical(logicalIndex, withTransition = true) {
                if (sbcIsTransitioning && withTransition && totalOriginalServicos > sbcItemsPerPage) return;
                
                sbcCurrentLogicalIndex = (logicalIndex + totalOriginalServicos) % totalOriginalServicos;
                
                if (withTransition && totalOriginalServicos > sbcItemsPerPage) sbcIsTransitioning = true;
                sbcCurrentActualIndex = (totalOriginalServicos > sbcItemsPerPage && totalOriginalServicos > 1) ? sbcClonesCount + sbcCurrentLogicalIndex : sbcCurrentLogicalIndex;

                servicosWrapper.style.transition = (withTransition && totalOriginalServicos > sbcItemsPerPage && totalOriginalServicos > 1) ? 'transform 0.5s ease-in-out' : 'none';
                servicosWrapper.style.transform = `translateX(-${sbcCurrentActualIndex * (sbcItemWidth + sbcItemMargin)}px)`;
                sbcUpdateIndicators();

                if (withTransition && totalOriginalServicos > sbcItemsPerPage && totalOriginalServicos > 1) {
                    servicosWrapper.addEventListener('transitionend', sbcHandleLoopJump, { once: true });
                } else {
                    sbcIsTransitioning = false;
                }
            }
            
            function sbcHandleLoopJump() {
                sbcIsTransitioning = false;
                const N = totalOriginalServicos;
                const C = sbcClonesCount;

                if (sbcCurrentActualIndex < C) { 
                    sbcCurrentLogicalIndex = (sbcCurrentLogicalIndex % N + N) % N; 
                    sbcCurrentActualIndex = C + sbcCurrentLogicalIndex;
                    servicosWrapper.style.transition = 'none';
                    servicosWrapper.style.transform = `translateX(-${sbcCurrentActualIndex * (sbcItemWidth + sbcItemMargin)}px)`;
                } else if (sbcCurrentActualIndex >= C + N) { 
                    sbcCurrentLogicalIndex = (sbcCurrentLogicalIndex % N + N) % N;
                    sbcCurrentActualIndex = C + sbcCurrentLogicalIndex;
                    servicosWrapper.style.transition = 'none';
                    servicosWrapper.style.transform = `translateX(-${sbcCurrentActualIndex * (sbcItemWidth + sbcItemMargin)}px)`;
                }
                 sbcUpdateIndicators();
            }

            function sbcMove(direction) {
                // Só permite mover se houver mais itens que o visível, ou se for mobile (onde sbcItemsPerPage é 1 e sempre pode mover se houver > 1 item)
                let canMove = totalOriginalServicos > sbcItemsPerPage;
                if (window.innerWidth <= 768 && totalOriginalServicos > 1) { // Mobile específico
                    canMove = true;
                }

                if (sbcIsTransitioning || !canMove) return;
                sbcGoToLogical(sbcCurrentLogicalIndex + direction);
            }

            function startSbcAutoRotate() {
                clearInterval(sbcAutoRotateServicesInterval);
                 let canAutoRotate = totalOriginalServicos > sbcItemsPerPage;
                 if (window.innerWidth <= 768 && totalOriginalServicos > 1) { // Mobile específico
                    canAutoRotate = true;
                }
                if (canAutoRotate) { 
                    sbcAutoRotateServicesInterval = setInterval(() => sbcMove(1), sbcAutoRotateTime);
                }
            }
            
            sbcSetupCarousel(); 
            window.addEventListener('resize', sbcSetupCarousel);
            startSbcAutoRotate(); 

            let sbcTouchStartX = 0, sbcTouchStartY = 0;
            // Permite swipe se houver mais itens que o visível OU se for mobile e houver mais de 1 item
             let canSwipe = totalOriginalServicos > sbcItemsPerPage;
             if (window.innerWidth <= 768 && totalOriginalServicos > 1) { // Mobile específico
                canSwipe = true;
            }

            if (servicosViewport && canSwipe) {
                servicosViewport.addEventListener('touchstart', function(event) {
                    sbcTouchStartX = event.touches[0].clientX;
                    sbcTouchStartY = event.touches[0].clientY;
                    clearInterval(sbcAutoRotateServicesInterval); 
                }, { passive: true });

                servicosViewport.addEventListener('touchend', function(event) {
                    if (sbcTouchStartX === 0) return;
                    let sbcTouchEndX = event.changedTouches[0].clientX;
                    let sbcTouchEndY = event.changedTouches[0].clientY;
                    
                    const swipeThresholdX = 40; const swipeThresholdY = 70;
                    let diffX = sbcTouchStartX - sbcTouchEndX;
                    let diffY = Math.abs(sbcTouchStartY - sbcTouchEndY);

                    if (Math.abs(diffX) > swipeThresholdX && diffY < swipeThresholdY) {
                        if (diffX > 0) { sbcMove(1); } 
                        else { sbcMove(-1); }
                    }
                    sbcTouchStartX = 0; sbcTouchStartY = 0;
                    startSbcAutoRotate(); 
                }, { passive: true });
            }
        }

        // Lógica do Modal
        const modalContainer = document.querySelector('.service-modal-container');
        if (servicosWrapper && modalContainer) {
            const modalTitleEl = modalContainer.querySelector('#service-modal-title');
            const modalTextEl = modalContainer.querySelector('#service-modal-text');
            const modalCloseButton = modalContainer.querySelector('.modal-close-button');

            if (modalTitleEl && modalTextEl && modalCloseButton) {
                servicosWrapper.addEventListener('click', function(event) {
                    const clickedBox = event.target.closest('.servico-box');
                    if (clickedBox) {
                        const title = clickedBox.dataset.serviceTitle || "Detalhes do Serviço";
                        let textData = clickedBox.dataset.serviceText || "Informação detalhada não disponível.|Por favor, entre em contato para mais informações.";
                        const paragraphs = textData.split('|').map(pText => `<p>${pText.trim()}</p>`).join('');

                        modalTitleEl.textContent = title;
                        modalTextEl.innerHTML = paragraphs;
                        modalContainer.classList.add('active');
                    }
                });

                if (!modalCloseButton.dataset.listenerAttached) {
                    modalCloseButton.addEventListener('click', () => {
                        modalContainer.classList.remove('active');
                    });
                    modalCloseButton.dataset.listenerAttached = 'true';
                }
                if (!modalContainer.dataset.listenerAttached) {
                     modalContainer.addEventListener('click', (e) => {
                        if (e.target === modalContainer) {
                            modalContainer.classList.remove('active');
                        }
                    });
                    modalContainer.dataset.listenerAttached = 'true';
                }
            }
        }
    }
});