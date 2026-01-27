// modal.js - Simple modal management
export function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log(`Modal ${modalId} shown`);
    } else {
        console.error(`Modal with ID ${modalId} not found`);
    }
}

export function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        console.log(`Modal ${modalId} closed`);
    }
}

export function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = '';
    console.log('All modals closed');
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeAllModals();
    }
});

// Close modal with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAllModals();
    }
});

// Prevent modal close when clicking inside modal content
document.addEventListener('click', (e) => {
    if (e.target.closest('.modal-content')) {
        e.stopPropagation();
    }
});