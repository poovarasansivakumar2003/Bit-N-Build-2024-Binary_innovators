
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menu-toggle');
    const menuItems = document.getElementById('menu-items');
    const mainContent = document.getElementById('maincnt');
  
    if (menuToggle && menuItems) {
        menuToggle.addEventListener('change', function() {
            if (this.checked) {
                menuItems.style.display = 'block';
                mainContent.style.display='none';


            } else {
                menuItems.style.display = 'none';
                mainContent.style.display='block';
            }
        });
    } else {
        console.error('Menu toggle or menu items not found');
    }
});