document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const mainImage = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const sizeOptions = document.querySelectorAll('.size-option input');
    const addToCartBtn = document.getElementById('add-to-cart');
    const buyNowBtn = document.getElementById('buy-now');
    
    // State
    let selectedSize = null;
    
    // Image Gallery Functionality
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            // Update main image
            const newImageSrc = this.getAttribute('data-image');
            mainImage.src = newImageSrc;
            
            // Update active thumbnail
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Size Selection
    sizeOptions.forEach(option => {
        option.addEventListener('change', function() {
            selectedSize = this.value;
            
            // Update visual selection
            document.querySelectorAll('.size-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            this.parentElement.classList.add('selected');
        });
    });
    
    // Add to Cart Functionality
    addToCartBtn.addEventListener('click', function() {
        if (!selectedSize) {
            showNotification('Please select a size first', 'error');
            return;
        }
        
        // === FIX #1: Get the real ID from the button's data-attribute ===
        // This 'data-product-id' MUST be on the <button> in your HTML file
        const realProductId = addToCartBtn.getAttribute('data-product-id');

        if (!realProductId) {
            console.error('CRITICAL: data-product-id attribute is missing from the button.');
            showNotification('Error: Product ID not found.', 'error');
            return;
        }
        
        // === FIX #2: Change URL from '/api/cart/add' to '/api/cart' ===
        fetch('/api/cart', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId: realProductId, // Send the real ID
                quantity: 1,
                size: selectedSize
            })
        })
        .then(response => {
            // Check if the response was successful
            if (!response.ok) {
                // Catch 500 errors
                return response.json().then(err => { 
                    throw new Error(err.message || 'Server Error'); 
                });
            }
            return response.json();
        })
        .then(data => {
            // Check for 'items' property as a sign of success
            if (data.items) { 
                showNotification('Product added to cart successfully!', 'success');
                // You can re-enable this if needed
                // updateCartCount(data.items.length); 
            } else {
                showNotification(data.message || 'Error adding product to cart', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Display the actual error message
            showNotification(error.message, 'error');
        });
    });
    
    // Buy Now Functionality
    buyNowBtn.addEventListener('click', function() {
        if (!selectedSize) {
            showNotification('Please select a size first', 'error');
            return;
        }
        
        // === NOTE: This is still sending the slug, not the ID ===
        // This is okay for now if your /checkout route expects the slug.
        // But if checkout ALSO needs the ID, you will need to fix this
        // just like you fixed Add to Cart.
        const pathParts = window.location.pathname.split('/');
        const productId = pathParts[pathParts.length - 1];
        
        // Direct to checkout with this product
        window.location.href = `/checkout?product=${productId}&size=${selectedSize}&quantity=1`;
    });
    
    // Helper Functions
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '12px 20px';
        notification.style.borderRadius = '4px';
        notification.style.color = 'white';
        notification.style.zIndex = '1000';
        notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        
        if (type === 'success') {
            notification.style.background = '#4caf50';
        } else {
            notification.style.background = '#e63946';
        }
        
        // Add to document
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }
    
    function updateCartCount(count) {
        const cartCountElement = document.querySelector('.cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = count;
        }
    }
});