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

    // --- LÓGICA DO MODAL (Reutilizado para Serviços e Produtos) ---
    const modalContainer = document.querySelector('.service-modal-container');
    const servicosGridStatic = document.querySelector('.servicos-grid-static');
    const produtosCarouselList = document.querySelector('.produtos-carousel'); // Usar .produtos-carousel para o listener do clique

    if (modalContainer) {
        const modalTitleEl = modalContainer.querySelector('#service-modal-title');
        const modalTextEl = modalContainer.querySelector('#service-modal-text');
        const modalCloseButton = modalContainer.querySelector('.modal-close-button');

        if (modalTitleEl && modalTextEl && modalCloseButton) {
            function openModalWithContent(title, textData) {
                const paragraphs = textData.split('|').map(pText => `<p>${pText.trim()}</p>`).join('');
                modalTitleEl.textContent = title;
                modalTextEl.innerHTML = paragraphs;
                modalContainer.classList.add('active');
            }

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

            if (servicosGridStatic) {
                servicosGridStatic.addEventListener('click', function(event) {
                    const clickedCard = event.target.closest('.servico-card-static');
                    if (clickedCard) {
                        const title = clickedCard.dataset.serviceTitle || "Detalhes do Serviço";
                        const textData = clickedCard.dataset.serviceText || "Informação detalhada não disponível.|Por favor, entre em contato para mais informações.";
                        openModalWithContent(title, textData);
                    }
                });
            }

            if (produtosCarouselList) { // Listener nos produtos
                produtosCarouselList.addEventListener('click', function(event) {
                    const clickedProduto = event.target.closest('.produto-item');
                    if (clickedProduto) {
                        const title = clickedProduto.dataset.produtoTitle || "Detalhes do Produto";
                        const textData = clickedProduto.dataset.produtoText || "Descrição detalhada não disponível.|Consulte-nos para mais informações.";
                        openModalWithContent(title, textData);
                    }
                });
            }
        }
    }

    // --- LÓGICA DO CARROSSEL DE PRODUTOS ---
    const produtosCarouselJS = document.querySelector('.produtos-carousel'); // Referência correta para o elemento que se move
    const prevButtonProdutos = document.querySelector('.produto-carousel-btn.prev');
    const nextButtonProdutos = document.querySelector('.produto-carousel-btn.next');

    if (produtosCarouselJS && prevButtonProdutos && nextButtonProdutos) {
        const produtoItemsAll = document.querySelectorAll('.produto-item');
        const totalProdutoItems = produtoItemsAll.length;
        
        let itemsPerPageProdutos;
        let currentProdutoItemIndex = 0; // Índice do primeiro item visível à esquerda
        let numDistinctPositions; // Número de "slides" ou posições distintas possíveis

        let produtosAutoRotateInterval;
        const produtosSlideIntervalTime = 5000;

        function setupProdutoCarousel() {
            if (window.innerWidth <= 768) { 
                itemsPerPageProdutos = 2;
            } else if (window.innerWidth <= 992) { 
                itemsPerPageProdutos = 3;
            } else { 
                itemsPerPageProdutos = 4;
            }

            if (totalProdutoItems === 0) {
                numDistinctPositions = 0;
            } else if (totalProdutoItems <= itemsPerPageProdutos) {
                numDistinctPositions = 1; // Todos os itens cabem, sem slide efetivo
            } else {
                numDistinctPositions = totalProdutoItems - itemsPerPageProdutos + 1;
            }
            
            if (numDistinctPositions === 0 || (numDistinctPositions === 1 && totalProdutoItems <= itemsPerPageProdutos)) {
                currentProdutoItemIndex = 0; 
            } else {
                currentProdutoItemIndex = Math.min(currentProdutoItemIndex, numDistinctPositions - 1);
                currentProdutoItemIndex = Math.max(0, currentProdutoItemIndex);
            }
            
            updateProdutoCarouselView();
            startProdutosAutoRotate();
        }

        function updateProdutoCarouselView() {
            if (totalProdutoItems === 0) {
                produtosCarouselJS.style.transform = `translateX(0%)`;
                if (prevButtonProdutos) prevButtonProdutos.style.display = 'none';
                if (nextButtonProdutos) nextButtonProdutos.style.display = 'none';
                return;
            }

            if (numDistinctPositions > 1) { // Mostra botões apenas se houver para onde deslizar
                if (prevButtonProdutos) prevButtonProdutos.style.display = 'block';
                if (nextButtonProdutos) nextButtonProdutos.style.display = 'block';
            } else {
                if (prevButtonProdutos) prevButtonProdutos.style.display = 'none';
                if (nextButtonProdutos) nextButtonProdutos.style.display = 'none';
            }

            const itemWidthPercentage = 100 / itemsPerPageProdutos;
            const translateXValue = -currentProdutoItemIndex * itemWidthPercentage;
            produtosCarouselJS.style.transform = `translateX(${translateXValue}%)`;
        }

        function moveToNextProdutoItem() {
            if (numDistinctPositions <= 1) return;

            currentProdutoItemIndex++;
            if (currentProdutoItemIndex >= numDistinctPositions) {
                currentProdutoItemIndex = 0; 
            }
            updateProdutoCarouselView();
        }

        function moveToPrevProdutoItem() {
            if (numDistinctPositions <= 1) return; 

            currentProdutoItemIndex--;
            if (currentProdutoItemIndex < 0) {
                currentProdutoItemIndex = numDistinctPositions - 1; 
            }
            updateProdutoCarouselView();
        }

        function startProdutosAutoRotate() {
            clearInterval(produtosAutoRotateInterval);
            if (numDistinctPositions > 1) { 
                produtosAutoRotateInterval = setInterval(moveToNextProdutoItem, produtosSlideIntervalTime);
            }
        }

        nextButtonProdutos.addEventListener('click', () => {
            moveToNextProdutoItem();
            startProdutosAutoRotate(); 
        });

        prevButtonProdutos.addEventListener('click', () => {
            moveToPrevProdutoItem();
            startProdutosAutoRotate(); 
        });

        setupProdutoCarousel();
        window.addEventListener('resize', setupProdutoCarousel);

        const produtosCarouselWrapper = document.querySelector('.produtos-carousel-wrapper');
        if (produtosCarouselWrapper) {
            produtosCarouselWrapper.addEventListener('mouseenter', () => {
                clearInterval(produtosAutoRotateInterval);
            });
            produtosCarouselWrapper.addEventListener('mouseleave', () => {
                startProdutosAutoRotate();
            });
        }

    } else {
        if (prevButtonProdutos) prevButtonProdutos.style.display = 'none';
        if (nextButtonProdutos) nextButtonProdutos.style.display = 'none';
    }

    // --- LÓGICA PARA ABAS DA SEÇÃO INFORMAÇÕES TÉCNICAS ---
    const infoTabsNav = document.querySelector('.info-tabs-nav');
    if (infoTabsNav) {
        const infoTabButtons = infoTabsNav.querySelectorAll('.info-tab-btn');
        const infoTabContents = document.querySelectorAll('.info-tab-content');

        function showInfoTab(tabId) {
            infoTabContents.forEach(content => {
                content.classList.toggle('active', content.id === tabId);
            });
            infoTabButtons.forEach(button => {
                button.classList.toggle('active', ('tab-' + button.dataset.tab) === tabId);
            });
        }

        infoTabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetTabId = 'tab-' + this.dataset.tab;
                showInfoTab(targetTabId);
            });
        });

        const activeTabButton = infoTabsNav.querySelector('.info-tab-btn.active');
        if (activeTabButton) {
            showInfoTab('tab-' + activeTabButton.dataset.tab);
        } else if (infoTabButtons.length > 0) {
            infoTabButtons[0].classList.add('active');
            if (infoTabContents.length > 0) { // Garante que há conteúdo para ativar
                 infoTabContents[0].classList.add('active');
            }
        }
    }
});