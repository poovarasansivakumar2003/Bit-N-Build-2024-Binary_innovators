document.addEventListener('DOMContentLoaded', function () {
    // Lazy loading images
    const lazyImages = document.querySelectorAll('img');

    lazyImages.forEach(img => {
        img.addEventListener('load', () => {
            img.classList.add('loaded');
        });
    });

    // Modal functionality (if required for viewing posts)
    const newsItems = document.querySelectorAll('.news-item');
    newsItems.forEach(item => {
        item.addEventListener('click', function () {
            const title = this.querySelector('.news-title').textContent;
            const summary = this.querySelector('.news-summary').textContent;
            showModal(title, summary);
        });
    });

    function showModal(title, content) {
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.innerHTML = `
            <div class="modal-content">
                <h2>${title}</h2>
                <p>${content}</p>
                <button class="close-modal">Close</button>
            </div>
        `;
        document.body.appendChild(modal);

        document.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
    }
});
