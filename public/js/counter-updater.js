document.addEventListener('DOMContentLoaded', function() {
    function updateCounters() {
        fetch('/api/counts')
            .then(response => response.json())
            .then(data => {
                document.querySelectorAll('[data-counter="total"]').forEach(el => {
                    el.textContent = data.total || 0;
                });
                
                document.querySelectorAll('[data-counter="active"]').forEach(el => {
                    el.textContent = data.active || 0;
                });
                
                document.querySelectorAll('[data-counter="done"]').forEach(el => {
                    el.textContent = data.done || 0;
                });
                
                document.querySelectorAll('[data-counter="archived"]').forEach(el => {
                    el.textContent = data.archived || 0;
                });
                
                document.querySelectorAll('[data-counter="trash"]').forEach(el => {
                    el.textContent = data.trash || 0;
                });
                
                document.querySelectorAll('[data-counter="pinned"]').forEach(el => {
                    el.textContent = data.pinned || 0;
                });
                
                document.querySelectorAll('.mobile-counter-total').forEach(el => {
                    el.textContent = data.total || 0;
                });
                
                document.querySelectorAll('.mobile-counter-active').forEach(el => {
                    el.textContent = data.active || 0;
                });
                
                document.querySelectorAll('.mobile-counter-trash').forEach(el => {
                    el.textContent = data.trash || 0;
                });
                
                document.querySelectorAll('.counter-total').forEach(el => {
                    el.textContent = data.total || 0;
                });
                
                document.querySelectorAll('.counter-active').forEach(el => {
                    el.textContent = data.active || 0;
                });
                
                document.querySelectorAll('.counter-done').forEach(el => {
                    el.textContent = data.done || 0;
                });
                
                document.querySelectorAll('.counter-archived').forEach(el => {
                    el.textContent = data.archived || 0;
                });
                
                document.querySelectorAll('.counter-pinned').forEach(el => {
                    el.textContent = data.pinned || 0;
                });
            })
            .catch(error => {
                console.error('Ошибка при получении счетчиков:', error);
            });
    }
    
    updateCounters();
    
    setInterval(updateCounters, 30000);
});