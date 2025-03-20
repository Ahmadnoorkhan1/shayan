const FlashCards = {
  initialize: () => {
    console.log('Setting up flash cards...');
    
    try {
      const flashCards = document.querySelectorAll('.flash-card');
      console.log(`Found ${flashCards.length} flash cards`);
      
      if (flashCards.length === 0) return;
      
      // Ensure CSS is properly applied with correct styling
      const style = document.createElement('style');
      style.textContent = `
        .flash-card-inner.flipped {
          transform: rotateY(180deg) !important;
        }
        .flash-card-inner {
          transform-style: preserve-3d !important;
          transition: transform 0.6s;
        }
      `;
      document.head.appendChild(style);
      
      flashCards.forEach((card, index) => {
        const cardInner = card.querySelector('.flash-card-inner');
        if (!cardInner) {
          console.warn(`Flash card ${index + 1} missing inner element`);
          return;
        }
        
        // Set explicit styles to ensure 3D effect works
        (cardInner as HTMLElement).style.transformStyle = 'preserve-3d';
        
        // Remove existing click handlers to prevent duplicates
        const newCard = card.cloneNode(true) as HTMLElement;
        if (card.parentNode) {
          card.parentNode.replaceChild(newCard, card);
        }
        
        // Add new click handler
        newCard.addEventListener('click', function() {
          const inner = this.querySelector('.flash-card-inner');
          if (!inner) return;
          
          console.log(`Flash card ${index + 1} clicked`);
          if (inner.classList.contains('flipped')) {
            inner.classList.remove('flipped');
          } else {
            inner.classList.add('flipped');
          }
        });
      });
      
      console.log('Flash cards setup complete');
    } catch (error) {
      console.error('Error setting up flash cards:', error);
    }
  }
};

export default FlashCards;