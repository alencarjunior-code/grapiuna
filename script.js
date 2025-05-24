document.addEventListener('DOMContentLoaded', function() {
    console.log("Script do carrossel iniciado!");

    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator-item');
    const slideIntervalTime = 5000;
    let currentSlide = 0;
    let autoRotateInterval;

    // Tenta selecionar o container dos indicadores para escondê-lo se necessário
    const indicatorsContainer = document.querySelector('.carousel-indicators');

    if (slides.length > 0) {
        console.log("Slides encontrados:", slides.length);
        if (indicators.length === slides.length) {
            console.log("Indicadores encontrados:", indicators.length);
        } else {
            console.warn("Número de slides e indicadores não corresponde. Indicadores podem não funcionar corretamente. Slides:", slides.length, "Indicadores:", indicators.length);
        }


        function updateIndicators(activeIndex) {
            if (indicators.length === slides.length) {
                indicators.forEach((indicator, index) => {
                    if (index === activeIndex) {
                        indicator.classList.add('active');
                    } else {
                        indicator.classList.remove('active');
                    }
                });
            }
        }

        function showSlide(index) {
            slides.forEach((slide) => {
                slide.classList.remove('active');
            });
            
            // Verifica se o slide no índice existe antes de adicionar a classe
            if (slides[index]) {
                slides[index].classList.add('active');
                updateIndicators(index);
                currentSlide = index;
            } else {
                console.error("Tentativa de mostrar slide com índice inválido:", index);
            }
        }

        function moveToNextSlide() {
            let newIndex = (currentSlide + 1) % slides.length;
            showSlide(newIndex);
        }

        function startAutoRotate() {
            clearInterval(autoRotateInterval); 
            if (slides.length > 1) {
                autoRotateInterval = setInterval(moveToNextSlide, slideIntervalTime);
                console.log("Rotação automática (re)iniciada.");
            }
        }

        // Configuração dos listeners dos indicadores
        if (indicators.length === slides.length && slides.length > 1) {
            indicators.forEach(indicator => {
                indicator.addEventListener('click', function() {
                    const slideTo = parseInt(this.dataset.slideTo);
                    if (slideTo !== currentSlide && slides[slideTo]) { 
                        showSlide(slideTo);
                        startAutoRotate(); 
                    }
                });
            });
        }
        
        // Esconde indicadores se houver 1 slide ou menos, ou se não corresponderem
        if (slides.length <= 1 || indicators.length !== slides.length) {
            if(indicatorsContainer) {
                indicatorsContainer.classList.add('hidden');
                console.log("Indicadores escondidos.");
            }
        }

        // Mostra o primeiro slide inicialmente e inicia a rotação
        showSlide(0); // Chama para mostrar o primeiro slide
        console.log("Primeiro slide (índice 0) deveria estar ativo após showSlide(0).");
        startAutoRotate();

    } else {
        console.error("Nenhum elemento .carousel-slide encontrado!");
        if(indicatorsContainer) { // Esconde indicadores se não houver slides
            indicatorsContainer.classList.add('hidden');
        }
    }
});